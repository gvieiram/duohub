import { describe, expect, it } from "vitest";
import { type CreateLeadInput, createLeadSchema } from "./schemas";

const validInput: CreateLeadInput = {
	name: "João da Silva",
	email: "joao@example.com",
	whatsapp: "(48) 99246-7107",
	situation: "CLT",
	consent: true,
	honeypot: "",
	utmSource: null,
	utmMedium: null,
	utmCampaign: null,
};

describe("createLeadSchema", () => {
	it("accepts a valid input", () => {
		expect(() => createLeadSchema.parse(validInput)).not.toThrow();
	});

	it("rejects name shorter than 2 chars", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, name: "J" }),
		).toThrow();
	});

	it("rejects name longer than 80 chars", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, name: "x".repeat(81) }),
		).toThrow();
	});

	it("rejects invalid email", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, email: "not-an-email" }),
		).toThrow();
	});

	it("normalises email to lowercase", () => {
		const parsed = createLeadSchema.parse({
			...validInput,
			email: "JoAo@Example.COM",
		});
		expect(parsed.email).toBe("joao@example.com");
	});

	it("rejects whatsapp with less than 10 digits", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, whatsapp: "(11) 1234" }),
		).toThrow();
	});

	it("accepts whatsapp with 10 digits (landline format)", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, whatsapp: "(48) 3028-1234" }),
		).not.toThrow();
	});

	it("accepts all situation enum values", () => {
		const situations = [
			"CLT",
			"AUTONOMO",
			"INVESTIDOR",
			"MEI_COM_PF",
			"OUTROS",
		] as const;
		for (const situation of situations) {
			expect(() =>
				createLeadSchema.parse({ ...validInput, situation }),
			).not.toThrow();
		}
	});

	it("rejects invalid situation", () => {
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: test-only
			createLeadSchema.parse({ ...validInput, situation: "PJ" as any }),
		).toThrow();
	});

	it("rejects when consent is false", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, consent: false }),
		).toThrow();
	});

	it("rejects when honeypot has content (bot detected)", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, honeypot: "bot-filled-this" }),
		).toThrow();
	});

	it("accepts utm fields when present", () => {
		const parsed = createLeadSchema.parse({
			...validInput,
			utmSource: "instagram",
			utmMedium: "bio",
			utmCampaign: "ir-2026",
		});
		expect(parsed.utmSource).toBe("instagram");
	});
});
