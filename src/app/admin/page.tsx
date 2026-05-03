import { messages } from "@/content/messages";
import { requireAdmin } from "@/lib/auth/helpers";

export default async function AdminDashboardPage() {
	const session = await requireAdmin();
	const { admin } = messages;

	const trimmedName = session.user.name?.trim();
	const firstName =
		trimmedName && trimmedName.length > 0 ? trimmedName.split(" ")[0] : "admin";

	return (
		<div className="space-y-6">
			<header>
				<h1 className="font-heading text-3xl">{admin.dashboard.title}</h1>
				<p className="text-muted-foreground">
					{admin.dashboard.welcome(firstName)}
				</p>
			</header>

			<div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
				{admin.dashboard.placeholder}
			</div>
		</div>
	);
}
