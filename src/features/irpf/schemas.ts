import { z } from "zod";

const WHATSAPP_DIGITS = /^\d{10,11}$/;

export const irpfSituationSchema = z.enum(
	["CLT", "AUTONOMO", "INVESTIDOR", "MEI", "APOSENTADO", "MULTIPLO", "NAO_SEI"],
	{ error: "Selecione uma situação" },
);

export type IrpfSituation = z.infer<typeof irpfSituationSchema>;

export const irpfComplexitySchema = z.enum([
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

export type IrpfComplexity = z.infer<typeof irpfComplexitySchema>;

export const irpfMomentSchema = z.enum([
	"PRIMEIRO_ANO",
	"MALHA_FINA",
	"JA_DECLAREI",
]);

export type IrpfMoment = z.infer<typeof irpfMomentSchema>;

// biome-ignore lint/suspicious/noControlCharactersInRegex: guarding against email header injection requires matching control chars explicitly
const noControlChars = (v: string) => !/[\r\n\u0000-\u001f\u007f]/.test(v);

export const submitIrpfContactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Nome muito curto")
		.max(80, "Nome muito longo")
		.refine(noControlChars, "Nome inválido"),

	email: z
		.string()
		.trim()
		.toLowerCase()
		.email("E-mail inválido")
		.refine(noControlChars, "E-mail inválido"),

	whatsapp: z
		.string()
		.trim()
		.refine((v) => WHATSAPP_DIGITS.test(v.replace(/\D/g, "")), {
			message: "WhatsApp inválido",
		}),

	situation: irpfSituationSchema.nullish(),

	complexity: z.array(irpfComplexitySchema).default([]),

	moment: irpfMomentSchema.nullish(),

	consent: z.boolean().refine((v) => v === true, {
		message: "É necessário aceitar a política de privacidade",
	}),
});

export type SubmitIrpfContactInput = z.input<typeof submitIrpfContactSchema>;
export type SubmitIrpfContactOutput = z.output<typeof submitIrpfContactSchema>;
