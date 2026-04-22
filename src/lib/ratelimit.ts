import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const globalForRatelimit = globalThis as unknown as {
	contactRatelimit: Ratelimit | undefined;
};

function createContactRatelimit(): Ratelimit {
	const redis = new Redis({
		url: env.UPSTASH_REDIS_REST_URL,
		token: env.UPSTASH_REDIS_REST_TOKEN,
	});

	return new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(5, "1 h"),
		analytics: true,
		prefix: "ratelimit:contact",
	});
}

export const contactRatelimit =
	globalForRatelimit.contactRatelimit ?? createContactRatelimit();

if (process.env.NODE_ENV !== "production") {
	globalForRatelimit.contactRatelimit = contactRatelimit;
}
