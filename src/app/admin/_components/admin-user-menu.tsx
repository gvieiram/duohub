"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions";
import { authClient } from "@/lib/auth/auth-client";
import { useMessages } from "@/stores/use-content-store";

type Props = {
	user: { email: string; name: string | null };
};

function resolveDisplayName(name: string | null, email: string): string {
	const trimmed = name?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : email;
}

export function AdminUserMenu({ user }: Props) {
	const router = useRouter();
	const { admin } = useMessages();

	async function handleLogout() {
		try {
			// Server Action writes USER_LOGOUT audit row (with IP/UA still
			// readable from the request) and invalidates the DB session.
			await logoutAction();
			// Client-side wipe is a defence-in-depth fallback; the Server
			// Action already cleared the cookie, so this is a no-op on
			// success but salvages the UI state if the server failed.
			await authClient.signOut();
			router.push("/admin/login");
		} catch {
			toast.error(admin.errors.logoutFailed, {
				duration: 8000,
				id: "admin-logout-failed",
			});
		}
	}

	const displayName = resolveDisplayName(user.name, user.email);
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-9 w-9 rounded-full p-0"
					data-testid="admin-user-menu-trigger"
					aria-label={user.email}
				>
					<Avatar className="h-9 w-9">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="px-2 py-1.5 text-sm">
					<p className="truncate font-medium">{displayName}</p>
					{displayName !== user.email ? (
						<p className="truncate text-muted-foreground text-xs">
							{user.email}
						</p>
					) : null}
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleLogout} data-testid="admin-logout">
					{admin.shell.logout}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
