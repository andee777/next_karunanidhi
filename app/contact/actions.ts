"use server";

import { Resend } from "resend";
import {
	type ContactFormState,
	contactSchema,
	getFieldErrors,
	HONEYPOT_FIELD,
	readContactValues,
} from "@/lib/contact";

const SUCCESS_MESSAGE =
	"Thanks — your message is on its way. I'll get back to you soon.";
const FALLBACK_MESSAGE =
	"Sorry, your message couldn't be sent right now. Please try again in a little while.";

export async function sendContactMessage(
	_prevState: ContactFormState,
	formData: FormData,
): Promise<ContactFormState> {
	// Report success so a bot gets no signal to adapt to, but send nothing.
	if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
		console.warn("sendContactMessage: honeypot field was filled, discarding");
		return { status: "success", message: SUCCESS_MESSAGE };
	}

	const values = readContactValues(formData);
	const parsed = contactSchema.safeParse(values);
	if (!parsed.success) {
		return {
			status: "error",
			message: "Please fix the highlighted fields.",
			fieldErrors: getFieldErrors(parsed.error),
			values,
		};
	}

	// Deliberately no fallback to Resend's shared onboarding@resend.dev sender:
	// a missing or unverified sender should fail visibly, not quietly send from
	// a domain that isn't this site's.
	const apiKey = process.env.RESEND_API_KEY;
	const to = process.env.OWNER_EMAIL;
	const from = process.env.CONTACT_FROM_EMAIL;
	if (!apiKey || !to || !from) {
		console.error(
			"sendContactMessage: RESEND_API_KEY, OWNER_EMAIL and CONTACT_FROM_EMAIL must all be set",
		);
		return { status: "error", message: FALLBACK_MESSAGE, values };
	}

	const { name, email, message } = parsed.data;
	try {
		// Plain text only, so nothing a visitor types is ever rendered as HTML.
		const { error } = await new Resend(apiKey).emails.send({
			from,
			to,
			replyTo: email,
			subject: `New message from ${name.replace(/\s+/g, " ")} via karunanidhi.dev`,
			text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
		});
		if (error) {
			console.error("sendContactMessage: Resend returned an error", error);
			return { status: "error", message: FALLBACK_MESSAGE, values };
		}
	} catch (err) {
		console.error("sendContactMessage: unexpected error sending email", err);
		return { status: "error", message: FALLBACK_MESSAGE, values };
	}

	return { status: "success", message: SUCCESS_MESSAGE };
}
