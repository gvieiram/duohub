export type RequestContext = {
	ipAddress: string | null;
	userAgent: string | null;
};

export function extractRequestContext(
	request: Request | undefined,
): RequestContext {
	if (!request) {
		return { ipAddress: null, userAgent: null };
	}

	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	const userAgent = request.headers.get("user-agent");

	let ipAddress: string | null = null;
	if (forwardedFor) {
		ipAddress = forwardedFor.split(",")[0]?.trim() ?? null;
	} else if (realIp) {
		ipAddress = realIp.trim();
	}

	return {
		ipAddress: ipAddress || null,
		userAgent: userAgent?.trim() || null,
	};
}
