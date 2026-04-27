"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * SSR-safe wrapper around `useReducedMotion()` from Framer Motion.
 *
 * `useReducedMotion()` reads `window.matchMedia("(prefers-reduced-motion: reduce)")`,
 * which doesn't exist on the server. The native hook returns `null` on the server
 * (and on the first client render) and the real value only after the first effect
 * — causing hydration mismatches when the value flips from `false` to `true` and
 * the `motion` props serialized into HTML differ between server and client.
 *
 * This wrapper guarantees the first render is always `false` (matching SSR),
 * and only after mount returns the actual user preference. The cost is a single
 * frame where reduced-motion users may briefly see the regular animation start
 * — acceptable trade-off for hydration consistency.
 */
export function useReducedMotionSafe(): boolean {
	const raw = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return mounted ? (raw ?? false) : false;
}
