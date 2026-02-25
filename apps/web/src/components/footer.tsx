"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";

import BlurText from "@/components/blur-text";
import { DecryptedText } from "@/components/decrypted-text";

gsap.registerPlugin(ScrollTrigger);

const FONT_MONO = "var(--font-jetbrains-mono), monospace";

const SOCIAL_LINKS = [
	{ label: "GitHub", href: "https://github.com/wurtz-codez" },
	{ label: "Twitter / X", href: "https://x.com/wurtz_codez" },
	{ label: "LinkedIn", href: "https://www.linkedin.com/in/koustubh-pande/" },
	// { label: "Instagram", href: "https://instagram.com/koustubhpande" },
] as const;

const SELECTED_WORKS = [
	{ label: "verq", href: "https://verqai.vercel.app" },
	{ label: "arkaiv", href: "https://arkaiv.vercel.app" },
	{ label: "Jewelry by LUNA", href: "https://www.jewelrybyluna.in" },
	{
		label: "ALLROUND",
		href: "https://github.com/singularityworks-xyz/ALLROUND",
	},
] as const;

const NAV_LINKS = [
	{ label: "Home", href: "/" },
	{ label: "Projects", href: "/#works" },
	{ label: "About", href: "/#about" },
	{ label: "Contact", href: "mailto:koustubhpande021@gmail.com" },
] as const;

// Noise SVG for grain overlay
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function useISTClock(): string {
	const [time, setTime] = useState("");

	useEffect(() => {
		const update = () => {
			const now = new Date();
			const istTime = new Date(
				now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
			);
			const hours = String(istTime.getHours()).padStart(2, "0");
			const minutes = String(istTime.getMinutes()).padStart(2, "0");
			const seconds = String(istTime.getSeconds()).padStart(2, "0");
			setTime(`${hours}:${minutes}:${seconds}`);
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, []);

	return time;
}

function MagneticLink({
	href,
	children,
	external = false,
}: {
	href: string;
	children: React.ReactNode;
	external?: boolean;
}) {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const arrowRef = useRef<HTMLSpanElement>(null);
	const underlineRef = useRef<HTMLDivElement>(null);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLAnchorElement>) => {
			const el = linkRef.current;
			if (!el) {
				return;
			}
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			gsap.to(el, {
				x: x * 0.3,
				y: y * 0.2,
				duration: 0.4,
				ease: "power2.out",
			});
		},
		[]
	);

	const handlePointerEnter = useCallback(() => {
		if (arrowRef.current) {
			gsap.to(arrowRef.current, {
				x: 0,
				opacity: 1,
				duration: 0.3,
				ease: "power2.out",
			});
		}
		if (underlineRef.current) {
			gsap.fromTo(
				underlineRef.current,
				{ scaleX: 0, transformOrigin: "left" },
				{ scaleX: 1, duration: 0.4, ease: "power3.out" }
			);
		}
	}, []);

	const handlePointerLeave = useCallback(() => {
		const el = linkRef.current;
		if (el) {
			gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
		}
		if (arrowRef.current) {
			gsap.to(arrowRef.current, {
				x: -12,
				opacity: 0,
				duration: 0.2,
				ease: "power2.in",
			});
		}
		if (underlineRef.current) {
			gsap.to(underlineRef.current, {
				scaleX: 0,
				transformOrigin: "right",
				duration: 0.3,
				ease: "power2.in",
			});
		}
	}, []);

	return (
		<a
			className="relative inline-flex items-center gap-2 py-1.5 no-underline"
			href={href}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			onPointerMove={handlePointerMove}
			ref={linkRef}
			rel={external ? "noopener noreferrer" : undefined}
			style={{
				fontFamily: FONT_MONO,
				fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
				color: "rgba(255, 255, 255, 0.6)",
				transition: "color 0.3s",
				willChange: "transform",
			}}
			target={external ? "_blank" : undefined}
		>
			<span
				aria-hidden="true"
				ref={arrowRef}
				style={{
					opacity: 0,
					transform: "translateX(-12px)",
					fontSize: "0.75em",
					color: "rgba(255, 255, 255, 0.4)",
				}}
			>
				&#8594;
			</span>
			<span className="relative">
				{children}
				<div
					className="absolute bottom-0 left-0 h-px w-full scale-x-0"
					ref={underlineRef}
					style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
				/>
			</span>
		</a>
	);
}

function AnimatedLine({ delay = 0 }: { delay?: number }) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const triggerEl = triggerRef.current;
		const lineEl = lineRef.current;
		if (!(triggerEl && lineEl)) {
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				lineEl,
				{ scaleX: 0, transformOrigin: "left center" },
				{
					scaleX: 1,
					duration: 1.2,
					delay,
					ease: "power3.inOut",
					scrollTrigger: {
						trigger: triggerEl,
						start: "top 85%",
						toggleActions: "play none none none",
					},
				}
			);
		});

		return () => ctx.revert();
	}, [delay]);

	return (
		<div className="w-full py-[1px]" ref={triggerRef}>
			<div
				className="w-full scale-x-0"
				ref={lineRef}
				style={{
					height: "1px",
					background:
						"linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1), transparent)",
				}}
			/>
		</div>
	);
}

function StaggeredRevealRow({
	children,
	delay = 0,
}: {
	children: React.ReactNode;
	delay?: number;
}) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const targetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const triggerEl = triggerRef.current;
		const targetEl = targetRef.current;
		if (!(triggerEl && targetEl)) {
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				targetEl,
				{
					opacity: 0,
					y: 40,
					clipPath: "inset(0 0 100% 0)",
				},
				{
					opacity: 1,
					y: 0,
					clipPath: "inset(0 0 0% 0)",
					duration: 0.8,
					delay,
					ease: "power3.out",
					scrollTrigger: {
						trigger: triggerEl,
						start: "top 85%",
						toggleActions: "play none none none",
					},
				}
			);
		});

		return () => ctx.revert();
	}, [delay]);

	return (
		<div ref={triggerRef}>
			<div ref={targetRef} style={{ opacity: 0 }}>
				{children}
			</div>
		</div>
	);
}

function CharacterStaggerText({ text }: { text: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!(el && inView)) {
			return;
		}

		const chars = el.querySelectorAll(".stagger-char");

		const ctx = gsap.context(() => {
			gsap.fromTo(
				chars,
				{
					y: "110%",
					opacity: 0,
					rotateX: -90,
				},
				{
					y: "0%",
					opacity: 1,
					rotateX: 0,
					duration: 0.6,
					stagger: 0.03,
					ease: "power3.out",
				}
			);
		});

		return () => ctx.revert();
	}, [inView]);

	const chars = text
		.split("")
		.map((char, index) => ({ char, id: `${char}-${index}` }));

	return (
		<div
			className="flex flex-wrap overflow-hidden"
			ref={containerRef}
			style={{ perspective: "600px" }}
		>
			{chars.map(({ char, id }) => (
				<span
					className="stagger-char inline-block"
					key={id}
					style={{
						opacity: 0,
						willChange: "transform, opacity",
					}}
				>
					{char === " " ? "\u00A0" : char}
				</span>
			))}
		</div>
	);
}

function PulsingDot() {
	return (
		<span className="relative inline-flex items-center justify-center">
			<span
				className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full opacity-75"
				style={{
					backgroundColor: "rgba(74, 222, 128, 0.6)",
					animationDuration: "1.5s",
				}}
			/>
			<span
				className="relative inline-flex h-2 w-2 rounded-full"
				style={{ backgroundColor: "rgb(74, 222, 128)" }}
			/>
		</span>
	);
}

function YearCounter() {
	const [displayYear, setDisplayYear] = useState("0000");
	const yearRef = useRef<HTMLSpanElement>(null);
	const [hasAnimated, setHasAnimated] = useState(false);

	useEffect(() => {
		const el = yearRef.current;
		if (!el) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasAnimated) {
					setHasAnimated(true);
					const target = 2026;
					const duration = 1500;
					const startTime = Date.now();
					const interval = setInterval(() => {
						const elapsed = Date.now() - startTime;
						const progress = Math.min(elapsed / duration, 1);
						const eased = 1 - (1 - progress) ** 3;
						const current = Math.floor(eased * target);
						setDisplayYear(String(current).padStart(4, "0"));
						if (progress >= 1) {
							clearInterval(interval);
							setDisplayYear("2026");
						}
					}, 16);
				}
			},
			{ threshold: 0.5 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasAnimated]);

	return (
		<span
			ref={yearRef}
			style={{ fontVariantNumeric: "tabular-nums", fontFamily: FONT_MONO }}
		>
			{displayYear}
		</span>
	);
}

function ColonPulse({ time }: { time: string }) {
	const colonRefs = useRef<(HTMLSpanElement | null)[]>([]);

	useEffect(() => {
		const colons = colonRefs.current.filter(Boolean);
		if (colons.length === 0) {
			return;
		}

		const interval = setInterval(() => {
			gsap.fromTo(
				colons,
				{ opacity: 1 },
				{
					opacity: 0.3,
					duration: 0.5,
					yoyo: true,
					repeat: 1,
					ease: "power2.inOut",
				}
			);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const parts = time
		.split(":")
		.map((part, index) => ({ part, id: `colon-part-${index}` }));
	return (
		<span style={{ fontVariantNumeric: "tabular-nums", fontFamily: FONT_MONO }}>
			{parts.map(({ part, id }, i) => (
				<span key={id}>
					{part}
					{i < parts.length - 1 && (
						<span
							ref={(el) => {
								colonRefs.current[i] = el;
							}}
						>
							:
						</span>
					)}
				</span>
			))}
		</span>
	);
}

export default function Footer() {
	const footerRef = useRef<HTMLElement>(null);
	const [sectionsVisible, setSectionsVisible] = useState(false);
	const istTime = useISTClock();

	useEffect(() => {
		const el = footerRef.current;
		if (!el) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setSectionsVisible(true);
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<footer
			className="relative w-full overflow-hidden"
			ref={footerRef}
			style={{
				backgroundColor: "#000",
				background:
					"radial-gradient(ellipse at 20% 50%, rgba(30, 30, 30, 0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(20, 20, 20, 0.8) 0%, transparent 50%), #000",
				padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)",
				color: "rgba(255, 255, 255, 0.8)",
			}}
		>
			{/* Grain overlay */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-0"
				style={{
					backgroundImage: NOISE_SVG,
					backgroundRepeat: "repeat",
					opacity: 0.5,
					mixBlendMode: "overlay",
				}}
			/>

			<div className="relative z-10 mx-auto max-w-6xl">
				{/* Big heading */}
				<div className="mb-16">
					<div
						style={{
							fontFamily: "var(--font-telma)",
							fontSize: "clamp(1.75rem, 6vw, 5.5rem)",
							fontWeight: 700,
							lineHeight: 1,
							letterSpacing: "-0.02em",
							color: "rgba(255, 255, 255, 0.9)",
						}}
					>
						<CharacterStaggerText text="LET'S CONNECT" />
					</div>
					<div className="mt-4" style={{ maxWidth: "500px" }}>
						<BlurText
							animateBy="words"
							className="text-sm leading-relaxed"
							delay={80}
							direction="bottom"
							stepDuration={0.5}
							text="Have an idea? Let's build something extraordinary together."
						/>
					</div>
				</div>

				{/* First separator */}
				<AnimatedLine delay={0} />

				{/* Main grid: Connect / Selected Work / Navigation */}
				<StaggeredRevealRow delay={0.1}>
					<div
						className="grid gap-8 py-10 sm:gap-12 md:grid-cols-3"
						style={{ fontFamily: FONT_MONO }}
					>
						{/* Connect column */}
						<div className="flex flex-col gap-4">
							<div
								style={{
									fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
									textTransform: "uppercase",
									letterSpacing: "0.15em",
									color: "rgba(255, 255, 255, 0.35)",
								}}
							>
								<DecryptedText
									duration={1200}
									speed={30}
									startWhen={sectionsVisible}
								>
									Connect
								</DecryptedText>
							</div>
							<div className="flex flex-col items-start gap-1">
								{SOCIAL_LINKS.map((link) => (
									<MagneticLink external href={link.href} key={link.label}>
										{link.label}
									</MagneticLink>
								))}
							</div>
						</div>

						{/* Selected Work column */}
						<div className="flex flex-col gap-4">
							<div
								style={{
									fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
									textTransform: "uppercase",
									letterSpacing: "0.15em",
									color: "rgba(255, 255, 255, 0.35)",
								}}
							>
								<DecryptedText
									delay={200}
									duration={1200}
									speed={30}
									startWhen={sectionsVisible}
								>
									Selected Work
								</DecryptedText>
							</div>
							<div className="flex flex-col items-start gap-1">
								{SELECTED_WORKS.map((work) => (
									<MagneticLink external href={work.href} key={work.label}>
										{work.label}
									</MagneticLink>
								))}
							</div>
						</div>

						{/* Navigation column */}
						<div className="flex flex-col gap-4">
							<div
								style={{
									fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
									textTransform: "uppercase",
									letterSpacing: "0.15em",
									color: "rgba(255, 255, 255, 0.35)",
								}}
							>
								<DecryptedText
									delay={400}
									duration={1200}
									speed={30}
									startWhen={sectionsVisible}
								>
									Navigation
								</DecryptedText>
							</div>
							<div className="flex flex-col items-start gap-1">
								{NAV_LINKS.map((link) => (
									<MagneticLink href={link.href} key={link.label}>
										{link.label}
									</MagneticLink>
								))}
							</div>
						</div>
					</div>
				</StaggeredRevealRow>

				{/* Second separator */}
				<AnimatedLine delay={0.15} />

				{/* Status row */}
				<StaggeredRevealRow delay={0.2}>
					<div
						className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between"
						style={{ fontFamily: FONT_MONO }}
					>
						{/* Status label */}
						<div className="flex flex-col gap-3">
							<div
								style={{
									fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
									textTransform: "uppercase",
									letterSpacing: "0.15em",
									color: "rgba(255, 255, 255, 0.35)",
								}}
							>
								<DecryptedText
									delay={600}
									duration={1200}
									speed={30}
									startWhen={sectionsVisible}
								>
									Status
								</DecryptedText>
							</div>
							<div
								className="flex items-center gap-3"
								style={{
									fontSize: "clamp(0.8rem, 1.3vw, 0.95rem)",
									color: "rgba(255, 255, 255, 0.5)",
								}}
							>
								<span>Local Time — IST</span>
								<span
									style={{
										color: "rgba(255, 255, 255, 0.8)",
										fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
									}}
								>
									<ColonPulse time={istTime} />
								</span>
							</div>
						</div>

						{/* Availability */}
						<div
							className="flex items-center gap-3"
							style={{
								fontSize: "clamp(0.8rem, 1.3vw, 0.95rem)",
								color: "rgba(255, 255, 255, 0.6)",
							}}
						>
							<span
								style={{
									fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
									textTransform: "uppercase",
									letterSpacing: "0.15em",
									color: "rgba(255, 255, 255, 0.35)",
									marginRight: "0.5rem",
								}}
							>
								Availability
							</span>
							<PulsingDot />
							<span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
								Open to work
							</span>
						</div>
					</div>
				</StaggeredRevealRow>

				{/* Third separator */}
				<AnimatedLine delay={0.25} />

				{/* Bottom bar: email + copyright */}
				<StaggeredRevealRow delay={0.3}>
					<div
						className="flex flex-col gap-4 pt-8 pb-2 sm:flex-row sm:items-center sm:justify-between"
						style={{ fontFamily: FONT_MONO }}
					>
						{/* Email */}
						<div className="group">
							<a
								className="inline-flex items-center gap-2 no-underline transition-colors"
								href="mailto:koustubhpande021@gmail.com"
								style={{
									fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
									color: "rgba(255, 255, 255, 0.6)",
								}}
							>
								<span
									style={{
										fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
										textTransform: "uppercase",
										letterSpacing: "0.15em",
										color: "rgba(255, 255, 255, 0.35)",
										marginRight: "0.25rem",
									}}
								>
									Email
								</span>
								<DecryptedText
									className="transition-colors hover:text-white/90"
									delay={800}
									duration={2000}
									speed={25}
									startWhen={sectionsVisible}
								>
									koustubhpande021@gmail.com
								</DecryptedText>
								<span
									aria-hidden="true"
									className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-45"
									style={{ color: "rgba(255, 255, 255, 0.3)" }}
								>
									&#8599;
								</span>
							</a>
						</div>

						{/* Copyright */}
						<div
							style={{
								fontSize: "clamp(0.7rem, 1.2vw, 0.8rem)",
								color: "rgba(255, 255, 255, 0.25)",
								letterSpacing: "0.05em",
							}}
						>
							&copy; <YearCounter /> Koustubh Pande
						</div>
					</div>
				</StaggeredRevealRow>
			</div>
		</footer>
	);
}
