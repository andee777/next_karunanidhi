"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Props = {
	className?: string;
};

export function ThemeToggle({ className = "" }: Props) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Same box as the button below (its classes + a 20px icon), so nothing
		// shifts when it swaps in after mount.
		return (
			<div className={className} aria-hidden="true">
				<div className="w-5 h-5" />
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
			aria-label="Toggle theme"
			className={className}
		>
			{resolvedTheme === "dark" ? (
				<Sun className="w-5 h-5" />
			) : (
				<Moon className="w-5 h-5" />
			)}
		</button>
	);
}
