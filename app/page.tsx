import type { Metadata } from "next";
import Link from "next/link";
import { defaultOpenGraphImages, openGraphDefaults } from "@/lib/metadata";
import Particles from "./components/particles";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
	openGraph: {
		...openGraphDefaults,
		images: defaultOpenGraphImages,
		title: "karunanidhi.dev",
		description: "Founder of karunatech.ca",
		url: "/",
	},
};

const navigation = [
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

export default function Home() {
	return (
		<div className="relative isolate flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
			<ThemeToggle className="absolute top-6 right-6 z-20 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50" />
			<nav className="mt-0 mb-6 text-lg ">
				<ul className="flex items-center justify-center gap-8 w-[420px]">
					{navigation.map((item) => (
						<li key={item.href}>
							<Link
								href={item.href}
								className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 font-bold"
							>
								{item.name}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<Particles className="absolute inset-0 -z-10 " quantity={50} />
			<h1 className="py-3.5 px-0.5 z-10 text-3xl text-black bg-white dark:text-white dark:bg-zinc-900 cursor-default text-edge-outline-dark font-display sm:text-5xl md:text-6xl whitespace-nowrap bg-clip-text mb-16">
				karunanidhi.dev
			</h1>
		</div>
	);
}
