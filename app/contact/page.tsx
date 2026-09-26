import type { Metadata } from "next";
import { defaultOpenGraphImages, openGraphDefaults } from "@/lib/metadata";
import { Navigation } from "../components/nav";
import { ContactForm } from "./contact-form";

const description =
	"Get in touch with Karunanidhi — send a message about a project, a question, or just to say hi.";

export const metadata: Metadata = {
	title: "Contact",
	description,
	alternates: { canonical: "/contact" },
	openGraph: {
		...openGraphDefaults,
		images: defaultOpenGraphImages,
		title: "Contact",
		description,
		url: "/contact",
	},
};

export default function ContactPage() {
	return (
		<div className="min-h-screen dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-zinc-800),var(--color-zinc-950))]">
			<Navigation />
			<div className="max-w-2xl px-6 pt-20 pb-16 mx-auto lg:px-8 md:pt-24 lg:pt-32">
				<h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
					Get in touch
				</h1>
				<p className="mt-4 text-zinc-600 dark:text-zinc-400">
					Have a project in mind, or just want to say hi? Send me a message and
					I&apos;ll get back to you.
				</p>
				<div className="p-6 mt-10 border shadow-sm rounded-2xl sm:p-8 border-zinc-300 bg-white/70 dark:border-zinc-700 dark:bg-zinc-900/50 dark:shadow-none">
					<ContactForm />
				</div>
			</div>
		</div>
	);
}
