import algosdk from "algosdk";
import z from "zod";

const HTTPVerbsSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
]);

export const HTTPRequestStructureSchema = z.object({
  type: z.literal("http"),
  method: HTTPVerbsSchema,
  queryParams: z.record(z.string(), z.string()).optional(),
  bodyType: z
    .enum(["json", "form-data", "multipart-form-data", "text", "binary"])
    .optional(),
  bodyFields: z.record(z.string(), z.any()).optional(),
  headerFields: z.record(z.string(), z.any()).optional(),
});

export type HTTPRequestStructure = z.infer<typeof HTTPRequestStructureSchema>;

export type Resource = `${string}://${string}`;

export type PaymentMiddlewareConfig = {
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
  inputSchema?: Omit<HTTPRequestStructure, "type" | "method">;
  outputSchema?: object;
  discoverable?: boolean;
  customPaywallHtml?: string;
  resource?: Resource;
  errorMessages?: {
    paymentRequired?: string;
    invalidPayment?: string;
    noMatchingRequirements?: string;
    verificationFailed?: string;
    settlementFailed?: string;
  };
};

export const moneySchema = z
  .union([z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")), z.number()])
  .transform((val) => Number(val)) // ensure number
  .refine((n) => !isNaN(n) && n >= 0.0001 && n <= 999999999, {
    message: "Must be between 0.0001 and 999999999",
  });

export type Money = z.input<typeof moneySchema>;

export const NetworkSchema = z.enum(["algorand-testnet", "algorand"]);
export type Network = z.infer<typeof NetworkSchema>;

export const SupportedAVMNetworks: Network[] = ["algorand-testnet", "algorand"];

export interface AlgorandTokenAmount {
  asset: {
    id: number;
    decimals: number;
  };
  amount: number;
}

export type Price = Money | AlgorandTokenAmount;

export interface RouteConfig {
  price: Price;
  network: Network;
  config?: PaymentMiddlewareConfig;
}

export interface RoutePattern {
  verb: string;
  pattern: RegExp;
  config: RouteConfig;
}

export type RoutesConfig = Record<string, Price | RouteConfig>;

export const x402Versions = [1] as const;
export const schemes = ["exact"] as const;

export const ExactAvmPayloadSchema = z
  .object({
    paymentIndex: z.number().int().nonnegative(),
    paymentGroup: z.array(z.string().min(1)),
  })
  .refine((data) => data.paymentIndex < data.paymentGroup.length, {
    path: ["paymentIndex"],
    message: "paymentIndex must be a valid index in paymentGroup",
  });
export type ExactAvmPayload = z.infer<typeof ExactAvmPayloadSchema>;

export const PaymentPayloadSchema = z.object({
  x402Version: z.number().refine((val) => x402Versions.includes(val as 1)),
  scheme: z.enum(schemes),
  network: NetworkSchema,
  payload: z.union([ExactAvmPayloadSchema]),
});
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;

const isInteger: (value: string) => boolean = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;
const isAlgorandAddress: (value: string) => boolean = (value) =>
  algosdk.isValidAddress(value);
export const PaymentRequirementsSchema = z.object({
  scheme: z.enum(schemes),
  network: NetworkSchema,
  maxAmountRequired: z.string().refine(isInteger),
  resource: z.string().url(),
  description: z.string(),
  mimeType: z.string(),
  outputSchema: z.record(z.string(), z.any()).optional(),
  payTo: z.string().refine(isAlgorandAddress),
  maxTimeoutSeconds: z.number().int(),
  asset: z.string().refine(isInteger),
  extra: z.record(z.string(), z.any()).optional(),
});
export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;

export type FacilitatorConfig = {
  account: algosdk.Account;
  feePayer?: boolean;
};

export type PaymentCallback = (data: {
  payerAddress: string;
  amount: string;
  txnId?: string;
  txnGroupId?: string;
  linkId?: string;
}) => Promise<void>;

export const ErrorReasons = [
  "insufficient_funds",
  "invalid_network",
  "invalid_payload",
  "invalid_payment_requirements",
  "invalid_scheme",
  "invalid_payment",
  "invalid_fee_pool_transaction",
  "payment_expired",
  "unsupported_scheme",
  "invalid_x402_version",
  "invalid_transaction_state",
  "invalid_x402_version",
  "unsupported_scheme",
  "unexpected_settle_error",
  "unexpected_verify_error",
  "invalid_transaction_count",
  "invalid_payment_index",
  "invalid_simulation"
] as const;

export const VerifyResponseSchema = z.object({
  isValid: z.boolean(),
  invalidReason: z.enum(ErrorReasons).optional(),
  payer: z.string().refine(isAlgorandAddress).optional(),
});
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

export const SettleResponseSchema = z.object({
  success: z.boolean(),
  errorReason: z.enum(ErrorReasons).optional(),
  payer: z.string().refine(isAlgorandAddress).optional(),
  transaction: z.string().optional(),
  network: NetworkSchema,
});
export type SettleResponse = z.infer<typeof SettleResponseSchema>;

export const SupportedPaymentKindSchema = z.object({
  x402Version: z.number().refine((val) => x402Versions.includes(val as 1)),
  scheme: z.enum(schemes),
  network: NetworkSchema,
  extra: z.record(z.string(), z.any()).optional(),
});
export type SupportedPaymentKind = z.infer<typeof SupportedPaymentKindSchema>;

export const SupportedPaymentKindsResponseSchema = z.object({
  kinds: z.array(SupportedPaymentKindSchema),
});
export type SupportedPaymentKindsResponse = z.infer<
  typeof SupportedPaymentKindsResponseSchema
>;
