"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/stores/use-content-store";

export function InlineCta() {
	const m = useMessages().ir;

	function scrollToForm(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		const target = document.getElementById("formulario-contato");
		if (!target) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		target.scrollIntoView({
			behavior: prefersReducedMotion ? "auto" : "smooth",
			block: "start",
		});
	}

	return (
		<div className="px-4 py-6 text-center lg:hidden">
			<Button size="lg" onClick={scrollToForm} className="w-full gap-2">
				{m.mobileCta.label}
				<ArrowDown className="size-4" aria-hidden />
			</Button>
		</div>
	);
}
