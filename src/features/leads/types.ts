import type { LeadSituation } from "./schemas";

export type CreateLeadResult =
	| { success: true }
	| { success: false; reason: "rate_limit" }
	| { success: false; reason: "validation"; errors: Record<string, string[]> }
	| { success: false; reason: "server_error" };

export type LeadPayload = {
	name: string;
	email: string;
	whatsapp: string;
	situation: LeadSituation;
	utmSource?: string | null;
	utmMedium?: string | null;
	utmCampaign?: string | null;
};

export const SITUATION_LABELS: Record<LeadSituation, string> = {
	CLT: "CLT",
	AUTONOMO: "Autônomo",
	INVESTIDOR: "Investidor",
	MEI_COM_PF: "MEI com PF",
	OUTROS: "Outros",
};
