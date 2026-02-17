"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

import BottomText from "@/components/bottom-text";
import LiquidEther from "@/components/liquid-ether";
import { useLoader } from "@/contexts/loader-context";

/**
 * SVG path data for each letter of "koustubh" extracted from JetBrains Mono Bold.
 * Each letter sits in a 120-unit wide cell; total viewBox width = 960, height = 200.
 */
const LETTER_PATHS = [
	{
		char: "k",
		d: "M41.40 160L16.40 160L16.40 14L41.40 14L41.40 93.20L59 93.20L85.20 50L113 50L80.40 103.20L114.20 160L85.80 160L59 114.40L41.40 114.40L41.40 160Z",
	},
	{
		char: "o",
		d: "M180 161.80Q158.80 161.80 146.40 149.90Q134 138 134 117.80L134 117.80L134 92.20Q134 71.80 146.40 60Q158.80 48.20 180 48.20Q201.20 48.20 213.60 60Q226 71.80 226 92.20L226 92.20L226 117.80Q226 138 213.60 149.90Q201.20 161.80 180 161.80ZM180 140Q190 140 195.50 134.50Q201 129 201 118.60L201 118.60L201 91.40Q201 81 195.50 75.50Q190 70 180 70Q170 70 164.50 75.50Q159 81 159 91.40L159 91.40L159 118.60Q159 129 164.50 134.50Q170 140 180 140Z",
	},
	{
		char: "u",
		d: "M300 162Q279 162 267 150.30Q255 138.60 255 118.40L255 118.40L255 50L280 50L280 118.20Q280 128.60 285.20 134.40Q290.40 140.20 300 140.20Q309.40 140.20 314.70 134.40Q320 128.60 320 118.20L320 118.20L320 50L345 50L345 118.40Q345 138.60 332.80 150.30Q320.60 162 300 162Z",
	},
	{
		char: "s",
		d: "M424.20 161.80L415.40 161.80Q395.80 161.80 384.40 152.90Q373 144 373 128.80L373 128.80L397.60 128.80Q397.60 135.20 402.30 138.60Q407 142 415.40 142L415.40 142L424.20 142Q433.20 142 438.10 138.60Q443 135.20 443 128.80Q443 122.80 439.60 119.90Q436.20 117 429.20 116L429.20 116L401.80 112.40Q388.60 110.60 381.50 102.20Q374.40 93.80 374.40 80.40Q374.40 64.80 384.80 56.50Q395.20 48.20 414.80 48.20L414.80 48.20L424 48.20Q442.40 48.20 453.60 56.60Q464.80 65 465.20 79L465.20 79L440.40 79Q440.20 73.80 435.80 70.70Q431.40 67.60 424 67.60L424 67.60L414.80 67.60Q406.80 67.60 402.60 70.90Q398.40 74.20 398.40 79.80Q398.40 84.80 401.50 87.20Q404.60 89.60 410.60 90.20L410.60 90.20L436.40 93.80Q451.60 95.60 459.30 104.50Q467 113.40 467 128.40Q467 144.40 456.10 153.10Q445.20 161.80 424.20 161.80Z",
	},
	{
		char: "t",
		d: "M585.40 160L551 160Q535.60 160 526.50 151.10Q517.40 142.20 517.40 127L517.40 127L517.40 72.60L487 72.60L487 50L517.40 50L517.40 19L542.60 19L542.60 50L586.40 50L586.40 72.60L542.60 72.60L542.60 126.40Q542.60 131.20 545.30 134.30Q548 137.40 552.80 137.40L552.80 137.40L585.40 137.40L585.40 160Z",
	},
	{
		char: "u",
		d: "M660 162Q639 162 627 150.30Q615 138.60 615 118.40L615 118.40L615 50L640 50L640 118.20Q640 128.60 645.20 134.40Q650.40 140.20 660 140.20Q669.40 140.20 674.70 134.40Q680 128.60 680 118.20L680 118.20L680 50L705 50L705 118.40Q705 138.60 692.80 150.30Q680.60 162 660 162Z",
	},
	{
		char: "b",
		d: "M790 162Q778.40 162 770.60 156.20Q762.80 150.40 759.80 140L759.80 140L759.80 160L735.40 160L735.40 14L760.40 14L760.40 44.80L759.60 70Q762.80 59.60 770.70 53.80Q778.60 48 790 48Q806.20 48 816 59.40Q825.80 70.80 825.80 90.20L825.80 90.20L825.80 120Q825.80 139.20 815.90 150.60Q806 162 790 162ZM780.60 140.40Q790.20 140.40 795.50 135.20Q800.80 130 800.80 119.20L800.80 119.20L800.80 90.80Q800.80 80 795.50 74.80Q790.20 69.60 780.60 69.60Q771 69.60 765.70 75.40Q760.40 81.20 760.40 91.80L760.40 91.80L760.40 118.20Q760.40 128.80 765.70 134.60Q771 140.40 780.60 140.40Z",
	},
	{
		char: "h",
		d: "M880.40 160L855.40 160L855.40 14L880.40 14L880.40 50L879.80 70.40Q881.80 60 889.60 54Q897.40 48 909.40 48Q925.60 48 935.30 58.80Q945 69.60 945 87.80L945 87.80L945 160L920 160L920 90.80Q920 80.60 914.70 75.10Q909.40 69.60 900.40 69.60Q891 69.60 885.70 75.20Q880.40 80.80 880.40 91.20L880.40 91.20L880.40 160Z",
	},
] as const;

const SVG_WIDTH = 960;
const SVG_HEIGHT = 200;

export default function HeroSection() {
	const { isFadingOut, loaderComplete } = useLoader();
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const pathRefs = useRef<(SVGPathElement | null)[]>([]);
	const [animationDone, setAnimationDone] = useState(false);

	useEffect(() => {
		if (isFadingOut && !isVisible) {
			setIsVisible(true);
		}
	}, [isFadingOut, isVisible]);

	// Stroke-draw animation: all letters draw simultaneously
	useEffect(() => {
		if (!isVisible) {
			return;
		}

		// Fade in the container
		if (containerRef.current) {
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

		const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
		if (paths.length === 0) {
			return;
		}

		// Set up each path for stroke-draw
		for (const path of paths) {
			const length = path.getTotalLength();
			gsap.set(path, {
				strokeDasharray: length,
				strokeDashoffset: length,
				fillOpacity: 0,
			});
		}

		const tl = gsap.timeline({
			onComplete: () => {
				setAnimationDone(true);
			},
		});

		// All letters draw their outlines simultaneously
		tl.to(paths, {
			strokeDashoffset: 0,
			duration: 2.4,
			ease: "power2.inOut",
		});

		// After outline completes, fade in the fill
		tl.to(paths, {
			fillOpacity: 1,
			duration: 0.78,
			ease: "power2.out",
		});

		return () => {
			tl.kill();
		};
	}, [isVisible]);

	// Hover handlers: on hover, boost stroke brightness / fill
	const handleMouseEnter = useCallback(() => {
		if (!animationDone) {
			return;
		}
		const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
		gsap.to(paths, {
			fill: "rgba(255, 255, 255, 1)",
			stroke: "rgba(255, 255, 255, 1)",
			duration: 0.8,
			ease: "power2.out",
		});
	}, [animationDone]);

	const handleMouseLeave = useCallback(() => {
		if (!animationDone) {
			return;
		}
		const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
		gsap.to(paths, {
			fill: "rgba(255, 255, 255, 0)",
			stroke: "rgba(255, 255, 255, 0.8)",
			duration: 0.5,
			ease: "power2.in",
		});
	}, [animationDone]);

	if (!(isVisible || loaderComplete)) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			style={{
				position: "sticky",
				top: 0,
				width: "100%",
				height: "100svh",
				opacity: 0,
				pointerEvents: loaderComplete ? "auto" : "none",
			}}
		>
			<LiquidEther
				autoDemo
				autoIntensity={2.2}
				autoSpeed={0.5}
				colors={["#ebf8ff", "#000000", "#676871"]}
				cursorSize={100}
				isBounce={false}
				isViscous
				iterationsPoisson={32}
				iterationsViscous={32}
				mouseForce={33}
				resolution={0.5}
				viscous={30}
			/>
			<div
				style={{
					position: "relative",
					zIndex: 1,
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
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
					<div
						aria-hidden="true"
						onBlur={handleMouseLeave}
						onFocus={handleMouseEnter}
						onPointerEnter={handleMouseEnter}
						onPointerLeave={handleMouseLeave}
						role="presentation"
						style={{
							cursor: "default",
							userSelect: "none",
							width: "clamp(280px, 70vw, 600px)",
						}}
					>
						<svg
							aria-labelledby="hero-name-title"
							role="img"
							style={{ width: "100%", height: "auto", display: "block" }}
							viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
							xmlns="http://www.w3.org/2000/svg"
						>
							<title id="hero-name-title">koustubh</title>
							{LETTER_PATHS.map((letter, i) => (
								<path
									d={letter.d}
									fill="rgba(255, 255, 255, 0)"
									key={letter.char + String(i)}
									ref={(el) => {
										pathRefs.current[i] = el;
									}}
									stroke="rgba(255, 255, 255, 0.8)"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							))}
						</svg>
					</div>
				</div>
				<BottomText />
			</div>
		</div>
	);
}
