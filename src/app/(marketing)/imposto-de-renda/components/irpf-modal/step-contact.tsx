"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMessages } from "@/stores/use-content-store";
import { useIrpfModalStore } from "@/stores/use-irpf-modal-store";

const WHATSAPP_DIGITS = /^\d{10,11}$/;

const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Nome muito curto")
		.max(80, "Nome muito longo"),
	email: z.string().trim().toLowerCase().email("E-mail inválido"),
	whatsapp: z
		.string()
		.trim()
		.refine((v) => WHATSAPP_DIGITS.test(v.replace(/\D/g, "")), {
			message: "WhatsApp inválido",
		}),
});

type ContactInput = z.input<typeof contactSchema>;

const inputClasses = cn(
	"h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
	"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
	"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
);

export type StepContactHandle = {
	submit: () => Promise<boolean>;
};

type Props = {
	consentError?: string;
};

export const StepContact = forwardRef<StepContactHandle, Props>(
	function StepContact({ consentError }, ref) {
		const { modal } = useMessages().ir;
		const initial = useIrpfModalStore((s) => s.formData);
		const updateFormData = useIrpfModalStore((s) => s.updateFormData);

		const {
			register,
			control,
			handleSubmit,
			formState: { errors },
		} = useForm<ContactInput>({
			resolver: zodResolver(contactSchema),
			mode: "onBlur",
			defaultValues: {
				name: initial.name,
				email: initial.email,
				whatsapp: initial.whatsapp,
			},
		});

		useImperativeHandle(ref, () => ({
			submit: () =>
				new Promise<boolean>((resolve) => {
					void handleSubmit(
						(data) => {
							updateFormData({
								name: data.name,
								email: data.email,
								whatsapp: data.whatsapp,
							});
							resolve(true);
						},
						() => resolve(false),
					)();
				}),
		}));

		return (
			<form
				noValidate
				className="flex flex-col gap-5 text-left"
				onSubmit={handleSubmit(() => {})}
			>
				<header className="flex flex-col gap-1">
					<h2 className="font-heading text-2xl text-foreground">
						{modal.step1.title}
					</h2>
					<p className="text-muted-foreground text-sm">
						{modal.step1.description}
					</p>
				</header>

				<div className="grid gap-2">
					<Label htmlFor="irpf-modal-name">
						{modal.step1.fields.name.label}
					</Label>
					<Input
						id="irpf-modal-name"
						type="text"
						autoComplete="name"
						placeholder={modal.step1.fields.name.placeholder}
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? "irpf-modal-name-error" : undefined}
						{...register("name")}
					/>
					{errors.name ? (
						<p id="irpf-modal-name-error" className="text-destructive text-sm">
							{errors.name.message}
						</p>
					) : null}
				</div>

				<div className="grid gap-2">
					<Label htmlFor="irpf-modal-email">
						{modal.step1.fields.email.label}
					</Label>
					<Input
						id="irpf-modal-email"
						type="email"
						inputMode="email"
						autoComplete="email"
						placeholder={modal.step1.fields.email.placeholder}
						aria-invalid={!!errors.email}
						aria-describedby={
							errors.email ? "irpf-modal-email-error" : undefined
						}
						{...register("email")}
					/>
					{errors.email ? (
						<p id="irpf-modal-email-error" className="text-destructive text-sm">
							{errors.email.message}
						</p>
					) : null}
				</div>

				<div className="grid gap-2">
					<Label htmlFor="irpf-modal-whatsapp">
						{modal.step1.fields.whatsapp.label}
					</Label>
					<Controller
						control={control}
						name="whatsapp"
						render={({ field }) => (
							<IMaskInput
								id="irpf-modal-whatsapp"
								type="tel"
								mask="(00) 00000-0000"
								unmask={true}
								lazy={false}
								overwrite={true}
								autoComplete="tel-national"
								placeholder={modal.step1.fields.whatsapp.placeholder}
								inputRef={field.ref}
								value={field.value ?? ""}
								onAccept={(value: string) => field.onChange(value)}
								onBlur={field.onBlur}
								aria-invalid={!!errors.whatsapp}
								aria-describedby={
									errors.whatsapp ? "irpf-modal-whatsapp-error" : undefined
								}
								className={inputClasses}
							/>
						)}
					/>
					{errors.whatsapp ? (
						<p
							id="irpf-modal-whatsapp-error"
							className="text-destructive text-sm"
						>
							{errors.whatsapp.message}
						</p>
					) : null}
				</div>

				{consentError ? (
					<p className="text-destructive text-sm" role="alert">
						{consentError}
					</p>
				) : null}
			</form>
		);
	},
);
