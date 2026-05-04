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

	it("preserves the query string on whitelisted paths", () => {
		expect(safeNext("/admin/clients?status=active")).toBe(
			"/admin/clients?status=active",
		);
	});

	it("strips the fragment from whitelisted paths", () => {
		expect(safeNext("/admin/clients#hash")).toBe("/admin/clients");
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

	it("rejects backslashes anywhere in the input", () => {
		expect(safeNext("/admin\\evil.com")).toBe("/admin");
	});

	it("rejects javascript: pseudo-URLs", () => {
		expect(safeNext("javascript:alert(1)")).toBe("/admin");
	});

	it("rejects data: pseudo-URLs", () => {
		expect(safeNext("data:text/html,<script>alert(1)</script>")).toBe("/admin");
	});

	it("rejects paths that share the /admin prefix but are not under it", () => {
		expect(safeNext("/administration")).toBe("/admin");
	});

	// Dot-segment traversal vectors. The browser normalises `..` segments
	// per RFC 3986 §5.2 when following the `Location` header — the naive
	// `startsWith("/admin/")` check would let these pass, then the browser
	// would land on the attacker host. The URL-constructor normalisation
	// in `safeNext` collapses them before the allow-list runs.

	it("rejects dot-segment escape to protocol-relative (..//host)", () => {
		expect(safeNext("/admin/..//evil.com")).toBe("/admin");
	});

	it("rejects dot-segment escape to a sibling path", () => {
		expect(safeNext("/admin/../../evil")).toBe("/admin");
	});

	it("rejects deeply nested dot-segment escape", () => {
		expect(safeNext("/admin/x/../../../evil")).toBe("/admin");
	});

	it("rejects encoded dot-segments (%2E%2E)", () => {
		expect(safeNext("/admin/%2E%2E/evil")).toBe("/admin");
	});

	it("rejects mixed encoded dot-segments (.%2E)", () => {
		expect(safeNext("/admin/.%2E/evil")).toBe("/admin");
	});
});
