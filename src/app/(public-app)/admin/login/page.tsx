import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
	title: "Entrar — DuoHub",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string; error?: string }>;
}) {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm space-y-8">
				<div className="flex justify-center">
					<Logo animated={false} />
				</div>
				<LoginForm searchParamsPromise={searchParams} />
			</div>
		</div>
	);
}
