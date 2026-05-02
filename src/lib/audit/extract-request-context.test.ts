// @vitest-environment node

import { describe, expect, it } from "vitest";
import { extractRequestContext } from "./extract-request-context";

describe("extractRequestContext", () => {
	it("returns nulls when no request is provided", () => {
		expect(extractRequestContext(undefined)).toEqual({
			ipAddress: null,
			userAgent: null,
		});
	});

	it("extracts IP from x-forwarded-for, taking only the first hop", () => {
		const req = new Request("https://example.com", {
			headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
		});
		expect(extractRequestContext(req).ipAddress).toBe("203.0.113.1");
	});

	it("falls back to x-real-ip when x-forwarded-for is missing", () => {
		const req = new Request("https://example.com", {
			headers: { "x-real-ip": "203.0.113.5" },
		});
		expect(extractRequestContext(req).ipAddress).toBe("203.0.113.5");
	});

	it("returns null IP when no proxy headers are set", () => {
		const req = new Request("https://example.com");
		expect(extractRequestContext(req).ipAddress).toBeNull();
	});

	it("extracts user-agent header", () => {
		const req = new Request("https://example.com", {
			headers: { "user-agent": "Mozilla/5.0 Test" },
		});
		expect(extractRequestContext(req).userAgent).toBe("Mozilla/5.0 Test");
	});

	it("trims whitespace around IP from x-forwarded-for", () => {
		const req = new Request("https://example.com", {
			headers: { "x-forwarded-for": "  203.0.113.1  , 10.0.0.1" },
		});
		expect(extractRequestContext(req).ipAddress).toBe("203.0.113.1");
	});

	it("returns null when x-forwarded-for is whitespace only", () => {
		const req = new Request("https://example.com", {
			headers: { "x-forwarded-for": "   " },
		});
		expect(extractRequestContext(req).ipAddress).toBeNull();
	});

	it("returns null when the first hop in x-forwarded-for is empty", () => {
		const req = new Request("https://example.com", {
			headers: { "x-forwarded-for": ", 10.0.0.1" },
		});
		expect(extractRequestContext(req).ipAddress).toBeNull();
	});
});
