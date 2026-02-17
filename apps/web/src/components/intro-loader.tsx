"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useLoader } from "@/contexts/loader-context";

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
	const { isLoading, isFadingOut, startFadeOut, setLoaderComplete } =
		useLoader();
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const topPanelRef = useRef<HTMLDivElement>(null);
	const bottomPanelRef = useRef<HTMLDivElement>(null);
	const textContainerRef = useRef<HTMLDivElement>(null);
	const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
	const whiteLayersRef = useRef<(HTMLSpanElement | null)[]>([]);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => {
		setShouldAnimate(true);
	}, []);

	useEffect(() => {
		if (!shouldAnimate) {
			return;
		}

		const tl = gsap.timeline({
			onComplete: () => {
				setLoaderComplete();
			},
		});
		timelineRef.current = tl;

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

		gsap.set(hiddenLetters, {
			width: 0,
			opacity: 0,
			overflow: "hidden",
		});

		gsap.set(shortWhiteLayers, {
			clipPath: "inset(100% 0 0 0)",
		});

		// --- Phase 1: Initial pause ---
		tl.to({}, { duration: 0.54 });

		// --- Phase 2: "kstb" white layer reveal ---
		tl.to(shortWhiteLayers, {
			clipPath: "inset(0% 0 0 0)",
			duration: 1.62,
			stagger: 0.2025,
			ease: "power2.inOut",
		});

		tl.to({}, { duration: 0.4725 });

		// Mark the point where "kstb" starts expanding to "koustubh" (line starts here)
		tl.addLabel("expandStart");

		// --- Phase 3: Hidden vowel letters expand ---
		tl.to(hiddenLetters, {
			width: "auto",
			duration: 1.08,
			ease: "power3.inOut",
			stagger: 0.081,
		});

		tl.to(
			hiddenLetters,
			{
				opacity: 1,
				duration: 0.675,
				stagger: 0.081,
				ease: "power2.out",
			},
			"-=0.675"
		);

		// Mark the point where letter animation is fully complete
		tl.addLabel("lettersEnd");

		// --- Phase 4: Pause after text completes, then split ---
		tl.to({}, { duration: 0.72 });

		tl.call(startFadeOut);

		// Fade the text out as the split begins
		tl.to(textContainerRef.current, {
			opacity: 0,
			duration: 0.27,
			ease: "power2.in",
		});

		// Horizontal split: top panel slides up, bottom panel slides down
		tl.to(
			topPanelRef.current,
			{
				yPercent: -100,
				duration: 0.765,
				ease: "power3.inOut",
			},
			"-=0.135"
		);

		tl.to(
			bottomPanelRef.current,
			{
				yPercent: 100,
				duration: 0.765,
				ease: "power3.inOut",
			},
			"<"
		);

		return () => {
			tl.kill();
		};
	}, [shouldAnimate, startFadeOut, setLoaderComplete]);

	if (!(isLoading || shouldAnimate)) {
		return <>{children}</>;
	}

	return (
		<>
			{isLoading && (
				<>
					{/* Top half panel */}
					<div
						ref={topPanelRef}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100%",
							height: "50%",
							zIndex: 50,
							backgroundColor: "#000",
						}}
					/>
					{/* Bottom half panel */}
					<div
						ref={bottomPanelRef}
						style={{
							position: "fixed",
							bottom: 0,
							left: 0,
							width: "100%",
							height: "50%",
							zIndex: 50,
							backgroundColor: "#000",
						}}
					/>
					{/* Text + line layer centered on top of both panels */}
					<div
						ref={textContainerRef}
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 51,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							pointerEvents: "none",
						}}
					>
						<div style={{ position: "relative" }}>
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
											color: letterDef.isShort ? undefined : "#000",
											WebkitTextStroke: letterDef.isShort
												? undefined
												: "1px rgba(255, 255, 255, 0.8)",
										}}
									>
										{letterDef.isShort ? (
											<>
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
											</>
										) : (
											letterDef.char
										)}
									</span>
								))}
							</div>
						</div>
					</div>
				</>
			)}
			<div
				style={{
					visibility: isLoading && !isFadingOut ? "hidden" : "visible",
					height: "100%",
				}}
			>
				{children}
			</div>
		</>
	);
}
