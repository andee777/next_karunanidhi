"use client";
import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { navPill, navPillActive, navPillIdle } from "./nav-styles";
import { ThemeToggle } from "./theme-toggle";

const links = [
	{ name: "Home", href: "/" },
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string): boolean {
	// "/" would prefix-match every route, so it only counts as an exact match.
	return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export const Navigation: React.FC = () => {
	const ref = useRef<HTMLElement>(null);
	const [isIntersecting, setIntersecting] = useState(true);
	const pathname = usePathname();

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
						: "bg-zinc-50/50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800"
				}`}
			>
				<div className="container flex items-center justify-end px-4 py-4 mx-auto sm:px-6">
					<nav aria-label="Main">
						<ul className="flex items-center gap-0.5 text-sm sm:gap-1 sm:text-base">
							{links.map((link) => {
								const active = isActive(pathname, link.href);
								return (
									<li key={link.href}>
										<Link
											href={link.href}
											aria-current={active ? "page" : undefined}
											className={`block px-2.5 py-1.5 sm:px-3 ${navPill} ${
												active ? navPillActive : navPillIdle
											}`}
										>
											{link.name}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
					<div className="flex items-center gap-0.5 ml-1 sm:gap-1 sm:ml-2">
						<Link
							href="https://github.com/andee777"
							target="_blank"
							aria-label="GitHub profile"
							className={`p-2 ${navPill} ${navPillIdle}`}
						>
							<SiGithub
								className="w-5 h-5"
								color="currentColor"
								aria-hidden="true"
							/>
						</Link>
						<ThemeToggle className={`p-2 ${navPill} ${navPillIdle}`} />
					</div>
				</div>
			</div>
		</header>
	);
};
