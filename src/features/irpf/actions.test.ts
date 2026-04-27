// @vitest-environment node

// biome-ignore-all lint/style/useNamingConvention: mocked exports mirror SCREAMING_SNAKE_CASE env/const names

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const limitMock = vi.fn();
const contactUpsertMock = vi.fn();
const emailSendMock = vi.fn();

vi.mock("@/lib/db", () => ({
	db: { contact: { upsert: contactUpsertMock } },
}));

vi.mock("@/lib/ratelimit", () => ({
	contactRatelimit: { limit: limitMock },
}));

vi.mock("@/lib/resend", () => ({
	resend: { emails: { send: emailSendMock } },
	EMAIL_FROM_ADDRESS: "DuoHub <contato@duohubcontabil.com.br>",
	EMAIL_REPLY_TO: "contato@duohubcontabil.com.br",
	getInternalRecipient: () => "contato@duohubcontabil.com.br",
}));

vi.mock("@/lib/env", () => ({
	env: {
		INTERNAL_CONTACT_EMAIL: "contato@duohubcontabil.com.br",
		VERCEL_ENV: "production",
	},
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

describe("submitIrpfContact action", () => {
	beforeEach(() => {
		limitMock.mockResolvedValue({ success: true });
		contactUpsertMock.mockResolvedValue({ id: "contact_1" });
		emailSendMock.mockResolvedValue({ data: { id: "mail_1" }, error: null });
	});

	afterEach(() => {
		vi.clearAllMocks();
		headersMock.mockImplementation(
			async () => new Headers({ "x-forwarded-for": "1.2.3.4" }),
		);
	});

	it("returns success for valid input and persists the contact", async () => {
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(validFormData());

		expect(result).toEqual({ success: true });
		expect(contactUpsertMock).toHaveBeenCalledOnce();
		expect(contactUpsertMock.mock.calls[0][0].where).toEqual({
			email: "joao@example.com",
		});
		expect(emailSendMock).toHaveBeenCalledTimes(2);
	});

	it("blocks when rate limit exceeded", async () => {
		limitMock.mockResolvedValueOnce({ success: false });
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(validFormData());

		expect(result).toEqual({ success: false, reason: "rate_limit" });
		expect(contactUpsertMock).not.toHaveBeenCalled();
	});

	it("returns validation errors for invalid email", async () => {
		const fd = validFormData();
		fd.set("email", "not-email");
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.email).toBeDefined();
		}
		expect(contactUpsertMock).not.toHaveBeenCalled();
	});

	it("returns fake success when honeypot is filled (bot detection is silent)", async () => {
		const fd = validFormData();
		fd.set("honeypot", "i-am-a-bot");
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result).toEqual({ success: true });
		expect(contactUpsertMock).not.toHaveBeenCalled();
		expect(emailSendMock).not.toHaveBeenCalled();
	});

	it("does not fail when email sending errors (contact is still persisted)", async () => {
		emailSendMock.mockRejectedValueOnce(new Error("resend down"));
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(validFormData());

		expect(result).toEqual({ success: true });
		expect(contactUpsertMock).toHaveBeenCalledOnce();
	});

	it("upserts when email already exists (dedupe)", async () => {
		const { submitIrpfContact } = await import("./actions");
		await submitIrpfContact(validFormData());

		const upsertArgs = contactUpsertMock.mock.calls[0][0];
		expect(upsertArgs.where).toEqual({ email: "joao@example.com" });
		expect(upsertArgs.create).toMatchObject({
			email: "joao@example.com",
			situation: "CLT",
			service: "IRPF",
		});
		expect(upsertArgs.update).toBeDefined();
	});

	it("persists step-1-only submission with null qualification fields", async () => {
		const fd = new FormData();
		fd.set("name", "Maria Souza");
		fd.set("email", "maria@example.com");
		fd.set("whatsapp", "(48) 99999-0000");
		fd.set("consent", "on");
		fd.set("honeypot", "");

		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result).toEqual({ success: true });
		const args = contactUpsertMock.mock.calls[0][0];
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

		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result).toEqual({ success: true });
		const args = contactUpsertMock.mock.calls[0][0];
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

		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result).toEqual({ success: true });
		const args = contactUpsertMock.mock.calls[0][0];
		expect(args.create.complexity).toEqual(["ALUGUEL", "DEPENDENTES"]);
	});

	it("accepts the new MEI enum value", async () => {
		const fd = validFormData();
		fd.set("situation", "MEI");

		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result).toEqual({ success: true });
		const args = contactUpsertMock.mock.calls[0][0];
		expect(args.create.situation).toBe("MEI");
	});

	it("accepts APOSENTADO, MULTIPLO and NAO_SEI situation values", async () => {
		const { submitIrpfContact } = await import("./actions");

		for (const situation of ["APOSENTADO", "MULTIPLO", "NAO_SEI"]) {
			contactUpsertMock.mockClear();
			const fd = validFormData();
			fd.set("situation", situation);
			fd.set("email", `${situation.toLowerCase()}@example.com`);

			const result = await submitIrpfContact(fd);
			expect(result).toEqual({ success: true });
			expect(contactUpsertMock.mock.calls[0][0].create.situation).toBe(
				situation,
			);
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
		const { submitIrpfContact } = await import("./actions");
		await submitIrpfContact(validFormData());

		expect(limitMock).toHaveBeenCalledWith("7.7.7.7");
	});

	it("falls back to first x-forwarded-for when x-real-ip is missing", async () => {
		headersMock.mockImplementationOnce(
			async () => new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }),
		);
		const { submitIrpfContact } = await import("./actions");
		await submitIrpfContact(validFormData());

		expect(limitMock).toHaveBeenCalledWith("1.1.1.1");
	});

	it("rejects name with CRLF as validation error (email header injection guard)", async () => {
		const fd = validFormData();
		fd.set("name", "Atacante\r\nBcc: victim@example.com");
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.name).toBeDefined();
		}
		expect(contactUpsertMock).not.toHaveBeenCalled();
		expect(emailSendMock).not.toHaveBeenCalled();
	});

	it("truncates oversized raw input before zod (big-string guard)", async () => {
		const fd = validFormData();
		fd.set("name", "x".repeat(10_000));
		const { submitIrpfContact } = await import("./actions");
		const result = await submitIrpfContact(fd);

		expect(result.success).toBe(false);
		if (!result.success && result.reason === "validation") {
			expect(result.errors.name).toBeDefined();
		}
	});
});
