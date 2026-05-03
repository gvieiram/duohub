// @vitest-environment node

import { describe, expect, it } from "vitest";
import { sleepRandomMs } from "./anti-timing";

describe("sleepRandomMs", () => {
	it("sleeps for at least min ms", async () => {
		const start = Date.now();
		await sleepRandomMs(50, 60);
		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(45);
	});

	it("never sleeps more than max ms (with 20ms tolerance)", async () => {
		const start = Date.now();
		await sleepRandomMs(10, 30);
		const elapsed = Date.now() - start;
		expect(elapsed).toBeLessThanOrEqual(50);
	});

	it("throws if min > max", async () => {
		await expect(sleepRandomMs(100, 50)).rejects.toThrow(/min/);
	});
});
