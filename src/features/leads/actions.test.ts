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

const headersMock = vi.fn(
	async () => new Headers({ "x-forwarded-for": "1.2.3.4" }),
);

vi.mock("next/headers", () => ({
	headers: () => headersMock(),
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
		headersMock.mockImplementation(
			async () => new Headers({ "x-forwarded-for": "1.2.3.4" }),
		);
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

	it("returns fake success when honeypot is filled (bot detection is silent)", async () => {
		const fd = validFormData();
		fd.set("honeypot", "i-am-a-bot");
		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result).toEqual({ success: true });
		expect(leadUpsertMock).not.toHaveBeenCalled();
		expect(emailSendMock).not.toHaveBeenCalled();
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

	it("persists step-1-only submission with null qualification fields", async () => {
		const fd = new FormData();
		fd.set("name", "Maria Souza");
		fd.set("email", "maria@example.com");
		fd.set("whatsapp", "(48) 99999-0000");
		fd.set("consent", "on");
		fd.set("honeypot", "");

		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result).toEqual({ success: true });
		const args = leadUpsertMock.mock.calls[0][0];
		expect(args.create.situation).toBeNull();
		expect(args.create.moment).toBeNull();
		expect(args.create.complexity).toEqual([]);
	});

	it("collects multiple complexity values from formData", async () => {
		const fd = validFormData();
		fd.append("complexity", "ALUGUEL");
		fd.append("complexity", "DEPENDENTES");
		fd.append("complexity", "RENDA_VARIAVEL");
		fd.set("moment", "JA_DECLAREI");

		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result).toEqual({ success: true });
		const args = leadUpsertMock.mock.calls[0][0];
		expect(args.create.complexity).toEqual([
			"ALUGUEL",
			"DEPENDENTES",
			"RENDA_VARIAVEL",
		]);
		expect(args.create.moment).toBe("JA_DECLAREI");
	});

	it("filters out invalid complexity values silently", async () => {
		const fd = validFormData();
		fd.append("complexity", "ALUGUEL");
		fd.append("complexity", "NOT_A_VALID_VALUE");
		fd.append("complexity", "DEPENDENTES");

		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result).toEqual({ success: true });
		const args = leadUpsertMock.mock.calls[0][0];
		expect(args.create.complexity).toEqual(["ALUGUEL", "DEPENDENTES"]);
	});

	it("accepts the new MEI enum value (renamed from MEI_COM_PF)", async () => {
		const fd = validFormData();
		fd.set("situation", "MEI");

		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result).toEqual({ success: true });
		const args = leadUpsertMock.mock.calls[0][0];
		expect(args.create.situation).toBe("MEI");
	});

	it("accepts new APOSENTADO, MULTIPLO and NAO_SEI situation values", async () => {
		const { createLead } = await import("./actions");

		for (const situation of ["APOSENTADO", "MULTIPLO", "NAO_SEI"]) {
			leadUpsertMock.mockClear();
			const fd = validFormData();
			fd.set("situation", situation);
			fd.set("email", `${situation.toLowerCase()}@example.com`);

			const result = await createLead(fd);
			expect(result).toEqual({ success: true });
			expect(leadUpsertMock.mock.calls[0][0].create.situation).toBe(situation);
		}
	});

	it("prefers x-real-ip over x-forwarded-for for rate limiting (spoof guard)", async () => {
		headersMock.mockImplementationOnce(
			async () =>
				new Headers({
					"x-forwarded-for": "99.99.99.99",
					"x-real-ip": "7.7.7.7",
				}),
		);
		const { createLead } = await import("./actions");
		await createLead(validFormData());

		expect(limitMock).toHaveBeenCalledWith("7.7.7.7");
	});

	it("falls back to first x-forwarded-for when x-real-ip is missing", async () => {
		headersMock.mockImplementationOnce(
			async () => new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }),
		);
		const { createLead } = await import("./actions");
		await createLead(validFormData());

		expect(limitMock).toHaveBeenCalledWith("1.1.1.1");
	});

	it("rejects name with CRLF as validation error (email header injection guard)", async () => {
		const fd = validFormData();
		fd.set("name", "Atacante\r\nBcc: victim@example.com");
		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.name).toBeDefined();
		}
		expect(leadUpsertMock).not.toHaveBeenCalled();
		expect(emailSendMock).not.toHaveBeenCalled();
	});

	it("truncates oversized raw input before zod (big-string guard)", async () => {
		const fd = validFormData();
		fd.set("name", "x".repeat(10_000));
		const { createLead } = await import("./actions");
		const result = await createLead(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.name).toBeDefined();
		}
	});
});
