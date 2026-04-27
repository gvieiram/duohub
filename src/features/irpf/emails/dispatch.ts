import "server-only";

import { IrpfContactConfirmationEmail } from "@/emails/irpf/contact-confirmation";
import { InternalNotificationEmail } from "@/emails/irpf/internal-notification";
import { env } from "@/lib/env";
import { EMAIL_FROM_ADDRESS, EMAIL_REPLY_TO, resend } from "@/lib/resend";
import type { IrpfContactPayload } from "../types";
import { whatsappLink } from "../utils";

const DUOHUB_WHATSAPP = "5548992467107";

/**
 * Identifier of which email failed when reporting `irpf_email_send_failed`
 * to PostHog. Keep in sync with the docs in `docs/observability.md`.
 */
export type IrpfEmailKind = "contact" | "internal";

export type IrpfEmailDispatchResult = {
	kind: IrpfEmailKind;
	status: "fulfilled" | "rejected";
	error?: string;
};

/**
 * Sends the contact confirmation email (to the lead) and the internal
 * notification email (to the DuoHub inbox) in parallel.
 *
 * Returns one entry per email so the caller can decide what to do with
 * partial failures (e.g. emit `irpf_email_send_failed` to PostHog without
 * failing the whole Server Action — the contact is already persisted).
 *
 * The error message is sanitised: only `error.message` is forwarded, never
 * the full Resend response, to avoid leaking PII or API tokens into events.
 */
export async function sendIrpfContactEmails(
	payload: IrpfContactPayload,
): Promise<IrpfEmailDispatchResult[]> {
	const contactWhatsappHref = whatsappLink(
		DUOHUB_WHATSAPP,
		"Olá! Vi a página de IR da DuoHub e gostaria de conversar sobre a minha declaração.",
	);

	const internalWhatsappHref = whatsappLink(
		payload.whatsapp,
		`Olá, ${payload.name}! Aqui é da DuoHub. Recebemos seu contato pela nossa página de IR 2026.`,
	);

	const [contactResult, internalResult] = await Promise.allSettled([
		resend.emails.send({
			from: EMAIL_FROM_ADDRESS,
			to: payload.email,
			replyTo: EMAIL_REPLY_TO,
			subject: "Recebemos seu contato — IR 2026",
			react: IrpfContactConfirmationEmail({
				name: payload.name,
				whatsappHref: contactWhatsappHref,
			}),
		}),
		resend.emails.send({
			from: EMAIL_FROM_ADDRESS,
			to: env.INTERNAL_CONTACT_EMAIL,
			replyTo: payload.email,
			subject: `Novo cliente interessado — IRPF 2026 · ${payload.name}`,
			react: InternalNotificationEmail({
				name: payload.name,
				email: payload.email,
				whatsapp: payload.whatsapp,
				situation: payload.situation,
				complexity: payload.complexity,
				moment: payload.moment,
				whatsappHref: internalWhatsappHref,
			}),
		}),
	]);

	return [
		toResult("contact", contactResult),
		toResult("internal", internalResult),
	];
}

function toResult(
	kind: IrpfEmailKind,
	settled: PromiseSettledResult<unknown>,
): IrpfEmailDispatchResult {
	if (settled.status === "fulfilled") {
		return { kind, status: "fulfilled" };
	}
	const reason = settled.reason;
	const message = reason instanceof Error ? reason.message : String(reason);
	return { kind, status: "rejected", error: message };
}
