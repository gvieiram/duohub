"use client";

import {
	type HTMLMotionProps,
	motion,
	useReducedMotion,
	type Variants,
} from "framer-motion";
import { forwardRef } from "react";

export const FADE_UP_DISTANCE = 20;
export const FADE_UP_DURATION = 0.5;
export const STAGGER_DELAY = 0.08;

export const fadeUpVariants: Variants = {
	hidden: { opacity: 0, y: FADE_UP_DISTANCE },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: FADE_UP_DURATION,
			ease: [0.16, 1, 0.3, 1],
		},
	},
};

export const staggerContainerVariants: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: STAGGER_DELAY,
			delayChildren: 0.05,
		},
	},
};

export const fadeUpItemVariants: Variants = {
	hidden: { opacity: 0, y: FADE_UP_DISTANCE },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: FADE_UP_DURATION,
			ease: [0.16, 1, 0.3, 1],
		},
	},
};

type FadeInProps = HTMLMotionProps<"div"> & {
	as?: "div" | "section" | "ol" | "ul" | "aside";
	delay?: number;
	amount?: number;
	once?: boolean;
};

/**
 * Fade + subtle upward entrance tied to viewport.
 * Respects `prefers-reduced-motion` (renders content without motion).
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(function FadeIn(
	{
		as = "div",
		delay = 0,
		amount = 0.2,
		once = true,
		transition,
		viewport,
		children,
		...rest
	},
	ref,
) {
	const shouldReduceMotion = useReducedMotion();
	const MotionTag = motion[as] as typeof motion.div;

	if (shouldReduceMotion) {
		return (
			<MotionTag ref={ref} {...rest}>
				{children}
			</MotionTag>
		);
	}

	return (
		<MotionTag
			ref={ref}
			initial={{ opacity: 0, y: FADE_UP_DISTANCE }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once, amount, ...viewport }}
			transition={{
				duration: FADE_UP_DURATION,
				ease: [0.16, 1, 0.3, 1],
				delay,
				...transition,
			}}
			{...rest}
		>
			{children}
		</MotionTag>
	);
});

type StaggerGroupProps = HTMLMotionProps<"div"> & {
	as?: "div" | "section" | "ol" | "ul";
	amount?: number;
	once?: boolean;
};

/**
 * Container that orchestrates staggered entrance for children using
 * `fadeUpItemVariants`. Child elements must use `motion.*` with
 * `variants={fadeUpItemVariants}` (no initial/animate/whileInView needed).
 */
export const StaggerGroup = forwardRef<HTMLDivElement, StaggerGroupProps>(
	function StaggerGroup(
		{ as = "div", amount = 0.2, once = true, children, ...rest },
		ref,
	) {
		const shouldReduceMotion = useReducedMotion();
		const MotionTag = motion[as] as typeof motion.div;

		if (shouldReduceMotion) {
			return (
				<MotionTag ref={ref} {...rest}>
					{children}
				</MotionTag>
			);
		}

		return (
			<MotionTag
				ref={ref}
				initial="hidden"
				whileInView="visible"
				viewport={{ once, amount }}
				variants={staggerContainerVariants}
				{...rest}
			>
				{children}
			</MotionTag>
		);
	},
);
