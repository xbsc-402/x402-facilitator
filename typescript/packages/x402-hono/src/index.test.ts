import { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exact } from "x402/schemes";
import { findMatchingRoute, findMatchingPaymentRequirements } from "x402/shared";
import { getPaywallHtml } from "x402/paywall";
import {
  FacilitatorConfig,
  Network,
  PaymentMiddlewareConfig,
  PaymentPayload,
  RouteConfig,
  RoutesConfig,
} from "x402/types";
import { useFacilitator } from "x402/verify";
import { paymentMiddleware } from "./index";
import { Address as SolanaAddress } from "@solana/kit";

// Mock dependencies
vi.mock("x402/verify", () => ({
  useFacilitator: vi.fn(),
}));

vi.mock("x402/paywall", () => ({
  getPaywallHtml: vi.fn(),
}));

vi.mock("x402/shared", async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getNetworkId: vi.fn().mockReturnValue("bsc-mainnet"),
    toJsonSafe: vi.fn(x => x),
    findMatchingPaymentRequirements: vi.fn(),
    computeRoutePatterns: vi.fn().mockImplementation(routes => {
      const normalizedRoutes = Object.fromEntries(
        Object.entries(routes).map(([pattern, value]) => [
          pattern,
          typeof value === "string" || typeof value === "number"
            ? ({ price: value, network: "bsc-mainnet" } as RouteConfig)
            : (value as RouteConfig),
        ]),
      );

      return Object.entries(normalizedRoutes).map(([pattern, routeConfig]) => {
        const [verb, path] = pattern.includes(" ") ? pattern.split(/\s+/) : ["*", pattern];
        if (!path) {
          throw new Error(`Invalid route pattern: ${pattern}`);
        }
        return {
          verb: verb.toUpperCase(),
          pattern: new RegExp(
            `^${path
              .replace(/\*/g, ".*?")
              .replace(/\[([^\]]+)\]/g, "[^/]+")
              .replace(/\//g, "\\/")}$`,
          ),
          config: routeConfig,
        };
      });
    }),
    findMatchingRoute: vi
      .fn()
      .mockImplementation(
        (routePatterns: Array<{ pattern: RegExp; verb: string }>, path: string, method: string) => {
          if (!routePatterns) return undefined;
          return routePatterns.find(({ pattern, verb }) => {
            const matchesPath = pattern.test(path);
            const matchesVerb = verb === "*" || verb === method.toUpperCase();
            return matchesPath && matchesVerb;
          });
        },
      ),
  };
});

vi.mock("x402/shared/evm", () => ({
  getUsdcAddressForChain: vi.fn().mockReturnValue("0x036CbD53842c5426634e7929541eC2318f3dCF7e"),
}));

// Mock exact.evm.decodePayment
vi.mock("x402/schemes", () => ({
  exact: {
    evm: {
      encodePayment: vi.fn(),
      decodePayment: vi.fn(),
    },
  },
}));

describe("paymentMiddleware()", () => {
  let mockContext: Context;
  let mockNext: () => Promise<void>;
  let middleware: ReturnType<typeof paymentMiddleware>;
  let mockVerify: ReturnType<typeof useFacilitator>["verify"];
  let mockSettle: ReturnType<typeof useFacilitator>["settle"];
  let mockSupported: ReturnType<typeof useFacilitator>["supported"];

  const middlewareConfig: PaymentMiddlewareConfig = {
    description: "Test payment",
    mimeType: "application/json",
    maxTimeoutSeconds: 300,
    outputSchema: { type: "object" },
    inputSchema: { queryParams: { type: "string" } },
    resource: "https://api.example.com/resource",
  };
  const outputSchema = {
    input: {
      method: "GET",
      type: "http",
      discoverable: true,
      ...middlewareConfig.inputSchema,
    },
    output: middlewareConfig.outputSchema,
  };

  const facilitatorConfig: FacilitatorConfig = {
    url: "https://facilitator.example.com",
  };

  const payTo = "0x1234567890123456789012345678901234567890";

  const routesConfig: RoutesConfig = {
    "/weather": {
      price: "$0.001",
      network: "bsc-mainnet",
      config: middlewareConfig,
    },
  };

  const validPayment: PaymentPayload = {
    scheme: "exact",
    x402Version: 1,
    network: "bsc-mainnet",
    payload: {
      signature: "0x123",
      authorization: {
        from: "0x123",
        to: "0x456",
        value: "0x123",
        validAfter: "0x123",
        validBefore: "0x123",
        nonce: "0x123",
      },
    },
  };
  const encodedValidPayment = "encoded-payment";

  beforeEach(() => {
    vi.resetAllMocks();

    mockContext = {
      req: {
        url: "http://localhost:3000/weather",
        path: "/weather",
        method: "GET",
        header: vi.fn(),
        headers: new Headers(),
      },
      res: {
        status: 200,
        headers: new Headers(),
      },
      header: vi.fn(),
      json: vi.fn(),
      html: vi.fn(),
    } as unknown as Context;

    mockNext = vi.fn();
    mockVerify = vi.fn() as ReturnType<typeof useFacilitator>["verify"];
    mockSettle = vi.fn() as ReturnType<typeof useFacilitator>["settle"];
    (useFacilitator as ReturnType<typeof vi.fn>).mockReturnValue({
      verify: mockVerify,
      settle: mockSettle,
    });
    (getPaywallHtml as ReturnType<typeof vi.fn>).mockReturnValue("<html>Paywall</html>");

    // Setup exact.evm mocks
    (exact.evm.encodePayment as ReturnType<typeof vi.fn>).mockReturnValue(encodedValidPayment);
    (exact.evm.decodePayment as ReturnType<typeof vi.fn>).mockReturnValue(validPayment);

    // Setup findMatchingRoute mock
    (findMatchingRoute as ReturnType<typeof vi.fn>).mockImplementation(
      (routePatterns, path, method) => {
        if (path === "/weather" && method === "GET") {
          return {
            verb: "GET",
            pattern: /^\/weather$/,
            config: {
              price: "$0.001",
              network: "bsc-mainnet",
              config: middlewareConfig,
            },
          };
        }
        return undefined;
      },
    );

    middleware = paymentMiddleware(payTo, routesConfig, facilitatorConfig);
  });

  it("should return 402 with payment requirements when no payment header is present", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "Accept") return "application/json";
      return undefined;
    });

    await middleware(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: "X-PAYMENT header is required",
        accepts: [
          {
            scheme: "exact",
            network: "bsc-mainnet",
            maxAmountRequired: "1000",
            resource: "https://api.example.com/resource",
            description: "Test payment",
            mimeType: "application/json",
            payTo: "0x1234567890123456789012345678901234567890",
            maxTimeoutSeconds: 300,
            asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            outputSchema,
            extra: {
              name: "USDC",
              version: "2",
            },
          },
        ],
        x402Version: 1,
      },
      402,
    );
  });

  it("should return 402 with feePayer for solana-devnet when no payment header is present", async () => {
    const solanaRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "solana-devnet",
        config: middlewareConfig,
      },
    };
    const solanaPayTo = "CKy5kSzS3K2V4RcedtEa7hC43aYk5tq6z6A4vZnE1fVz";
    const feePayer = "FeePayerAddress12345";
    const supportedResponse = {
      kinds: [
        {
          scheme: "exact",
          network: "solana-devnet",
          extra: { feePayer },
        },
      ],
    };

    mockSupported = vi.fn().mockResolvedValue(supportedResponse);
    (useFacilitator as ReturnType<typeof vi.fn>).mockReturnValue({
      verify: mockVerify,
      settle: mockSettle,
      supported: mockSupported,
    });

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "solana-devnet",
        config: middlewareConfig,
      },
    });

    const middlewareSol = paymentMiddleware(
      solanaPayTo as SolanaAddress,
      solanaRoutesConfig,
      facilitatorConfig,
    );

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

    await middlewareSol(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accepts: expect.arrayContaining([
          expect.objectContaining({
            network: "solana-devnet",
            payTo: solanaPayTo,
            extra: expect.objectContaining({ feePayer }),
          }),
        ]),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should return 402 with feePayer for solana when no payment header is present", async () => {
    const solanaRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "solana",
        config: middlewareConfig,
      },
    };
    const solanaPayTo = "CKy5kSzS3K2V4RcedtEa7hC43aYk5tq6z6A4vZnE1fVz";
    const feePayer = "FeePayerAddressMainnet";
    const supportedResponse = {
      kinds: [
        {
          scheme: "exact",
          network: "solana",
          extra: { feePayer },
        },
      ],
    };

    mockSupported = vi.fn().mockResolvedValue(supportedResponse);
    (useFacilitator as ReturnType<typeof vi.fn>).mockReturnValue({
      verify: mockVerify,
      settle: mockSettle,
      supported: mockSupported,
    });

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "solana",
        config: middlewareConfig,
      },
    });

    const middlewareSol = paymentMiddleware(
      solanaPayTo as SolanaAddress,
      solanaRoutesConfig,
      facilitatorConfig,
    );

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

    await middlewareSol(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accepts: expect.arrayContaining([
          expect.objectContaining({
            network: "solana",
            payTo: solanaPayTo,
            extra: expect.objectContaining({ feePayer }),
          }),
        ]),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should throw error for unsupported network", async () => {
    const unsupportedRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "unsupported-network" as Network,
        config: middlewareConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "unsupported-network",
        config: middlewareConfig,
      },
    });

    const middlewareUnsupported = paymentMiddleware(
      payTo,
      unsupportedRoutesConfig,
      facilitatorConfig,
    );

    await expect(middlewareUnsupported(mockContext, mockNext)).rejects.toThrow(
      "Unsupported network: unsupported-network",
    );
  });

  it("should throw error when SVM facilitator does not provide fee payer", async () => {
    const solanaRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "solana-devnet",
        config: middlewareConfig,
      },
    };
    const solanaPayTo = "CKy5kSzS3K2V4RcedtEa7hC43aYk5tq6z6A4vZnE1fVz";
    const supportedResponse = {
      kinds: [
        {
          scheme: "exact",
          network: "solana-devnet",
          extra: {}, // No feePayer
        },
      ],
    };

    mockSupported = vi.fn().mockResolvedValue(supportedResponse);
    (useFacilitator as ReturnType<typeof vi.fn>).mockReturnValue({
      verify: mockVerify,
      settle: mockSettle,
      supported: mockSupported,
    });

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "solana-devnet",
        config: middlewareConfig,
      },
    });

    const middlewareSol = paymentMiddleware(
      solanaPayTo as SolanaAddress,
      solanaRoutesConfig,
      facilitatorConfig,
    );

    await expect(middlewareSol(mockContext, mockNext)).rejects.toThrow(
      "The facilitator did not provide a fee payer for network: solana-devnet.",
    );
  });

  it("should handle custom error messages for payment required", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        paymentRequired: "Custom payment required message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "Accept") return "application/json";
      return undefined;
    });

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom payment required message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should handle custom error messages for invalid payment", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        invalidPayment: "Custom invalid payment message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    const invalidPayment = "invalid-payment-header";
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return invalidPayment;
      return undefined;
    });

    (exact.evm.decodePayment as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Invalid payment");
    });

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom invalid payment message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should handle custom error messages for no matching requirements", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        noMatchingRequirements: "Custom no matching requirements message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return undefined
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue(undefined);

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom no matching requirements message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should handle custom error messages for verification failed", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        verificationFailed: "Custom verification failed message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      isValid: false,
      invalidReason: "insufficient_funds",
    });

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom verification failed message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should handle custom error messages for settlement failed", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        settlementFailed: "Custom settlement failed message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });
    (mockSettle as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Settlement failed"));

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom settlement failed message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should handle settlement response failure with custom error message", async () => {
    const customErrorConfig: PaymentMiddlewareConfig = {
      ...middlewareConfig,
      errorMessages: {
        settlementFailed: "Custom settlement response failed message",
      },
    };

    const customRoutesConfig: RoutesConfig = {
      "/weather": {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    };

    (findMatchingRoute as ReturnType<typeof vi.fn>).mockReturnValue({
      verb: "GET",
      pattern: /^\/weather$/,
      config: {
        price: "$0.001",
        network: "bsc-mainnet",
        config: customErrorConfig,
      },
    });

    const middlewareCustom = paymentMiddleware(payTo, customRoutesConfig, facilitatorConfig);

    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });
    (mockSettle as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      errorReason: "insufficient_balance",
      transaction: "0x123",
      network: "bsc-mainnet",
      payer: "0x123",
    });

    await middlewareCustom(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Custom settlement response failed message",
        accepts: expect.any(Array),
        x402Version: 1,
      }),
      402,
    );
  });

  it("should return HTML paywall for browser requests", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "Accept") return "text/html";
      if (name === "User-Agent") return "Mozilla/5.0";
      return undefined;
    });

    await middleware(mockContext, mockNext);

    expect(mockContext.html).toHaveBeenCalledWith("<html>Paywall</html>", 402);
  });

  it("should verify payment and proceed if valid", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });

    await middleware(mockContext, mockNext);

    expect(exact.evm.decodePayment).toHaveBeenCalledWith(encodedValidPayment);
    expect(mockVerify).toHaveBeenCalledWith(validPayment, expect.any(Object));
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return 402 if payment verification fails", async () => {
    const invalidPayment = "invalid-payment-header";
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return invalidPayment;
      return undefined;
    });

    (exact.evm.decodePayment as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Invalid payment");
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      isValid: false,
      invalidReason: "insufficient_funds",
    });

    await middleware(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        x402Version: 1,
        error: new Error("Invalid payment"),
        accepts: [
          {
            scheme: "exact",
            network: "bsc-mainnet",
            maxAmountRequired: "1000",
            resource: "https://api.example.com/resource",
            description: "Test payment",
            mimeType: "application/json",
            payTo: "0x1234567890123456789012345678901234567890",
            maxTimeoutSeconds: 300,
            asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            outputSchema,
            extra: {
              name: "USDC",
              version: "2",
            },
          },
        ],
      },
      402,
    );
  });

  it("should handle settlement after response", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });
    (mockSettle as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      transaction: "0x123",
      network: "bsc-mainnet",
    });

    // Mock the json method to simulate response already sent
    const originalJson = mockContext.json;
    mockContext.json = vi.fn().mockImplementation(() => {
      throw new Error("Response already sent");
    });

    // Spy on the Headers.set method
    const headersSpy = vi.spyOn(mockContext.res.headers, "set");

    await middleware(mockContext, mockNext);

    expect(exact.evm.decodePayment).toHaveBeenCalledWith(encodedValidPayment);
    expect(mockSettle).toHaveBeenCalledWith(validPayment, expect.any(Object));
    expect(headersSpy).toHaveBeenCalledWith("X-PAYMENT-RESPONSE", expect.any(String));

    // Restore original json method
    mockContext.json = originalJson;
    // Restore the spy
    headersSpy.mockRestore();
  });

  it("should handle settlement failure before response is sent", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });

    // Mock findMatchingPaymentRequirements to return a valid requirement
    vi.mocked(findMatchingPaymentRequirements).mockReturnValue({
      scheme: "exact",
      network: "bsc-mainnet",
      maxAmountRequired: "1000",
      resource: "https://api.example.com/resource",
      description: "Test payment",
      mimeType: "application/json",
      payTo: "0x1234567890123456789012345678901234567890",
      maxTimeoutSeconds: 300,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      outputSchema: {
        input: {
          type: "http",
          method: "GET",
          queryParams: { type: "string" },
        },
        output: { type: "object" },
      },
      extra: {
        name: "USDC",
        version: "2",
      },
    });

    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });
    (mockSettle as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Settlement failed"));

    await middleware(mockContext, mockNext);

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        x402Version: 1,
        error: new Error("Settlement failed"),
        accepts: [
          {
            scheme: "exact",
            network: "bsc-mainnet",
            maxAmountRequired: "1000",
            resource: "https://api.example.com/resource",
            description: "Test payment",
            mimeType: "application/json",
            payTo: "0x1234567890123456789012345678901234567890",
            maxTimeoutSeconds: 300,
            asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            outputSchema,
            extra: {
              name: "USDC",
              version: "2",
            },
          },
        ],
      },
      402,
    );
  });

  it("should not settle payment if protected route returns status >= 400", async () => {
    (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      if (name === "X-PAYMENT") return encodedValidPayment;
      return undefined;
    });
    (mockVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: true });
    (mockSettle as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      transaction: "0x123",
      network: "bsc-mainnet",
    });

    // Simulate downstream handler setting status 500
    Object.defineProperty(mockContext.res, "status", { value: 500, writable: true });

    await middleware(mockContext, mockNext);

    expect(mockSettle).not.toHaveBeenCalled();
    expect(mockContext.res.status).toBe(500);
  });

  describe("session token integration", () => {
    it("should pass sessionTokenEndpoint to paywall HTML when configured", async () => {
      const paywallConfig = {
        cdpClientKey: "test-client-key",
        appName: "Test App",
        appLogo: "/test-logo.png",
        sessionTokenEndpoint: "/api/x402/session-token",
      };

      const middlewareWithPaywall = paymentMiddleware(
        payTo,
        routesConfig,
        facilitatorConfig,
        paywallConfig,
      );

      (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        if (name === "Accept") return "text/html";
        if (name === "User-Agent") return "Mozilla/5.0";
        return undefined;
      });

      await middlewareWithPaywall(mockContext, mockNext);

      expect(getPaywallHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          cdpClientKey: "test-client-key",
          appName: "Test App",
          appLogo: "/test-logo.png",
          sessionTokenEndpoint: "/api/x402/session-token",
        }),
      );
    });

    it("should not pass sessionTokenEndpoint when not configured", async () => {
      const paywallConfig = {
        cdpClientKey: "test-client-key",
        appName: "Test App",
      };

      const middlewareWithPaywall = paymentMiddleware(
        payTo,
        routesConfig,
        facilitatorConfig,
        paywallConfig,
      );

      (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        if (name === "Accept") return "text/html";
        if (name === "User-Agent") return "Mozilla/5.0";
        return undefined;
      });

      await middlewareWithPaywall(mockContext, mockNext);

      expect(getPaywallHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          cdpClientKey: "test-client-key",
          appName: "Test App",
          sessionTokenEndpoint: undefined,
        }),
      );
    });

    it("should pass sessionTokenEndpoint even when other paywall config is minimal", async () => {
      const paywallConfig = {
        sessionTokenEndpoint: "/custom/session-token",
      };

      const middlewareWithPaywall = paymentMiddleware(
        payTo,
        routesConfig,
        facilitatorConfig,
        paywallConfig,
      );

      (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        if (name === "Accept") return "text/html";
        if (name === "User-Agent") return "Mozilla/5.0";
        return undefined;
      });

      await middlewareWithPaywall(mockContext, mockNext);

      expect(getPaywallHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTokenEndpoint: "/custom/session-token",
          cdpClientKey: undefined,
          appName: undefined,
          appLogo: undefined,
        }),
      );
    });

    it("should work without any paywall config", async () => {
      const middlewareWithoutPaywall = paymentMiddleware(payTo, routesConfig, facilitatorConfig);

      (mockContext.req.header as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        if (name === "Accept") return "text/html";
        if (name === "User-Agent") return "Mozilla/5.0";
        return undefined;
      });

      await middlewareWithoutPaywall(mockContext, mockNext);

      expect(getPaywallHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTokenEndpoint: undefined,
          cdpClientKey: undefined,
          appName: undefined,
          appLogo: undefined,
        }),
      );
    });
  });
});
