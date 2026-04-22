// biome-ignore-all lint/style/useNamingConvention: keys mirror the Prisma enums
import type { IrpfComplexity, IrpfMoment, IrpfSituation } from "./schemas";

export type SubmitIrpfContactResult =
	| { success: true }
	| { success: false; reason: "rate_limit" }
	| { success: false; reason: "validation"; errors: Record<string, string[]> }
	| { success: false; reason: "server_error" };

export type IrpfContactPayload = {
	name: string;
	email: string;
	whatsapp: string;
	situation: IrpfSituation | null;
	complexity: IrpfComplexity[];
	moment: IrpfMoment | null;
};

export const SITUATION_LABELS: Record<IrpfSituation, string> = {
	CLT: "CLT",
	AUTONOMO: "Autônomo ou PJ",
	INVESTIDOR: "Investidor",
	MEI: "MEI",
	APOSENTADO: "Aposentado",
	MULTIPLO: "Mais de uma situação",
	NAO_SEI: "Não sei",
};

export const COMPLEXITY_LABELS: Record<IrpfComplexity, string> = {
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

export const MOMENT_LABELS: Record<IrpfMoment, string> = {
	PRIMEIRO_ANO: "Nunca declarei — primeiro ano obrigatório",
	MALHA_FINA: "Estou com pendência ou na malha fina",
	JA_DECLAREI: "Já declarei em anos anteriores",
};
