// Namespace import, not `import { z }`: this module ships to the browser, and
// the named `z` object drags every Zod locale into the bundle (~89 KB vs ~31 KB gz).
import * as z from "zod";

// Shared by the contact form (instant client-side feedback) and its server
// action (the real gate — the client is never trusted), so the two can't drift.
export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Please enter your name.")
		.max(100, "Please keep your name under 100 characters."),
	// Trim before checking the format: z.email().trim() validates first, which
	// would reject a pasted address with a stray trailing space.
	email: z
		.string()
		.trim()
		.min(1, "Please enter your email address.")
		.max(254, "That email address is too long.")
		.pipe(z.email("Please enter a valid email address.")),
	message: z
		.string()
		.trim()
		.min(1, "Please enter a message.")
		.max(5000, "Please keep your message under 5,000 characters."),
});

export type ContactField = keyof z.infer<typeof contactSchema>;
export type ContactValues = Record<ContactField, string>;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactFormState = {
	status: "idle" | "success" | "error";
	message: string;
	fieldErrors?: ContactFieldErrors;
	// Echoed back on failure: React resets an uncontrolled form after its
	// action runs, so these are fed back in as defaultValues to keep it filled.
	values?: ContactValues;
};

export const CONTACT_FIELDS: ContactField[] = ["name", "email", "message"];

// Off-screen field that real visitors never see; bots that fill every input do.
export const HONEYPOT_FIELD = "website";

export function readContactValues(formData: FormData): ContactValues {
	return {
		name: String(formData.get("name") ?? ""),
		email: String(formData.get("email") ?? ""),
		message: String(formData.get("message") ?? ""),
	};
}

export function getFieldErrors(
	error: z.ZodError<ContactValues>,
): ContactFieldErrors {
	const { fieldErrors } = z.flattenError(error);
	const errors: ContactFieldErrors = {};
	for (const field of CONTACT_FIELDS) {
		const first = fieldErrors[field]?.[0];
		if (first) errors[field] = first;
	}
	return errors;
}
