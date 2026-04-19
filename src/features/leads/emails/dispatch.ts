import "server-only";

import { env } from "@/lib/env";
import { LEAD_FROM_ADDRESS, LEAD_REPLY_TO, resend } from "@/lib/resend";
import type { LeadPayload } from "../types";

export async function sendLeadEmails(payload: LeadPayload): Promise<void> {
	await Promise.allSettled([
		resend.emails.send({
			from: LEAD_FROM_ADDRESS,
			to: payload.email,
			replyTo: LEAD_REPLY_TO,
			subject: "Recebemos seu contato — IR 2026",
			text: `Olá, ${payload.name}! Recebemos seu contato. Responderemos em até 24 horas úteis.`,
		}),
		resend.emails.send({
			from: LEAD_FROM_ADDRESS,
			to: env.INTERNAL_LEADS_EMAIL,
			replyTo: payload.email,
			subject: `🆕 Novo lead IR 2026 — ${payload.name}`,
			text: JSON.stringify(payload, null, 2),
		}),
	]);
}
