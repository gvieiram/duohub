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
	const realIp = h.get("x-real-ip");
	if (realIp) return realIp.trim();

	const forwarded = h.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}

	return "anonymous";
}

function parseComplexity(formData: FormData) {
	const values = formData.getAll("complexity").map((v) => String(v));
	if (values.length === 0) return [];
	return values
		.map((v) => leadComplexitySchema.safeParse(v))
		.filter((r) => r.success)
		.map((r) => r.data);
}

const RAW_MAX_LEN = 500;

function readRawString(
	formData: FormData,
	field: string,
	maxLen = RAW_MAX_LEN,
): string {
	return String(formData.get(field) ?? "").slice(0, maxLen);
}

function toNullable(value: FormDataEntryValue | null): string | null {
	if (value === null) return null;
	const str = String(value).slice(0, RAW_MAX_LEN).trim();
	return str.length > 0 ? str : null;
}

function formDataToInput(formData: FormData) {
	return {
		name: readRawString(formData, "name"),
		email: readRawString(formData, "email"),
		whatsapp: readRawString(formData, "whatsapp"),
		situation: toNullable(formData.get("situation")),
		complexity: parseComplexity(formData),
		moment: toNullable(formData.get("moment")),
		consent:
			formData.get("consent") === "on" || formData.get("consent") === "true",
		honeypot: readRawString(formData, "honeypot"),
		utmSource: readRawString(formData, "utmSource") || null,
		utmMedium: readRawString(formData, "utmMedium") || null,
		utmCampaign: readRawString(formData, "utmCampaign") || null,
	};
}

async function persistAndNotify(
	input: z.output<typeof createLeadSchema>,
): Promise<void> {
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

		if (raw.honeypot.length > 0) {
			console.warn("[createLead] honeypot triggered", { ip });
			return { success: true };
		}

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

		await persistAndNotify(parsed.data);
		return { success: true };
	} catch (err) {
		console.error("[createLead] unexpected error", err);
		return { success: false, reason: "server_error" };
	}
}
