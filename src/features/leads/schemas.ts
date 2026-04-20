import { z } from "zod";

const WHATSAPP_DIGITS = /^\d{10,11}$/;

export const leadSituationSchema = z.enum(
	["CLT", "AUTONOMO", "INVESTIDOR", "MEI_COM_PF", "OUTROS"],
	{ error: "Selecione uma situação" },
);

export type LeadSituation = z.infer<typeof leadSituationSchema>;

export const createLeadSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Nome muito curto")
		.max(80, "Nome muito longo"),

	email: z.string().trim().toLowerCase().email("E-mail inválido"),

	whatsapp: z
		.string()
		.trim()
		.refine((v) => WHATSAPP_DIGITS.test(v.replace(/\D/g, "")), {
			message: "WhatsApp inválido",
		}),

	situation: leadSituationSchema,

	consent: z.boolean().refine((v) => v === true, {
		message: "É necessário aceitar a política de privacidade",
	}),

	honeypot: z.string().max(0, "Submissão bloqueada"),

	utmSource: z.string().max(80).nullable().optional(),
	utmMedium: z.string().max(80).nullable().optional(),
	utmCampaign: z.string().max(80).nullable().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
