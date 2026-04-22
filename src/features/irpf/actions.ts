"use server";

import "server-only";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactRatelimit } from "@/lib/ratelimit";
import { sendIrpfContactEmails } from "./emails/dispatch";
import { irpfComplexitySchema, submitIrpfContactSchema } from "./schemas";
import type { IrpfContactPayload, SubmitIrpfContactResult } from "./types";
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
		.map((v) => irpfComplexitySchema.safeParse(v))
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
	};
}

async function persistAndNotify(
	input: z.output<typeof submitIrpfContactSchema>,
): Promise<void> {
	const normalizedWhatsapp = normalizeWhatsapp(input.whatsapp);
	const situation = input.situation ?? null;
	const moment = input.moment ?? null;

	const contact = await db.contact.upsert({
		where: { email: input.email },
		create: {
			name: input.name,
			email: input.email,
			whatsapp: normalizedWhatsapp,
			service: "IRPF",
			situation,
			complexity: input.complexity,
			moment,
			consentAt: new Date(),
		},
		update: {
			name: input.name,
			whatsapp: normalizedWhatsapp,
			situation,
			complexity: input.complexity,
			moment,
		},
	});

	const payload: IrpfContactPayload = {
		name: input.name,
		email: input.email,
		whatsapp: normalizedWhatsapp,
		situation,
		complexity: input.complexity,
		moment,
	};

	try {
		await sendIrpfContactEmails(payload);
	} catch (err) {
		console.error("[submitIrpfContact] email dispatch failed", {
			contactId: contact.id,
			err,
		});
	}
}

export async function submitIrpfContact(
	formData: FormData,
): Promise<SubmitIrpfContactResult> {
	try {
		const h = await headers();
		const ip = getClientIp(h);

		const { success: rateOk } = await contactRatelimit.limit(ip);
		if (!rateOk) {
			return { success: false, reason: "rate_limit" };
		}

		const raw = formDataToInput(formData);

		if (raw.honeypot.length > 0) {
			console.warn("[submitIrpfContact] honeypot triggered", { ip });
			return { success: true };
		}

		const parsed = submitIrpfContactSchema.safeParse(raw);

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
		console.error("[submitIrpfContact] unexpected error", err);
		return { success: false, reason: "server_error" };
	}
}
