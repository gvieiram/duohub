"use client";

import { PostHogProvider } from "@posthog/react";
import { ThemeProvider } from "next-themes";
import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import type { FlagsState } from "@/lib/flags";
import { posthog } from "@/lib/posthog/client";
import { useFlagsStore } from "@/stores/use-flags-store";

type ProvidersProps = {
	children: React.ReactNode;
	flags?: Partial<FlagsState>;
};

export function Providers({ children, flags }: ProvidersProps) {
	const hydrated = useRef(false);
	if (flags && !hydrated.current) {
		useFlagsStore.setState(flags);
		hydrated.current = true;
	}

	return (
		<PostHogProvider client={posthog}>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
			>
				{children}
				<Toaster position="bottom-right" richColors closeButton />
			</ThemeProvider>
		</PostHogProvider>
	);
}
