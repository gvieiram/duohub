"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/stores/use-content-store";

export function InlineCta() {
	const m = useMessages().ir;
	const shouldReduceMotion = useReducedMotion();

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
				<motion.span
					aria-hidden
					animate={
						shouldReduceMotion
							? undefined
							: {
									y: [0, 3, 0],
								}
					}
					transition={{
						duration: 1.4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="inline-flex"
				>
					<ArrowDown className="size-4" aria-hidden />
				</motion.span>
			</Button>
		</div>
	);
}
