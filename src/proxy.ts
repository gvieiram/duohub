import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "better-auth.session_token";

export function proxy(request: NextRequest) {
	// The matcher (config below) already excludes /admin/login, but a defensive
	// check guards against accidental coverage changes — never redirect a login
	// page back to itself.
	if (request.nextUrl.pathname.startsWith("/admin/login")) {
		return NextResponse.next();
	}

	if (request.cookies.has(SESSION_COOKIE_NAME)) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/admin/login", request.url);
	loginUrl.searchParams.set("next", request.nextUrl.pathname);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	// `/admin` (exact) needs to be listed separately because the regex
	// `/admin/((?!login).*)` requires at least one char after `/admin/`,
	// so the bare `/admin` would otherwise slip past the proxy and only be
	// caught by the layout guard (which redirects without ?next=).
	matcher: ["/admin", "/admin/((?!login).*)", "/app/:path*"],
};
