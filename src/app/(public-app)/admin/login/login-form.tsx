"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { use, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendLoginMagicLinkAction } from "@/features/auth/actions";
import { type LoginInput, loginSchema } from "@/features/auth/schemas";
import { useMessages } from "@/stores/use-content-store";

type Props = {
	searchParamsPromise: Promise<{ next?: string; error?: string }>;
};

export function LoginForm({ searchParamsPromise }: Props) {
	const params = use(searchParamsPromise);
	const { auth } = useMessages();
	const [submitted, setSubmitted] = useState(false);

	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			next: params.next?.startsWith("/") ? params.next : "/admin",
		},
	});

	async function onSubmit(values: LoginInput) {
		await sendLoginMagicLinkAction(values);
		setSubmitted(true);
	}

	if (submitted) {
		return (
			<div className="rounded-lg border bg-card p-6 text-center">
				<h2 className="font-medium">{auth.login.successTitle}</h2>
				<p className="mt-2 text-muted-foreground text-sm">
					{auth.login.successMessage}
				</p>
			</div>
		);
	}

	const errorMessage =
		params.error === "forbidden"
			? auth.login.errors.forbidden
			: params.error === "session_invalidated"
				? auth.login.errors.sessionInvalidated
				: null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{auth.login.emailLabel}</FormLabel>
							<FormControl>
								<Input
									type="email"
									autoFocus
									autoComplete="email"
									maxLength={254}
									placeholder={auth.login.emailPlaceholder}
									data-testid="login-email-input"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full"
					disabled={form.formState.isSubmitting}
					data-testid="login-submit"
				>
					{form.formState.isSubmitting
						? auth.login.submitting
						: auth.login.submit}
				</Button>

				{errorMessage && (
					<p role="alert" className="text-destructive text-sm">
						{errorMessage}
					</p>
				)}
			</form>
		</Form>
	);
}
