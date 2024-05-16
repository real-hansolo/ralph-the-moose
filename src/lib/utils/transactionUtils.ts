import { type Wallet } from "@maany_shr/thirdweb/wallets";
import type { TExecutedTransactionDTO } from "../core/dto/web3-gateway-dto";
import type { TWallet, TPreparedContractCall, TPreparedTransaction } from "../core/entity/models";
import type { TSignal, TTransactionGasStatus } from "../core/entity/signals";
import type Web3GatewayOutputPort from "../core/ports/secondary/web3-gateway-output-port";
import { type PreparedTransaction } from "@maany_shr/thirdweb";
import { clientContainer } from "../infrastructure/config/ioc/container";
import { GATEWAYS } from "../infrastructure/config/ioc/symbols";
import type WalletProviderOutputPort from "../core/ports/secondary/wallet-provider-output-port";
import type { ActiveWalletDTO } from "../core/dto/wallet-provider-dto";

export const callThirdWebContractUtil = async (
  wallet: TWallet,
  preparedContractCall: TPreparedContractCall,
  gasStatusSignal?: TSignal<TTransactionGasStatus>,
): Promise<TExecutedTransactionDTO> => {
  const web3Gateway = clientContainer.get<Web3GatewayOutputPort<Wallet, PreparedTransaction, PreparedTransaction>>(GATEWAYS.WEB3_GATEWAY);
  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  const activeWalletDTO: ActiveWalletDTO<Wallet> = walletProvider.getActiveWallet();
  if (!activeWalletDTO.success) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: `Error getting active wallet. ${activeWalletDTO.data.type}`,
        type: "transaction_error",
      },
    };
  }

  if (activeWalletDTO.data.activeAccount === undefined) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: "Cannot determine active account of connected wallet.",
        type: "transaction_error",
      },
    };
  }

  if (activeWalletDTO.data.activeAccount !== wallet.activeAccount) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: `Account being used for transaction is not active. ${wallet.activeAccount} is not active. The active account is: ${activeWalletDTO.data.activeAccount}`,
        type: "transaction_error",
      },
    };
  }

  const thirdwebWallet = activeWalletDTO.walletInstance;
  if (thirdwebWallet === undefined) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: "Cannot proceed. Thirdweb Wallet Instance was not found in thirdweb provider",
        type: "transaction_error",
      },
    };
  }

  const preparedTransactionDTO = web3Gateway.prepareContractCall(preparedContractCall);
  if (!preparedTransactionDTO.success) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: `Error preparing contract call. ${preparedTransactionDTO.data.message}`,
        type: "transaction_error",
      },
    };
  }
  const web3GatewayPreparedContractCall = preparedTransactionDTO.preparedContractCall;

  if (!web3GatewayPreparedContractCall) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedContractCall.contract.address,
        value: preparedContractCall.value,
        data: preparedContractCall.data,
        network: preparedContractCall.contract.network,
        message: "Error preparing contract call",
        type: "transaction_error",
      },
    };
  }
  if (gasStatusSignal) {
    const estimatedGasDTO = await web3Gateway.estimateGas(web3GatewayPreparedContractCall);
    if (estimatedGasDTO.success) {
      gasStatusSignal.value.value = {
        estimatedGas: Number(estimatedGasDTO.data), // Convert bigint to number
        gasLimit: preparedContractCall.contract.network.gasLimit,
        preparedTransaction: preparedContractCall,
      };
    }
  }

  const executedTransactionDTO = await web3Gateway.callContract(web3GatewayPreparedContractCall, preparedContractCall, thirdwebWallet);

  return executedTransactionDTO;
};

export const sendThirdWebTransactionUtil = async (
  wallet: TWallet,
  preparedTransaction: TPreparedTransaction,
  gasStatusSignal?: TSignal<TTransactionGasStatus>,
): Promise<TExecutedTransactionDTO> => {
  const web3Gateway = clientContainer.get<Web3GatewayOutputPort<Wallet, PreparedTransaction, PreparedTransaction>>(GATEWAYS.WEB3_GATEWAY);
  const walletProvider = clientContainer.get<WalletProviderOutputPort<Wallet>>(GATEWAYS.WALLET_PROVIDER);
  const activeWalletDTO: ActiveWalletDTO<Wallet> = walletProvider.getActiveWallet();
  if (!activeWalletDTO.success) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: `Error getting active wallet. ${activeWalletDTO.data.type}`,
        type: "transaction_error",
      },
    };
  }

  if (activeWalletDTO.data.activeAccount === undefined) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: "Cannot determine active account of connected wallet.",
        type: "transaction_error",
      },
    };
  }

  if (activeWalletDTO.data.activeAccount !== wallet.activeAccount) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount ?? "",
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: `Account being used for transaction is not active. ${wallet.activeAccount} is not active. The active account is: ${activeWalletDTO.data.activeAccount}`,
        type: "transaction_error",
      },
    };
  }

  const thirdwebWallet = activeWalletDTO.walletInstance;
  if (thirdwebWallet === undefined) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: "Cannot proceed. Thirdweb Wallet Instance was not found in thirdweb provider",
        type: "transaction_error",
      },
    };
  }

  const preparedTransactionDTO = web3Gateway.prepareTransaction(preparedTransaction);
  if (!preparedTransactionDTO.success) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: `Error preparing transaction. ${preparedTransactionDTO.data.message}`,
        type: "transaction_error",
      },
    };
  }
  const web3GatewayPreparedTransaction = preparedTransactionDTO.preparedTransaction;

  if (!web3GatewayPreparedTransaction) {
    return {
      success: false,
      data: {
        from: wallet.activeAccount,
        to: preparedTransaction.to,
        value: preparedTransaction.value,
        data: preparedTransaction.data,
        network: preparedTransaction.network,
        message: "Error preparing transaction",
        type: "transaction_error",
      },
    };
  }

  if (gasStatusSignal) {
    const estimatedGasDTO = await web3Gateway.estimateGas(web3GatewayPreparedTransaction);
    if (estimatedGasDTO.success) {
      gasStatusSignal.value.value = {
        estimatedGas: Number(estimatedGasDTO.data), // Convert bigint to number
        gasLimit: preparedTransaction.network.gasLimit,
        preparedTransaction: preparedTransaction,
      };
    }
  }

  const executedTransactionDTO = await web3Gateway.sendTransaction(web3GatewayPreparedTransaction, preparedTransaction, thirdwebWallet);

  return executedTransactionDTO;
};
