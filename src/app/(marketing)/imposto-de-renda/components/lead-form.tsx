"use client";

import { track } from "@vercel/analytics";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createLead } from "@/features/leads/actions";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";

type Props = {
	variant?: "hero" | "final";
	className?: string;
	utm?: {
		source?: string | null;
		medium?: string | null;
		campaign?: string | null;
	};
};

export function LeadForm({ variant = "hero", className, utm }: Props) {
	const m = useMessages().ir.form;
	const [isPending, startTransition] = useTransition();
	const formId = `ir-lead-form-${variant}`;
	const titleId = `${formId}-title`;

	async function action(formData: FormData) {
		if (utm?.source) formData.set("utmSource", utm.source);
		if (utm?.medium) formData.set("utmMedium", utm.medium);
		if (utm?.campaign) formData.set("utmCampaign", utm.campaign);

		startTransition(async () => {
			const result = await createLead(formData);

			if (result.success) {
				toast.success(m.toast.success);
				track("lead_submitted", {
					source: "ir-page",
					situation: String(formData.get("situation") ?? ""),
				});
				const form = document.getElementById(formId);
				if (form instanceof HTMLFormElement) form.reset();
				return;
			}

			if (result.reason === "rate_limit") {
				toast.error(m.toast.rateLimit);
				return;
			}

			toast.error(m.toast.error);
		});
	}

	return (
		<form
			id={formId}
			action={action}
			className={cn(
				"flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm",
				variant === "final" && "mx-auto max-w-2xl",
				className,
			)}
			aria-labelledby={titleId}
		>
			<header className="space-y-1">
				<h3 id={titleId} className="font-heading text-xl">
					{m.title}
				</h3>
				<p className="text-muted-foreground text-sm">{m.description}</p>
			</header>

			<input
				type="text"
				name="honeypot"
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
				className="pointer-events-none absolute h-0 w-0 opacity-0"
			/>

			<div className="grid gap-2">
				<Label htmlFor={`name-${variant}`}>{m.fields.name.label}</Label>
				<Input
					id={`name-${variant}`}
					name="name"
					placeholder={m.fields.name.placeholder}
					required
					maxLength={80}
					autoComplete="name"
				/>
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`email-${variant}`}>{m.fields.email.label}</Label>
				<Input
					id={`email-${variant}`}
					type="email"
					name="email"
					placeholder={m.fields.email.placeholder}
					required
					autoComplete="email"
				/>
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`whatsapp-${variant}`}>{m.fields.whatsapp.label}</Label>
				<Input
					id={`whatsapp-${variant}`}
					name="whatsapp"
					placeholder={m.fields.whatsapp.placeholder}
					required
					inputMode="tel"
					autoComplete="tel"
				/>
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`situation-${variant}`}>
					{m.fields.situation.label}
				</Label>
				<Select name="situation" required>
					<SelectTrigger id={`situation-${variant}`} className="w-full">
						<SelectValue placeholder={m.fields.situation.placeholder} />
					</SelectTrigger>
					<SelectContent>
						{m.fields.situation.options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-start gap-3 text-muted-foreground text-sm">
				<Checkbox
					id={`consent-${variant}`}
					name="consent"
					required
					className="mt-0.5"
				/>
				<Label
					htmlFor={`consent-${variant}`}
					className="font-normal text-muted-foreground leading-snug"
				>
					{m.fields.consent.label}{" "}
					<a
						href={m.fields.consent.linkHref}
						className="underline underline-offset-2 hover:text-foreground"
					>
						{m.fields.consent.linkLabel}
					</a>
					.
				</Label>
			</div>

			<Button type="submit" disabled={isPending} className="w-full">
				{isPending ? m.submitting : m.submit}
			</Button>
		</form>
	);
}
