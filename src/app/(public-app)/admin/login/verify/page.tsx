import type { Metadata } from "next";
import { messages } from "@/content/messages";

export const metadata: Metadata = {
	title: "Validando — DuoHub",
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function VerifyPage() {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-background">
			<p className="text-muted-foreground text-sm">
				{messages.auth.verify.loading}
			</p>
		</div>
	);
}
