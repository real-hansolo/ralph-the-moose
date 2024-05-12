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
} from "~/lib/infrastructure/dto/wallet-provider-dto";
import { injectable } from "inversify";

@injectable()
export class ThirdwebWalletProvider
  implements WalletProviderOutputPort<Wallet>
{
 

  getName(): string {
    return "thirdweb";
  }

  getSupportedWallets(): SupportedWalletsDTO<Wallet> {
    const thirdwebMetamask = createWallet("io.metamask");
    return {
      success: true,
      data: [ "Metamask" ],
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
        __transform__thirdweb_wallet_to_Wallet(thidwebWallet);
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
            __transform__thirdweb_wallet_to_Wallet(thirdwebWallet);
          return wallet;
        } catch (error: unknown) {
          return {
            name: thirdwebWallet.id,
            provider: "thirdweb",
            activeAccount: "unknown",
            availableAccounts: [],
            activeNetwork: {
              chainId: 0,
              name: "Unknown",
            },
          };
        }
      }),
    };
  }
  
  disconnect(wallet: Wallet): DisconnectWalletDTO {
    const disconnect = connectionManager.disconnectWallet;
    let walletAddress = wallet.getAccount()?.address;
    if(walletAddress === undefined) {
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
        data: { error: error.toString()},
      }
    }
  }
}


function __transform__thirdweb_chain_to_Network(chain: Chain): TNetwork {
  return {
    chainId: chain.id,
    name: chain.name ?? "Unknown Name",
  };
}

function __transform__thirdweb_wallet_to_Wallet(wallet: Wallet | undefined): TWallet {
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
    __transform__thirdweb_chain_to_Network(walletChain);

  return {
    name: wallet.id,
    provider: "thirdweb",
    activeAccount: activeAccount.address,
    availableAccounts: [],
    activeNetwork: walletNetwork,
  };
}
