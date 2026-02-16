"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import {
	type NotePosition,
	type Project,
	STICKY_NOTE_STYLES,
	StickyNote,
} from "@/components/sticky-note";
import { useLoader } from "@/contexts/loader-context";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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
// Layout: positions and rotations for the 5 sticky notes
// ---------------------------------------------------------------------------

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
// Style Constants
// ---------------------------------------------------------------------------

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";
const COLOR_DIVIDER = "rgba(255, 255, 255, 0.1)";

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
			<style>{STICKY_NOTE_STYLES}</style>

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
