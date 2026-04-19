import "server-only";

import { env } from "@/lib/env";
import { LEAD_FROM_ADDRESS, LEAD_REPLY_TO, resend } from "@/lib/resend";
import type { LeadPayload } from "../types";
import { whatsappLink } from "../utils";
import { InternalNotificationEmail } from "./internal-notification";
import { LeadConfirmationEmail } from "./lead-confirmation";

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
			subject: `Novo lead IR 2026 — ${payload.name}`,
			react: InternalNotificationEmail({
				name: payload.name,
				email: payload.email,
				whatsapp: payload.whatsapp,
				situation: payload.situation,
				whatsappHref: internalWhatsappHref,
				utmSource: payload.utmSource,
				utmMedium: payload.utmMedium,
				utmCampaign: payload.utmCampaign,
			}),
		}),
	]);
}
