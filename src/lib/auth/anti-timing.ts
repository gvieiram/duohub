import "server-only";

export async function sleepRandomMs(min: number, max: number): Promise<void> {
	if (min > max) {
		throw new Error(`sleepRandomMs: min (${min}) must be <= max (${max})`);
	}
	const ms = Math.floor(min + Math.random() * (max - min));
	await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
