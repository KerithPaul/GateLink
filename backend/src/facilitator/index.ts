import algosdk from "algosdk";
import {
  bytesToBase64,
  safeBase64Decode,
  safeBase64Encode,
  toJsonSafe,
} from "../middleware/helpers";
import {
  FacilitatorConfig,
  SupportedPaymentKindsResponse,
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from "../middleware/types";

const DEFAULT_FACILITATOR_URL = "https://x402.org/facilitator";

/**
 * Creates a facilitator client for interacting with the X402 payment facilitator service
 *
 * @param facilitator - The facilitator config to use. If not provided, the default facilitator will be used.
 * @returns An object containing verify and settle functions for interacting with the facilitator
 */
export function useFacilitator(facilitator: FacilitatorConfig) {
  /**
   * Verifies a payment payload with the facilitator service
   *
   * @param payload - The payment payload to verify
   * @param paymentRequirements - The payment requirements to verify against
   * @returns A promise that resolves to the verification response
   */
  async function verify(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<VerifyResponse> {
    try {
      const payer = facilitator.feePayer
        ? facilitator.account.addr.toString()
        : undefined;
      const transactions: algosdk.Transaction[] =
        payload.payload.paymentGroup.map((transaction) => {
          try {
            const decoded = algosdk.decodeSignedTransaction(
              Buffer.from(transaction, "base64")
            );
            return decoded.txn;
          } catch (e) {
            return algosdk.decodeUnsignedTransaction(
              Buffer.from(transaction, "base64")
            );
          }
        });

      if (transactions.length !== payload.payload.paymentGroup.length) {
        return {
          isValid: false,
          invalidReason: "invalid_transaction_count",
          payer: payer,
        };
      }

      if (payload.payload.paymentIndex >= transactions.length) {
        return {
          isValid: false,
          invalidReason: "invalid_payment_index",
          payer: payer,
        };
      }

      const paymentTxn = transactions[payload.payload.paymentIndex];

      if (
        paymentTxn.type !== "axfer" ||
        paymentTxn.assetTransfer === undefined ||
        paymentTxn.assetTransfer.amount.toString() !==
          paymentRequirements.maxAmountRequired ||
        paymentTxn.assetTransfer.receiver.toString() !==
          paymentRequirements.payTo
      ) {
        return {
          isValid: false,
          invalidReason: "invalid_payment",
          payer: payer,
        };
      }

      const finalTransactions = [...payload.payload.paymentGroup];
      const signedTransactions: { txn: string; index: number }[] = [];
      if (payer !== undefined) {
        for (var i = 0; i < transactions.length; i++) {
          const txn = transactions[i];
          if (txn.payment !== undefined && txn.sender.toString() === payer) {
            if (
              txn.payment.closeRemainderTo !== undefined ||
              txn.payment.amount.toString() !== "0" ||
              txn.rekeyTo !== undefined ||
              txn.type !== "pay"
            ) {
              return {
                isValid: false,
                invalidReason: "invalid_fee_pool_transaction",
                payer: payer,
              };
            } else {
              signedTransactions.push({
                txn: bytesToBase64(txn.signTxn(facilitator.account.sk)),
                index: i,
              });
            }
          }
        }

        if (signedTransactions.length > 0) {
          for (var i = 0; i < signedTransactions.length; i++) {
            finalTransactions[signedTransactions[i].index] =
              signedTransactions[i].txn;
          }
        }
      }

      const nodeConfig = {
        testnet: {
          token: "a".repeat(64),
          server: "https://testnet-api.algonode.cloud",
          port: 443,
        },
        mainnet: {
          token: "a".repeat(64),
          server: "https://mainnet-api.algonode.cloud",
          port: 443,
        },
      };

      const config =
        nodeConfig[
          paymentRequirements.network == "algorand" ? "mainnet" : "testnet"
        ];

      const algodClient = new algosdk.Algodv2(
        config.token,
        config.server,
        config.port
      );

      const txnBytes = finalTransactions.map((txn) =>
        Buffer.from(txn, "base64")
      );
      const decodedTransactions = txnBytes.map((txn) => {
        const decoded = algosdk.decodeSignedTransaction(txn);
        return decoded.txn;
      });
      const simulateRes = await algodClient
        .simulateRawTransactions(txnBytes)
        .do();

      for (var i = 0; i < simulateRes.txnGroups.length; i++) {
        const txnGroup = simulateRes.txnGroups[i];
        if (
          txnGroup.failedAt !== undefined ||
          txnGroup.failureMessage !== undefined
        ) {
          return {
            isValid: false,
            invalidReason: "invalid_simulation",
            payer: payer,
          };
        }
      }

      return {
        isValid: true,
        invalidReason: undefined,
        payer: payer,
      };
    } catch (e) {
      return {
        isValid: false,
        invalidReason: "unexpected_verify_error",
        payer: undefined,
      };
    }
  }

  /**
   * Settles a payment with the facilitator service
   *
   * @param payload - The payment payload to settle
   * @param paymentRequirements - The payment requirements for the settlement
   * @returns A promise that resolves to the settlement response
   */
  async function settle(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<SettleResponse> {
    try {
      const payer = facilitator.feePayer
        ? facilitator.account.addr.toString()
        : undefined;

      if (payload.payload.paymentIndex >= payload.payload.paymentGroup.length) {
        return {
          success: false,
          errorReason: "invalid_payment_index",
          payer: payer,
          network: paymentRequirements.network,
        };
      }

      const transactions: algosdk.Transaction[] =
        payload.payload.paymentGroup.map((transaction) => {
          try {
            const decoded = algosdk.decodeSignedTransaction(
              Buffer.from(transaction, "base64")
            );
            return decoded.txn;
          } catch (e) {
            return algosdk.decodeUnsignedTransaction(
              Buffer.from(transaction, "base64")
            );
          }
        });

      const finalTransactions = payload.payload.paymentGroup;
      const signedTransactions: { txn: string; index: number }[] = [];
      if (payer !== undefined) {
        for (var i = 0; i < transactions.length; i++) {
          const txn = transactions[i];
          if (txn.payment !== undefined && txn.sender.toString() === payer) {
            if (
              txn.payment.closeRemainderTo !== undefined ||
              txn.payment.amount.toString() !== "0" ||
              txn.rekeyTo !== undefined ||
              txn.type !== "pay"
            ) {
              return {
                success: false,
                errorReason: "invalid_payment",
                network: paymentRequirements.network,
                payer: payer,
              };
            } else {
              signedTransactions.push({
                txn: bytesToBase64(txn.signTxn(facilitator.account.sk)),
                index: i,
              });
            }
          }
        }

        if (signedTransactions.length > 0) {
          for (var i = 0; i < signedTransactions.length; i++) {
            finalTransactions[signedTransactions[i].index] =
              signedTransactions[i].txn;
          }
        }
      }

      const nodeConfig = {
        testnet: {
          token: "a".repeat(64),
          server: "https://testnet-api.algonode.cloud",
          port: 443,
        },
        mainnet: {
          token: "a".repeat(64),
          server: "https://mainnet-api.algonode.cloud",
          port: 443,
        },
      };

      const config =
        nodeConfig[
          paymentRequirements.network == "algorand" ? "mainnet" : "testnet"
        ];

      const algodClient = new algosdk.Algodv2(
        config.token,
        config.server,
        config.port
      );

      const txnBytes = finalTransactions.map((txn) =>
        Buffer.from(txn, "base64")
      );
      const res = await algodClient.sendRawTransaction(txnBytes).do();

      await algosdk.waitForConfirmation(algodClient, res.txid, 3);

      return {
        success: true,
        errorReason: undefined,
        network: paymentRequirements.network,
        payer: payer,
        transaction: res.txid,
      };
    } catch (e) {
      return {
        success: false,
        errorReason: "unexpected_settle_error",
        payer: undefined,
        network: paymentRequirements.network,
        transaction: undefined,
      };
    }
  }

  /**
   * Gets the supported payment kinds from the facilitator service.
   *
   * @returns A promise that resolves to the supported payment kinds
   */
  async function supported(): Promise<SupportedPaymentKindsResponse> {
    const feePayer = facilitator.feePayer
      ? facilitator.account.addr.toString()
      : undefined;
    const data: SupportedPaymentKindsResponse = {
      kinds: [
        {
          x402Version: 1,
          scheme: "exact",
          network: "algorand",
          extra: {
            feePayer: feePayer,
          },
        },
        {
          x402Version: 1,
          scheme: "exact",
          network: "algorand-testnet",
          extra: {
            feePayer: feePayer,
          },
        },
      ],
    };
    return data as SupportedPaymentKindsResponse;
  }

  return { verify, settle, supported };
}
