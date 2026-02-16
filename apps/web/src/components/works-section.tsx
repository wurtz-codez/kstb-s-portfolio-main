"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLoader } from "@/contexts/loader-context";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface Project {
	title: string;
	description: string;
	category: "work" | "project";
	tags: string[];
	github?: string;
	live?: string;
	image?: string;
}

const PROJECTS: Project[] = [
	{
		title: "Project One",
		description: "A brief description of the work done.",
		category: "work",
		tags: ["React", "TypeScript", "Node.js"],
		live: "#",
	},
	{
		title: "Project Two",
		description: "Another project with different tech.",
		category: "work",
		tags: ["Next.js", "PostgreSQL"],
		github: "#",
		live: "#",
	},
	{
		title: "Project Three",
		description: "Freelance work for a client.",
		category: "work",
		tags: ["Swift", "iOS"],
		github: "#",
	},
	{
		title: "Project Four",
		description: "A personal side project.",
		category: "project",
		tags: ["Python", "ML"],
		github: "#",
		live: "#",
	},
	{
		title: "Project Five",
		description: "Open source contribution.",
		category: "project",
		tags: ["Rust", "CLI"],
		github: "#",
	},
];

// ---------------------------------------------------------------------------
// Style Constants
// ---------------------------------------------------------------------------

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";
const COLOR_DIVIDER = "rgba(255, 255, 255, 0.1)";

const COLOR_NOTE_BG = "#1a1a1a";
const COLOR_NOTE_BORDER = "rgba(255, 255, 255, 0.08)";
const COLOR_NOTE_CONTENT_BG = "#111111";
const COLOR_FLAP = "#2a2a2a";
const COLOR_FLAP_UNDERSIDE = "#0d0d0d";

// ---------------------------------------------------------------------------
// Layout: positions and rotations for the 5 sticky notes
// ---------------------------------------------------------------------------

interface NotePosition {
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
	rotation: number;
	transformExtra?: string;
}

const NOTE_POSITIONS: NotePosition[] = [
	// top-left
	{ top: "6%", left: "10%", rotation: -2.5 },
	// top-right
	{ top: "4%", right: "10%", rotation: 1.8 },
	// center
	{
		top: "50%",
		left: "50%",
		rotation: 0.5,
		transformExtra: "translate(-50%, -50%)",
	},
	// bottom-left
	{ bottom: "6%", left: "8%", rotation: 2.2 },
	// bottom-right
	{ bottom: "4%", right: "10%", rotation: -1.5 },
];

// ---------------------------------------------------------------------------
// CSS (injected once via <style>)
// ---------------------------------------------------------------------------

const COMPONENT_STYLES = `
	.sticky-note {
		transition: filter 0.3s ease;
	}
	.sticky-note:hover {
		filter: brightness(1.08);
	}

	/* Hover overlay on the front face */
	.note-front-overlay {
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	.sticky-note:hover .note-front-overlay {
		opacity: 1;
	}

	/* Flap lift on hover */
	.note-flap {
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}
	.sticky-note:hover .note-flap {
		transform: rotate(-8deg) translateZ(4px) !important;
		box-shadow: -4px -4px 12px rgba(0,0,0,0.5) !important;
	}

	/* Links on the back */
	.note-link {
		transition: color 0.2s ease, text-decoration-color 0.2s ease;
		text-decoration: underline;
		text-decoration-color: rgba(255,255,255,0.15);
		text-underline-offset: 3px;
	}
	.note-link:hover {
		color: #fff !important;
		text-decoration-color: rgba(255,255,255,0.5);
	}

	/* Close button */
	.note-close-btn {
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.note-close-btn:hover {
		background-color: rgba(255,255,255,0.15) !important;
		color: #fff !important;
	}

	/* Responsive: stack on smaller screens */
	@media (max-width: 768px) {
		.sticky-notes-container {
			display: flex !important;
			flex-direction: column !important;
			align-items: center !important;
			gap: 2rem !important;
			height: auto !important;
			min-height: auto !important;
			padding: 2rem 0 !important;
		}
		.sticky-note {
			position: relative !important;
			top: auto !important;
			bottom: auto !important;
			left: auto !important;
			right: auto !important;
			transform: none !important;
			width: min(260px, 75vw) !important;
			height: min(260px, 75vw) !important;
		}
	}

	@media (min-width: 769px) and (max-width: 1100px) {
		.sticky-note {
			width: clamp(160px, 20vw, 220px) !important;
			height: clamp(160px, 20vw, 220px) !important;
		}
	}
`;

// ---------------------------------------------------------------------------
// StickyNote Component
// ---------------------------------------------------------------------------

interface StickyNoteProps {
	project: Project;
	position: NotePosition;
	noteRef: (el: HTMLDivElement | null) => void;
}

function StickyNote({ project, position, noteRef }: StickyNoteProps) {
	const [isOpen, setIsOpen] = useState(false);
	const frontRef = useRef<HTMLDivElement>(null);
	const backRef = useRef<HTMLDivElement>(null);
	const flapRef = useRef<HTMLButtonElement>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);

	// Build the peel-back timeline once on mount
	useEffect(() => {
		const front = frontRef.current;
		const back = backRef.current;
		if (!(front && back)) {
			return;
		}

		const tl = gsap.timeline({ paused: true });

		// Phase 1: the corner flap grows / lifts up (0 -> 0.3)
		tl.to(
			front,
			{
				rotateX: 4,
				rotateY: -6,
				duration: 0.3,
				ease: "power2.in",
			},
			0
		);

		// Phase 2: full peel – front rotates away from bottom-right
		// transform-origin is top-left so the bottom-right lifts
		tl.to(
			front,
			{
				rotateX: 25,
				rotateY: -180,
				scale: 0.92,
				opacity: 0,
				duration: 0.55,
				ease: "power3.inOut",
			},
			0.25
		);

		// Phase 3: back content fades in
		tl.fromTo(
			back,
			{ opacity: 0, y: 15, scale: 0.95 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.45,
				ease: "power2.out",
			},
			0.45
		);

		timelineRef.current = tl;

		return () => {
			tl.kill();
		};
	}, []);

	const handleOpen = useCallback(() => {
		if (isOpen) {
			return;
		}
		setIsOpen(true);
		timelineRef.current?.play();
	}, [isOpen]);

	const handleClose = useCallback(() => {
		if (!isOpen) {
			return;
		}
		setIsOpen(false);
		timelineRef.current?.reverse();
	}, [isOpen]);

	// Compute position styles
	const positionStyles: React.CSSProperties = {
		position: "absolute",
		width: "clamp(180px, 18vw, 280px)",
		height: "clamp(180px, 18vw, 280px)",
		...(position.top !== undefined ? { top: position.top } : {}),
		...(position.bottom !== undefined ? { bottom: position.bottom } : {}),
		...(position.left !== undefined ? { left: position.left } : {}),
		...(position.right !== undefined ? { right: position.right } : {}),
	};

	const baseRotation = `rotate(${position.rotation}deg)`;
	const extra = position.transformExtra ? ` ${position.transformExtra}` : "";
	positionStyles.transform = `${baseRotation}${extra}`;

	return (
		<div
			className="sticky-note"
			ref={noteRef}
			style={{
				...positionStyles,
				opacity: 0,
				perspective: "800px",
			}}
		>
			{/* ---- FRONT FACE (cover) ---- */}
			<div
				ref={frontRef}
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: COLOR_NOTE_BG,
					border: `1px solid ${COLOR_NOTE_BORDER}`,
					transformOrigin: "top left",
					transformStyle: "preserve-3d",
					backfaceVisibility: "hidden",
					zIndex: isOpen ? 0 : 2,
					overflow: "hidden",
				}}
			>
				{/* Project image placeholder */}
				<div
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "rgba(255,255,255,0.03)",
					}}
				>
					<span
						style={{
							fontFamily: FONT_MONO,
							fontSize: "0.7rem",
							color: "rgba(255,255,255,0.15)",
							letterSpacing: "0.1em",
							textTransform: "uppercase",
						}}
					>
						img
					</span>
				</div>

				{/* Hover overlay: shows project name */}
				<div
					className="note-front-overlay"
					style={{
						position: "absolute",
						inset: 0,
						backgroundColor: "rgba(0,0,0,0.65)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "1rem",
					}}
				>
					<span
						style={{
							fontFamily: FONT_MONO,
							fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
							fontWeight: 600,
							color: "#fff",
							textAlign: "center",
							letterSpacing: "-0.01em",
							lineHeight: 1.3,
						}}
					>
						{project.title}
					</span>
				</div>

				{/* Corner flap – bottom right */}
				<button
					aria-label={`Open details for ${project.title}`}
					className="note-flap"
					onClick={handleOpen}
					ref={flapRef}
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: "44px",
						height: "44px",
						cursor: "pointer",
						zIndex: 3,
						transformOrigin: "bottom right",
						transform: "rotate(-4deg) translateZ(2px)",
						background: "none",
						border: "none",
						padding: 0,
						margin: 0,
					}}
					type="button"
				>
					{/* Flap shadow / underside */}
					<span
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(135deg, transparent 50%, ${COLOR_FLAP_UNDERSIDE} 50%)`,
							boxShadow: "-2px -2px 8px rgba(0,0,0,0.35)",
						}}
					/>
					{/* Flap visible face */}
					<span
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(135deg, transparent 48%, ${COLOR_FLAP} 48%, ${COLOR_FLAP} 100%)`,
						}}
					/>
					{/* Arrow icon on the flap */}
					<span
						style={{
							position: "absolute",
							bottom: "6px",
							right: "7px",
							fontFamily: FONT_MONO,
							fontSize: "0.65rem",
							color: "rgba(255,255,255,0.45)",
							lineHeight: 1,
							pointerEvents: "none",
						}}
					>
						&#8599;
					</span>
				</button>

				{/* Fold shadow line across bottom-right corner */}
				<div
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: "62px",
						height: "62px",
						background:
							"linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,0.2) 49.5%, rgba(0,0,0,0.2) 50.5%, transparent 50.5%)",
						pointerEvents: "none",
					}}
				/>
			</div>

			{/* ---- BACK FACE (content) ---- */}
			<div
				ref={backRef}
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: COLOR_NOTE_CONTENT_BG,
					border: `1px solid ${COLOR_NOTE_BORDER}`,
					padding: "clamp(0.75rem, 2vw, 1.25rem)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					opacity: 0,
					zIndex: 1,
					overflow: "hidden",
				}}
			>
				{/* Top section: title + description */}
				<div>
					{/* Category label */}
					<span
						style={{
							fontFamily: FONT_ACCENT,
							fontStyle: "italic",
							fontSize: "0.6rem",
							color: "rgba(255,255,255,0.3)",
							display: "block",
							marginBottom: "0.35rem",
						}}
					>
						{project.category}
					</span>
					<h3
						style={{
							fontFamily: FONT_MONO,
							fontSize: "clamp(0.75rem, 1.2vw, 0.95rem)",
							fontWeight: 600,
							color: "rgba(255,255,255,0.9)",
							margin: "0 0 0.5rem 0",
							letterSpacing: "-0.01em",
							lineHeight: 1.2,
						}}
					>
						{project.title}
					</h3>
					<p
						style={{
							fontFamily: FONT_MONO,
							fontSize: "clamp(0.55rem, 0.9vw, 0.7rem)",
							color: "rgba(255,255,255,0.5)",
							margin: 0,
							lineHeight: 1.55,
						}}
					>
						{project.description}
					</p>
				</div>

				{/* Bottom section: links + close */}
				<div>
					{/* Tags */}
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "0.3rem",
							marginBottom: "0.6rem",
						}}
					>
						{project.tags.map((tag) => (
							<span
								key={tag}
								style={{
									fontFamily: FONT_MONO,
									fontSize: "0.5rem",
									color: "rgba(255,255,255,0.3)",
									border: "1px solid rgba(255,255,255,0.1)",
									padding: "0.1rem 0.3rem",
									letterSpacing: "0.03em",
								}}
							>
								{tag}
							</span>
						))}
					</div>

					{/* Links row */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.75rem",
						}}
					>
						{project.github && (
							<a
								className="note-link"
								href={project.github}
								rel="noopener noreferrer"
								style={{
									fontFamily: FONT_MONO,
									fontSize: "0.6rem",
									color: "rgba(255,255,255,0.55)",
									textDecoration: "underline",
								}}
								target="_blank"
							>
								github
							</a>
						)}
						{project.live && (
							<a
								className="note-link"
								href={project.live}
								rel="noopener noreferrer"
								style={{
									fontFamily: FONT_MONO,
									fontSize: "0.6rem",
									color: "rgba(255,255,255,0.55)",
									textDecoration: "underline",
								}}
								target="_blank"
							>
								live demo
							</a>
						)}

						{/* Close button */}
						<button
							aria-label={`Close details for ${project.title}`}
							className="note-close-btn"
							onClick={handleClose}
							style={{
								marginLeft: "auto",
								fontFamily: FONT_MONO,
								fontSize: "0.55rem",
								color: "rgba(255,255,255,0.4)",
								backgroundColor: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.1)",
								padding: "0.2rem 0.5rem",
								cursor: "pointer",
								letterSpacing: "0.03em",
								lineHeight: 1.4,
							}}
							type="button"
						>
							close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Section-level GSAP helpers
// ---------------------------------------------------------------------------

/**
 * Animate the section header elements with ScrollTrigger.
 */
const animateSectionHeader = (
	labelEl: HTMLElement | null,
	headingEl: HTMLElement | null,
	lineEl: HTMLElement | null
): void => {
	if (labelEl) {
		gsap.fromTo(
			labelEl,
			{ clipPath: "inset(0 100% 0 0)" },
			{
				clipPath: "inset(0 0% 0 0)",
				duration: 0.8,
				ease: "power3.out",
				scrollTrigger: {
					trigger: labelEl,
					start: "top 85%",
					toggleActions: "play none none none",
				},
			}
		);
	}

	if (headingEl) {
		gsap.fromTo(
			headingEl,
			{ opacity: 0, y: 40 },
			{
				opacity: 1,
				y: 0,
				duration: 0.6,
				ease: "power2.out",
				delay: 0.15,
				scrollTrigger: {
					trigger: headingEl,
					start: "top 85%",
					toggleActions: "play none none none",
				},
			}
		);
	}

	if (lineEl) {
		gsap.fromTo(
			lineEl,
			{ scaleX: 0 },
			{
				scaleX: 1,
				duration: 1,
				ease: "power2.inOut",
				transformOrigin: "left center",
				scrollTrigger: {
					trigger: lineEl,
					start: "top 85%",
					toggleActions: "play none none none",
				},
			}
		);
	}
};

/**
 * Animate the section reveal container with a circular clip-path.
 */
const animateSectionReveal = (
	revealEl: HTMLDivElement | null,
	triggerEl: HTMLElement | null
): void => {
	if (!(revealEl && triggerEl)) {
		return;
	}

	gsap.fromTo(
		revealEl,
		{ clipPath: "circle(0% at 50% 100%)" },
		{
			clipPath: "circle(150% at 50% 100%)",
			ease: "none",
			scrollTrigger: {
				trigger: triggerEl,
				start: "top bottom",
				end: "top top",
				scrub: 0.6,
			},
		}
	);
};

/**
 * Stagger-reveal the sticky notes after the section enters.
 */
const animateNotes = (notes: (HTMLDivElement | null)[]): void => {
	const validNotes = notes.filter(Boolean);
	if (validNotes.length === 0) {
		return;
	}

	gsap.fromTo(
		validNotes,
		{ opacity: 0, scale: 0.82, y: 30 },
		{
			opacity: 1,
			scale: 1,
			y: 0,
			duration: 0.65,
			ease: "back.out(1.4)",
			stagger: 0.13,
			scrollTrigger: {
				trigger: validNotes[0],
				start: "top 90%",
				toggleActions: "play none none none",
			},
		}
	);
};

// ---------------------------------------------------------------------------
// WorksSection
// ---------------------------------------------------------------------------

export default function WorksSection() {
	const { loaderComplete } = useLoader();
	const sectionRef = useRef<HTMLElement>(null);
	const revealRef = useRef<HTMLDivElement>(null);

	const labelRef = useRef<HTMLSpanElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	const noteRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (!loaderComplete) {
			return;
		}

		const ctx = gsap.context(() => {
			animateSectionReveal(revealRef.current, sectionRef.current);
			animateSectionHeader(
				labelRef.current,
				headingRef.current,
				lineRef.current
			);
			animateNotes(noteRefs.current);
		}, sectionRef);

		return () => {
			ctx.revert();
		};
	}, [loaderComplete]);

	return (
		<section
			ref={sectionRef}
			style={{
				position: "relative",
				overflow: "hidden",
				backgroundColor: "transparent",
				zIndex: 10,
			}}
		>
			<style>{COMPONENT_STYLES}</style>

			<div
				ref={revealRef}
				style={{
					backgroundColor: "#000",
					clipPath: "circle(0% at 50% 100%)",
					willChange: "clip-path",
					padding:
						"clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(2rem, 4vw, 4rem)",
				}}
			>
				{/* Section header */}
				<div style={{ marginBottom: "2rem" }}>
					<span
						ref={labelRef}
						style={{
							display: "inline-block",
							fontFamily: FONT_ACCENT,
							fontStyle: "italic",
							fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
							color: "rgba(255, 255, 255, 0.5)",
							marginBottom: "0.5rem",
							clipPath: "inset(0 100% 0 0)",
						}}
					>
						selected
					</span>
					<h2
						ref={headingRef}
						style={{
							fontFamily: FONT_MONO,
							fontSize: "clamp(2rem, 5vw, 3.5rem)",
							fontWeight: 600,
							color: "rgba(255, 255, 255, 0.8)",
							margin: 0,
							letterSpacing: "-0.02em",
							lineHeight: 1.1,
							opacity: 0,
							transform: "translateY(40px)",
						}}
					>
						works
					</h2>
				</div>

				{/* Divider */}
				<div
					ref={lineRef}
					style={{
						width: "100%",
						height: "1px",
						backgroundColor: COLOR_DIVIDER,
						marginBottom: "2rem",
						transformOrigin: "left center",
						transform: "scaleX(0)",
					}}
				/>

				{/* Sticky notes container */}
				<div
					className="sticky-notes-container"
					style={{
						position: "relative",
						width: "100%",
						minHeight: "max(70vh, 520px)",
						height: "clamp(520px, 75vh, 800px)",
					}}
				>
					{PROJECTS.map((project, i) => (
						<StickyNote
							key={project.title}
							noteRef={(el) => {
								noteRefs.current[i] = el;
							}}
							position={NOTE_POSITIONS[i]}
							project={project}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
