"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import type React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
	CONTACT_FIELDS,
	type ContactField,
	type ContactFieldErrors,
	type ContactFormState,
	contactSchema,
	getFieldErrors,
	HONEYPOT_FIELD,
	readContactValues,
} from "@/lib/contact";
import { sendContactMessage } from "./actions";

const initialState: ContactFormState = { status: "idle", message: "" };

// Borders are zinc-500 (not the site's usual zinc-300/700) so the field edge
// clears WCAG's 3:1 non-text contrast; focus thickens it to a solid 2px, and
// invalid fields stay red even while focused.
const inputClassName =
	"block w-full rounded-lg border border-zinc-500 bg-zinc-50 px-3.5 py-2.5 text-zinc-900 shadow-sm transition-colors duration-200 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-600 dark:border-zinc-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-none dark:placeholder:text-zinc-400 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 dark:aria-[invalid=true]:border-red-400 dark:aria-[invalid=true]:focus:border-red-400 dark:aria-[invalid=true]:focus:ring-red-400";

export function ContactForm() {
	// Remounting on "Send another message" is the simplest way to get a fresh
	// useActionState — it has no reset of its own.
	const [formKey, setFormKey] = useState(0);
	return (
		<ContactFormInner
			key={formKey}
			onSendAnother={() => setFormKey((key) => key + 1)}
		/>
	);
}

function ContactFormInner({ onSendAnother }: { onSendAnother: () => void }) {
	const [state, formAction] = useActionState(sendContactMessage, initialState);
	const [errors, setErrors] = useState<ContactFieldErrors>({});
	const [syncedState, setSyncedState] = useState(state);
	const successHeadingRef = useRef<HTMLHeadingElement>(null);

	// Adopt the server's field errors whenever a new result comes back (only
	// reachable if client validation was bypassed, e.g. with JS disabled).
	if (state !== syncedState) {
		setSyncedState(state);
		setErrors(state.fieldErrors ?? {});
	}

	useEffect(() => {
		if (state.status === "success") successHeadingRef.current?.focus();
	}, [state.status]);

	function validateField(field: ContactField, value: string) {
		const result = contactSchema.shape[field].safeParse(value);
		setErrors((prev) => ({
			...prev,
			[field]: result.success ? undefined : result.error.issues[0]?.message,
		}));
	}

	function handleBlur(field: ContactField, value: string) {
		// Don't nag about a field someone merely tabbed through; submit catches it.
		if (value.trim() !== "" || errors[field]) validateField(field, value);
	}

	function handleChange(field: ContactField, value: string) {
		// Once a field is flagged, re-check as they type so the error clears
		// the moment it's fixed.
		if (errors[field]) validateField(field, value);
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		const form = event.currentTarget;
		const result = contactSchema.safeParse(
			readContactValues(new FormData(form)),
		);
		if (result.success) {
			setErrors({});
			return;
		}
		// Stops React from invoking the server action at all.
		event.preventDefault();
		const fieldErrors = getFieldErrors(result.error);
		setErrors(fieldErrors);
		const firstInvalid = CONTACT_FIELDS.find((field) => fieldErrors[field]);
		form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
	}

	if (state.status === "success") {
		return (
			<div
				role="status"
				className="flex flex-col items-center py-8 text-center"
			>
				<span className="flex items-center justify-center rounded-full w-14 h-14 bg-emerald-50 ring-1 ring-emerald-700/20 dark:bg-emerald-400/10 dark:ring-emerald-400/20">
					<CircleCheck
						className="w-7 h-7 text-emerald-700 dark:text-emerald-400"
						aria-hidden="true"
					/>
				</span>
				<h2
					ref={successHeadingRef}
					tabIndex={-1}
					className="mt-5 text-xl font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none"
				>
					Message sent
				</h2>
				<p className="max-w-sm mt-2 text-zinc-600 dark:text-zinc-400">
					{state.message}
				</p>
				<button
					type="button"
					onClick={onSendAnother}
					className="px-5 py-2 mt-6 text-sm font-medium border rounded-full duration-200 border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-100"
				>
					Send another message
				</button>
			</div>
		);
	}

	const fieldProps = (field: ContactField) => ({
		id: field,
		name: field,
		defaultValue: state.values?.[field],
		required: true,
		"aria-invalid": errors[field] ? true : undefined,
		"aria-describedby": errors[field] ? `${field}-error` : undefined,
		onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			handleBlur(field, event.currentTarget.value),
		onChange: (
			event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		) => handleChange(field, event.currentTarget.value),
		className: inputClassName,
	});

	return (
		<form
			action={formAction}
			onSubmit={handleSubmit}
			noValidate
			className="relative space-y-6"
		>
			{state.status === "error" && !state.fieldErrors && (
				<div
					role="alert"
					className="flex items-start gap-3 p-4 text-sm border rounded-xl border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
				>
					<CircleAlert className="w-5 h-5 mt-px shrink-0" aria-hidden="true" />
					<p>{state.message}</p>
				</div>
			)}

			{/* Off-screen rather than display:none, which some bots detect and skip. */}
			<div
				className="absolute w-px h-px overflow-hidden -left-[9999px]"
				aria-hidden="true"
			>
				<label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
				<input
					id={HONEYPOT_FIELD}
					name={HONEYPOT_FIELD}
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<FormField field="name" label="Name" error={errors.name}>
					<input
						{...fieldProps("name")}
						type="text"
						autoComplete="name"
						placeholder="Your name"
						maxLength={100}
					/>
				</FormField>
				<FormField field="email" label="Email" error={errors.email}>
					<input
						{...fieldProps("email")}
						type="email"
						autoComplete="email"
						placeholder="you@example.com"
						maxLength={254}
					/>
				</FormField>
			</div>

			<FormField field="message" label="Message" error={errors.message}>
				<textarea
					{...fieldProps("message")}
					rows={6}
					placeholder="What would you like to talk about?"
					maxLength={5000}
					className={`${inputClassName} min-h-36 resize-y`}
				/>
			</FormField>

			<div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					All fields are required.
				</p>
				<SubmitButton />
			</div>
		</form>
	);
}

function FormField({
	field,
	label,
	error,
	children,
}: {
	field: ContactField;
	label: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<label
				htmlFor={field}
				className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
			>
				{label}
			</label>
			{children}
			{error && (
				<p
					id={`${field}-error`}
					className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400"
				>
					<CircleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
					{error}
				</p>
			)}
		</div>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium rounded-full sm:w-auto duration-200 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-100"
		>
			{pending ? (
				<LoaderCircle
					className="w-4 h-4 motion-safe:animate-spin"
					aria-hidden="true"
				/>
			) : (
				<Send className="w-4 h-4" aria-hidden="true" />
			)}
			{pending ? "Sending…" : "Send message"}
		</button>
	);
}
