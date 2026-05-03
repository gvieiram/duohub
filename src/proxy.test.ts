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

	it("redirects to /admin/login when no cookie on /admin", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin", false));
		expect(redirectMock).toHaveBeenCalledTimes(1);
		expect(redirectMock.mock.calls[0]?.[0]).toContain("/admin/login");
		// `/admin` exact must also carry next= so the user lands back on the
		// intended page after login.
		expect(redirectMock.mock.calls[0]?.[0]).toContain("next=%2Fadmin");
	});

	it("preserves the original path in ?next when redirecting", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin/clients", false));
		const target = redirectMock.mock.calls[0]?.[0] ?? "";
		expect(target).toContain("next=%2Fadmin%2Fclients");
	});

	it("does not redirect /admin/login itself", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/admin/login", false));
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("redirects to /admin/login when no cookie on /app", () => {
		redirectMock.mockClear();
		proxy(makeRequest("/app/dashboard", false));
		expect(redirectMock).toHaveBeenCalledTimes(1);
		expect(redirectMock.mock.calls[0]?.[0]).toContain("/admin/login");
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
