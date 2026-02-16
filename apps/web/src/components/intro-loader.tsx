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
	const { isLoading, startFadeOut, setLoaderComplete } = useLoader();
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const overlayRef = useRef<HTMLDivElement>(null);
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

		tl.to({}, { duration: 0.6 });

		tl.to(shortWhiteLayers, {
			clipPath: "inset(0% 0 0 0)",
			duration: 1.8,
			stagger: 0.225,
			ease: "power2.inOut",
		});

		tl.to({}, { duration: 0.525 });

		tl.to(hiddenLetters, {
			width: "auto",
			duration: 1.2,
			ease: "power3.inOut",
			stagger: 0.09,
		});

		tl.to(
			hiddenLetters,
			{
				opacity: 1,
				duration: 0.75,
				stagger: 0.09,
				ease: "power2.out",
			},
			"-=0.75"
		);

		tl.to({}, { duration: 1.2 });

		tl.call(startFadeOut);

		tl.to(overlayRef.current, {
			opacity: 0,
			duration: 0.75,
			ease: "power2.inOut",
		});

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
			)}
			<div
				style={{
					visibility: isLoading ? "hidden" : "visible",
					height: "100%",
				}}
			>
				{children}
			</div>
		</>
	);
}
