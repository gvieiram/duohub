import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Validando — DuoHub",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function VerifyPage() {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-background">
			<p className="text-muted-foreground text-sm">Validando seu link…</p>
		</div>
	);
}
