"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { revokeUserAction } from "@/features/users/actions";
import { useMessages } from "@/stores/use-content-store";

type RevokeUserButtonProps = {
	user: { id: string; email: string };
	disabled?: boolean;
};

export function RevokeUserButton({ user, disabled }: RevokeUserButtonProps) {
	const messages = useMessages();
	const { revokeDialog, errors } = messages.admin.users;
	const [isPending, startTransition] = useTransition();

	function handleConfirm() {
		startTransition(async () => {
			const result = await revokeUserAction({ userId: user.id });
			if (result.success) {
				toast.success(revokeDialog.success);
			} else {
				toast.error(result.error || errors.generic);
			}
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" disabled={disabled}>
					{revokeDialog.confirm}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>{revokeDialog.title}</AlertDialogTitle>
					<AlertDialogDescription>
						{revokeDialog.description(user.email)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{revokeDialog.cancel}</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isPending}
						onClick={handleConfirm}
					>
						{revokeDialog.confirm}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
