"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFacilitator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

export async function verifyPayment(payload: string): Promise<string> {
  // right now this needs to be defined in 2 places, we'll clean this up with a proper nextjs abstraction
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "bsc",
    maxAmountRequired: "10000",
    resource: "https://example.com",
    description: "Payment for a service",
    mimeType: "text/html",
    payTo: "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    maxTimeoutSeconds: 60,
    asset: "0x2CBa817f6e3Ca58ff702Dc66feEEcb230A2EF349",
    outputSchema: undefined,
    extra: {
      name: "USD4",
      version: "1",
    },
  };

  const { verify, settle } = useFacilitator(); // eslint-disable-line

  try {
    const payment = exact.evm.decodePayment(payload);
    const valid = await verify(payment, paymentRequirements);
    if (!valid.isValid) {
      throw new Error(valid.invalidReason);
    }

    const settleResponse = await settle(payment, paymentRequirements);

    if (!settleResponse.success) {
      throw new Error(settleResponse.errorReason);
    }
  } catch (error) {
    console.error({ error });
    return `Error: ${error}`;
  }

  const cookieStore = await cookies();
  // This should be a JWT signed by the server following best practices for a session token
  // See: https://nextjs.org/docs/app/guides/authentication#stateless-sessions
  cookieStore.set("payment-session", payload);
  redirect("/protected");
}
