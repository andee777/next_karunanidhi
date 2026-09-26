import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { defaultOpenGraphImages, openGraphDefaults } from "@/lib/metadata";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";

const description =
	"Get in touch with Karunanidhi by email, on X, or on GitHub.";

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

const socials = [
	{
		icon: <SiX size={20} color="currentColor" />,
		href: "https://twitter.com/dj_master_k",
		label: "X",
		handle: "@dj_master_k",
	},
	{
		icon: <Mail size={20} />,
		href: "mailto:info@karunanidhi.dev",
		label: "Email",
		handle: "info@karunanidhi.dev",
	},
	{
		icon: <SiGithub size={20} color="currentColor" />,
		href: "https://github.com/andee777",
		label: "Github",
		handle: "andee777",
	},
];

export default function ContactPage() {
	return (
		<div className=" bg-gradient-to-tl from-zinc-50/0 via-zinc-50 to-zinc-50/0 dark:from-zinc-950/0 dark:via-zinc-950 dark:to-zinc-950/0">
			<Navigation />
			<h1 className="sr-only">Contact</h1>
			<div className="container flex items-center justify-center min-h-screen px-4 mx-auto">
				<div className="grid w-full grid-cols-1 gap-8 mx-auto mt-32 sm:mt-0 sm:grid-cols-3 lg:gap-16">
					{socials.map((s) => (
						<Card key={s.label}>
							<Link
								href={s.href}
								target="_blank"
								className="p-4 relative flex flex-col items-center gap-4 duration-700 group md:gap-8 md:py-24  lg:pb-48  md:p-16"
							>
								<span
									className="absolute w-px h-2/3 bg-gradient-to-b from-zinc-300 dark:from-zinc-700 via-zinc-300/50 dark:via-zinc-700/50 to-transparent"
									aria-hidden="true"
								/>
								<span
									className="relative z-10 flex items-center justify-center w-12 h-12 text-sm duration-1000 border rounded-full text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 group-hover:border-zinc-200 dark:group-hover:border-zinc-600"
									aria-hidden="true"
								>
									{s.icon}
								</span>{" "}
								<div className="z-10 flex flex-col items-center">
									<span className="lg:text-xl font-medium duration-150 xl:text-3xl text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white font-display">
										{s.label}
									</span>
								</div>
							</Link>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
