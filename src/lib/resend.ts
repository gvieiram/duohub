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
