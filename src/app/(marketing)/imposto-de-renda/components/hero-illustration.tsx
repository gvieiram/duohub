"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroIllustration() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<div
			aria-hidden
			className="relative mx-auto aspect-square w-full max-w-[460px]"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.85 }}
				animate={
					prefersReducedMotion
						? { opacity: 0.55, scale: 1 }
						: { opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] }
				}
				transition={{
					duration: 6,
					repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
				className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
			/>

			{/* biome-ignore lint/performance/noImgElement: animated GIF must not be processed by next/image optimizer */}
			<motion.img
				src="/illustrations/irpf-hero.gif"
				alt=""
				width={500}
				height={500}
				initial={{ opacity: 0, scale: 0.94, y: 16 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
				className="relative h-full w-full object-contain drop-shadow-[0_24px_48px_rgba(15,59,58,0.18)]"
			/>
		</div>
	);
}
