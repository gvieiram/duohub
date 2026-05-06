import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { messages } from "@/content/messages";
import type { UserListItem } from "@/features/users/types";
import { formatDate } from "@/lib/date";
import { RevokeUserButton } from "./revoke-user-button";

type UsersTableProps = {
	users: UserListItem[];
	currentUserId: string;
};

function resolveDisplayName(user: {
	name: string | null;
	email: string;
}): string {
	const trimmed = user.name?.trim();
	if (trimmed && trimmed.length > 0) return trimmed;
	return user.email;
}

function resolveInitials(user: { name: string | null; email: string }): string {
	return resolveDisplayName(user).slice(0, 2).toUpperCase();
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
	const { admin, common } = messages;

	if (users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
				<p className="font-medium">{admin.users.empty.title}</p>
				<p className="text-muted-foreground text-sm">
					{admin.users.empty.description}
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{admin.users.columns.user}</TableHead>
					<TableHead>{admin.users.columns.status}</TableHead>
					<TableHead>{admin.users.columns.lastAccess}</TableHead>
					<TableHead>{admin.users.columns.createdAt}</TableHead>
					<TableHead>{admin.users.columns.actions}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>
							<div className="flex items-center gap-3">
								<Avatar>
									<AvatarFallback>{resolveInitials(user)}</AvatarFallback>
								</Avatar>
								<div className="grid leading-tight">
									<span className="truncate font-medium">
										{resolveDisplayName(user)}
									</span>
									{user.name && (
										<span className="truncate text-muted-foreground text-xs">
											{user.email}
										</span>
									)}
								</div>
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={user.revokedAt ? "outline" : "default"}>
								{user.revokedAt ? common.status.revoked : common.status.active}
							</Badge>
						</TableCell>
						<TableCell>
							{user.lastAccessAt ? (
								formatDate(user.lastAccessAt)
							) : (
								<span className="text-muted-foreground">
									{common.terms.never}
								</span>
							)}
						</TableCell>
						<TableCell>{formatDate(user.createdAt)}</TableCell>
						<TableCell>
							<RevokeUserButton
								user={{ id: user.id, email: user.email }}
								disabled={user.id === currentUserId || user.revokedAt !== null}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
