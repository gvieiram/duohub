import { z } from "zod";

const WHATSAPP_DIGITS = /^\d{10,11}$/;

export const leadSituationSchema = z.enum(
	["CLT", "AUTONOMO", "INVESTIDOR", "MEI", "APOSENTADO", "MULTIPLO", "NAO_SEI"],
	{ error: "Selecione uma situação" },
);

export type LeadSituation = z.infer<typeof leadSituationSchema>;

export const leadComplexitySchema = z.enum([
	"ALUGUEL",
	"VENDA_IMOVEL",
	"DEPENDENTES",
	"RENDA_VARIAVEL",
	"CRIPTOATIVOS",
	"EXTERIOR",
	"PENSAO",
	"PREVIDENCIA",
	"NENHUMA",
	"NAO_SEI",
]);

export type LeadComplexity = z.infer<typeof leadComplexitySchema>;

export const leadMomentSchema = z.enum([
	"PRIMEIRO_ANO",
	"DECLARA_SOZINHO",
	"TROCAR_CONTADOR",
	"MALHA_FINA",
	"PESQUISANDO",
]);

export type LeadMoment = z.infer<typeof leadMomentSchema>;

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

	situation: leadSituationSchema.nullish(),

	complexity: z.array(leadComplexitySchema).default([]),

	moment: leadMomentSchema.nullish(),

	consent: z.boolean().refine((v) => v === true, {
		message: "É necessário aceitar a política de privacidade",
	}),

	honeypot: z.string().max(0, "Submissão bloqueada"),

	utmSource: z.string().max(80).nullable().optional(),
	utmMedium: z.string().max(80).nullable().optional(),
	utmCampaign: z.string().max(80).nullable().optional(),
});

export type CreateLeadInput = z.input<typeof createLeadSchema>;
export type CreateLeadOutput = z.output<typeof createLeadSchema>;
