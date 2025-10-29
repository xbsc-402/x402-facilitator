import { z } from "zod";
export declare const schemes: readonly ["exact"];
export declare const x402Versions: readonly [1];
export declare const ErrorReasons: readonly ["insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"];
export declare const PaymentRequirementsSchema: z.ZodObject<{
    scheme: z.ZodEnum<["exact"]>;
    network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
    maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
    resource: z.ZodString;
    description: z.ZodString;
    mimeType: z.ZodString;
    outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
    maxTimeoutSeconds: z.ZodNumber;
    asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
    extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    scheme: "exact";
    asset: string;
    maxAmountRequired: string;
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    resource: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    outputSchema?: Record<string, any> | undefined;
    extra?: Record<string, any> | undefined;
}, {
    description: string;
    scheme: "exact";
    asset: string;
    maxAmountRequired: string;
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    resource: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    outputSchema?: Record<string, any> | undefined;
    extra?: Record<string, any> | undefined;
}>;
export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;
export declare const ExactEvmPayloadAuthorizationSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    value: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    validAfter: z.ZodEffects<z.ZodString, string, string>;
    validBefore: z.ZodEffects<z.ZodString, string, string>;
    nonce: z.ZodString;
}, "strip", z.ZodTypeAny, {
    to: string;
    from: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
}, {
    to: string;
    from: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
}>;
export type ExactEvmPayloadAuthorization = z.infer<typeof ExactEvmPayloadAuthorizationSchema>;
export declare const ExactEvmPayloadSchema: z.ZodObject<{
    signature: z.ZodString;
    authorization: z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        value: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        validAfter: z.ZodEffects<z.ZodString, string, string>;
        validBefore: z.ZodEffects<z.ZodString, string, string>;
        nonce: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        to: string;
        from: string;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: string;
    }, {
        to: string;
        from: string;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: string;
    }>;
}, "strip", z.ZodTypeAny, {
    signature: string;
    authorization: {
        to: string;
        from: string;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: string;
    };
}, {
    signature: string;
    authorization: {
        to: string;
        from: string;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: string;
    };
}>;
export type ExactEvmPayload = z.infer<typeof ExactEvmPayloadSchema>;
export declare const ExactSvmPayloadSchema: z.ZodObject<{
    transaction: z.ZodString;
}, "strip", z.ZodTypeAny, {
    transaction: string;
}, {
    transaction: string;
}>;
export type ExactSvmPayload = z.infer<typeof ExactSvmPayloadSchema>;
export declare const PaymentPayloadSchema: z.ZodObject<{
    x402Version: z.ZodEffects<z.ZodNumber, number, number>;
    scheme: z.ZodEnum<["exact"]>;
    network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
    payload: z.ZodUnion<[z.ZodObject<{
        signature: z.ZodString;
        authorization: z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            value: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            validAfter: z.ZodEffects<z.ZodString, string, string>;
            validBefore: z.ZodEffects<z.ZodString, string, string>;
            nonce: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        }, {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        signature: string;
        authorization: {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    }, {
        signature: string;
        authorization: {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    }>, z.ZodObject<{
        transaction: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        transaction: string;
    }, {
        transaction: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    scheme: "exact";
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    x402Version: number;
    payload: {
        signature: string;
        authorization: {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    } | {
        transaction: string;
    };
}, {
    scheme: "exact";
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    x402Version: number;
    payload: {
        signature: string;
        authorization: {
            to: string;
            from: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    } | {
        transaction: string;
    };
}>;
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
export type UnsignedPaymentPayload = Omit<PaymentPayload, "payload"> & {
    payload: Omit<ExactEvmPayload, "signature"> & {
        signature: undefined;
    };
};
export declare const x402ResponseSchema: z.ZodObject<{
    x402Version: z.ZodEffects<z.ZodNumber, number, number>;
    error: z.ZodOptional<z.ZodEnum<["insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"]>>;
    accepts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
        resource: z.ZodString;
        description: z.ZodString;
        mimeType: z.ZodString;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
        maxTimeoutSeconds: z.ZodNumber;
        asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }>, "many">>;
    payer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    x402Version: number;
    error?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
    payer?: string | undefined;
    accepts?: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }[] | undefined;
}, {
    x402Version: number;
    error?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
    payer?: string | undefined;
    accepts?: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }[] | undefined;
}>;
export type x402Response = z.infer<typeof x402ResponseSchema>;
declare const HTTPVerbsSchema: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]>;
export type HTTPVerbs = z.infer<typeof HTTPVerbsSchema>;
export declare const HTTPRequestStructureSchema: z.ZodObject<{
    type: z.ZodLiteral<"http">;
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]>;
    queryParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyType: z.ZodOptional<z.ZodEnum<["json", "form-data", "multipart-form-data", "text", "binary"]>>;
    bodyFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    headerFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "http";
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    queryParams?: Record<string, string> | undefined;
    bodyType?: "binary" | "json" | "form-data" | "multipart-form-data" | "text" | undefined;
    bodyFields?: Record<string, any> | undefined;
    headerFields?: Record<string, any> | undefined;
}, {
    type: "http";
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    queryParams?: Record<string, string> | undefined;
    bodyType?: "binary" | "json" | "form-data" | "multipart-form-data" | "text" | undefined;
    bodyFields?: Record<string, any> | undefined;
    headerFields?: Record<string, any> | undefined;
}>;
export declare const RequestStructureSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"http">;
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]>;
    queryParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyType: z.ZodOptional<z.ZodEnum<["json", "form-data", "multipart-form-data", "text", "binary"]>>;
    bodyFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    headerFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "http";
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    queryParams?: Record<string, string> | undefined;
    bodyType?: "binary" | "json" | "form-data" | "multipart-form-data" | "text" | undefined;
    bodyFields?: Record<string, any> | undefined;
    headerFields?: Record<string, any> | undefined;
}, {
    type: "http";
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    queryParams?: Record<string, string> | undefined;
    bodyType?: "binary" | "json" | "form-data" | "multipart-form-data" | "text" | undefined;
    bodyFields?: Record<string, any> | undefined;
    headerFields?: Record<string, any> | undefined;
}>]>;
export type HTTPRequestStructure = z.infer<typeof HTTPRequestStructureSchema>;
export type RequestStructure = z.infer<typeof RequestStructureSchema>;
export declare const DiscoveredResourceSchema: z.ZodObject<{
    resource: z.ZodString;
    type: z.ZodEnum<["http"]>;
    x402Version: z.ZodEffects<z.ZodNumber, number, number>;
    accepts: z.ZodArray<z.ZodObject<{
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
        resource: z.ZodString;
        description: z.ZodString;
        mimeType: z.ZodString;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
        maxTimeoutSeconds: z.ZodNumber;
        asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }>, "many">;
    lastUpdated: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "http";
    resource: string;
    x402Version: number;
    accepts: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }[];
    lastUpdated: Date;
    metadata?: Record<string, any> | undefined;
}, {
    type: "http";
    resource: string;
    x402Version: number;
    accepts: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }[];
    lastUpdated: Date;
    metadata?: Record<string, any> | undefined;
}>;
export type DiscoveredResource = z.infer<typeof DiscoveredResourceSchema>;
export declare const SettleRequestSchema: z.ZodObject<{
    paymentPayload: z.ZodObject<{
        x402Version: z.ZodEffects<z.ZodNumber, number, number>;
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        payload: z.ZodUnion<[z.ZodObject<{
            signature: z.ZodString;
            authorization: z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                value: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
                validAfter: z.ZodEffects<z.ZodString, string, string>;
                validBefore: z.ZodEffects<z.ZodString, string, string>;
                nonce: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            }, {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        }, {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        }>, z.ZodObject<{
            transaction: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            transaction: string;
        }, {
            transaction: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    }, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    }>;
    paymentRequirements: z.ZodObject<{
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
        resource: z.ZodString;
        description: z.ZodString;
        mimeType: z.ZodString;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
        maxTimeoutSeconds: z.ZodNumber;
        asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    paymentPayload: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    };
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
}, {
    paymentPayload: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    };
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
}>;
export type SettleRequest = z.infer<typeof SettleRequestSchema>;
export declare const VerifyRequestSchema: z.ZodObject<{
    paymentPayload: z.ZodObject<{
        x402Version: z.ZodEffects<z.ZodNumber, number, number>;
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        payload: z.ZodUnion<[z.ZodObject<{
            signature: z.ZodString;
            authorization: z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                value: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
                validAfter: z.ZodEffects<z.ZodString, string, string>;
                validBefore: z.ZodEffects<z.ZodString, string, string>;
                nonce: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            }, {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        }, {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        }>, z.ZodObject<{
            transaction: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            transaction: string;
        }, {
            transaction: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    }, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    }>;
    paymentRequirements: z.ZodObject<{
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
        resource: z.ZodString;
        description: z.ZodString;
        mimeType: z.ZodString;
        outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
        maxTimeoutSeconds: z.ZodNumber;
        asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }, {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    paymentPayload: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    };
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
}, {
    paymentPayload: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        payload: {
            signature: string;
            authorization: {
                to: string;
                from: string;
                value: string;
                validAfter: string;
                validBefore: string;
                nonce: string;
            };
        } | {
            transaction: string;
        };
    };
    paymentRequirements: {
        description: string;
        scheme: "exact";
        asset: string;
        maxAmountRequired: string;
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        resource: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        outputSchema?: Record<string, any> | undefined;
        extra?: Record<string, any> | undefined;
    };
}>;
export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;
export declare const VerifyResponseSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    invalidReason: z.ZodOptional<z.ZodEnum<["insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"]>>;
    payer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
}, "strip", z.ZodTypeAny, {
    isValid: boolean;
    invalidReason?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
    payer?: string | undefined;
}, {
    isValid: boolean;
    invalidReason?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
    payer?: string | undefined;
}>;
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
export declare const SettleResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    errorReason: z.ZodOptional<z.ZodEnum<["insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"]>>;
    payer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    transaction: z.ZodString;
    network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    transaction: string;
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    payer?: string | undefined;
    errorReason?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
}, {
    success: boolean;
    transaction: string;
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    payer?: string | undefined;
    errorReason?: "invalid_exact_svm_payload_transaction" | "insufficient_funds" | "invalid_exact_evm_payload_authorization_valid_after" | "invalid_exact_evm_payload_authorization_valid_before" | "invalid_exact_evm_payload_authorization_value" | "invalid_exact_evm_payload_signature" | "invalid_exact_evm_payload_recipient_mismatch" | "invalid_exact_svm_payload_transaction_amount_mismatch" | "invalid_exact_svm_payload_transaction_create_ata_instruction" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee" | "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset" | "invalid_exact_svm_payload_transaction_instructions" | "invalid_exact_svm_payload_transaction_instructions_length" | "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction" | "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high" | "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked" | "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked" | "invalid_exact_svm_payload_transaction_not_a_transfer_instruction" | "invalid_exact_svm_payload_transaction_receiver_ata_not_found" | "invalid_exact_svm_payload_transaction_sender_ata_not_found" | "invalid_exact_svm_payload_transaction_simulation_failed" | "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata" | "invalid_network" | "invalid_payload" | "invalid_payment_requirements" | "invalid_scheme" | "invalid_payment" | "payment_expired" | "unsupported_scheme" | "invalid_x402_version" | "invalid_transaction_state" | "settle_exact_svm_block_height_exceeded" | "settle_exact_svm_transaction_confirmation_timed_out" | "unexpected_settle_error" | "unexpected_verify_error" | undefined;
}>;
export type SettleResponse = z.infer<typeof SettleResponseSchema>;
export declare const ListDiscoveryResourcesRequestSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    type?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListDiscoveryResourcesRequest = z.infer<typeof ListDiscoveryResourcesRequestSchema>;
export declare const ListDiscoveryResourcesResponseSchema: z.ZodObject<{
    x402Version: z.ZodEffects<z.ZodNumber, number, number>;
    items: z.ZodArray<z.ZodObject<{
        resource: z.ZodString;
        type: z.ZodEnum<["http"]>;
        x402Version: z.ZodEffects<z.ZodNumber, number, number>;
        accepts: z.ZodArray<z.ZodObject<{
            scheme: z.ZodEnum<["exact"]>;
            network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
            maxAmountRequired: z.ZodEffects<z.ZodString, string, string>;
            resource: z.ZodString;
            description: z.ZodString;
            mimeType: z.ZodString;
            outputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            payTo: z.ZodUnion<[z.ZodString, z.ZodString]>;
            maxTimeoutSeconds: z.ZodNumber;
            asset: z.ZodUnion<[z.ZodString, z.ZodString]>;
            extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }, {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }>, "many">;
        lastUpdated: z.ZodDate;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "http";
        resource: string;
        x402Version: number;
        accepts: {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }[];
        lastUpdated: Date;
        metadata?: Record<string, any> | undefined;
    }, {
        type: "http";
        resource: string;
        x402Version: number;
        accepts: {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }[];
        lastUpdated: Date;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    pagination: z.ZodObject<{
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        offset: number;
        total: number;
    }, {
        limit: number;
        offset: number;
        total: number;
    }>;
}, "strip", z.ZodTypeAny, {
    x402Version: number;
    items: {
        type: "http";
        resource: string;
        x402Version: number;
        accepts: {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }[];
        lastUpdated: Date;
        metadata?: Record<string, any> | undefined;
    }[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}, {
    x402Version: number;
    items: {
        type: "http";
        resource: string;
        x402Version: number;
        accepts: {
            description: string;
            scheme: "exact";
            asset: string;
            maxAmountRequired: string;
            network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
            resource: string;
            mimeType: string;
            payTo: string;
            maxTimeoutSeconds: number;
            outputSchema?: Record<string, any> | undefined;
            extra?: Record<string, any> | undefined;
        }[];
        lastUpdated: Date;
        metadata?: Record<string, any> | undefined;
    }[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}>;
export type ListDiscoveryResourcesResponse = z.infer<typeof ListDiscoveryResourcesResponseSchema>;
export declare const SupportedPaymentKindSchema: z.ZodObject<{
    x402Version: z.ZodEffects<z.ZodNumber, number, number>;
    scheme: z.ZodEnum<["exact"]>;
    network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
    extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    scheme: "exact";
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    x402Version: number;
    extra?: Record<string, any> | undefined;
}, {
    scheme: "exact";
    network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
    x402Version: number;
    extra?: Record<string, any> | undefined;
}>;
export type SupportedPaymentKind = z.infer<typeof SupportedPaymentKindSchema>;
export declare const SupportedPaymentKindsResponseSchema: z.ZodObject<{
    kinds: z.ZodArray<z.ZodObject<{
        x402Version: z.ZodEffects<z.ZodNumber, number, number>;
        scheme: z.ZodEnum<["exact"]>;
        network: z.ZodEnum<["bsc", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet", "polygon", "polygon-amoy", "peaq"]>;
        extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        extra?: Record<string, any> | undefined;
    }, {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        extra?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    kinds: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        extra?: Record<string, any> | undefined;
    }[];
}, {
    kinds: {
        scheme: "exact";
        network: "bsc" | "avalanche-fuji" | "base" | "avalanche" | "sei" | "sei-testnet" | "polygon" | "polygon-amoy" | "peaq" | "iotex" | "solana-devnet" | "solana";
        x402Version: number;
        extra?: Record<string, any> | undefined;
    }[];
}>;
export type SupportedPaymentKindsResponse = z.infer<typeof SupportedPaymentKindsResponseSchema>;
export {};
//# sourceMappingURL=x402Specs.d.ts.map