export type UserListItem = {
	id: string;
	email: string;
	name: string | null;
	createdAt: Date;
	revokedAt: Date | null;
	lastAccessAt: Date | null;
};
