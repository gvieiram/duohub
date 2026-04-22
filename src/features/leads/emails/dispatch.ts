import "server-only";

import { InternalNotificationEmail } from "@/emails/leads/internal-notification";
import { LeadConfirmationEmail } from "@/emails/leads/lead-confirmation";
import { env } from "@/lib/env";
import { LEAD_FROM_ADDRESS, LEAD_REPLY_TO, resend } from "@/lib/resend";
import type { LeadPayload } from "../types";
import { whatsappLink } from "../utils";

const DUOHUB_WHATSAPP = "5548992467107";

export async function sendLeadEmails(payload: LeadPayload): Promise<void> {
	const leadWhatsappHref = whatsappLink(
		DUOHUB_WHATSAPP,
		"Olá! Vi a página de IR da DuoHub e gostaria de conversar sobre a minha declaração.",
	);

	const internalWhatsappHref = whatsappLink(
		payload.whatsapp,
		`Olá, ${payload.name}! Aqui é da DuoHub. Recebemos seu contato pela nossa página de IR 2026.`,
	);

	await Promise.allSettled([
		resend.emails.send({
			from: LEAD_FROM_ADDRESS,
			to: payload.email,
			replyTo: LEAD_REPLY_TO,
			subject: "Recebemos seu contato — IR 2026",
			react: LeadConfirmationEmail({
				name: payload.name,
				whatsappHref: leadWhatsappHref,
			}),
		}),
		resend.emails.send({
			from: LEAD_FROM_ADDRESS,
			to: env.INTERNAL_LEADS_EMAIL,
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
}
