"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { type Project, TiltedCard } from "@/components/tilted-card";
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
		gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
	},
	{
		title: "Project Two",
		description: "Another project with different tech.",
		category: "work",
		tags: ["Next.js", "PostgreSQL"],
		github: "#",
		live: "#",
		gradient: "linear-gradient(135deg, #2d1b33 0%, #1a1a2e 50%, #0d1117 100%)",
	},
	{
		title: "Project Three",
		description: "Freelance work for a client.",
		category: "work",
		tags: ["Swift", "iOS"],
		github: "#",
		gradient: "linear-gradient(135deg, #1b2838 0%, #171a21 50%, #1e2d3d 100%)",
	},
	{
		title: "Project Four",
		description: "A personal side project.",
		category: "project",
		tags: ["Python", "ML"],
		github: "#",
		live: "#",
		gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a2a 50%, #1a2a2a 100%)",
	},
	{
		title: "Project Five",
		description: "Open source contribution.",
		category: "project",
		tags: ["Rust", "CLI"],
		github: "#",
		gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1a2e 100%)",
	},
];

// ---------------------------------------------------------------------------
// Layout: positions and rotations for the 5 cards
// ---------------------------------------------------------------------------

interface CardPosition {
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
	rotation: number;
	transformExtra?: string;
}

const CARD_POSITIONS: CardPosition[] = [
	{ top: "6%", left: "10%", rotation: -2.5 },
	{ top: "4%", right: "10%", rotation: 1.8 },
	{
		top: "50%",
		left: "50%",
		rotation: 0.5,
		transformExtra: "translate(-50%, -50%)",
	},
	{ bottom: "6%", left: "8%", rotation: 2.2 },
	{ bottom: "4%", right: "10%", rotation: -1.5 },
];

// ---------------------------------------------------------------------------
// Style Constants
// ---------------------------------------------------------------------------

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";
const COLOR_DIVIDER = "rgba(255, 255, 255, 0.1)";
const CARD_SIZE = "clamp(234px, 23.4vw, 364px)";

// ---------------------------------------------------------------------------
// Responsive styles for the card layout
// ---------------------------------------------------------------------------

const RESPONSIVE_STYLES = `
	@media (max-width: 768px) {
		.works-cards-container {
			display: flex !important;
			flex-direction: column !important;
			align-items: center !important;
			gap: 2rem !important;
			height: auto !important;
			min-height: auto !important;
			padding: 2rem 0 !important;
		}
		.works-card-wrapper {
			position: relative !important;
			top: auto !important;
			bottom: auto !important;
			left: auto !important;
			right: auto !important;
			transform: none !important;
			width: min(338px, 97.5vw) !important;
			height: min(338px, 97.5vw) !important;
		}
	}

	@media (min-width: 769px) and (max-width: 1100px) {
		.works-card-wrapper {
			width: clamp(208px, 26vw, 286px) !important;
			height: clamp(208px, 26vw, 286px) !important;
		}
	}
`;

// ---------------------------------------------------------------------------
// Section-level GSAP helpers
// ---------------------------------------------------------------------------

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

const animateCards = (cards: (HTMLElement | null)[]): void => {
	const validCards = cards.filter(Boolean);
	if (validCards.length === 0) {
		return;
	}

	gsap.fromTo(
		validCards,
		{ opacity: 0, scale: 0.82, y: 30 },
		{
			opacity: 1,
			scale: 1,
			y: 0,
			duration: 0.65,
			ease: "back.out(1.4)",
			stagger: 0.13,
			scrollTrigger: {
				trigger: validCards[0],
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

	const cardRefs = useRef<(HTMLElement | null)[]>([]);

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
			animateCards(cardRefs.current);
		}, sectionRef);

		return () => {
			ctx.revert();
		};
	}, [loaderComplete]);

	return (
		<section
			id="works"
			ref={sectionRef}
			style={{
				position: "relative",
				overflow: "hidden",
				backgroundColor: "transparent",
				zIndex: 10,
			}}
		>
			<style>{RESPONSIVE_STYLES}</style>

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

				{/* Cards container */}
				<div
					className="works-cards-container"
					style={{
						position: "relative",
						width: "100%",
						minHeight: "max(80vh, 676px)",
						height: "clamp(676px, 97.5vh, 1040px)",
					}}
				>
					{PROJECTS.map((project, i) => {
						const pos = CARD_POSITIONS[i];
						const baseRotation = `rotate(${pos.rotation}deg)`;
						const extra = pos.transformExtra ? ` ${pos.transformExtra}` : "";

						return (
							<div
								className="works-card-wrapper"
								key={project.title}
								ref={(el) => {
									cardRefs.current[i] = el;
								}}
								style={{
									position: "absolute",
									width: CARD_SIZE,
									height: CARD_SIZE,
									...(pos.top !== undefined ? { top: pos.top } : {}),
									...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
									...(pos.left !== undefined ? { left: pos.left } : {}),
									...(pos.right !== undefined ? { right: pos.right } : {}),
									transform: `${baseRotation}${extra}`,
									opacity: 0,
								}}
							>
								<TiltedCard project={project} showTooltip={false} size="100%" />
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
