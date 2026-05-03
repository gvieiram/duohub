"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { use, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

function resolveErrorMessage(
	code: string | undefined,
	errors: ReturnType<typeof useMessages>["auth"]["login"]["errors"],
): string | null {
	if (!code) return null;
	switch (code) {
		case "forbidden":
			return errors.forbidden;
		case "session_invalidated":
			return errors.sessionInvalidated;
		// Better Auth magic-link verification error codes (see
		// node_modules/better-auth/.../plugins/magic-link/index.mjs):
		case "EXPIRED_TOKEN":
			return errors.expiredToken;
		case "INVALID_TOKEN":
			return errors.invalidToken;
		case "ATTEMPTS_EXCEEDED":
			return errors.attemptsExceeded;
		// Emitted when the email isn't registered and `disableSignUp: true`.
		case "new_user_signup_disabled":
			return errors.notAuthorized;
		case "failed_to_create_user":
			return errors.generic;
		default:
			return errors.generic;
	}
}

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

	// Surface verification/auth errors from the URL via toast (visual) AND
	// react-hook-form's setError (assertive announcement to screen readers via
	// FormMessage). Strip `?error=` from the URL so refresh doesn't re-trigger.
	// `firedRef` guards against StrictMode's double-effect in dev.
	const setError = form.setError;
	const firedRef = useRef(false);
	useEffect(() => {
		if (firedRef.current) return;
		const message = resolveErrorMessage(params.error, auth.login.errors);
		if (!message) return;

		firedRef.current = true;
		toast.error(message);
		setError("email", { type: "server", message });

		const url = new URL(window.location.href);
		url.searchParams.delete("error");
		window.history.replaceState({}, "", url.toString());
	}, [params.error, auth.login.errors, setError]);

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
			</form>
		</Form>
	);
}
