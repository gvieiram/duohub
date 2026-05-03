"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { loginSchema } from "./schemas";

export type LoginActionResult = { ok: true };

export async function sendLoginMagicLinkAction(
	input: unknown,
): Promise<LoginActionResult> {
	const parsed = loginSchema.safeParse(input);

	if (!parsed.success) {
		return { ok: true };
	}

	const reqHeaders = await headers();
	// Better Auth does not synthesise `ctx.request` when the endpoint is
	// invoked from a Server Action, so IP and User-Agent must travel through
	// `body.metadata` to reach the `sendMagicLink` callback (and the audit
	// log) intact.
	const ipAddress =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		reqHeaders.get("x-real-ip")?.trim() ??
		null;
	const userAgent = reqHeaders.get("user-agent")?.trim() ?? null;

	try {
		await auth.api.signInMagicLink({
			body: {
				email: parsed.data.email,
				callbackURL: parsed.data.next ?? "/admin",
				metadata: { ipAddress, userAgent },
			},
			headers: reqHeaders,
		});
	} catch {
		// Swallow — anti-enumeration. Failures are auditable on the server.
	}

	return { ok: true };
}
