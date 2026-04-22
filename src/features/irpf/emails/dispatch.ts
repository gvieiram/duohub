import "server-only";

import { IrpfContactConfirmationEmail } from "@/emails/irpf/contact-confirmation";
import { InternalNotificationEmail } from "@/emails/irpf/internal-notification";
import { env } from "@/lib/env";
import { EMAIL_FROM_ADDRESS, EMAIL_REPLY_TO, resend } from "@/lib/resend";
import type { IrpfContactPayload } from "../types";
import { whatsappLink } from "../utils";

const DUOHUB_WHATSAPP = "5548992467107";

export async function sendIrpfContactEmails(
	payload: IrpfContactPayload,
): Promise<void> {
	const contactWhatsappHref = whatsappLink(
		DUOHUB_WHATSAPP,
		"Olá! Vi a página de IR da DuoHub e gostaria de conversar sobre a minha declaração.",
	);

	const internalWhatsappHref = whatsappLink(
		payload.whatsapp,
		`Olá, ${payload.name}! Aqui é da DuoHub. Recebemos seu contato pela nossa página de IR 2026.`,
	);

	await Promise.allSettled([
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
}
