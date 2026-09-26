"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { navPill } from "./nav-styles";
import Particles from "./particles";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const navigation = [
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

const LIGHT_HEADING_CLASSES = "text-black bg-white";
const DARK_HEADING_CLASSES = "text-white bg-zinc-900";
const HEADING_SHARED_CLASSES =
	"py-3.5 px-0.5 text-3xl cursor-default text-edge-outline-dark font-display sm:text-5xl md:text-6xl whitespace-nowrap bg-clip-text mb-16";

const LIGHT_NAV_TEXT_CLASS = "text-zinc-700";
const DARK_NAV_TEXT_CLASS = "text-zinc-300";

const IDLE_CLIP_PATH =
	"[clip-path:polygon(100%_0%,100%_0%,100%_0%,100%_0%,100%_0%)]";

// Clicking the toggle plays a diagonal wipe (see the theme-wipe keyframes in
// global.css) that grows from this button's top-right corner down to the
// bottom-left, at a constant angle the whole way — no hinge/pivot on any
// corner. The actual theme only flips once the wipe fully covers the screen
// (handleAnimationEnd), so the instant re-color of every element happens
// hidden behind it. A second overlay duplicates the nav text and heading in
// the destination theme's colors and is revealed by the exact same
// clip-path, so nothing pops to its new color before the wipe reaches it —
// and, since it's a full-screen overlay, nothing is left uncovered to flash
// when the wipe finally hands off to the real (now up to date) page.
export function HomeHero() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	// The toggle's own icon/color update the instant it's clicked, tracked
	// separately from `resolvedTheme` — which only actually changes once the
	// wipe finishes covering the screen (see handleAnimationEnd) — so the
	// button gives immediate feedback instead of waiting out the animation.
	const [iconTheme, setIconTheme] = useState<"light" | "dark">();
	// Locks the button out for the length of the wipe: retriggering mid-wipe
	// recomputed `next` from the still-stale `resolvedTheme`, so a second
	// click just restarted the same animation instead of reversing it — and
	// interrupting one wipe's animation-end never let its pending setTheme
	// run, leaving the two overlays and the real page free to disagree.
	const [isToggling, setIsToggling] = useState(false);
	const isTogglingRef = useRef(false);
	const bgOverlayRef = useRef<HTMLDivElement>(null);
	const overlayWrapperRef = useRef<HTMLDivElement>(null);
	const navDuplicateRef = useRef<HTMLElement>(null);
	const headingTextRef = useRef<HTMLDivElement>(null);
	const pendingThemeRef = useRef<"light" | "dark" | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (resolvedTheme === "light" || resolvedTheme === "dark") {
			setIconTheme(resolvedTheme);
		}
	}, [resolvedTheme]);

	function handleToggle() {
		if (isTogglingRef.current) return;

		const next = resolvedTheme === "dark" ? "light" : "dark";
		setIconTheme(next);
		const bg = bgOverlayRef.current;
		const overlayWrapper = overlayWrapperRef.current;
		const navDuplicate = navDuplicateRef.current;
		const headingText = headingTextRef.current;
		if (
			!bg ||
			!overlayWrapper ||
			!navDuplicate ||
			!headingText ||
			window.matchMedia(REDUCED_MOTION_QUERY).matches
		) {
			setTheme(next);
			return;
		}

		isTogglingRef.current = true;
		setIsToggling(true);
		pendingThemeRef.current = next;
		bg.dataset.theme = next;
		navDuplicate.className =
			next === "dark" ? DARK_NAV_TEXT_CLASS : LIGHT_NAV_TEXT_CLASS;
		headingText.className = `${HEADING_SHARED_CLASSES} ${
			next === "dark" ? DARK_HEADING_CLASSES : LIGHT_HEADING_CLASSES
		}`;

		for (const el of [bg, overlayWrapper]) {
			el.classList.remove("theme-wipe-run");
		}
		// Forces a reflow so re-adding the class restarts the animation if the
		// button is clicked again before the previous wipe finishes.
		void bg.offsetWidth;
		for (const el of [bg, overlayWrapper]) {
			el.classList.add("theme-wipe-run");
		}
	}

	function handleAnimationEnd() {
		// flushSync forces the real page's colors to actually finish updating
		// before the wipe overlays are removed below — otherwise React's
		// re-render can land a frame late, and the old theme flashes back for
		// an instant where the (by-then-collapsed) overlays used to be.
		if (pendingThemeRef.current) {
			const next = pendingThemeRef.current;
			pendingThemeRef.current = null;
			flushSync(() => setTheme(next));
		}
		// Belt-and-suspenders on top of flushSync: wait one more real paint
		// (rAF fires just before the browser's next repaint) before revealing
		// what's behind the overlays, so the updated theme is guaranteed to
		// have actually been painted — not just committed — while still
		// hidden, however the update above ends up scheduled internally.
		requestAnimationFrame(() => {
			bgOverlayRef.current?.classList.remove("theme-wipe-run");
			overlayWrapperRef.current?.classList.remove("theme-wipe-run");
			isTogglingRef.current = false;
			setIsToggling(false);
		});
	}

	// Built from navPill's pieces rather than the shared constant itself: its
	// dark: hover/focus colors only apply once the real .dark class flips (at
	// the end of the wipe), but this button's own feedback should be
	// instant, so those pieces are keyed off `iconTheme` instead.
	const toggleClassName = `absolute top-4 right-4 z-30 p-2 rounded-full duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${
		iconTheme === "dark"
			? "text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 focus-visible:outline-zinc-100"
			: "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/70 focus-visible:outline-zinc-900"
	}`;

	return (
		<div
			id="home"
			className="relative isolate flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-zinc-50 dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-zinc-800),var(--color-zinc-950))]"
		>
			{/* Background color wipe, kept below the particles so the bracket
			    glyphs stay visible on top while the theme's color sweeps past. */}
			<div
				ref={bgOverlayRef}
				aria-hidden="true"
				onAnimationEnd={handleAnimationEnd}
				className={`absolute inset-0 z-0 pointer-events-none ${IDLE_CLIP_PATH} data-[theme=dark]:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-zinc-800),var(--color-zinc-950))] data-[theme=light]:bg-zinc-50`}
			/>

			{mounted ? (
				<button
					type="button"
					onClick={handleToggle}
					disabled={isToggling}
					aria-label="Toggle theme"
					className={toggleClassName}
				>
					{iconTheme === "dark" ? (
						<Sun className="w-5 h-5" />
					) : (
						<Moon className="w-5 h-5" />
					)}
				</button>
			) : (
				// Same box as the button above (its classes + a 20px icon), so
				// nothing shifts when it swaps in after mount.
				<div className={toggleClassName} aria-hidden="true">
					<div className="w-5 h-5" />
				</div>
			)}

			<nav className="relative z-20 mt-0 mb-6 text-lg">
				<ul className="flex items-center justify-center gap-2 w-[420px]">
					{navigation.map((item) => (
						<li key={item.href}>
							<Link
								href={item.href}
								className={`block px-4 py-1.5 font-bold ${navPill} text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50`}
							>
								{item.name}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<Particles className="absolute inset-0 z-10" quantity={50} />

			<h1
				className={`relative z-20 ${HEADING_SHARED_CLASSES} text-black bg-white dark:text-white dark:bg-zinc-900`}
			>
				karunanidhi.dev
			</h1>

			{/* Exact duplicate of the nav+heading layout, colored for the
			    destination theme and revealed by the same clip-path as the
			    background wipe, so nothing here is left to snap into its new
			    color once the wipe finishes and this overlay disappears. */}
			<div
				ref={overlayWrapperRef}
				aria-hidden="true"
				className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none ${IDLE_CLIP_PATH}`}
			>
				<nav
					ref={navDuplicateRef}
					className={`${LIGHT_NAV_TEXT_CLASS} mt-0 mb-6 text-lg`}
				>
					<ul className="flex items-center justify-center gap-2 w-[420px]">
						{navigation.map((item) => (
							<li key={item.href}>
								<span className="block px-4 py-1.5 font-bold">{item.name}</span>
							</li>
						))}
					</ul>
				</nav>
				<div
					ref={headingTextRef}
					className={`${HEADING_SHARED_CLASSES} text-black bg-white`}
				>
					karunanidhi.dev
				</div>
			</div>
		</div>
	);
}
