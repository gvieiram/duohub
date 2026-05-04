import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth/helpers";
import { safeNext } from "@/lib/auth/safe-redirect";
import { resolveAll } from "@/lib/posthog/flags";

export const metadata: Metadata = {
	title: "Entrar — DuoHub",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string; error?: string }>;
}) {
	const params = await searchParams;

	// If the request carries an `?error=...` (e.g. session_invalidated,
	// forbidden, EXPIRED_TOKEN), the user must see the toast and re-login —
	// skip the logged-in guard so we don't bounce them back to /admin
	// immediately and create a redirect loop with `requireAdmin()`.
	if (!params.error) {
		const session = await getSession();
		if (session) {
			redirect(safeNext(params.next));
		}
	}

	const flags = await resolveAll();

	return (
		// `theme-admin` swaps the brand palette for the stock shadcn neutral
		// palette so the login screen feels like a tool rather than a brand
		// expression. See `src/app/globals.css`.
		<div className="theme-admin flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a href="/" className="flex items-center gap-2 self-center font-medium">
					<Logo animated={false} />
				</a>
				<LoginForm
					showProviderChooser={flags.isAdminLoginExtraProvidersEnabled}
					searchParamsPromise={searchParams}
				/>
			</div>
		</div>
	);
}
