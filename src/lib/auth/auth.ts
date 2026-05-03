import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";

import { sendMagicLinkEmail } from "@/features/auth/emails/dispatch";
import { auditLog } from "@/lib/audit/log";
import { sleepRandomMs } from "@/lib/auth/anti-timing";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { rateLimitMagicLink } from "@/lib/ratelimit";

export const auth = betterAuth({
	database: prismaAdapter(db, { provider: "postgresql" }),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: { enabled: false },
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: { enabled: true, maxAge: 60 * 5 },
	},
	experimental: { joins: true },
	trustedOrigins: [env.BETTER_AUTH_URL],
	plugins: [
		magicLink({
			expiresIn: 60 * 15,
			disableSignUp: true,
			storeToken: "hashed",
			sendMagicLink: async ({ email, url }, ctx) => {
				const request = ctx?.request as Request | undefined;
				const ipAddress =
					request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
					null;

				// Anti-timing: always sleep before any branching, so timing of
				// "user exists" vs "user does not exist" is indistinguishable.
				await sleepRandomMs(100, 300);

				const user = await db.user.findUnique({
					where: { email },
					select: { id: true, name: true, revokedAt: true },
				});

				if (!user || user.revokedAt) {
					await auditLog.write({
						action: "MAGIC_LINK_SENT",
						actorEmail: email,
						actorId: user?.id ?? null,
						metadata: {
							suppressed: true,
							reason: !user ? "user_not_found" : "user_revoked",
						},
						request,
					});
					return;
				}

				const allowed = await rateLimitMagicLink({ email, ipAddress });
				if (!allowed) {
					await auditLog.write({
						action: "MAGIC_LINK_SENT",
						actorEmail: email,
						actorId: user.id,
						metadata: { suppressed: true, reason: "rate_limited" },
						request,
					});
					return;
				}

				await sendMagicLinkEmail({
					to: email,
					magicLinkUrl: url,
					recipientName: user.name,
				});

				await auditLog.write({
					action: "MAGIC_LINK_SENT",
					actorEmail: email,
					actorId: user.id,
					request,
				});
			},
		}),
		nextCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
