import {
  AlgorandTokenAmount,
  ExactAvmPayload,
  Network,
  PaymentPayload,
  PaymentPayloadSchema,
  Price,
  RouteConfig,
  RoutePattern,
  RoutesConfig,
  SupportedAVMNetworks,
  moneySchema,
  PaymentRequirements,
  SettleResponse,
} from "./types";

/**
 * Computes the route patterns for the given routes config
 *
 * @param routes - The routes config to compute the patterns for
 * @returns The route patterns
 */
export function computeRoutePatterns(routes: RoutesConfig): RoutePattern[] {
  const normalizedRoutes = Object.fromEntries(
    Object.entries(routes).map(([pattern, value]) => [
      pattern,
      typeof value === "string" || typeof value === "number"
        ? ({ price: value, network: "algorand" } as RouteConfig)
        : (value as RouteConfig),
    ])
  );

  return Object.entries(normalizedRoutes).map(([pattern, routeConfig]) => {
    // Split pattern into verb and path, defaulting to "*" for verb if not specified
    const [verb, path] = pattern.includes(" ")
      ? pattern.split(/\s+/)
      : ["*", pattern];
    if (!path) {
      throw new Error(`Invalid route pattern: ${pattern}`);
    }
    return {
      verb: verb.toUpperCase(),
      pattern: new RegExp(
        `^${
          path
            // First escape all special regex characters except * and []
            .replace(/[$()+.?^{|}]/g, "\\$&")
            // Then handle our special pattern characters
            .replace(/\*/g, ".*?") // Make wildcard non-greedy and optional
            .replace(/\[([^\]]+)\]/g, "[^/]+") // Convert [param] to regex capture
            .replace(/\//g, "\\/") // Escape slashes
        }$`,
        "i"
      ),
      config: routeConfig,
    };
  });
}

/**
 * Finds the matching route pattern for the given path and method
 *
 * @param routePatterns - The route patterns to search through
 * @param path - The path to match against
 * @param method - The HTTP method to match against
 * @returns The matching route pattern or undefined if no match is found
 */
export function findMatchingRoute(
  routePatterns: RoutePattern[],
  path: string,
  method: string
): RoutePattern | undefined {
  // Normalize the path:
  // 1. Remove query parameters and hash fragments
  // 2. Replace backslashes with forward slashes
  // 3. Replace multiple consecutive slashes with a single slash
  // 4. Keep trailing slash if path is not root
  let normalizedPath: string;
  try {
    // First split off query parameters and hash fragments
    const pathWithoutQuery = path.split(/[?#]/)[0];

    // Then decode the path - this needs to happen before any normalization
    // so encoded characters are properly handled
    const decodedPath = decodeURIComponent(pathWithoutQuery);

    // Normalize the path (just clean up slashes)
    normalizedPath = decodedPath
      .replace(/\\/g, "/") // replace backslashes
      .replace(/\/+/g, "/") // collapse slashes
      .replace(/(.+?)\/+$/, "$1"); // trim trailing slashes
  } catch {
    // If decoding fails (e.g., invalid % encoding), return undefined
    return undefined;
  }

  // Find matching route pattern
  const matchingRoutes = routePatterns.filter(({ pattern, verb }) => {
    const matchesPath = pattern.test(normalizedPath);
    const upperMethod = method.toUpperCase();
    const matchesVerb = verb === "*" || upperMethod === verb;

    const result = matchesPath && matchesVerb;
    return result;
  });

  if (matchingRoutes.length === 0) {
    return undefined;
  }

  // Use the most specific route (longest path pattern)
  const matchingRoute = matchingRoutes.reduce((a, b) =>
    b.pattern.source.length > a.pattern.source.length ? b : a
  );

  return matchingRoute;
}

export function getDefaultAssetDecimals(network: Network) {
  if (network === "algorand") {
    return {
      id: 31566704,
      decimals: 6,
    };
  } else if (network === "algorand-testnet") {
    return {
      id: 10458941,
      decimals: 6,
    };
  }
  throw new Error(`Unsupported network: ${network}`);
}

/**
 * Escapes a string for safe injection into JavaScript string literals
 *
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Parses the amount from the given price
 *
 * @param price - The price to parse
 * @param network - The network to get the default asset for
 * @returns The parsed amount or an error message
 */
export function processPriceToAtomicAmount(
  price: Price,
  network: Network
):
  | {
      maxAmountRequired: string;
      asset: AlgorandTokenAmount["asset"];
    }
  | { error: string } {
  // Handle USDC amount (string) or token amount (ERC20TokenAmount)
  let maxAmountRequired: string;
  let asset: AlgorandTokenAmount["asset"];

  if (typeof price === "string" || typeof price === "number") {
    // USDC amount in dollars
    const parsedAmount = moneySchema.safeParse(price);
    if (!parsedAmount.success) {
      return {
        error: `Invalid price (price: ${price}). Must be in the form "$3.10", 0.10, "0.001", ${parsedAmount.error}`,
      };
    }
    const parsedUsdAmount = parsedAmount.data;
    asset = getDefaultAssetDecimals(network);
    maxAmountRequired = (parsedUsdAmount * 10 ** asset.decimals).toString();
  } else {
    // Token amount in atomic units
    maxAmountRequired = (price.amount * 10 ** price.asset.decimals).toString();
    asset = price.asset;
  }

  return {
    maxAmountRequired,
    asset,
  };
}

/**
 * Decodes a base64 string back to its original format
 *
 * @param data - The base64 encoded string to be decoded
 * @returns The decoded string in UTF-8 format
 */
export function safeBase64Decode(data: string): string {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.atob === "function"
  ) {
    return globalThis.atob(data);
  }
  return Buffer.from(data, "base64").toString("utf-8");
}

/**
 * Encodes a string to base64 format
 *
 * @param data - The string to be encoded to base64
 * @returns The base64 encoded string
 */
export function safeBase64Encode(data: string): string {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.btoa === "function"
  ) {
    return globalThis.btoa(data);
  }
  return Buffer.from(data).toString("base64");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return safeBase64Encode(binary);
}

/**
 * Encodes a settlement response into a base64 header string
 *
 * @param response - The settlement response to encode
 * @returns A base64 encoded string containing the settlement response
 */
export function settleResponseHeader(response: SettleResponse): string {
    return safeBase64Encode(JSON.stringify(response));
  }

/**
 * Decodes a base64 encoded payment string back into a PaymentPayload object
 *
 * @param payment - The base64 encoded payment string to decode
 * @returns The decoded and validated PaymentPayload object
 */
export function decodePayment(payment: string): PaymentPayload {
  const decoded = safeBase64Decode(payment);
  const parsed = JSON.parse(decoded);

  let obj: PaymentPayload;

  // avm
  if (SupportedAVMNetworks.includes(parsed.network)) {
    obj = {
      ...parsed,
      payload: parsed.payload as ExactAvmPayload,
    };
  } else {
    throw new Error("Invalid network");
  }

  const validated = PaymentPayloadSchema.parse(obj);
  return validated;
}

/**
 * Finds the matching payment requirements for the given payment
 *
 * @param paymentRequirements - The payment requirements to search through
 * @param payment - The payment to match against
 * @returns The matching payment requirements or undefined if no match is found
 */
export function findMatchingPaymentRequirements(
  paymentRequirements: PaymentRequirements[],
  payment: PaymentPayload
) {
  return paymentRequirements.find(
    (value) =>
      value.scheme === payment.scheme && value.network === payment.network
  );
}

/**
 * Converts an object to a JSON-safe format by converting bigint values to strings
 * and recursively processing nested objects and arrays
 *
 * @param data - The object to convert to JSON-safe format
 * @returns A new object with all bigint values converted to strings
 */
export function toJsonSafe<T extends object>(data: T): object {
  if (typeof data !== "object") {
    throw new Error("Data is not an object");
  }

  /**
   * Recursively converts values to JSON-safe format
   *
   * @param value - The value to convert
   * @returns The converted value with bigints as strings
   */
  function convert(value: unknown): unknown {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, convert(val)])
      );
    }

    if (Array.isArray(value)) {
      return value.map(convert);
    }

    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  }

  return convert(data) as object;
}
