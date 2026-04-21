"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) {
			return;
		}

		const mediaQueryList = window.matchMedia(query);
		const onChange = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		setMatches(mediaQueryList.matches);
		mediaQueryList.addEventListener("change", onChange);
		return () => mediaQueryList.removeEventListener("change", onChange);
	}, [query]);

	return matches;
}

export function useIsDesktop() {
	return useMediaQuery("(min-width: 768px)");
}
