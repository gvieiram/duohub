"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMessages } from "@/stores/use-content-store";
import { IrpfModalTrigger } from "./irpf-modal/trigger-button";

export function InlineCta() {
	const { modal } = useMessages().ir;
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className="px-4 py-6 text-center lg:hidden">
			<IrpfModalTrigger size="lg" className="w-full gap-2">
				{modal.trigger.mobile}
				<motion.span
					aria-hidden
					animate={
						shouldReduceMotion
							? undefined
							: {
									y: [0, -2, 0],
									x: [0, 2, 0],
								}
					}
					transition={{
						duration: 1.4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="inline-flex"
				>
					<ArrowUpRight className="size-4" aria-hidden />
				</motion.span>
			</IrpfModalTrigger>
		</div>
	);
}
