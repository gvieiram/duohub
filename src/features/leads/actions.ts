"use server";

import "server-only";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { leadRatelimit } from "@/lib/ratelimit";
import { sendLeadEmails } from "./emails/dispatch";
import { createLeadSchema } from "./schemas";
import type { CreateLeadResult, LeadPayload } from "./types";
import { normalizeWhatsapp } from "./utils";

function getClientIp(h: Headers): string {
	const forwarded = h.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	return h.get("x-real-ip") ?? "anonymous";
}

function formDataToInput(formData: FormData) {
	return {
		name: String(formData.get("name") ?? ""),
		email: String(formData.get("email") ?? ""),
		whatsapp: String(formData.get("whatsapp") ?? ""),
		situation: String(formData.get("situation") ?? ""),
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

		const lead = await db.lead.upsert({
			where: { email: input.email },
			create: {
				name: input.name,
				email: input.email,
				whatsapp: normalizedWhatsapp,
				situation: input.situation,
				source: "ir-page",
				utmSource: input.utmSource ?? null,
				utmMedium: input.utmMedium ?? null,
				utmCampaign: input.utmCampaign ?? null,
				consentAt: new Date(),
			},
			update: {
				name: input.name,
				whatsapp: normalizedWhatsapp,
				situation: input.situation,
				utmSource: input.utmSource ?? null,
				utmMedium: input.utmMedium ?? null,
				utmCampaign: input.utmCampaign ?? null,
			},
		});

		const payload: LeadPayload = {
			name: input.name,
			email: input.email,
			whatsapp: normalizedWhatsapp,
			situation: input.situation,
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
