"use server";

import "server-only";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { leadRatelimit } from "@/lib/ratelimit";
import { sendLeadEmails } from "./emails/dispatch";
import { createLeadSchema, leadComplexitySchema } from "./schemas";
import type { CreateLeadResult, LeadPayload } from "./types";
import { normalizeWhatsapp } from "./utils";

function getClientIp(h: Headers): string {
	const forwarded = h.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	return h.get("x-real-ip") ?? "anonymous";
}

function parseComplexity(formData: FormData) {
	const values = formData.getAll("complexity").map((v) => String(v));
	if (values.length === 0) return [];
	return values
		.map((v) => leadComplexitySchema.safeParse(v))
		.filter((r) => r.success)
		.map((r) => r.data);
}

function toNullable(value: FormDataEntryValue | null): string | null {
	if (value === null) return null;
	const str = String(value).trim();
	return str.length > 0 ? str : null;
}

function formDataToInput(formData: FormData) {
	return {
		name: String(formData.get("name") ?? ""),
		email: String(formData.get("email") ?? ""),
		whatsapp: String(formData.get("whatsapp") ?? ""),
		situation: toNullable(formData.get("situation")),
		complexity: parseComplexity(formData),
		moment: toNullable(formData.get("moment")),
		consent:
			formData.get("consent") === "on" || formData.get("consent") === "true",
		honeypot: String(formData.get("honeypot") ?? ""),
		utmSource: (formData.get("utmSource") as string | null) || null,
		utmMedium: (formData.get("utmMedium") as string | null) || null,
		utmCampaign: (formData.get("utmCampaign") as string | null) || null,
	};
}

export async function createLead(
	formData: FormData,
): Promise<CreateLeadResult> {
	try {
		const h = await headers();
		const ip = getClientIp(h);

		const { success: rateOk } = await leadRatelimit.limit(ip);
		if (!rateOk) {
			return { success: false, reason: "rate_limit" };
		}

		const raw = formDataToInput(formData);
		const parsed = createLeadSchema.safeParse(raw);

		if (!parsed.success) {
			return {
				success: false,
				reason: "validation",
				errors: z.flattenError(parsed.error).fieldErrors as Record<
					string,
					string[]
				>,
			};
		}

		const input = parsed.data;
		const normalizedWhatsapp = normalizeWhatsapp(input.whatsapp);
		const situation = input.situation ?? null;
		const moment = input.moment ?? null;

		const lead = await db.lead.upsert({
			where: { email: input.email },
			create: {
				name: input.name,
				email: input.email,
				whatsapp: normalizedWhatsapp,
				situation,
				complexity: input.complexity,
				moment,
				source: "ir-page",
				utmSource: input.utmSource ?? null,
				utmMedium: input.utmMedium ?? null,
				utmCampaign: input.utmCampaign ?? null,
				consentAt: new Date(),
			},
			update: {
				name: input.name,
				whatsapp: normalizedWhatsapp,
				situation,
				complexity: input.complexity,
				moment,
				utmSource: input.utmSource ?? null,
				utmMedium: input.utmMedium ?? null,
				utmCampaign: input.utmCampaign ?? null,
			},
		});

		const payload: LeadPayload = {
			name: input.name,
			email: input.email,
			whatsapp: normalizedWhatsapp,
			situation,
			complexity: input.complexity,
			moment,
			utmSource: input.utmSource ?? null,
			utmMedium: input.utmMedium ?? null,
			utmCampaign: input.utmCampaign ?? null,
		};

		try {
			await sendLeadEmails(payload);
		} catch (err) {
			console.error("[createLead] email dispatch failed", {
				leadId: lead.id,
				err,
			});
		}

		return { success: true };
	} catch (err) {
		console.error("[createLead] unexpected error", err);
		return { success: false, reason: "server_error" };
	}
}
