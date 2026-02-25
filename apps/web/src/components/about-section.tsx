"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoader } from "@/contexts/loader-context";

gsap.registerPlugin(ScrollTrigger);

const FONT_MONO = "var(--font-jetbrains-mono), monospace";
const FONT_ACCENT = "var(--font-telma)";

const TYPES = [
	"cs undergrad",
	"full stack dev",
	"iOS app dev",
	"AI-driven system designer",
	"UI/UX designer",
	"co-founder of singularity works",
] as const;

const LINE_COUNT = 5;

// Scroll progress thresholds at which each chat line appears (0–1 range)
const LINE_THRESHOLDS = [0.05, 0.2, 0.35, 0.55, 0.7] as const;

// Pop animation config
const POP_DURATION = 0.3;
const POP_EASE = "back.out(1.7)";
const UNPOP_DURATION = 0.2;
const UNPOP_EASE = "power2.in";

const popIn = (element: HTMLDivElement): void => {
	gsap.killTweensOf(element);
	gsap.fromTo(
		element,
		{ scale: 0, opacity: 0 },
		{ scale: 1, opacity: 1, duration: POP_DURATION, ease: POP_EASE }
	);
};

const popOut = (element: HTMLDivElement): void => {
	gsap.killTweensOf(element);
	gsap.to(element, {
		scale: 0,
		opacity: 0,
		duration: UNPOP_DURATION,
		ease: UNPOP_EASE,
	});
};

export default function AboutSection() {
	const { loaderComplete } = useLoader();
	const sectionRef = useRef<HTMLElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	// Refs for each chat bubble element
	const line1Ref = useRef<HTMLDivElement>(null);
	const line2Ref = useRef<HTMLDivElement>(null);
	const line3Ref = useRef<HTMLDivElement>(null);
	const line4Ref = useRef<HTMLDivElement>(null);
	const line5Ref = useRef<HTMLDivElement>(null);

	// Track which lines are currently visible (to avoid re-triggering animations)
	const lineVisibleRef = useRef<boolean[]>(
		Array.from({ length: LINE_COUNT }, () => false)
	);

	// Typewriter state
	const [activeIndex, setActiveIndex] = useState(0);
	const [displayedType, setDisplayedType] = useState<string>(TYPES[0]);
	const currentTypeRef = useRef<string>(TYPES[0]);
	const [hasTyped, setHasTyped] = useState(false);
	const typewriterStartedRef = useRef(false);
	const [line3Visible, setLine3Visible] = useState(false);

	// Stable array of refs — individual refs never change identity
	const lineRefsArray = useRef([
		line1Ref,
		line2Ref,
		line3Ref,
		line4Ref,
		line5Ref,
	]);

	const resetAllLines = useCallback(() => {
		for (const ref of lineRefsArray.current) {
			if (ref.current) {
				gsap.killTweensOf(ref.current);
				gsap.set(ref.current, { scale: 0, opacity: 0 });
			}
		}
		lineVisibleRef.current = Array.from({ length: LINE_COUNT }, () => false);
		setLine3Visible(false);
		setActiveIndex(0);
		setDisplayedType(TYPES[0]);
		currentTypeRef.current = TYPES[0];
		setHasTyped(false);
		typewriterStartedRef.current = false;
	}, []);

	// GSAP ScrollTrigger setup
	useEffect(() => {
		if (!loaderComplete) {
			return;
		}

		const ctx = gsap.context(() => {
			// 1. Circle to full-screen reveal on scroll enter
			gsap.fromTo(
				innerRef.current,
				{ clipPath: "circle(0% at 50% 50%)" },
				{
					clipPath: "circle(150% at 50% 50%)",
					ease: "none",
					scrollTrigger: {
						trigger: sectionRef.current,
						start: "top bottom",
						end: "top top",
						scrub: 2.6,
					},
				}
			);

			// 2. Pin section and use scroll progress to pop chat lines in/out
			const TOTAL_STEPS = TYPES.length + 2;
			const scrollDistance = TOTAL_STEPS * 1000;

			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top top",
				end: `+=${scrollDistance}`,
				pin: true,
				scrub: 1,
				onUpdate: (self) => {
					const { progress } = self;

					for (let i = 0; i < LINE_COUNT; i++) {
						const shouldShow = progress >= LINE_THRESHOLDS[i];
						const isVisible = lineVisibleRef.current[i];
						const el = lineRefsArray.current[i].current;

						if (!el || shouldShow === isVisible) {
							continue;
						}

						lineVisibleRef.current[i] = shouldShow;

						if (shouldShow) {
							popIn(el);
						} else {
							popOut(el);
						}

						// Track Line 3 visibility for typewriter
						if (i === 2) {
							setLine3Visible(shouldShow);
						}
					}
				},
				onLeaveBack: () => {
					resetAllLines();
				},
			});
		}, sectionRef);

		return () => {
			ctx.revert();
		};
	}, [loaderComplete, resetAllLines]);

	// Start the typewriter once Line 3 becomes visible
	useEffect(() => {
		if (!line3Visible || typewriterStartedRef.current) {
			return;
		}
		typewriterStartedRef.current = true;
		setHasTyped(true);
	}, [line3Visible]);

	// Auto-advance typewriter index after the current type finishes displaying
	useEffect(() => {
		if (!(line3Visible && hasTyped)) {
			return;
		}
		const targetText = TYPES[activeIndex] ?? "";
		if (displayedType !== targetText) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setActiveIndex((prev) => (prev + 1) % TYPES.length);
		}, 700);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [line3Visible, activeIndex, displayedType, hasTyped]);

	// Typewriter animation: backspace then type character-by-character
	useEffect(() => {
		const targetText = TYPES[activeIndex] || "";
		let isCancelled = false;
		const isCancelledCheck = () => isCancelled;

		const findCommonPrefixLength = (a: string, b: string): number => {
			let len = 0;
			while (len < a.length && len < b.length && a[len] === b[len]) {
				len++;
			}
			return len;
		};

		const backspace = async (stopAt: number) => {
			while (currentTypeRef.current.length > stopAt && !isCancelledCheck()) {
				currentTypeRef.current = currentTypeRef.current.slice(0, -1);
				setDisplayedType(currentTypeRef.current);
				await new Promise((r) => setTimeout(r, 40));
			}
		};

		const typeForward = async (target: string) => {
			while (
				currentTypeRef.current.length < target.length &&
				!isCancelledCheck()
			) {
				const nextChar = target[currentTypeRef.current.length];
				currentTypeRef.current += nextChar;
				setDisplayedType(currentTypeRef.current);
				await new Promise((r) => setTimeout(r, 80));
			}
		};

		const animate = async () => {
			if (currentTypeRef.current === targetText) {
				return;
			}
			const prefixLen = findCommonPrefixLength(
				currentTypeRef.current,
				targetText
			);
			await backspace(prefixLen);
			await typeForward(targetText);
		};

		animate();

		return () => {
			isCancelled = true;
		};
	}, [activeIndex]);

	return (
		<section
			id="about"
			ref={sectionRef}
			style={{
				backgroundColor: "transparent",
				position: "relative",
				width: "100%",
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
			}}
		>
			<div
				ref={innerRef}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "#000",
					padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)",
					color: "rgba(255, 255, 255, 0.8)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						maxWidth: "800px",
						width: "100%",
						margin: "0 auto",
						zIndex: 10,
						paddingBottom: "2rem",
					}}
				>
					{/* Line 1 — right-aligned (sender) */}
					<div
						style={{
							minHeight: "4rem",
							marginBottom: "4rem",
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						<div
							ref={line1Ref}
							style={{
								display: "inline-block",
								padding: "1rem 1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								borderRadius: "1rem 1rem 0 1rem",
								fontFamily: FONT_MONO,
								fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								color: "rgba(255, 255, 255, 0.6)",
								opacity: 0,
								scale: 0,
								transformOrigin: "bottom right",
							}}
						>
							Who are you!?
						</div>
					</div>

					{/* Line 2 — left-aligned (receiver) */}
					<div style={{ minHeight: "4rem", marginBottom: "4rem" }}>
						<div
							ref={line2Ref}
							style={{
								display: "inline-block",
								padding: "1rem 1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.05)",
								borderRadius: "1rem 1rem 1rem 0",
								fontFamily: FONT_MONO,
								fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								opacity: 0,
								scale: 0,
								transformOrigin: "bottom left",
							}}
						>
							hmm, good question...
						</div>
					</div>

					{/* Line 3 — left-aligned (receiver, with typewriter) */}
					<div style={{ minHeight: "4rem", marginBottom: "4rem" }}>
						<div
							ref={line3Ref}
							style={{
								display: "inline-block",
								padding: "1rem 1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.05)",
								borderRadius: "1rem 1rem 1rem 0",
								fontFamily: FONT_MONO,
								fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								opacity: 0,
								scale: 0,
								transformOrigin: "bottom left",
							}}
						>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									alignItems: "center",
								}}
							>
								<span>I am a </span>
								<span
									style={{
										marginLeft: "0.5rem",
										color: "#fff",
										fontFamily: FONT_ACCENT,
										fontWeight: "bold",
										borderRight: "2px solid rgba(255, 255, 255, 0.8)",
										paddingRight: "4px",
										minHeight: "1.2em",
										display: "inline-block",
									}}
								>
									{displayedType}
								</span>
							</div>
						</div>
					</div>

					{/* Line 4 — right-aligned (sender) */}
					<div
						style={{
							minHeight: "4rem",
							marginBottom: "4rem",
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						<div
							ref={line4Ref}
							style={{
								display: "inline-block",
								padding: "1rem 1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								borderRadius: "1rem 1rem 0 1rem",
								fontFamily: FONT_MONO,
								fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								color: "rgba(255, 255, 255, 0.6)",
								opacity: 0,
								scale: 0,
								transformOrigin: "bottom right",
							}}
						>
							how do you manage all of this stuff!?
						</div>
					</div>

					{/* Line 5 — left-aligned (receiver) */}
					<div style={{ minHeight: "4rem", marginBottom: "0rem" }}>
						<div
							ref={line5Ref}
							style={{
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								padding: "1rem 1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.05)",
								borderRadius: "1rem 1rem 1rem 0",
								fontFamily: FONT_MONO,
								fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								opacity: 0,
								scale: 0,
								transformOrigin: "bottom left",
							}}
						>
							<span>caffeine cuz </span>
							<span
								style={{
									color: "#fff",
									fontWeight: "bold",
									marginLeft: "0.5rem",
								}}
							>
								REDBULL gives you wiiiiinggssssss
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
