import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "better-auth.session_token";

export function middleware(request: NextRequest) {
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
	matcher: ["/admin/((?!login).*)", "/app/:path*"],
};
