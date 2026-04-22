import { describe, expect, it } from "vitest";
import { normalizeWhatsapp, whatsappLink } from "./utils";

describe("normalizeWhatsapp", () => {
	it("strips all non-digit characters", () => {
		expect(normalizeWhatsapp("(48) 99246-7107")).toBe("48992467107");
	});

	it("returns empty string for empty input", () => {
		expect(normalizeWhatsapp("")).toBe("");
	});
});

describe("whatsappLink", () => {
	it("builds a wa.me url with 55 prefix and encoded text", () => {
		const url = whatsappLink("(48) 99246-7107", "Olá, DuoHub!");
		expect(url).toBe("https://wa.me/5548992467107?text=Ol%C3%A1%2C%20DuoHub!");
	});

	it("does not duplicate the 55 prefix if already present", () => {
		const url = whatsappLink("5548992467107", "oi");
		expect(url).toBe("https://wa.me/5548992467107?text=oi");
	});
});
