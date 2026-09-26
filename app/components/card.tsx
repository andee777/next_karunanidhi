"use client";
import { motion, useMotionTemplate, useSpring } from "framer-motion";

import type { PropsWithChildren } from "react";

export const Card: React.FC<PropsWithChildren> = ({ children }) => {
	const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
	const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

	function onMouseMove({
		currentTarget,
		clientX,
		clientY,
	}: React.MouseEvent<HTMLDivElement>) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}
	const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
	const style = { maskImage, WebkitMaskImage: maskImage };

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracking gradient wrapper, not an interactive control
		<div
			onMouseMove={onMouseMove}
			className="overflow-hidden relative duration-700 border rounded-xl hover:bg-zinc-400/10 dark:hover:bg-zinc-100/10 group md:gap-8 hover:border-zinc-500/10 border-zinc-300 dark:border-zinc-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900 dark:has-[:focus-visible]:ring-zinc-100"
		>
			<div className="pointer-events-none" aria-hidden="true">
				<motion.div
					className="absolute inset-0 z-10  bg-gradient-to-br opacity-100  via-zinc-100/10  transition duration-1000 group-hover:opacity-50 "
					style={style}
				/>
			</div>

			{children}
		</div>
	);
};
