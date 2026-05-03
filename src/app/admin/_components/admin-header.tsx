import { AdminSidebarTrigger } from "./admin-sidebar-trigger";
import { AdminUserMenu } from "./admin-user-menu";

type Props = {
	user: { email: string; name: string | null };
};

export function AdminHeader({ user }: Props) {
	return (
		<header className="flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
			<AdminSidebarTrigger />
			<div className="flex items-center gap-2">
				<AdminUserMenu user={user} />
			</div>
		</header>
	);
}
