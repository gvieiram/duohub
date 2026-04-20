import { describe, expect, it } from "vitest";
import { type CreateLeadInput, createLeadSchema } from "./schemas";

const validInput: CreateLeadInput = {
	name: "João da Silva",
	email: "joao@example.com",
	whatsapp: "(48) 99246-7107",
	situation: "CLT",
	complexity: [],
	moment: null,
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
			"MEI",
			"APOSENTADO",
			"MULTIPLO",
			"NAO_SEI",
		] as const;
		for (const situation of situations) {
			expect(() =>
				createLeadSchema.parse({ ...validInput, situation }),
			).not.toThrow();
		}
	});

	it("accepts null situation (user skipped step 2)", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, situation: null }),
		).not.toThrow();
	});

	it("accepts undefined situation (user skipped step 2)", () => {
		const { situation: _s, ...rest } = validInput;
		expect(() => createLeadSchema.parse(rest)).not.toThrow();
	});

	it("rejects invalid situation value", () => {
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: test-only
			createLeadSchema.parse({ ...validInput, situation: "PJ" as any }),
		).toThrow();
	});

	it("accepts empty complexity array (default)", () => {
		const parsed = createLeadSchema.parse(validInput);
		expect(parsed.complexity).toEqual([]);
	});

	it("accepts multiple complexity values", () => {
		const parsed = createLeadSchema.parse({
			...validInput,
			complexity: ["ALUGUEL", "DEPENDENTES", "RENDA_VARIAVEL"],
		});
		expect(parsed.complexity).toEqual([
			"ALUGUEL",
			"DEPENDENTES",
			"RENDA_VARIAVEL",
		]);
	});

	it("rejects invalid complexity value", () => {
		expect(() =>
			createLeadSchema.parse({
				...validInput,
				// biome-ignore lint/suspicious/noExplicitAny: test-only
				complexity: ["ALUGUEL", "INVALID"] as any,
			}),
		).toThrow();
	});

	it("accepts all moment enum values", () => {
		const moments = [
			"PRIMEIRO_ANO",
			"DECLARA_SOZINHO",
			"TROCAR_CONTADOR",
			"MALHA_FINA",
			"PESQUISANDO",
		] as const;
		for (const moment of moments) {
			expect(() =>
				createLeadSchema.parse({ ...validInput, moment }),
			).not.toThrow();
		}
	});

	it("accepts null moment (user skipped step 2)", () => {
		expect(() =>
			createLeadSchema.parse({ ...validInput, moment: null }),
		).not.toThrow();
	});

	it("rejects invalid moment value", () => {
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: test-only
			createLeadSchema.parse({ ...validInput, moment: "WRONG" as any }),
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

	it("accepts a minimal step-1-only submission (all qualification null)", () => {
		const { situation: _s, moment: _m, ...rest } = validInput;
		const parsed = createLeadSchema.parse(rest);
		expect(parsed.situation ?? null).toBeNull();
		expect(parsed.moment ?? null).toBeNull();
		expect(parsed.complexity).toEqual([]);
	});
});
