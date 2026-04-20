"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
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
import {
	type CreateLeadInput,
	createLeadSchema,
} from "@/features/leads/schemas";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";
import { PrivacyDialog } from "./privacy-dialog";

type Props = {
	variant?: "hero" | "final";
	className?: string;
	utm?: {
		source?: string | null;
		medium?: string | null;
		campaign?: string | null;
	};
};

const inputClasses = cn(
	"h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
	"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
	"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
);

export function LeadForm({ variant = "hero", className, utm }: Props) {
	const m = useMessages().ir.form;
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<CreateLeadInput>({
		resolver: zodResolver(createLeadSchema),
		defaultValues: {
			name: "",
			email: "",
			whatsapp: "",
			situation: undefined,
			consent: false,
			honeypot: "",
			utmSource: utm?.source ?? null,
			utmMedium: utm?.medium ?? null,
			utmCampaign: utm?.campaign ?? null,
		},
	});

	const formId = `ir-lead-form-${variant}`;
	const titleId = `${formId}-title`;

	function onSubmit(data: CreateLeadInput) {
		const fd = new FormData();
		fd.set("name", data.name);
		fd.set("email", data.email);
		fd.set("whatsapp", data.whatsapp);
		fd.set("situation", data.situation);
		fd.set("consent", data.consent ? "true" : "false");
		fd.set("honeypot", data.honeypot);
		if (data.utmSource) fd.set("utmSource", data.utmSource);
		if (data.utmMedium) fd.set("utmMedium", data.utmMedium);
		if (data.utmCampaign) fd.set("utmCampaign", data.utmCampaign);

		startTransition(async () => {
			const result = await createLead(fd);

			if (result.success) {
				toast.success(m.toast.success);
				track("lead_submitted", {
					source: "ir-page",
					situation: data.situation,
				});
				reset();
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
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className={cn(
				"flex flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm",
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
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
				className="pointer-events-none absolute h-0 w-0 opacity-0"
				{...register("honeypot")}
			/>

			<div className="grid gap-2">
				<Label htmlFor={`name-${variant}`}>{m.fields.name.label}</Label>
				<Input
					id={`name-${variant}`}
					placeholder={m.fields.name.placeholder}
					maxLength={80}
					autoComplete="name"
					aria-invalid={!!errors.name}
					aria-describedby={errors.name ? `name-${variant}-error` : undefined}
					{...register("name")}
				/>
				{errors.name && (
					<p
						id={`name-${variant}-error`}
						className="text-destructive text-sm"
						role="alert"
					>
						{errors.name.message}
					</p>
				)}
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`email-${variant}`}>{m.fields.email.label}</Label>
				<Input
					id={`email-${variant}`}
					type="email"
					placeholder={m.fields.email.placeholder}
					autoComplete="email"
					aria-invalid={!!errors.email}
					aria-describedby={errors.email ? `email-${variant}-error` : undefined}
					{...register("email")}
				/>
				{errors.email && (
					<p
						id={`email-${variant}-error`}
						className="text-destructive text-sm"
						role="alert"
					>
						{errors.email.message}
					</p>
				)}
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`whatsapp-${variant}`}>{m.fields.whatsapp.label}</Label>
				<Controller
					control={control}
					name="whatsapp"
					render={({ field }) => (
						<IMaskInput
							id={`whatsapp-${variant}`}
							mask="(00) 00000-0000"
							unmask={true}
							inputMode="tel"
							autoComplete="tel"
							placeholder={m.fields.whatsapp.placeholder}
							className={inputClasses}
							value={field.value}
							inputRef={field.ref}
							onAccept={(value: string) => field.onChange(value)}
							onBlur={field.onBlur}
							aria-invalid={!!errors.whatsapp}
							aria-describedby={
								errors.whatsapp ? `whatsapp-${variant}-error` : undefined
							}
						/>
					)}
				/>
				{errors.whatsapp && (
					<p
						id={`whatsapp-${variant}-error`}
						className="text-destructive text-sm"
						role="alert"
					>
						{errors.whatsapp.message}
					</p>
				)}
			</div>

			<div className="grid gap-2">
				<Label htmlFor={`situation-${variant}`}>
					{m.fields.situation.label}
				</Label>
				<Controller
					control={control}
					name="situation"
					render={({ field }) => (
						<Select onValueChange={field.onChange} value={field.value}>
							<SelectTrigger
								id={`situation-${variant}`}
								ref={field.ref}
								onBlur={field.onBlur}
								className="w-full"
								aria-invalid={!!errors.situation}
								aria-describedby={
									errors.situation ? `situation-${variant}-error` : undefined
								}
							>
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
					)}
				/>
				{errors.situation && (
					<p
						id={`situation-${variant}-error`}
						className="text-destructive text-sm"
						role="alert"
					>
						{errors.situation.message}
					</p>
				)}
			</div>

			<div className="grid gap-2">
				<div className="flex items-start gap-3 text-muted-foreground text-sm">
					<Controller
						control={control}
						name="consent"
						render={({ field }) => (
							<Checkbox
								id={`consent-${variant}`}
								checked={field.value}
								onCheckedChange={(checked) => field.onChange(checked === true)}
								onBlur={field.onBlur}
								ref={field.ref}
								className="mt-0.5"
								aria-invalid={!!errors.consent}
								aria-describedby={
									errors.consent ? `consent-${variant}-error` : undefined
								}
							/>
						)}
					/>
					<span className="text-muted-foreground text-sm leading-snug">
						<Label
							htmlFor={`consent-${variant}`}
							className="inline font-normal text-muted-foreground"
						>
							{m.fields.consent.label}
						</Label>{" "}
						<PrivacyDialog />.
					</span>
				</div>
				{errors.consent && (
					<p
						id={`consent-${variant}-error`}
						className="text-destructive text-sm"
						role="alert"
					>
						{errors.consent.message}
					</p>
				)}
			</div>

			<Button type="submit" disabled={isPending} className="w-full">
				{isPending ? m.submitting : m.submit}
			</Button>
		</form>
	);
}
