import { describe, expect, it } from "vitest";
import {
	type SubmitIrpfContactInput,
	submitIrpfContactSchema,
} from "./schemas";

const validInput: SubmitIrpfContactInput = {
	name: "João da Silva",
	email: "joao@example.com",
	whatsapp: "(48) 99246-7107",
	situation: "CLT",
	complexity: [],
	moment: null,
	consent: true,
};

describe("submitIrpfContactSchema", () => {
	it("accepts a valid input", () => {
		expect(() => submitIrpfContactSchema.parse(validInput)).not.toThrow();
	});

	it("rejects name shorter than 2 chars", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, name: "J" }),
		).toThrow();
	});

	it("rejects name longer than 80 chars", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, name: "x".repeat(81) }),
		).toThrow();
	});

	it("rejects name with CRLF (email header injection guard)", () => {
		expect(() =>
			submitIrpfContactSchema.parse({
				...validInput,
				name: "Atacante\r\nBcc: victim@example.com",
			}),
		).toThrow();
	});

	it("rejects name with ASCII control chars", () => {
		expect(() =>
			submitIrpfContactSchema.parse({
				...validInput,
				name: "Foo\u0000Bar",
			}),
		).toThrow();
	});

	it("rejects invalid email", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, email: "not-an-email" }),
		).toThrow();
	});

	it("normalises email to lowercase", () => {
		const parsed = submitIrpfContactSchema.parse({
			...validInput,
			email: "JoAo@Example.COM",
		});
		expect(parsed.email).toBe("joao@example.com");
	});

	it("rejects whatsapp with less than 10 digits", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, whatsapp: "(11) 1234" }),
		).toThrow();
	});

	it("accepts whatsapp with 10 digits (landline format)", () => {
		expect(() =>
			submitIrpfContactSchema.parse({
				...validInput,
				whatsapp: "(48) 3028-1234",
			}),
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
				submitIrpfContactSchema.parse({ ...validInput, situation }),
			).not.toThrow();
		}
	});

	it("accepts null situation (user skipped step 2)", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, situation: null }),
		).not.toThrow();
	});

	it("accepts undefined situation (user skipped step 2)", () => {
		const { situation: _s, ...rest } = validInput;
		expect(() => submitIrpfContactSchema.parse(rest)).not.toThrow();
	});

	it("rejects invalid situation value", () => {
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: test-only
			submitIrpfContactSchema.parse({ ...validInput, situation: "PJ" as any }),
		).toThrow();
	});

	it("accepts empty complexity array (default)", () => {
		const parsed = submitIrpfContactSchema.parse(validInput);
		expect(parsed.complexity).toEqual([]);
	});

	it("accepts multiple complexity values", () => {
		const parsed = submitIrpfContactSchema.parse({
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
			submitIrpfContactSchema.parse({
				...validInput,
				// biome-ignore lint/suspicious/noExplicitAny: test-only
				complexity: ["ALUGUEL", "INVALID"] as any,
			}),
		).toThrow();
	});

	it("accepts all moment enum values", () => {
		const moments = ["PRIMEIRO_ANO", "MALHA_FINA", "JA_DECLAREI"] as const;
		for (const moment of moments) {
			expect(() =>
				submitIrpfContactSchema.parse({ ...validInput, moment }),
			).not.toThrow();
		}
	});

	it("accepts null moment (user skipped step 2)", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, moment: null }),
		).not.toThrow();
	});

	it("rejects invalid moment value", () => {
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: test-only
			submitIrpfContactSchema.parse({ ...validInput, moment: "WRONG" as any }),
		).toThrow();
	});

	it("rejects when consent is false", () => {
		expect(() =>
			submitIrpfContactSchema.parse({ ...validInput, consent: false }),
		).toThrow();
	});

	it("accepts a minimal step-1-only submission (all qualification null)", () => {
		const { situation: _s, moment: _m, ...rest } = validInput;
		const parsed = submitIrpfContactSchema.parse(rest);
		expect(parsed.situation ?? null).toBeNull();
		expect(parsed.moment ?? null).toBeNull();
		expect(parsed.complexity).toEqual([]);
	});
});
