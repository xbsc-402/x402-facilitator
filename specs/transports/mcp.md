# Transport: MCP (Model Context Protocol)

## Summary

The MCP transport implements x402 payment flows over the Model Context Protocol using JSON-RPC messages. This enables AI agents and MCP clients to seamlessly pay for tools and resources independent of the underlying MCP transport.

The flow described below can be used for any MCP request/response cycle: tool calls, resources or client/server initialization.

## Payment Required Signaling

The server indicates payment is required using JSON-RPC's native error format with a 402 status code.

**Mechanism**: JSON-RPC error response with `code: 402` and `PaymentRequirementsResponse` in `error.data`
**Data Format**: `PaymentRequirementsResponse` schema in `error.data` field

**Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment required",
    "data": {
      "x402Version": 1,
      "error": "Payment required to access this resource",
      "accepts": [
        {
          "scheme": "exact",
          "network": "bsc-mainnet",
          "maxAmountRequired": "10000",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
          "resource": "mcp://tool/financial_analysis",
          "description": "Advanced financial analysis tool",
          "mimeType": "application/json",
          "outputSchema": null,
          "maxTimeoutSeconds": 60,
          "extra": {
            "name": "USDC",
            "version": "2"
          }
        }
      ]
    }
  }
}
```

## Payment Payload Transmission

Clients send payment data using the MCP `_meta` field with key `x402/payment`.

**Mechanism**: `_meta["x402/payment"]` field in request parameters
**Data Format**: `PaymentPayload` schema in metadata field

**Example (Tool Call with Payment):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "financial_analysis",
    "arguments": {
      "ticker": "AAPL",
      "analysis_type": "deep"
    },
    "_meta": {
      "x402/payment": {
        "x402Version": 1,
        "scheme": "exact",
        "network": "bsc-mainnet",
        "payload": {
          "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34008c8e8986a1283259764173608a2ce6496642e377d6da8dbbf5836e9bd15092f9ecab05ded3d6293af148b571c",
          "authorization": {
            "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
            "to": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
            "value": "10000",
            "validAfter": "1740672089",
            "validBefore": "1740672154",
            "nonce": "0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480"
          }
        }
      }
    }
  }
}
```

## Settlement Response Delivery

Servers communicate payment settlement results using the `_meta["x402/payment-response"]` field.

**Mechanism**: `_meta["x402/payment-response"]` field in response result
**Data Format**: `SettlementResponse` schema in metadata field

**Example (Successful Tool Response):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Financial analysis for AAPL: Strong fundamentals with positive outlook..."
      }
    ],
    "_meta": {
      "x402/payment-response": {
        "success": true,
        "transaction": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "network": "bsc-mainnet",
        "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
      }
    }
  }
}
```

**Example (Payment Failure):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment settlement failed: insufficient funds",
    "data": {
      "x402Version": 1,
      "error": "Payment settlement failed: insufficient funds",
      "accepts": [
        /* original payment requirements */
      ],
      "x402/payment-response": {
        "success": false,
        "errorReason": "insufficient_funds",
        "transaction": "",
        "network": "bsc-mainnet",
        "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
      }
    }
  }
}
```

## Error Handling

MCP transport maps x402 errors to appropriate JSON-RPC mechanisms:

| x402 Error       | JSON-RPC Response | Code   | Description                                                    |
| ---------------- | ----------------- | ------ | -------------------------------------------------------------- |
| Payment Required | Error Response    | 402    | Payment required with `PaymentRequirementsResponse` in `data` |
| Payment Failed   | Error Response    | 402    | Payment settlement failed with failure details in `data`      |
| Invalid Payment  | Error Response    | -32602 | Malformed payment payload or invalid parameters                |
| Server Error     | Error Response    | -32603 | Internal server error during payment processing                |
| Parse Error      | Error Response    | -32700 | Invalid JSON in payment payload                                |
| Method Error     | Error Response    | -32601 | Unsupported x402 method or capability                          |

### Payment-Related Errors (402)

Payment-related errors use JSON-RPC's native error format with code 402 and structured data:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment required to access this resource",
    "data": {
      "x402Version": 1,
      "error": "Payment required to access this resource",
      "accepts": [
        /* PaymentRequirements array */
      ]
    }
  }
}
```

### Protocol Errors (Technical Issues)

Technical errors use standard JSON-RPC error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid parameters: malformed payment payload in _meta['x402/payment']"
  }
}
```

**Common Protocol Error Examples:**

- **Parse Error (-32700)**: Invalid JSON in `_meta["x402/payment"]` field
- **Invalid Params (-32602)**: Missing required payment fields or invalid payment schema
- **Internal Error (-32603)**: Payment processor unavailable or blockchain network error
- **Method Not Found (-32601)**: Server doesn't support x402 payments for the requested method

## References

- [Core x402 Specification](../x402-specification.md)
- [MCP Specification](https://modelcontextprotocol.io/specification/)
- [MCP \_meta Field Documentation](https://modelcontextprotocol.io/specification/2025-06-18/basic#meta)
- [x402-mcp](https://github.com/ethanniser/x402-mcp)
- [agents/x402-mcp](https://github.com/cloudflare/agents/blob/main/packages/agents/src/mcp/x402.ts)
