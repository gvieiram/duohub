// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();

vi.mock("@/lib/db", () => ({
	db: { user: { findMany: findManyMock } },
}));

const { listUsers } = await import("./queries");

describe("listUsers — query shape", () => {
	beforeEach(() => {
		findManyMock.mockReset();
		findManyMock.mockResolvedValue([]);
	});

	it("calls db.user.findMany with the expected where, select and orderBy", async () => {
		await listUsers();

		expect(findManyMock).toHaveBeenCalledWith({
			where: { role: "ADMIN" },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				revokedAt: true,
				sessions: {
					select: { createdAt: true },
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
			orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
		});
	});
});

describe("listUsers — mapping", () => {
	beforeEach(() => {
		findManyMock.mockReset();
	});

	it("maps sessions[0].createdAt into lastAccessAt for users with sessions", async () => {
		const sessionDate = new Date("2026-04-01T10:00:00Z");
		findManyMock.mockResolvedValue([
			{
				id: "user-1",
				email: "admin@duohub.com",
				name: "Admin",
				createdAt: new Date("2026-01-01T00:00:00Z"),
				revokedAt: null,
				sessions: [{ createdAt: sessionDate }],
			},
		]);

		const result = await listUsers();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: "user-1",
			email: "admin@duohub.com",
			name: "Admin",
			createdAt: new Date("2026-01-01T00:00:00Z"),
			revokedAt: null,
			lastAccessAt: sessionDate,
		});
	});

	it("maps lastAccessAt to null for users without sessions", async () => {
		findManyMock.mockResolvedValue([
			{
				id: "user-2",
				email: "noaccess@duohub.com",
				name: null,
				createdAt: new Date("2026-02-01T00:00:00Z"),
				revokedAt: new Date("2026-03-01T00:00:00Z"),
				sessions: [],
			},
		]);

		const result = await listUsers();

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: "user-2",
			email: "noaccess@duohub.com",
			name: null,
			createdAt: new Date("2026-02-01T00:00:00Z"),
			revokedAt: new Date("2026-03-01T00:00:00Z"),
			lastAccessAt: null,
		});
	});
});
