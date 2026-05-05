// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const nextMock = vi.fn(() => ({ kind: "next" }));

vi.mock("next/server", () => ({
	// biome-ignore lint/style/useNamingConvention: must match the actual export name from next/server
	NextResponse: {
		redirect: (url: URL) => {
			redirectMock(url.toString());
			return { kind: "redirect", url };
		},
		next: () => nextMock(),
	},
}));

const { proxy } = await import("./proxy");

function makeRequest(pathname: string, hasCookie: boolean) {
	const url = new URL(`http://localhost:3000${pathname}`);
	return {
		nextUrl: url,
		url: url.toString(),
		cookies: {
			has: (name: string) => hasCookie && name.includes("session"),
		},
	} as never;
}

describe("proxy", () => {
	it("calls next() when cookie is present on /admin", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin", true));
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("redirects to /login when no cookie on /admin", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin", false));
		expect(redirectMock).toHaveBeenCalledTimes(1);
		expect(redirectMock.mock.calls[0]?.[0]).toContain("/login");
		// `/admin` exact must also carry next= so the user lands back on the
		// intended page after login.
		expect(redirectMock.mock.calls[0]?.[0]).toContain("next=%2Fadmin");
	});

	it("preserves the original path in ?next when redirecting", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin/clients", false));
		const target = redirectMock.mock.calls[0]?.[0] ?? "";
		expect(target).toContain("/login");
		expect(target).toContain("next=%2Fadmin%2Fclients");
	});

	it("redirects to /login when no cookie on /app", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/app/dashboard", false));
		expect(redirectMock).toHaveBeenCalledTimes(1);
		expect(redirectMock.mock.calls[0]?.[0]).toContain("/login");
		expect(redirectMock.mock.calls[0]?.[0]).toContain(
			"next=%2Fapp%2Fdashboard",
		);
	});

	it("calls next() when cookie is present on /app", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/app/dashboard", true));
		expect(redirectMock).not.toHaveBeenCalled();
	});
});

// The matcher is what guarantees `/login` never reaches `proxy()` at the
// Edge — but config is declarative and easy to break by accident. Pin it
// here so a future refactor that drops `/login` outside the negative
// space (e.g. switching to a catch-all) fails in CI rather than at
// runtime.
describe("proxy matcher", () => {
	it("scopes the middleware to authenticated trees only", async () => {
		const { config } = await import("./proxy");
		expect(config.matcher).toEqual(["/admin", "/admin/:path*", "/app/:path*"]);
		expect(config.matcher).not.toContain("/login");
	});
});
