"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { useLoader } from "@/contexts/loader-context";

gsap.registerPlugin(ScrollTrigger);

interface Project {
	title: string;
	description: string;
	category: "work" | "project";
	tags: string[];
	github?: string;
	live?: string;
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
	{
		title: "Project Six",
		description: "Experimental project.",
		category: "project",
		tags: ["Go", "WebSocket"],
		github: "#",
	},
];

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";
const COLOR_GRAY = "rgb(128, 128, 128)";
const COLOR_BORDER = "rgba(255, 255, 255, 0.06)";
const COLOR_BORDER_TAG = "rgba(255, 255, 255, 0.12)";
const COLOR_DIVIDER = "rgba(255, 255, 255, 0.1)";

interface ProjectCardProps {
	project: Project;
	cardRef: (el: HTMLElement | null) => void;
	imageRef: (el: HTMLDivElement | null) => void;
}

const ProjectCard = ({ project, cardRef, imageRef }: ProjectCardProps) => (
	<article
		className="works-card"
		ref={cardRef}
		style={{
			borderBottom: `1px solid ${COLOR_BORDER}`,
			padding: "1.5rem 0",
			opacity: 0,
			transform: "translateY(40px)",
			display: "flex",
			gap: "1.25rem",
			alignItems: "flex-start",
		}}
	>
		{/* Small image thumbnail */}
		<div
			ref={imageRef}
			style={{
				width: "48px",
				height: "48px",
				minWidth: "48px",
				backgroundColor: "rgba(255, 255, 255, 0.04)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				marginTop: "0.125rem",
				overflow: "hidden",
			}}
		>
			<span
				style={{
					fontFamily: FONT_MONO,
					fontSize: "0.55rem",
					color: "rgba(255, 255, 255, 0.2)",
					letterSpacing: "0.05em",
				}}
			>
				img
			</span>
		</div>

		{/* Content */}
		<div style={{ flex: 1, minWidth: 0 }}>
			{/* Title row with category */}
			<div
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: "0.75rem",
					marginBottom: "0.35rem",
				}}
			>
				<h3
					style={{
						fontFamily: FONT_MONO,
						fontSize: "0.95rem",
						fontWeight: 500,
						color: "rgba(255, 255, 255, 0.9)",
						margin: 0,
						letterSpacing: "-0.01em",
					}}
				>
					{project.title}
				</h3>
				<span
					style={{
						fontFamily: FONT_ACCENT,
						fontStyle: "italic",
						fontSize: "0.65rem",
						color: "rgba(255, 255, 255, 0.3)",
						whiteSpace: "nowrap",
					}}
				>
					{project.category}
				</span>
			</div>

			{/* Description */}
			<p
				style={{
					fontFamily: FONT_MONO,
					fontSize: "0.75rem",
					color: COLOR_GRAY,
					margin: "0 0 0.75rem 0",
					lineHeight: 1.5,
				}}
			>
				{project.description}
			</p>

			{/* Tags and links row */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "0.4rem",
				}}
			>
				{project.tags.map((tag) => (
					<span
						key={tag}
						style={{
							fontFamily: FONT_MONO,
							fontSize: "0.6rem",
							color: "rgba(255, 255, 255, 0.35)",
							border: `1px solid ${COLOR_BORDER_TAG}`,
							padding: "0.15rem 0.4rem",
							letterSpacing: "0.03em",
							lineHeight: 1.4,
						}}
					>
						{tag}
					</span>
				))}

				<div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
					{project.github && (
						<a
							className="works-link"
							href={project.github}
							rel="noopener noreferrer"
							style={{
								fontFamily: FONT_MONO,
								fontSize: "0.6rem",
								color: COLOR_GRAY,
								textDecoration: "none",
							}}
							target="_blank"
						>
							github →
						</a>
					)}
					{project.live && (
						<a
							className="works-link"
							href={project.live}
							rel="noopener noreferrer"
							style={{
								fontFamily: FONT_MONO,
								fontSize: "0.6rem",
								color: COLOR_GRAY,
								textDecoration: "none",
							}}
							target="_blank"
						>
							live →
						</a>
					)}
				</div>
			</div>
		</div>
	</article>
);

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
 * Animate project cards with a staggered reveal.
 */
const animateCards = (
	cards: (HTMLElement | null)[],
	gridEl: HTMLElement | null
): void => {
	const validCards = cards.filter(Boolean);
	if (validCards.length === 0 || !gridEl) {
		return;
	}

	gsap.fromTo(
		validCards,
		{ opacity: 0, y: 40 },
		{
			opacity: 1,
			y: 0,
			duration: 0.6,
			ease: "power2.out",
			stagger: 0.12,
			scrollTrigger: {
				trigger: gridEl,
				start: "top 80%",
				toggleActions: "play none none none",
			},
		}
	);
};

/**
 * Apply subtle parallax to image thumbnails.
 */
const animateImageParallax = (images: (HTMLDivElement | null)[]): void => {
	const validImages = images.filter(Boolean);
	for (const img of validImages) {
		gsap.fromTo(
			img,
			{ y: 8 },
			{
				y: -8,
				ease: "none",
				scrollTrigger: {
					trigger: img,
					start: "top bottom",
					end: "bottom top",
					scrub: 1,
				},
			}
		);
	}
};

export default function WorksSection() {
	const { loaderComplete } = useLoader();
	const sectionRef = useRef<HTMLElement>(null);
	const revealRef = useRef<HTMLDivElement>(null);

	const labelRef = useRef<HTMLSpanElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const cardRefs = useRef<(HTMLElement | null)[]>([]);
	const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

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
			animateCards(cardRefs.current, gridRef.current);
			animateImageParallax(imageRefs.current);
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
			<style>{`
				.works-card {
					transition: background-color 0.3s ease;
				}
				.works-card:hover {
					background-color: rgba(255, 255, 255, 0.02);
				}
				.works-link {
					transition: color 0.2s ease;
				}
				.works-link:hover {
					color: #fff;
				}
			`}</style>

			<div
				ref={revealRef}
				style={{
					backgroundColor: "#000",
					clipPath: "circle(0% at 50% 100%)",
					willChange: "clip-path",
					padding:
						"clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(6rem, 12vw, 10rem)",
				}}
			>
				{/* Section header */}
				<div style={{ marginBottom: "2.5rem" }}>
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
						marginBottom: "1rem",
						transformOrigin: "left center",
						transform: "scaleX(0)",
					}}
				/>

				{/* All projects in a single list */}
				<div ref={gridRef}>
					{PROJECTS.map((project, i) => (
						<ProjectCard
							cardRef={(el) => {
								cardRefs.current[i] = el;
							}}
							imageRef={(el) => {
								imageRefs.current[i] = el;
							}}
							key={project.title}
							project={project}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
