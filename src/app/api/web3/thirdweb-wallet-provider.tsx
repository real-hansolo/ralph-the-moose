import { type Chain } from "@maany_shr/thirdweb/chains";
import { createWallet, type Wallet } from "@maany_shr/thirdweb/wallets";
import { connectionManager } from "@maany_shr/thirdweb/react";
import { type TWallet, type TNetwork } from "~/lib/core/entity/models";
import type WalletProviderOutputPort from "~/lib/core/ports/secondary/wallet-provider-output-port";
import type {
  ActiveWalletDTO,
  ConnectedWalletsDTO,
  DisconnectWalletDTO,
  SupportedWalletsDTO,
} from "~/lib/core/dto/wallet-provider-dto";
import { inject, injectable } from "inversify";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";
import NetworkGateway from "~/lib/infrastructure/gateways/network-gateway";
import type { TNetworkDTO } from "~/lib/core/dto/network-dto";

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

  getSupportedWallets(): SupportedWalletsDTO<Wallet> {
    const thirdwebMetamask = createWallet("io.metamask");
    return {
      success: true,
      data: ["Metamask"],
      walletInstances: [
        {
          name: "Metamask",
          walletInstance: thirdwebMetamask,
        },
      ],
    };
  }

  getActiveWallet(): ActiveWalletDTO<Wallet> {
    try {
      const walletStore = connectionManager.activeWalletStore;
      const thidwebWallet: Wallet | undefined = walletStore.getValue();
      const activeWallet =
        this.__transform__thirdweb_wallet_to_Wallet(thidwebWallet);
      return {
        success: true,
        data: activeWallet,
        walletInstance: thidwebWallet,
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: {
          type: "unknown_error",
        },
      };
    }
  }

  getConnectedWallets(): ConnectedWalletsDTO {
    const store = connectionManager.connectedWallets;
    const connectedWallets = store.getValue();
    if (connectedWallets.length === 0) {
      return {
        success: false,
        data: {
          type: "no_wallets_connected",
        },
      };
    }
    return {
      success: true,
      data: connectedWallets.map((thirdwebWallet) => {
        try {
          const wallet =
            this.__transform__thirdweb_wallet_to_Wallet(thirdwebWallet);
          return wallet;
        } catch (error: unknown) {
          return {
            name: thirdwebWallet.id,
            provider: "thirdweb",
            activeAccount: "unknown",
            availableAccounts: [],
            activeNetwork: {
              name: "Unknown",
              chainId: 0,
              explorer: { name: "", url: "" },
              rpcProvider: '',
              nativeCurrency: "",
              gasLimit: 0,
              fee: { minting: 0, wrapping: 0, unwrapping: 0 },
              contracts: {
                ralphReservoirAddress: "",
                ralphTokenAddress: "",
              },
              icon: undefined,
            },
          };
        }
      }),
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

  __transform__thirdweb_chain_to_Network(chain: Chain): TNetwork {
    const walletNetworkDTO: TNetworkDTO = this.networkGateway.getNetwork(
      chain.id,
    );
    if (!walletNetworkDTO.success) {
      throw new Error(
        `Wallet network ${chain.name}: ${chain.id} is not supported!`,
      );
    }
    return walletNetworkDTO.data;
  }

  __transform__thirdweb_wallet_to_Wallet(wallet: Wallet | undefined): TWallet {
    if (wallet === undefined) {
      throw new Error("Wallet is undefined");
    }
    const activeAccount = wallet.getAccount();
    if (activeAccount === undefined) {
      throw new Error("Active account is undefined");
    }

    const walletChain = wallet.getChain();
    if (walletChain === undefined) {
      throw new Error("Wallet chain is undefined");
    }

    const walletNetwork =
      this.__transform__thirdweb_chain_to_Network(walletChain);

    return {
      name: wallet.id,
      provider: "thirdweb",
      activeAccount: activeAccount.address,
      availableAccounts: [],
      activeNetwork: walletNetwork,
    };
  }
}
