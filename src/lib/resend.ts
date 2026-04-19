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
