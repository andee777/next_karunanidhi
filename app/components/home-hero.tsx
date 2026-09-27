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

const HEADING_SHARED_CLASSES =
	"py-3.5 px-0.5 text-3xl cursor-default text-edge-outline-dark font-display sm:text-5xl md:text-6xl whitespace-nowrap bg-clip-text mb-16";

// Clicking the toggle uses the View Transitions API (see the ::view-transition
// rules in global.css) to play a diagonal wipe that grows from this button's
// top-right corner down to the bottom-left. Unlike a hand-rolled overlay, the
// browser itself snapshots the old page, applies the DOM update, snapshots
// the new page, and only swaps them in atomically — there's no window where
// application code has to guess whether the real page has "caught up" yet,
// which a from-scratch clip-path-overlay version (tried first) kept
// occasionally losing by a frame. Falls back to an instant switch when the
// API or reduced-motion rules it out.
//
// Known limitation: under rapid repeated toggling, Chromium can still
// occasionally flash one stray frame of the previous theme after the new one
// has settled — confirmed by frame-by-frame video review in both directions,
// with the toggle's own icon (driven by separate React state) staying put
// throughout, meaning the flash isn't from our own click handler re-firing.
// This matches a real, currently-open browser bug: starting a new view
// transition is supposed to let the previous one finish its cancellation
// before the new one starts capturing, but Chrome doesn't reliably enforce
// that ordering (https://issues.chromium.org/issues/477200524; see also the
// related Firefox crash report at
// https://bugzilla.mozilla.org/show_bug.cgi?id=1959116). The mitigations
// below (an explicit skip of any transition our own lock somehow missed,
// plus a generous cooldown before allowing another one) reduce how often a
// click lands in the vulnerable window, but can't guarantee it never will —
// that part is out of our hands until the browser fixes it.
export function HomeHero() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	// The toggle's own icon/color update the instant it's clicked, tracked
	// separately from `resolvedTheme` — which only actually changes once the
	// transition's DOM-update callback runs — so the button gives immediate
	// feedback instead of waiting out the animation.
	const [iconTheme, setIconTheme] = useState<"light" | "dark">();
	// Locks the button out for the length of the transition: retriggering
	// mid-transition would recompute `next` from the still-stale
	// `resolvedTheme` and start a second, overlapping transition.
	const [isToggling, setIsToggling] = useState(false);
	const isTogglingRef = useRef(false);
	// Defense in depth for the Chromium bug linked above: if handleToggle is
	// ever reached while a transition is still active despite the lock, skip
	// it explicitly (and wait for its own cancellation) instead of letting a
	// second startViewTransition call race it implicitly.
	const activeTransitionRef = useRef<ReturnType<
		typeof document.startViewTransition
	> | null>(null);

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

		if (
			typeof document.startViewTransition !== "function" ||
			window.matchMedia(REDUCED_MOTION_QUERY).matches
		) {
			setTheme(next);
			return;
		}

		isTogglingRef.current = true;
		setIsToggling(true);

		// Should be unreachable (isTogglingRef already gates this), but if a
		// transition is somehow still marked active, skip it and let its own
		// cancellation run to completion before starting a new one, rather than
		// relying on Chrome's own implicit skip-and-restart handling — which is
		// exactly what issue 477200524 says doesn't reliably order correctly.
		activeTransitionRef.current?.skipTransition();

		const transition = document.startViewTransition(() => {
			flushSync(() => setTheme(next));
		});
		activeTransitionRef.current = transition;

		transition.finished.finally(() => {
			if (activeTransitionRef.current === transition) {
				activeTransitionRef.current = null;
			}
			// `finished` resolving means the transition's animations are done,
			// but per the Chromium bug linked above, the browser's own internal
			// cancellation/cleanup bookkeeping isn't guaranteed to be finished
			// yet — starting a new transition inside that trailing window is
			// what has produced the stray-frame flash on video. A generous
			// wall-clock margin (not requestAnimationFrame: that's scheduled by
			// the rendering/compositor pipeline, which is under extra load from
			// whatever's recording the screen to catch this bug in the first
			// place, making it the wrong clock to depend on here) gives that
			// cleanup more room to finish before a rapid next click is let
			// through — reduces how often the window gets hit, but since this
			// is a browser-side race rather than one in this code, it can't be
			// guaranteed to close it entirely.
			setTimeout(() => {
				isTogglingRef.current = false;
				setIsToggling(false);
			}, 400);
		});
	}

	// Built from navPill's pieces rather than the shared constant itself: its
	// dark: hover/focus colors only apply once the real .dark class flips (at
	// the end of the transition), but this button's own feedback should be
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
		</div>
	);
}
