import { type Wallet } from "@maany_shr/thirdweb/wallets";
import { connectionManager } from "@maany_shr/thirdweb/react";
import { type TWallet } from "~/lib/core/entity/models";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  FromWalletInstanceDTO,
  GetWalletInstanceDTO,
  SupportedWalletsDTO,
} from "~/lib/core/dto/wallet-provider-dto";
import { inject, injectable } from "inversify";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";
import NetworkGateway from "~/lib/infrastructure/gateways/network-gateway";
import { getNetworkFromThirdwebChain } from "~/lib/utils/networkUtils";

@injectable()
export class ThirdwebWalletProvider
  implements WalletProviderOutputPort<Wallet>
{
  constructor(
    @inject(GATEWAYS.NETWORK_GATEWAY) private networkGateway: NetworkGateway,
  ) {}
  getName(): string {
    return "thirdweb";
  }

  getWalletInstance(wallet: TWallet): GetWalletInstanceDTO<Wallet> {
    const thirdwebWallet = connectionManager.connectedWallets.getValue();
    const walletInstance = thirdwebWallet.find(
      (connectedWallet) => connectedWallet.id === wallet.id,
    );
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
    if(activeAccount === undefined) {
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
    const walletStore = connectionManager.activeWalletStore;
    const thidwebWallet: Wallet | undefined = walletStore.getValue();
    if (thidwebWallet === undefined) {
      return {
        success: false,
        data: {
          type: "wallet_not_connected",
        },
      };
    }
    const dto = this.fromWalletInstance(thidwebWallet);
    if (!dto.success) {
      return {
        success: false,
        data: {
          type: "wallet_not_connected",
        },
      };
    }
    const wallet = dto.data;
    if (!wallet.activeAccount) {
      return {
        success: false,
        data: {
          type: "wallet_not_connected",
        },
      };
    }
    return {
      success: true,
      data: {
        ...wallet,
        activeAccount: wallet.activeAccount,
      },
      walletInstance: thidwebWallet,
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
    const transformedWallets = connectedWallets.map((wallet) => {
      const dto = this.fromWalletInstance(wallet);
      if (dto.success && dto.data.activeAccount !== undefined) {
        return dto.data;
      }
    }).filter((wallet) => wallet?.activeAccount !== undefined);

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
}