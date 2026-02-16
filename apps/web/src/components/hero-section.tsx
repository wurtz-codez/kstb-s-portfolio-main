"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useLoader } from "@/contexts/loader-context";

const LETTERS = [
	{ char: "k", key: "k-first" },
	{ char: "o", key: "o-first" },
	{ char: "u", key: "u-first" },
	{ char: "s", key: "s-first" },
	{ char: "t", key: "t-first" },
	{ char: "u", key: "u-second" },
	{ char: "b", key: "b-first" },
	{ char: "h", key: "h-first" },
] as const;

export default function HeroSection() {
	const { isFadingOut, loaderComplete } = useLoader();
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const whiteLayersRef = useRef<(HTMLSpanElement | null)[]>([]);

	useEffect(() => {
		if (isFadingOut && !isVisible) {
			setIsVisible(true);
		}
	}, [isFadingOut, isVisible]);

	useEffect(() => {
		if (isVisible && containerRef.current) {
			gsap.fromTo(
				containerRef.current,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: 0.75,
					ease: "power2.inOut",
				}
			);
		}
	}, [isVisible]);

	const handleMouseEnter = () => {
		gsap.to(whiteLayersRef.current.filter(Boolean), {
			clipPath: "inset(0% 0 0 0)",
			duration: 0.6,
			ease: "power2.out",
		});
	};

	const handleMouseLeave = () => {
		gsap.to(whiteLayersRef.current.filter(Boolean), {
			clipPath: "inset(100% 0 0 0)",
			duration: 0.4,
			ease: "power2.in",
		});
	};

	if (!(isVisible || loaderComplete)) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			style={{
				position: "fixed",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				opacity: 0,
				pointerEvents: loaderComplete ? "auto" : "none",
			}}
		>
			<div style={{ position: "relative" }}>
				<span
					style={{
						position: "absolute",
						bottom: "100%",
						left: "-20%",
						marginBottom: "0.25em",
						fontFamily: "var(--font-telma)",
						fontStyle: "italic",
						fontSize: "clamp(1.25rem, 4vw, 2rem)",
						color: "rgba(255, 255, 255, 0.8)",
						whiteSpace: "nowrap",
					}}
				>
					hey, i&apos;m
				</span>
				<button
					aria-hidden="true"
					onBlur={handleMouseLeave}
					onFocus={handleMouseEnter}
					onPointerEnter={handleMouseEnter}
					onPointerLeave={handleMouseLeave}
					style={{
						display: "flex",
						flexDirection: "row",
						fontSize: "clamp(2.5rem, 8vw, 5rem)",
						fontWeight: 700,
						fontFamily: "var(--font-jetbrains-mono), monospace",
						letterSpacing: "-0.02em",
						lineHeight: 1,
						userSelect: "none",
						cursor: "default",
						background: "none",
						border: "none",
						padding: 0,
					}}
					tabIndex={-1}
					type="button"
				>
					{LETTERS.map((letterDef, i) => (
						<span
							key={letterDef.key}
							style={{
								position: "relative",
								display: "inline-block",
							}}
						>
							<span
								style={{
									color: "#000",
									WebkitTextStroke: "1px rgba(255, 255, 255, 0.8)",
								}}
							>
								{letterDef.char}
							</span>
							<span
								aria-hidden="true"
								ref={(el) => {
									whiteLayersRef.current[i] = el;
								}}
								style={{
									position: "absolute",
									inset: 0,
									color: "#fff",
									WebkitTextStroke: "1px rgba(255, 255, 255, 0.8)",
									clipPath: "inset(100% 0 0 0)",
								}}
							>
								{letterDef.char}
							</span>
						</span>
					))}
				</button>
			</div>
		</div>
	);
}
