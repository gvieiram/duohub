// biome-ignore-all lint/style/useNamingConvention: keys mirror the Prisma enums
import type { LeadComplexity, LeadMoment, LeadSituation } from "./schemas";

export type CreateLeadResult =
	| { success: true }
	| { success: false; reason: "rate_limit" }
	| { success: false; reason: "validation"; errors: Record<string, string[]> }
	| { success: false; reason: "server_error" };

export type LeadPayload = {
	name: string;
	email: string;
	whatsapp: string;
	situation: LeadSituation | null;
	complexity: LeadComplexity[];
	moment: LeadMoment | null;
	utmSource?: string | null;
	utmMedium?: string | null;
	utmCampaign?: string | null;
};

export const SITUATION_LABELS: Record<LeadSituation, string> = {
	CLT: "CLT",
	AUTONOMO: "Autônomo ou PJ",
	INVESTIDOR: "Investidor",
	MEI: "MEI",
	APOSENTADO: "Aposentado",
	MULTIPLO: "Mais de uma situação",
	NAO_SEI: "Não sei",
};

export const COMPLEXITY_LABELS: Record<LeadComplexity, string> = {
	ALUGUEL: "Recebeu aluguel",
	VENDA_IMOVEL: "Comprou ou vendeu imóvel",
	DEPENDENTES: "Tem dependentes",
	RENDA_VARIAVEL: "Ações, FIIs ou renda variável",
	CRIPTOATIVOS: "Criptoativos",
	EXTERIOR: "Bens ou rendas no exterior",
	PENSAO: "Pensão alimentícia (paga ou recebida)",
	PREVIDENCIA: "Previdência privada",
	NENHUMA: "Nenhuma dessas",
	NAO_SEI: "Não sei / prefiro conversar",
};

export const MOMENT_LABELS: Record<LeadMoment, string> = {
	PRIMEIRO_ANO: "Nunca declarei — primeiro ano obrigatório",
	MALHA_FINA: "Estou com pendência ou na malha fina",
	JA_DECLAREI: "Já declarei em anos anteriores",
};
