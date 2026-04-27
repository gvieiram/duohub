import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

const globalForResend = globalThis as unknown as {
	resend: Resend | undefined;
};

export const resend = globalForResend.resend ?? new Resend(env.RESEND_API_KEY);

if (process.env.NODE_ENV !== "production") {
	globalForResend.resend = resend;
}

export const EMAIL_FROM_ADDRESS =
	"DuoHub Gestão Contábil <contato@duohubcontabil.com.br>";
export const EMAIL_REPLY_TO = "contato@duohubcontabil.com.br";

// Resend's sandbox address: emails sent here are visible in the Resend
// dashboard but never delivered to a real inbox. We route internal
// notifications here in dev/preview so the official mailbox only receives
// real production submissions.
const RESEND_TEST_RECIPIENT = "delivered@resend.dev";

export function getInternalRecipient(): string {
	return env.VERCEL_ENV === "production"
		? env.INTERNAL_CONTACT_EMAIL
		: RESEND_TEST_RECIPIENT;
}
