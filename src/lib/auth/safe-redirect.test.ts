// @vitest-environment node

import { describe, expect, it } from "vitest";

import { safeNext } from "./safe-redirect";

describe("safeNext", () => {
	it("returns /admin when next is undefined", () => {
		expect(safeNext(undefined)).toBe("/admin");
	});

	it("returns /admin when next is null", () => {
		expect(safeNext(null)).toBe("/admin");
	});

	it("returns /admin when next is an empty string", () => {
		expect(safeNext("")).toBe("/admin");
	});

	it("returns /admin for the exact path /admin", () => {
		expect(safeNext("/admin")).toBe("/admin");
	});

	it("preserves whitelisted /admin/* paths", () => {
		expect(safeNext("/admin/clients")).toBe("/admin/clients");
	});

	it("preserves nested /admin/* paths", () => {
		expect(safeNext("/admin/clients/123")).toBe("/admin/clients/123");
	});

	it("returns /app for the exact path /app", () => {
		expect(safeNext("/app")).toBe("/app");
	});

	it("preserves whitelisted /app/* paths", () => {
		expect(safeNext("/app/dashboard")).toBe("/app/dashboard");
	});

	it("falls back to /admin for the homepage", () => {
		expect(safeNext("/")).toBe("/admin");
	});

	it("falls back to /admin for marketing routes", () => {
		expect(safeNext("/imposto-de-renda")).toBe("/admin");
	});

	it("rejects absolute URLs (https scheme)", () => {
		expect(safeNext("https://evil.com/admin")).toBe("/admin");
	});

	it("rejects protocol-relative URLs", () => {
		expect(safeNext("//evil.com/admin")).toBe("/admin");
	});

	it("rejects backslash-prefixed paths", () => {
		expect(safeNext("/\\evil.com")).toBe("/admin");
	});

	it("rejects javascript: pseudo-URLs", () => {
		expect(safeNext("javascript:alert(1)")).toBe("/admin");
	});

	it("rejects paths that share the /admin prefix but are not under it", () => {
		expect(safeNext("/administration")).toBe("/admin");
	});
});
