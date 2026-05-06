import { type NextRequest, NextResponse } from "next/server";

// Better Auth derives the session cookie name from `auth.context.authCookies
// .sessionToken.name`. We hardcode it here because the proxy runs at the Edge
// runtime and cannot import the auth instance (which pulls Prisma, Resend,
// etc.). If the cookie configuration ever changes (e.g. enabling cross-domain
// cookies which adds a `__Secure-` prefix), update both places.
const SESSION_COOKIE_NAME = "better-auth.session_token";

export function proxy(request: NextRequest) {
	if (request.cookies.has(SESSION_COOKIE_NAME)) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("next", request.nextUrl.pathname);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	// `/login` lives outside the authenticated trees, so the matcher
	// doesn't need to special-case it. `/admin` (exact) is listed
	// separately so the bare path still triggers the cookie check —
	// otherwise `/admin/:path*` would let it slip through.
	matcher: ["/admin", "/admin/:path*", "/app/:path*"],
};
