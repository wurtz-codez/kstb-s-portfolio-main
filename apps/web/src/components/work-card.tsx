"use client";

import gsap from "gsap";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface WorkCardProps {
	title: string;
	description?: string;
	githubUrl?: string;
	liveUrl?: string;
	tags?: string[];
	variant?: "featured" | "normal";
}

export function WorkCard({
	title,
	description,
	githubUrl,
	liveUrl,
	tags,
	variant = "normal",
}: WorkCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const underlineRef = useRef<HTMLDivElement>(null);
	const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

	useEffect(() => {
		const card = cardRef.current;
		if (!card) {
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				card,
				{
					opacity: 0,
					y: 20,
					clipPath: "inset(0 0 100% 0)",
				},
				{
					opacity: 1,
					y: 0,
					clipPath: "inset(0 0 0% 0)",
					duration: 0.6,
					ease: "power2.out",
				}
			);
		});

		return () => ctx.revert();
	}, []);

	const handlePointerEnter = () => {
		const underline = underlineRef.current;
		if (underline) {
			gsap.fromTo(
				underline,
				{ scaleX: 0 },
				{ scaleX: 1, duration: 0.3, ease: "power2.out" }
			);
		}

		const card = cardRef.current;
		if (card) {
			gsap.to(card, {
				backgroundColor: "rgba(255, 255, 255, 0.03)",
				duration: 0.3,
				ease: "power2.out",
			});
		}

		const links = linkRefs.current.filter(Boolean);
		if (links.length > 0) {
			gsap.to(links, {
				x: 4,
				duration: 0.2,
				ease: "power2.out",
			});
		}
	};

	const handlePointerLeave = () => {
		const underline = underlineRef.current;
		if (underline) {
			gsap.to(underline, {
				scaleX: 0,
				duration: 0.2,
				ease: "power2.in",
			});
		}

		const card = cardRef.current;
		if (card) {
			gsap.to(card, {
				backgroundColor: "transparent",
				duration: 0.3,
				ease: "power2.out",
			});
		}

		const links = linkRefs.current.filter(Boolean);
		if (links.length > 0) {
			gsap.to(links, {
				x: 0,
				duration: 0.2,
				ease: "power2.out",
			});
		}
	};

	return (
		<div
			className={cn(
				"group relative flex flex-col gap-4 p-6 transition-colors",
				variant === "featured" && "p-8"
			)}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			ref={cardRef}
		>
			<div className="flex flex-col gap-3">
				<div className="relative flex flex-col gap-1">
					<h3
						className="relative inline-block font-medium text-lg tracking-tight"
						style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}
					>
						<span className="text-white/80">{title}</span>
						<div
							className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white/30"
							ref={underlineRef}
						/>
					</h3>
					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<span
									className="text-xs"
									key={tag}
									style={{ color: "rgb(128, 128, 128)" }}
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{description && (
					<p
						className="text-sm leading-relaxed"
						style={{ color: "rgba(255, 255, 255, 0.6)" }}
					>
						{description}
					</p>
				)}
			</div>

			<div className="flex items-center gap-4 pt-2">
				{githubUrl && (
					<a
						className="flex items-center gap-1.5 text-sm transition-colors hover:text-white/90"
						href={githubUrl}
						ref={(el) => {
							linkRefs.current[0] = el;
						}}
						rel="noopener noreferrer"
						style={{ color: "rgba(255, 255, 255, 0.5)" }}
						target="_blank"
					>
						<GitHubIcon className="h-4 w-4" />
						<span>Source</span>
					</a>
				)}
				{liveUrl && (
					<a
						className="flex items-center gap-1.5 text-sm transition-colors hover:text-white/90"
						href={liveUrl}
						ref={(el) => {
							linkRefs.current[1] = el;
						}}
						rel="noopener noreferrer"
						style={{ color: "rgba(255, 255, 255, 0.5)" }}
						target="_blank"
					>
						<ExternalLink className="h-4 w-4" />
						<span>Live</span>
					</a>
				)}
			</div>
		</div>
	);
}

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-labelledby="github-icon-title"
			className={className}
			fill="currentColor"
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title id="github-icon-title">GitHub</title>
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}
