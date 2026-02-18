"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
	title: string;
	description: string;
	category: "work" | "project";
	tags: string[];
	github?: string;
	live?: string;
	image?: string;
	gradient?: string;
}

interface TiltedCardProps {
	project: Project;
	/** CSS size string, e.g. "clamp(180px, 18vw, 280px)" */
	size: string;
	/** Ref callback so the parent can stagger-animate entrance */
	cardRef?: (el: HTMLElement | null) => void;
	/** Max tilt rotation in degrees */
	rotateAmplitude?: number;
	/** Scale factor on hover */
	scaleOnHover?: number;
	/** Show cursor-following tooltip with title */
	showTooltip?: boolean;
}

// ---------------------------------------------------------------------------
// Spring configs
// ---------------------------------------------------------------------------

const TILT_SPRING = { damping: 30, stiffness: 100, mass: 2 };
const CAPTION_SPRING = { stiffness: 350, damping: 30, mass: 1 };

// ---------------------------------------------------------------------------
// Font tokens (matching the rest of the portfolio)
// ---------------------------------------------------------------------------

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TiltedCard({
	project,
	size,
	cardRef,
	rotateAmplitude = 12,
	scaleOnHover = 1.05,
	showTooltip = true,
}: TiltedCardProps) {
	const ref = useRef<HTMLElement>(null);

	// Motion values for 3D tilt
	const cursorX = useMotionValue(0);
	const cursorY = useMotionValue(0);
	const rotateX = useSpring(useMotionValue(0), TILT_SPRING);
	const rotateY = useSpring(useMotionValue(0), TILT_SPRING);
	const scale = useSpring(1, TILT_SPRING);
	const tooltipOpacity = useSpring(0);
	const captionRotate = useSpring(0, CAPTION_SPRING);

	const lastYRef = useRef(0);

	function handlePointerMove(e: React.PointerEvent) {
		const el = ref.current;
		if (!el) {
			return;
		}

		const rect = el.getBoundingClientRect();
		const offsetX = e.clientX - rect.left - rect.width / 2;
		const offsetY = e.clientY - rect.top - rect.height / 2;

		rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
		rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);

		cursorX.set(e.clientX - rect.left);
		cursorY.set(e.clientY - rect.top);

		const velocityY = offsetY - lastYRef.current;
		captionRotate.set(-velocityY * 0.6);
		lastYRef.current = offsetY;
	}

	function handlePointerEnter() {
		scale.set(scaleOnHover);
		tooltipOpacity.set(1);
	}

	function handlePointerLeave() {
		tooltipOpacity.set(0);
		scale.set(1);
		rotateX.set(0);
		rotateY.set(0);
		captionRotate.set(0);
	}

	// Fallback gradient if no image
	const gradient =
		project.gradient ??
		"linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)";

	const backgroundStyle = project.image
		? {
				backgroundImage: `url(${project.image})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}
		: { background: gradient };

	return (
		<div
			className="group tilted-card-figure perspective-[800px] relative flex flex-col items-center justify-center"
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			onPointerMove={handlePointerMove}
			ref={(el) => {
				(ref as React.MutableRefObject<HTMLElement | null>).current = el;
				cardRef?.(el);
			}}
			style={{
				height: size,
				width: size,
			}}
		>
			<motion.div
				className="tilted-card-inner preserve-3d relative overflow-hidden rounded-lg"
				style={{
					width: size,
					height: size,
					rotateX,
					rotateY,
					scale,
				}}
			>
				{/* Gradient placeholder (or background-image when real image exists) */}
				<div
					className="tilted-card-gradient translate-z-0 absolute inset-0 flex items-end justify-start rounded-lg p-4 transition-transform duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-[-35%]"
					style={backgroundStyle}
				>
					<span
						className="tilted-card-gradient-title font-semibold text-[clamp(0.75rem,1.2vw,0.95rem)] text-white/90 leading-tight tracking-tight"
						style={{ fontFamily: FONT_MONO }}
					>
						{project.title}
					</span>
				</div>

				{/* Info panel — slides in from right on hover */}
				<InfoPanel project={project} />
			</motion.div>

			{/* Cursor-following tooltip */}
			{showTooltip && (
				<motion.div
					className="tilted-card-caption pointer-events-none absolute top-0 left-0 z-30 rounded bg-white px-2.5 py-1 text-[10px] text-neutral-800 opacity-0"
					style={{
						x: cursorX,
						y: cursorY,
						opacity: tooltipOpacity,
						rotate: captionRotate,
						fontFamily: FONT_MONO,
					}}
				>
					{project.title}
				</motion.div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// InfoPanel — white panel with project details, slides in on hover
// ---------------------------------------------------------------------------

function InfoPanel({ project }: { project: Project }) {
	return (
		<div
			className="tilted-card-info-panel pointer-events-none absolute top-0 right-0 z-40 flex h-full w-[60%] translate-x-full flex-col justify-between rounded-r-lg bg-white p-[clamp(0.6rem,1.5vw,1rem)] opacity-0 transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100"
			style={{ fontFamily: FONT_MONO }}
		>
			<div>
				<span
					className="tilted-card-info-category mb-0.5 block text-[0.5rem] text-black/35 uppercase italic tracking-widest"
					style={{ fontFamily: FONT_ACCENT }}
				>
					{project.category}
				</span>
				<h3 className="tilted-card-info-title mb-0.5 font-bold text-[clamp(0.65rem,1.1vw,0.85rem)] text-black leading-tight tracking-tight">
					{project.title}
				</h3>
				<p className="tilted-card-info-description m-0 text-[clamp(0.48rem,0.8vw,0.6rem)] text-black/55 leading-relaxed">
					{project.description}
				</p>
			</div>

			<div>
				<div className="tilted-card-info-tags mb-1 flex flex-wrap gap-0.5">
					{project.tags.map((tag) => (
						<span
							className="tilted-card-info-tag border border-black/12 px-0.5 py-0.5 text-[0.42rem] text-black/40 tracking-wide"
							key={tag}
						>
							{tag}
						</span>
					))}
				</div>

				<div className="tilted-card-info-links flex items-center gap-2">
					{project.github && (
						<a
							className="tilted-card-info-link font-medium text-[0.52rem] text-black/60 underline decoration-black/20 underline-offset-2 transition-all duration-200 hover:translate-x-0.5 hover:text-black/85"
							href={project.github}
							rel="noopener noreferrer"
							target="_blank"
						>
							github
						</a>
					)}
					{project.live && (
						<a
							className="tilted-card-info-link font-medium text-[0.52rem] text-black/60 underline decoration-black/20 underline-offset-2 transition-all duration-200 hover:translate-x-0.5 hover:text-black/85"
							href={project.live}
							rel="noopener noreferrer"
							target="_blank"
						>
							live demo
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
