"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import BlurText from "@/components/blur-text";
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
];

export default function AboutSection() {
	const { loaderComplete } = useLoader();
	const sectionRef = useRef<HTMLElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const [showLine1, setShowLine1] = useState(false);
	const [showLine2, setShowLine2] = useState(false);
	const [showLine3, setShowLine3] = useState(false);

	const [showLine4, setShowLine4] = useState(false);
	const [showLine5, setShowLine5] = useState(false);
	const [line1Complete, setLine1Complete] = useState(false);
	const [line2Complete, setLine2Complete] = useState(false);
	const [line3Complete, setLine3Complete] = useState(false);
	const [line4Complete, setLine4Complete] = useState(false);
	const [line4Eligible, setLine4Eligible] = useState(false);
	const [line5Eligible, setLine5Eligible] = useState(false);
	const [line3BaseDone, setLine3BaseDone] = useState(false);
	const [line3TypeDone, setLine3TypeDone] = useState(false);
	const [sequenceId, setSequenceId] = useState(0);
	const sequenceIdRef = useRef(0);

	const [activeIndex, setActiveIndex] = useState(0);
	const [displayedType, setDisplayedType] = useState(TYPES[0]);
	const currentTypeRef = useRef(TYPES[0]);
	const [hasTyped, setHasTyped] = useState(false);

	useEffect(() => {
		sequenceIdRef.current = sequenceId;
	}, [sequenceId]);

	useEffect(() => {
		if (!loaderComplete) {
			return;
		}

		const ctx = gsap.context(() => {
			// 1. Circle to Full Screen Animation on Scroll Enter
			gsap.fromTo(
				innerRef.current,
				{ clipPath: "circle(0% at 50% 50%)" },
				{
					clipPath: "circle(150% at 50% 50%)",
					ease: "none",
					scrollTrigger: {
						trigger: sectionRef.current,
						start: "top bottom", // Start as section enters viewport
						end: "top top", // Finish when section reaches top of viewport
						scrub: 2.6, // Slower smooth scrub (higher number = more smoothing lag)
					},
				}
			);

			// 2. Start chat sequence when section enters
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top 35%",
				onEnter: () => {
					setSequenceId((prev) => prev + 1);
					setActiveIndex(0);
					setDisplayedType(TYPES[0]);
					currentTypeRef.current = TYPES[0];
					setHasTyped(false);
					setShowLine1(true);
					setShowLine2(false);
					setShowLine3(false);
					setShowLine4(false);
					setShowLine5(false);
					setLine1Complete(false);
					setLine2Complete(false);
					setLine3Complete(false);
					setLine4Complete(false);
					setLine3BaseDone(false);
					setLine3TypeDone(hasTyped);
				},
				onLeaveBack: () => {
					setSequenceId((prev) => prev + 1);
					setActiveIndex(0);
					setDisplayedType(TYPES[0]);
					currentTypeRef.current = TYPES[0];
					setHasTyped(false);
					setShowLine1(false);
					setShowLine2(false);
					setShowLine3(false);
					setShowLine4(false);
					setShowLine5(false);
					setLine1Complete(false);
					setLine2Complete(false);
					setLine3Complete(false);
					setLine4Complete(false);
					setLine4Eligible(false);
					setLine5Eligible(false);
					setLine3BaseDone(false);
					setLine3TypeDone(false);
				},
			});

			// 3. Pin section and scrub through indices
			const TOTAL_STEPS = TYPES.length + 2;
			const scrollDistance = TOTAL_STEPS * 1000; // 1000px per item to slow down scrolling
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top top",
				end: `+=${scrollDistance}`,
				pin: true,
				scrub: 1, // Add smoothing
				onUpdate: (self) => {
					const progress = self.progress;
					const line4Progress = TYPES.length / TOTAL_STEPS;
					const line5Progress = (TYPES.length + 1) / TOTAL_STEPS;
					setLine4Eligible(progress >= line4Progress);
					setLine5Eligible(progress >= line5Progress);
				},
			});
		}, sectionRef);

		return () => {
			ctx.revert();
		};
	}, [loaderComplete]);

	useEffect(() => {
		if (!line1Complete || showLine2) {
			return;
		}
		setShowLine2(true);
	}, [line1Complete, showLine2]);

	useEffect(() => {
		if (!line2Complete || showLine3) {
			return;
		}
		setShowLine3(true);
	}, [line2Complete, showLine3]);

	useEffect(() => {
		if (!line3Complete || showLine4 || !line4Eligible) {
			return;
		}
		setShowLine4(true);
	}, [line3Complete, showLine4, line4Eligible]);

	useEffect(() => {
		if (!line4Complete || showLine5 || !line5Eligible) {
			return;
		}
		setShowLine5(true);
	}, [line4Complete, showLine5, line5Eligible]);

	useEffect(() => {
		if (!(line3BaseDone && line3TypeDone) || line3Complete) {
			return;
		}
		setLine3Complete(true);
	}, [line3BaseDone, line3TypeDone, line3Complete]);

	useEffect(() => {
		if (!showLine3) {
			return;
		}
		const targetText = TYPES[activeIndex] ?? "";
		if (displayedType !== targetText || !hasTyped) {
			return;
		}
		const sequenceToken = sequenceIdRef.current;
		const timeoutId = window.setTimeout(() => {
			if (sequenceIdRef.current !== sequenceToken) {
				return;
			}
			setActiveIndex((prev) => (prev + 1) % TYPES.length);
		}, 700);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [showLine3, activeIndex, displayedType, hasTyped]);

	useEffect(() => {
		if (!(showLine3 && hasTyped)) {
			return;
		}
		setLine3TypeDone(true);
	}, [showLine3, hasTyped]);

	const sequenceIdSnapshot = sequenceId;
	const handleLine1Complete = () => {
		if (sequenceIdRef.current !== sequenceIdSnapshot) {
			return;
		}
		setLine1Complete(true);
	};

	const handleLine2Complete = () => {
		if (sequenceIdRef.current !== sequenceIdSnapshot) {
			return;
		}
		setLine2Complete(true);
	};

	const handleLine3BaseComplete = () => {
		if (sequenceIdRef.current !== sequenceIdSnapshot) {
			return;
		}
		setLine3BaseDone(true);
	};

	const handleLine3TypeComplete = () => {
		if (sequenceIdRef.current !== sequenceIdSnapshot) {
			return;
		}
		setHasTyped(true);
	};

	const handleLine4Complete = () => {
		if (sequenceIdRef.current !== sequenceIdSnapshot) {
			return;
		}
		setLine4Complete(true);
	};

	// Automatic Typewriter logic handling backspaces character-by-character
	useEffect(() => {
		const targetText = TYPES[activeIndex] || "";
		let isCancelled = false;

		const animateTypewriter = async () => {
			if (currentTypeRef.current === targetText) {
				return;
			}
			// Find common prefix length
			let commonPrefixLen = 0;
			const currentText = currentTypeRef.current;
			while (
				commonPrefixLen < currentText.length &&
				commonPrefixLen < targetText.length &&
				currentText[commonPrefixLen] === targetText[commonPrefixLen]
			) {
				commonPrefixLen++;
			}

			// Backspace phase
			await processBackspace(commonPrefixLen);

			// Typing phase
			await processTyping(targetText);
		};

		const processBackspace = async (commonPrefixLen: number) => {
			while (currentTypeRef.current.length > commonPrefixLen) {
				if (isCancelled) {
					return;
				}
				currentTypeRef.current = currentTypeRef.current.slice(0, -1);
				setDisplayedType(currentTypeRef.current);
				await new Promise((r) => setTimeout(r, 40)); // Backspace speed
			}
		};

		const processTyping = async (targetText: string) => {
			while (currentTypeRef.current.length < targetText.length) {
				if (isCancelled) {
					return;
				}
				const nextChar = targetText[currentTypeRef.current.length];
				currentTypeRef.current += nextChar;
				setDisplayedType(currentTypeRef.current);
				await new Promise((r) => setTimeout(r, 80)); // Typing speed
			}
		};

		animateTypewriter();

		return () => {
			isCancelled = true;
		};
	}, [activeIndex]);

	return (
		<section
			id="about"
			ref={sectionRef}
			style={{
				backgroundColor: "transparent", // Let the mask show what's underneath
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
					backgroundColor: "#000", // Black background inside the circle mask
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
						paddingBottom: "2rem", // Reduce gap to next section
					}}
				>
					{/* Line 1 */}
					<div
						style={{
							minHeight: "4rem",
							marginBottom: "4rem", // Increased space between chats
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						{showLine1 && (
							<div
								style={{
									display: "inline-block",
									padding: "1rem 1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.1)",
									borderRadius: "1rem 1rem 0 1rem",
									fontFamily: FONT_MONO,
									fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
									color: "rgba(255, 255, 255, 0.6)",
								}}
							>
								<BlurText
									delay={150}
									direction="bottom"
									onAnimationComplete={handleLine1Complete}
									stepDuration={0.8}
									text="Who are you!?"
								/>
							</div>
						)}
					</div>

					{/* Line 2 */}
					<div style={{ minHeight: "4rem", marginBottom: "4rem" }}>
						{showLine2 && (
							<div
								style={{
									display: "inline-block",
									padding: "1rem 1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									borderRadius: "1rem 1rem 1rem 0",
									fontFamily: FONT_MONO,
									fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								}}
							>
								<BlurText
									delay={150}
									onAnimationComplete={handleLine2Complete}
									stepDuration={0.8}
									text="hmm, good question..."
								/>
							</div>
						)}
					</div>

					{/* Line 3 */}
					<div style={{ minHeight: "4rem", marginBottom: "4rem" }}>
						{showLine3 && (
							<div
								style={{
									display: "inline-block",
									padding: "1rem 1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									borderRadius: "1rem 1rem 1rem 0",
									fontFamily: FONT_MONO,
									fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								}}
							>
								<div
									style={{
										display: "flex",
										flexWrap: "wrap",
										alignItems: "center",
									}}
								>
									<BlurText
										delay={150}
										onAnimationComplete={handleLine3BaseComplete}
										stepDuration={0.8}
										text="I am a "
									/>
									<span
										style={{
											marginLeft: "0.5rem",
											color: "#fff",
											fontFamily: FONT_ACCENT, // Array texts get Telma font
											fontWeight: "bold",
											borderRight: "2px solid rgba(255, 255, 255, 0.8)",
											paddingRight: "4px",
											minHeight: "1.2em",
											display: "inline-block",
										}}
									>
										{hasTyped ? (
											displayedType
										) : (
											<BlurText
												className="m-0"
												delay={150}
												onAnimationComplete={handleLine3TypeComplete}
												stepDuration={0.8}
												text={TYPES[0]}
											/>
										)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* Line 4 */}
					<div
						style={{
							minHeight: "4rem",
							marginBottom: "4rem", // Increased space
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						{showLine4 && (
							<div
								style={{
									display: "inline-block",
									padding: "1rem 1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.1)",
									borderRadius: "1rem 1rem 0 1rem",
									fontFamily: FONT_MONO,
									fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
									color: "rgba(255, 255, 255, 0.6)",
								}}
							>
								<BlurText
									delay={150}
									direction="bottom"
									onAnimationComplete={handleLine4Complete}
									stepDuration={0.8}
									text="how do you manage all of this stuff!?"
								/>
							</div>
						)}
					</div>

					{/* Line 5 */}
					<div style={{ minHeight: "4rem", marginBottom: "0rem" }}>
						{showLine5 && (
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									alignItems: "center",
									padding: "1rem 1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									borderRadius: "1rem 1rem 1rem 0",
									fontFamily: FONT_MONO,
									fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
								}}
							>
								<BlurText delay={150} stepDuration={0.8} text="caffeine cuz " />
								<span style={{ color: "#fff", fontWeight: "bold" }}>
									<BlurText
										delay={150}
										stepDuration={0.8}
										text="REDBULL gives you wiiiiinggssssss"
									/>
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
