"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "intro-loader-shown";

// Each letter in "koustubh" with a stable key and whether it's part of "kstb"
const LETTERS = [
	{ char: "k", key: "k-first", isShort: true },
	{ char: "o", key: "o-first", isShort: false },
	{ char: "u", key: "u-first", isShort: false },
	{ char: "s", key: "s-first", isShort: true },
	{ char: "t", key: "t-first", isShort: true },
	{ char: "u", key: "u-second", isShort: false },
	{ char: "b", key: "b-first", isShort: true },
	{ char: "h", key: "h-first", isShort: false },
] as const;

export default function IntroLoader({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isLoading, setIsLoading] = useState(true);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const overlayRef = useRef<HTMLDivElement>(null);
	const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
	const whiteLayersRef = useRef<(HTMLSpanElement | null)[]>([]);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);

	// Check sessionStorage on mount
	useEffect(() => {
		const alreadyShown = sessionStorage.getItem(SESSION_KEY);
		if (alreadyShown) {
			setIsLoading(false);
		} else {
			setShouldAnimate(true);
		}
	}, []);

	// Run the animation
	useEffect(() => {
		if (!shouldAnimate) {
			return;
		}

		const tl = gsap.timeline({
			onComplete: () => {
				sessionStorage.setItem(SESSION_KEY, "true");
				setIsLoading(false);
			},
		});
		timelineRef.current = tl;

		// Collect references for each group
		const hiddenLetters: HTMLSpanElement[] = [];
		const shortWhiteLayers: HTMLSpanElement[] = [];

		for (let i = 0; i < LETTERS.length; i++) {
			const letterDef = LETTERS[i];
			const el = lettersRef.current[i];
			if (!el) {
				continue;
			}

			if (letterDef.isShort) {
				const whiteLayer = whiteLayersRef.current[i];
				if (whiteLayer) {
					shortWhiteLayers.push(whiteLayer);
				}
			} else {
				hiddenLetters.push(el);
			}
		}

		// Initial state: hidden letters have no width and are invisible
		gsap.set(hiddenLetters, {
			width: 0,
			opacity: 0,
			overflow: "hidden",
		});

		// Initial state: white layers are clipped from top (showing nothing)
		gsap.set(shortWhiteLayers, {
			clipPath: "inset(100% 0 0 0)",
		});

		// --- Phase 1: Water fill animation ---
		// Small delay before starting
		tl.to({}, { duration: 0.4 });

		// Animate white layers from bottom to top (water fill)
		tl.to(shortWhiteLayers, {
			clipPath: "inset(0% 0 0 0)",
			duration: 1.2,
			stagger: 0.15,
			ease: "power2.inOut",
		});

		// --- Phase 2: Spread and reveal ---
		// Brief pause after fill completes
		tl.to({}, { duration: 0.35 });

		// Expand hidden letters to make space
		tl.to(hiddenLetters, {
			width: "auto",
			duration: 0.8,
			ease: "power3.inOut",
			stagger: 0.06,
		});

		// Fade in the hidden letters (slightly overlapping with the width animation)
		tl.to(
			hiddenLetters,
			{
				opacity: 1,
				duration: 0.5,
				stagger: 0.06,
				ease: "power2.out",
			},
			"-=0.5"
		);

		// --- Phase 3: Hold and exit ---
		tl.to({}, { duration: 0.8 });

		// Fade out the entire overlay
		tl.to(overlayRef.current, {
			opacity: 0,
			duration: 0.5,
			ease: "power2.inOut",
		});

		return () => {
			tl.kill();
		};
	}, [shouldAnimate]);

	// If loader was already shown, render children directly
	if (!(isLoading || shouldAnimate)) {
		return <>{children}</>;
	}

	return (
		<>
			{isLoading && (
				<div
					ref={overlayRef}
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 50,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#000",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							fontSize: "clamp(2.5rem, 8vw, 5rem)",
							fontWeight: 700,
							fontFamily: "var(--font-jetbrains-mono), monospace",
							letterSpacing: "-0.02em",
							lineHeight: 1,
							userSelect: "none",
						}}
					>
						{LETTERS.map((letterDef, i) => (
							<span
								key={letterDef.key}
								ref={(el) => {
									lettersRef.current[i] = el;
								}}
								style={{
									position: "relative",
									display: "inline-block",
									color: letterDef.isShort ? undefined : "#555",
								}}
							>
								{letterDef.isShort ? (
									<>
										{/* Grey base layer */}
										<span style={{ color: "#555" }}>{letterDef.char}</span>
										{/* White overlay layer with clip-path for water fill */}
										<span
											aria-hidden="true"
											ref={(el) => {
												whiteLayersRef.current[i] = el;
											}}
											style={{
												position: "absolute",
												inset: 0,
												color: "#fff",
												clipPath: "inset(100% 0 0 0)",
											}}
										>
											{letterDef.char}
										</span>
									</>
								) : (
									letterDef.char
								)}
							</span>
						))}
					</div>
				</div>
			)}
			<div
				style={{
					visibility: isLoading ? "hidden" : "visible",
				}}
			>
				{children}
			</div>
		</>
	);
}
