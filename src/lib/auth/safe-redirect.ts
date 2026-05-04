/**
 * Resolves a user-supplied `next` query param into a safe internal path
 * for post-login redirection.
 *
 * Anti open-redirect: untrusted input must never produce a redirect to
 * an external origin. Only paths under `/admin/*` and `/app/*` (the
 * authenticated areas) are valid destinations. Everything else falls
 * back to `/admin`.
 *
 * Defends against:
 * - Absolute URLs (`https://evil.com`)
 * - Protocol-relative URLs (`//evil.com`)
 * - Backslash tricks that some parsers normalise to `/`
 * - Paths outside the authenticated areas (`/`, `/imposto-de-renda`)
 * - Dot-segment traversal (`/admin/..//evil.com`, `/admin/../../evil`).
 *   The naive `startsWith("/admin/")` check would let these pass; the
 *   browser then resolves the dot-segments per RFC 3986 §5.2 when
 *   following the `Location` header and lands on the attacker host.
 *   We normalise via the `URL` constructor (with a fixed sentinel
 *   origin) before applying the allow-list.
 *
 * Pure function — no I/O, safe to import in any runtime.
 */
export function safeNext(next: string | undefined | null): string {
	const FALLBACK = "/admin";
	if (!next) return FALLBACK;

	// Reject absolute URLs (`https://...`) and protocol-relative URLs
	// (`//...`) up front — `URL` would happily parse these as external.
	if (next.includes("://") || next.startsWith("//")) return FALLBACK;

	// Backslashes get normalised to `/` by some browsers/proxies, which
	// can flip an apparently internal path into a protocol-relative one.
	if (next.includes("\\")) return FALLBACK;

	// Resolve dot-segments and any percent-encoding against a fixed
	// sentinel origin. If the result lands anywhere other than the
	// sentinel, we know the input escaped the origin (e.g. via `..//`).
	const SENTINEL_ORIGIN = "https://internal.invalid";
	let resolved: URL;
	try {
		resolved = new URL(next, SENTINEL_ORIGIN);
	} catch {
		return FALLBACK;
	}
	if (resolved.origin !== SENTINEL_ORIGIN) return FALLBACK;

	const path = resolved.pathname;
	const isAdminPath = path === "/admin" || path.startsWith("/admin/");
	const isAppPath = path === "/app" || path.startsWith("/app/");
	if (!isAdminPath && !isAppPath) return FALLBACK;

	// Drop the fragment (browsers don't send it to the server anyway,
	// and including it has no benefit). Preserve the query string so
	// e.g. `/admin/clients?status=active` round-trips cleanly.
	return path + resolved.search;
}
