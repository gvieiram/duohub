"use server";

import "server-only";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerPostHog } from "@/lib/posthog/server";
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

	const results = await sendIrpfContactEmails(payload);

	for (const result of results) {
		if (result.status !== "rejected") continue;

		console.error("[submitIrpfContact] email dispatch failed", {
			contactId: contact.id,
			kind: result.kind,
			error: result.error,
		});

		captureEmailFailure({
			contactId: contact.id,
			kind: result.kind,
			errorMessage: result.error,
		});
	}
}

/**
 * Sends `irpf_email_send_failed` to PostHog so we can:
 *   - alert when Resend (or our wiring) is broken in production
 *   - graph a trend of failures over time on the F0 dashboard
 *
 * The `distinctId` is the freshly-created `contactId` instead of the lead's
 * email — the event must not carry PII (LGPD + repo security policy).
 *
 * Captures are best-effort: any error here is swallowed so the user-facing
 * Server Action keeps returning `{ success: true }` (the contact is already
 * persisted; we just lost an observability signal).
 */
function captureEmailFailure({
	contactId,
	kind,
	errorMessage,
}: {
	contactId: string;
	kind: "contact" | "internal";
	errorMessage?: string;
}): void {
	try {
		const posthog = getServerPostHog();
		posthog.capture({
			distinctId: contactId,
			event: "irpf_email_send_failed",
			properties: {
				kind,
				errorMessage: errorMessage?.slice(0, 500),
				$set: { lastEmailFailureAt: new Date().toISOString() },
			},
		});
	} catch (err) {
		console.error("[submitIrpfContact] posthog capture failed", err);
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
