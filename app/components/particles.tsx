"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

type ParticlesProps = {
	className?: string;
	quantity?: number;
	staticity?: number;
	ease?: number;
};

type RGB = { r: number; g: number; b: number };

type Sprite = {
	image: HTMLCanvasElement;
	// Offset of the glyph's center/middle anchor within `image`, and the
	// image's size, all in CSS px.
	anchorX: number;
	anchorY: number;
	width: number;
	height: number;
};

type Particle = {
	x: number;
	y: number;
	translateX: number;
	translateY: number;
	size: number;
	alpha: number;
	targetAlpha: number;
	dx: number;
	dy: number;
	magnetism: number;
	symbol: "{" | "}";
	sprite: Sprite;
};

type CanvasMetrics = {
	width: number;
	height: number;
	dpr: number;
	maxParticleSize: number;
};

const SYMBOLS: Particle["symbol"][] = ["{", "}"];

// Weighted 2:3 so blue shows up slightly more often than amber/yellow. Used
// in both themes — only the alpha range (below) differs by theme.
const PALETTE: RGB[] = [
	{ r: 255, g: 224, b: 0 },
	{ r: 255, g: 224, b: 0 },
	{ r: 0, g: 143, b: 255 },
	{ r: 0, g: 143, b: 255 },
	{ r: 0, g: 143, b: 255 },
];

const LIGHT_ALPHA_RANGE: [min: number, max: number] = [0.18, 0.65];
const DARK_ALPHA_RANGE: [min: number, max: number] = [0.35, 0.9];

const MIN_PARTICLE_SIZE = 20;
const PARTICLE_SIZE_DIVISOR = 5; // maxParticleSize = canvas width / this
const MAX_PARTICLE_SIZE_FLOOR = 60;
const MAX_PARTICLE_SIZE_CEIL = 220;

const EDGE_FADE_X = 20; // px from the left/right edge where particles fade out
const EDGE_FADE_Y = 50; // px from the top/bottom edge where particles fade out
const ALPHA_RAMP_STEP = 0.02; // fade-in speed once clear of edges, per frame at TARGET_FRAME_MS
const DRIFT_SPEED = 0.2; // max px of ambient x/y drift, per frame at TARGET_FRAME_MS
const MAGNETISM_MIN = 0.1;
const MAGNETISM_MAX = 4.1;
// All of the per-frame deltas above were tuned for a steady 60fps. Actual
// frame timing jitters (more visibly so for slow-moving particles, where a
// fixed delta is a large relative change), so `step` scales every delta by
// how much time really elapsed instead of assuming a fixed frame length.
const TARGET_FRAME_MS = 1000 / 60;
const MAX_TIME_SCALE = 5; // caps the catch-up jump after e.g. a backgrounded tab resumes
const SPRITE_PADDING = 2; // device px of empty margin so anti-aliased edges aren't clipped

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
	const query = window.matchMedia(REDUCED_MOTION_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

function getReducedMotion(): boolean {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotion(): boolean {
	return false;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function randomBetween(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function pick<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

// 0 within the fade band along the canvas edges, ramping up to 1 once clear.
function computeEdgeFade(
	particle: Particle,
	width: number,
	height: number,
): number {
	const distanceToEdge = Math.min(
		particle.x + particle.translateX - EDGE_FADE_X,
		width - particle.x - particle.translateX - EDGE_FADE_X,
		particle.y + particle.translateY - EDGE_FADE_Y,
		height - particle.y - particle.translateY - EDGE_FADE_Y,
	);
	return clamp(distanceToEdge / EDGE_FADE_X, 0, 1);
}

function computeTargetAlpha(
	size: number,
	maxParticleSize: number,
	isDark: boolean,
): number {
	const [alphaMin, alphaMax] = isDark ? DARK_ALPHA_RANGE : LIGHT_ALPHA_RANGE;
	// Bigger glyphs read as further back, so fade them toward the low end.
	const sizeFactor = clamp(
		(size - MIN_PARTICLE_SIZE) / (maxParticleSize - MIN_PARTICLE_SIZE),
		0,
		1,
	);
	return randomBetween(alphaMin, alphaMax) * (1 - sizeFactor * 0.5);
}

// Canvas fillText snaps glyphs to the device pixel grid (whole pixels
// vertically in Chromium, unless the glyph is very large), so a slow particle
// drifting a fraction of a pixel per frame would sit still for many frames and
// then jump a full pixel. drawImage resamples at the exact sub-pixel position,
// so each particle's glyph is rasterized once here and moved with drawImage.
function createSprite(
	symbol: Particle["symbol"],
	size: number,
	color: RGB,
	dpr: number,
): Sprite {
	const image = document.createElement("canvas");
	const ctx = image.getContext("2d");
	const font = `${size * dpr}px sans-serif`;
	if (!ctx) return { image, anchorX: 0, anchorY: 0, width: 0, height: 0 };

	ctx.font = font;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const bounds = ctx.measureText(symbol);
	const anchorX = Math.ceil(bounds.actualBoundingBoxLeft) + SPRITE_PADDING;
	const anchorY = Math.ceil(bounds.actualBoundingBoxAscent) + SPRITE_PADDING;
	image.width =
		anchorX + Math.ceil(bounds.actualBoundingBoxRight) + SPRITE_PADDING;
	image.height =
		anchorY + Math.ceil(bounds.actualBoundingBoxDescent) + SPRITE_PADDING;

	// Resizing the canvas above reset the context state.
	ctx.font = font;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
	ctx.fillText(symbol, anchorX, anchorY);

	return {
		image,
		anchorX: anchorX / dpr,
		anchorY: anchorY / dpr,
		width: image.width / dpr,
		height: image.height / dpr,
	};
}

export default function Particles({
	className = "",
	quantity = 50,
	staticity = 20,
	ease = 55,
}: ParticlesProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const metricsRef = useRef<CanvasMetrics>({
		width: 0,
		height: 0,
		dpr: 1,
		maxParticleSize: MAX_PARTICLE_SIZE_FLOOR,
	});
	const mouseRef = useRef({ x: 0, y: 0 });
	const frameRef = useRef<number | null>(null);
	const lastTimestampRef = useRef<number | null>(null);

	const reducedMotion = useSyncExternalStore(
		subscribeToReducedMotion,
		getReducedMotion,
		getServerReducedMotion,
	);
	const { resolvedTheme } = useTheme();
	// createParticle/step are memoized once and keep running inside a single
	// long-lived requestAnimationFrame loop, so they can't see new render's
	// `resolvedTheme` via closure — this ref is how they read the live value.
	const themeRef = useRef(resolvedTheme);

	const createParticle = useCallback((): Particle => {
		const { width, height, dpr, maxParticleSize } = metricsRef.current;
		const isDark = themeRef.current === "dark";
		const size = randomBetween(MIN_PARTICLE_SIZE, maxParticleSize);
		const symbol = pick(SYMBOLS);

		return {
			x: Math.floor(Math.random() * width),
			y: Math.floor(Math.random() * height),
			translateX: 0,
			translateY: 0,
			size,
			alpha: 0,
			targetAlpha: computeTargetAlpha(size, maxParticleSize, isDark),
			dx: randomBetween(-DRIFT_SPEED, DRIFT_SPEED),
			dy: randomBetween(-DRIFT_SPEED, DRIFT_SPEED),
			magnetism: randomBetween(MAGNETISM_MIN, MAGNETISM_MAX),
			symbol,
			sprite: createSprite(symbol, size, pick(PALETTE), dpr),
		};
	}, []);

	const drawParticle = useCallback((particle: Particle) => {
		const ctx = contextRef.current;
		if (!ctx) return;
		const { image, anchorX, anchorY, width, height } = particle.sprite;
		ctx.globalAlpha = particle.alpha;
		ctx.drawImage(
			image,
			particle.x + particle.translateX - anchorX,
			particle.y + particle.translateY - anchorY,
			width,
			height,
		);
	}, []);

	const clearCanvas = useCallback(() => {
		const { width, height } = metricsRef.current;
		contextRef.current?.clearRect(0, 0, width, height);
	}, []);

	const resize = useCallback(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const { offsetWidth: width, offsetHeight: height } = container;
		const maxParticleSize = clamp(
			width / PARTICLE_SIZE_DIVISOR,
			MAX_PARTICLE_SIZE_FLOOR,
			MAX_PARTICLE_SIZE_CEIL,
		);
		metricsRef.current = { width, height, dpr, maxParticleSize };

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		contextRef.current?.scale(dpr, dpr);

		particlesRef.current = Array.from({ length: quantity }, createParticle);
	}, [quantity, createParticle]);

	const step = useCallback(
		(timestamp: number) => {
			const lastTimestamp = lastTimestampRef.current;
			const deltaMs =
				lastTimestamp === null ? TARGET_FRAME_MS : timestamp - lastTimestamp;
			lastTimestampRef.current = timestamp;
			// Normalizes every delta below against real elapsed time instead of
			// assuming each call is exactly one 60fps frame apart.
			const timeScale = clamp(deltaMs / TARGET_FRAME_MS, 0, MAX_TIME_SCALE);

			clearCanvas();
			const { width, height } = metricsRef.current;

			particlesRef.current = particlesRef.current.map((particle) => {
				const edgeFade = computeEdgeFade(particle, width, height);
				// Ramps towards the (edge-faded) target from either side, near
				// the edges too: a theme switch re-rolls every targetAlpha, and
				// assigning `targetAlpha * edgeFade` directly there made glyphs
				// in the edge band visibly pop by up to ~0.4 alpha in one frame.
				const maxStep = ALPHA_RAMP_STEP * timeScale;
				const alpha =
					particle.alpha +
					clamp(
						particle.targetAlpha * edgeFade - particle.alpha,
						-maxStep,
						maxStep,
					);

				const nextX = particle.x + particle.dx * timeScale;
				const nextY = particle.y + particle.dy * timeScale;
				const translateX =
					particle.translateX +
					((mouseRef.current.x / (staticity / particle.magnetism) -
						particle.translateX) /
						ease) *
						timeScale;
				const translateY =
					particle.translateY +
					((mouseRef.current.y / (staticity / particle.magnetism) -
						particle.translateY) /
						ease) *
						timeScale;

				const outOfBounds =
					nextX < -particle.size ||
					nextX > width + particle.size ||
					nextY < -particle.size ||
					nextY > height + particle.size;

				const next = outOfBounds
					? createParticle()
					: { ...particle, x: nextX, y: nextY, translateX, translateY, alpha };

				drawParticle(next);
				return next;
			});

			frameRef.current = requestAnimationFrame(step);
		},
		[staticity, ease, clearCanvas, createParticle, drawParticle],
	);

	// Reduced-motion fallback: a single still frame with every particle at its
	// resting alpha, in place of the loop (no drift, fade-in, or parallax).
	const drawStill = useCallback(() => {
		clearCanvas();
		const { width, height } = metricsRef.current;
		for (const particle of particlesRef.current) {
			particle.alpha =
				particle.targetAlpha * computeEdgeFade(particle, width, height);
			drawParticle(particle);
		}
	}, [clearCanvas, drawParticle]);

	useEffect(() => {
		contextRef.current = canvasRef.current?.getContext("2d") ?? null;
		const handleResize = reducedMotion
			? () => {
					resize();
					drawStill();
				}
			: resize;
		handleResize();
		if (!reducedMotion) {
			// So a loop restarted after reduced motion is switched back off
			// doesn't treat the whole pause as a single frame's elapsed time.
			lastTimestampRef.current = null;
			frameRef.current = requestAnimationFrame(step);
		}
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, [reducedMotion, resize, step, drawStill]);

	useEffect(() => {
		// Written straight to a ref rather than React state: only the rAF loop
		// reads it, so re-rendering on every mousemove would be wasted work.
		const handleMouseMove = (event: MouseEvent) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const { width, height } = metricsRef.current;
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left - width / 2;
			const y = event.clientY - rect.top - height / 2;
			if (Math.abs(x) < width / 2 && Math.abs(y) < height / 2) {
				mouseRef.current = { x, y };
			}
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	useEffect(() => {
		themeRef.current = resolvedTheme;
		const isDark = resolvedTheme === "dark";
		const { maxParticleSize } = metricsRef.current;
		for (const particle of particlesRef.current) {
			particle.targetAlpha = computeTargetAlpha(
				particle.size,
				maxParticleSize,
				isDark,
			);
		}
		if (reducedMotion) drawStill();
	}, [resolvedTheme, reducedMotion, drawStill]);

	return (
		<div className={className} ref={containerRef} aria-hidden="true">
			<canvas ref={canvasRef} />
		</div>
	);
}
