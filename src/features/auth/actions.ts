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

	try {
		await auth.api.signInMagicLink({
			body: {
				email: parsed.data.email,
				callbackURL: parsed.data.next ?? "/admin",
			},
			headers: await headers(),
		});
	} catch {
		// Swallow — anti-enumeration. Failures are auditable on the server.
	}

	return { ok: true };
}
