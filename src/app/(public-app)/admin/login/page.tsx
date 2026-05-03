import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
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
	const flags = await resolveAll();

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
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
