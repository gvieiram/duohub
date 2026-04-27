import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

describe("useReducedMotionSafe", () => {
	beforeEach(() => {
		// Default jsdom doesn't expose matchMedia. Provide a stable stub so
		// Framer Motion's underlying `useReducedMotion()` doesn't crash.
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			configurable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	it("always returns a boolean (never null/undefined)", () => {
		const { result } = renderHook(() => useReducedMotionSafe());
		expect(typeof result.current).toBe("boolean");
		expect(result.current).not.toBeNull();
		expect(result.current).not.toBeUndefined();
	});

	// Note: Framer Motion's `useReducedMotion()` keeps a module-level cache of
	// the matchMedia result, so toggling the mock between tests does not change
	// what the hook returns. Verifying the actual "false-on-SSR-then-true-on-mount"
	// behaviour requires a real browser — that's covered by the Playwright pass
	// that validates the absence of the hydration mismatch warning on the
	// /imposto-de-renda and / pages with prefers-reduced-motion: reduce.
});
