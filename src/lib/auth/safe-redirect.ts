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
 * - Backslash tricks (`/\\evil.com` — some parsers normalise this)
 * - Paths outside the authenticated areas (`/`, `/imposto-de-renda`)
 *
 * Pure function — no I/O, safe to import in any runtime.
 */
export function safeNext(next: string | undefined | null): string {
	const FALLBACK = "/admin";
	if (!next) return FALLBACK;

	if (next.includes("://") || next.startsWith("//")) return FALLBACK;

	if (next.startsWith("/\\") || next.includes("\\")) return FALLBACK;

	const isAdminPath = next === "/admin" || next.startsWith("/admin/");
	const isAppPath = next === "/app" || next.startsWith("/app/");
	if (!isAdminPath && !isAppPath) return FALLBACK;

	return next;
}
