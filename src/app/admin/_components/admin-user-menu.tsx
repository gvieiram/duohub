"use client";

import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";
import { useMessages } from "@/stores/use-content-store";

type Props = {
	user: { email: string; name: string | null };
};

export function AdminUserMenu({ user }: Props) {
	const router = useRouter();
	const { admin } = useMessages();

	async function handleLogout() {
		await authClient.signOut();
		router.push("/admin/login");
		router.refresh();
	}

	const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

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
					<p className="truncate font-medium">{user.name ?? user.email}</p>
					{user.name ? (
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
