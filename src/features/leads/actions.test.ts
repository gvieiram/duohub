// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: mocked exports mirror SCREAMING_SNAKE_CASE env/const names

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const limitMock = vi.fn();
const leadUpsertMock = vi.fn();
const emailSendMock = vi.fn();

vi.mock("@/lib/db", () => ({
	db: { lead: { upsert: leadUpsertMock } },
}));

vi.mock("@/lib/ratelimit", () => ({
	leadRatelimit: { limit: limitMock },
}));

vi.mock("@/lib/resend", () => ({
	resend: { emails: { send: emailSendMock } },
	LEAD_FROM_ADDRESS: "DuoHub <contato@duohubcontabil.com.br>",
	LEAD_REPLY_TO: "contato@duohubcontabil.com.br",
}));

vi.mock("@/lib/env", () => ({
	env: { INTERNAL_LEADS_EMAIL: "contato@duohubcontabil.com.br" },
}));

vi.mock("next/headers", () => ({
	headers: async () => new Headers({ "x-forwarded-for": "1.2.3.4" }),
}));

const validFormData = () => {
	const fd = new FormData();
	fd.set("name", "João da Silva");
	fd.set("email", "joao@example.com");
	fd.set("whatsapp", "(48) 99246-7107");
	fd.set("situation", "CLT");
	fd.set("consent", "on");
	fd.set("honeypot", "");
	return fd;
};

describe("createLead action", () => {
	beforeEach(() => {
		limitMock.mockResolvedValue({ success: true });
		leadUpsertMock.mockResolvedValue({ id: "lead_1" });
		emailSendMock.mockResolvedValue({ data: { id: "mail_1" }, error: null });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns success for valid input and persists the lead", async () => {
		const { createLead } = await import("./actions");
		const result = await createLead(validFormData());

		expect(result).toEqual({ success: true });
		expect(leadUpsertMock).toHaveBeenCalledOnce();
		expect(leadUpsertMock.mock.calls[0][0].where).toEqual({
			email: "joao@example.com",
		});
		expect(emailSendMock).toHaveBeenCalledTimes(2);
	});

	it("blocks when rate limit exceeded", async () => {
		limitMock.mockResolvedValueOnce({ success: false });
		const { createLead } = await import("./actions");
		const result = await createLead(validFormData());

		expect(result).toEqual({ success: false, reason: "rate_limit" });
		expect(leadUpsertMock).not.toHaveBeenCalled();
	});

	it("returns validation errors for invalid email", async () => {
		const fd = validFormData();
		fd.set("email", "not-email");
		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.email).toBeDefined();
		}
		expect(leadUpsertMock).not.toHaveBeenCalled();
	});

	it("silently rejects when honeypot is filled (bot)", async () => {
		const fd = validFormData();
		fd.set("honeypot", "i-am-a-bot");
		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result.success).toBe(false);
		expect(leadUpsertMock).not.toHaveBeenCalled();
	});

	it("does not fail when email sending errors (lead is still persisted)", async () => {
		emailSendMock.mockRejectedValueOnce(new Error("resend down"));
		const { createLead } = await import("./actions");
		const result = await createLead(validFormData());

		expect(result).toEqual({ success: true });
		expect(leadUpsertMock).toHaveBeenCalledOnce();
	});

	it("upserts when email already exists (dedupe)", async () => {
		const { createLead } = await import("./actions");
		await createLead(validFormData());

		const upsertArgs = leadUpsertMock.mock.calls[0][0];
		expect(upsertArgs.where).toEqual({ email: "joao@example.com" });
		expect(upsertArgs.create).toMatchObject({
			email: "joao@example.com",
			situation: "CLT",
			source: "ir-page",
		});
		expect(upsertArgs.update).toBeDefined();
	});

	it("captures utm fields when provided", async () => {
		const fd = validFormData();
		fd.set("utmSource", "instagram");
		fd.set("utmMedium", "bio");
		fd.set("utmCampaign", "ir-2026");
		const { createLead } = await import("./actions");
		await createLead(fd);

		const args = leadUpsertMock.mock.calls[0][0];
		expect(args.create.utmSource).toBe("instagram");
		expect(args.create.utmMedium).toBe("bio");
		expect(args.create.utmCampaign).toBe("ir-2026");
	});
});
