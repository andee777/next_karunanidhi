"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export const Navigation: React.FC = () => {
	const ref = useRef<HTMLElement>(null);
	const [isIntersecting, setIntersecting] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry.isIntersecting),
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<header ref={ref}>
			<div
				className={`fixed inset-x-0 top-0 z-50 backdrop-blur  duration-200 border-b  ${
					isIntersecting
						? "bg-zinc-900/0 border-transparent"
						: "bg-zinc-900/500  border-zinc-800 "
				}`}
			>
				<div className="container flex flex-row-reverse items-center justify-between p-6 mx-auto">
					<div className="flex items-center justify-between gap-8">
						<Link
							href="/projects"
							className="duration-200 text-zinc-600 hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200"
						>
							Projects
						</Link>
						<Link
							href="/contact"
							className="duration-200 text-zinc-600 hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200"
						>
							Contact
						</Link>
						<ThemeToggle className="duration-200 text-zinc-600 hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200" />
					</div>

					<Link
						href="/"
						className="duration-200 text-zinc-600 hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						<ArrowLeft className="w-6 h-6 " />
					</Link>
				</div>
			</div>
		</header>
	);
};
