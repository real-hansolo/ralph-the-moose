import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { connectionManager } from "@maany_shr/thirdweb/react";
import type { TNetwork, TWallet } from "~/lib/core/entity/models";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  FromWalletInstanceDTO,
  GetActiveWalletNetworkDTO,
  GetWalletInstanceDTO,
  SupportedWalletsDTO,
  SwitchActiveWalletNetworkDTO,
} from "~/lib/core/dto/wallet-provider-dto";
import { inject, injectable } from "inversify";
import { GATEWAYS, SIGNALS } from "~/lib/infrastructure/config/ioc/symbols";
import NetworkGateway from "~/lib/infrastructure/gateways/network-gateway";
import { getNetworkFromThirdwebChain, getThirdWebChain } from "~/lib/utils/networkUtils";
import { signalsContainer } from "~/lib/infrastructure/config/ioc/container";
import type { TSignal } from "~/lib/core/entity/signals";

@injectable()
export class ThirdwebWalletProvider implements WalletProviderOutputPort<Wallet> {
  log(message: string): string {
    const timestamp = new Date().toISOString();
    return `[ThirdwebWalletProvider] [${timestamp}] ${message}`;
  }
  constructor(@inject(GATEWAYS.NETWORK_GATEWAY) private networkGateway: NetworkGateway) {
    // subscribe to wallet changes
    const walletStore = connectionManager.activeWalletStore;
    walletStore.subscribe(() => {
      const thirdWebWallet = walletStore.getValue();
      const S_ACTIVE_WALLET = signalsContainer.get<TSignal<TWallet | undefined>>(SIGNALS.ACTIVE_WALLET);
      if (thirdWebWallet === undefined) {
        console.error(this.log("Failed to get active wallet"));
        S_ACTIVE_WALLET.value.value = undefined;
        return;
      }
      const walletInstanceDTO = this.fromWalletInstance(thirdWebWallet);
      if (!walletInstanceDTO.success) {
        console.error(this.log("Failed to get wallet instance for active wallet"));
        S_ACTIVE_WALLET.value.value = undefined;
        return;
      }
      const wallet = walletInstanceDTO.data;
      console.log(this.log(`Wallet changed to: ${wallet.activeAccount}`));
      S_ACTIVE_WALLET.value.value = wallet;
    });

    const walletNetworkStore = connectionManager.activeWalletChainStore;

    walletNetworkStore.subscribe(() => {
      const thirdWebChain = walletNetworkStore.getValue();
      const S_ACTIVE_WALLET_NETWORK = signalsContainer.get<TSignal<TNetwork | undefined | "unsupported-wallet-network">>(SIGNALS.ACTIVE_WALLET_NETWORK);
      if (thirdWebChain === undefined) {
        console.error(this.log("Thirdweb: Failed to get active wallet chain"));
        S_ACTIVE_WALLET_NETWORK.value.value = undefined;
        return;
      }
      try {
        const activeWalletNetwork = getNetworkFromThirdwebChain(thirdWebChain);
        S_ACTIVE_WALLET_NETWORK.value.value = activeWalletNetwork;
        console.log(
          this.log(
            `Wallet network changed to: ${activeWalletNetwork === "unsupported-wallet-network" ? "unsupported-wallet-network" : activeWalletNetwork.name}`,
          ),
        );
      } catch (error) {
        console.error(this.log((error as Error).message));
        S_ACTIVE_WALLET_NETWORK.value.value = "unsupported-wallet-network";
        return;
      }
    });
  }
  getName(): string {
    return "thirdweb";
  }

  getWalletInstance(wallet: TWallet): GetWalletInstanceDTO<Wallet> {
    const thirdwebWallet = connectionManager.connectedWallets.getValue();
    const walletInstance = thirdwebWallet.find((connectedWallet) => connectedWallet.id === wallet.id);
    if (walletInstance === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_provider_error",
          message: `Wallet ${wallet.id} not found in thirdweb provider!`,
        },
      };
    }
    return {
      success: true,
      data: walletInstance,
    };
  }

  fromWalletInstance(walletInstance: Wallet): FromWalletInstanceDTO {
    const activeAccount = walletInstance.getAccount();
    const walletChain = walletInstance.getChain();
    if (walletChain === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_provider_error",
          message: `Wallet ${walletInstance.id} is not connected to any chain!`,
        },
      };
    }
    if (activeAccount === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_provider_error",
          message: `Wallet ${walletInstance.id} has no active account!`,
        },
      };
    }
    const walletNetwork = getNetworkFromThirdwebChain(walletChain);
    return {
      success: true,
      data: {
        name: walletInstance.id,
        id: walletInstance.id,
        provider: "thirdweb",
        activeAccount: activeAccount?.address,
        availableAccounts: [],
        activeNetwork: walletNetwork,
      },
    };
  }

  getSupportedWallets(): SupportedWalletsDTO {
    return {
      success: true,
      data: [
        {
          name: "io.metamask",
          id: "io.metamask",
          provider: "thirdweb",
        },
      ],
    };
  }

  getActiveWallet(): ActiveWalletDTO<Wallet> {
    const S_ACTIVE_WALLET = signalsContainer.get<TSignal<TWallet | undefined>>(SIGNALS.ACTIVE_WALLET);
    if (S_ACTIVE_WALLET.value.value === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_not_connected",
        },
      };
    }
    const walletInstanceDTO = this.getWalletInstance(S_ACTIVE_WALLET.value.value);
    if (!walletInstanceDTO.success) {
      return {
        success: false,
        data: {
          type: "wallet_not_supported",
        },
      };
    }
    return {
      success: true,
      data: {...S_ACTIVE_WALLET.value.value},
      walletInstance: walletInstanceDTO.data,
    };
  }

  getConnectedWallets(): ConnectedWalletsDTO {
    const store = connectionManager.connectedWallets;
    const connectedWallets = store.getValue().filter((wallet) => wallet !== undefined);
    if (connectedWallets.length === 0) {
      return {
        success: false,
        data: {
          type: "no_wallets_connected",
        },
      };
    }
    const transformedWallets = connectedWallets
      .map((wallet) => {
        const dto = this.fromWalletInstance(wallet);
        if (dto.success && dto.data.activeAccount !== undefined) {
          return dto.data;
        }
      })
      .filter((wallet) => wallet?.activeAccount !== undefined);

    return {
      success: true,
      data: transformedWallets as unknown as TWallet[],
    };
  }

  disconnect(wallet: Wallet): DisconnectWalletDTO {
    const disconnect = connectionManager.disconnectWallet;
    let walletAddress = wallet.getAccount()?.address;
    if (walletAddress === undefined) {
      walletAddress = "unknown";
    }
    try {
      disconnect(wallet);
      return {
        success: true,
        data: {
          name: wallet.id,
          provider: "thirdweb",
          address: walletAddress,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        data: { error: error.toString() },
      };
    }
  }

  async switchActiveWalletNetwork(network: TNetwork): Promise<SwitchActiveWalletNetworkDTO> {
    const switchChain = connectionManager.switchActiveWalletChain;
    try {
      const thirdwebNetwork = getThirdWebChain(network.name);
      await switchChain(thirdwebNetwork);
      return {
        success: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        data: {
          type: "wallet_provider_error",
          message: (error as Error).message,
        },
      };
    }
  }

  getActiveWalletNetwork(): GetActiveWalletNetworkDTO {
    const S_ACTIVE_WALLET_NETWORK = signalsContainer.get<TSignal<TNetwork | undefined | "unsupported-wallet-network">>(SIGNALS.ACTIVE_WALLET_NETWORK);
    if (S_ACTIVE_WALLET_NETWORK.value.value === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_provider_error",
          message: "No thirdweb chain found for active wallet! Maybe the wallet is not connected.",
        },
      };
    }
    if (S_ACTIVE_WALLET_NETWORK.value.value === "unsupported-wallet-network") {
      return {
        success: false,
        data: {
          type: "wallet_provider_error",
          message: "Unsupported wallet network",
        },
      };
    }

    return {
      success: true,
      data: S_ACTIVE_WALLET_NETWORK.value.value,
    };
  }
}
