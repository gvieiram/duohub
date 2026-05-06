import "server-only";

import { MagicLinkEmail } from "@/emails/auth/magic-link";
import { EMAIL_FROM_ADDRESS, EMAIL_REPLY_TO, resend } from "@/lib/resend";

type SendMagicLinkInput = {
	to: string;
	magicLinkUrl: string;
	recipientName?: string | null;
};

export async function sendMagicLinkEmail(
	input: SendMagicLinkInput,
): Promise<void> {
	const { error } = await resend.emails.send({
		from: EMAIL_FROM_ADDRESS,
		to: input.to,
		replyTo: EMAIL_REPLY_TO,
		subject: "Seu link de acesso ao DuoHub",
		react: MagicLinkEmail({
			magicLinkUrl: input.magicLinkUrl,
			recipientName: input.recipientName,
		}),
	});

	if (error) {
		const message = error.message ?? error.name ?? "unknown";
		throw new Error(`[magic-link email] ${message}`);
	}
}
