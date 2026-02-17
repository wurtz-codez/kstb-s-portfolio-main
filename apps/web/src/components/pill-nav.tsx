"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import "./pill-nav.css";

interface NavItem {
	label: string;
	href: string;
}

interface PillNavProps {
	items: NavItem[];
	className?: string;
	ease?: string;
	baseColor?: string;
	pillColor?: string;
	hoveredPillTextColor?: string;
	pillTextColor?: string;
	initialLoadAnimation?: boolean;
}

const LOGO_SIZE = 26;

export default function PillNav({
	items,
	className = "",
	ease = "power3.easeOut",
	baseColor = "#fff",
	pillColor = "#060010",
	hoveredPillTextColor = "#060010",
	pillTextColor,
	initialLoadAnimation = true,
}: PillNavProps) {
	const resolvedPillTextColor = pillTextColor ?? baseColor;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
	const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
	const logoRef = useRef<HTMLButtonElement>(null);
	const logoSvgRef = useRef<HTMLSpanElement>(null);
	const logoTweenRef = useRef<gsap.core.Tween | null>(null);
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const navItemsRef = useRef<HTMLDivElement>(null);
	const easeRef = useRef(ease);
	const initialLoadAnimationRef = useRef(initialLoadAnimation);

	easeRef.current = ease;
	initialLoadAnimationRef.current = initialLoadAnimation;

	const layout = useCallback(() => {
		const currentEase = easeRef.current;
		for (const circle of circleRefs.current) {
			if (!circle?.parentElement) {
				continue;
			}

			const pill = circle.parentElement;
			const rect = pill.getBoundingClientRect();
			const { width: w, height: h } = rect;
			const R = ((w * w) / 4 + h * h) / (2 * h);
			const D = Math.ceil(2 * R) + 2;
			const delta =
				Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
			const originY = D - delta;

			circle.style.width = `${String(D)}px`;
			circle.style.height = `${String(D)}px`;
			circle.style.bottom = `-${String(delta)}px`;

			gsap.set(circle, {
				xPercent: -50,
				scale: 0,
				transformOrigin: `50% ${String(originY)}px`,
			});

			const label = pill.querySelector<HTMLSpanElement>(".pill-label");
			const white = pill.querySelector<HTMLSpanElement>(".pill-label-hover");

			if (label) {
				gsap.set(label, { y: 0 });
			}
			if (white) {
				gsap.set(white, { y: h + 12, opacity: 0 });
			}

			const index = circleRefs.current.indexOf(circle);
			if (index === -1) {
				continue;
			}

			tlRefs.current[index]?.kill();
			const tl = gsap.timeline({ paused: true });

			tl.to(
				circle,
				{
					scale: 1.2,
					xPercent: -50,
					duration: 2,
					ease: currentEase,
					overwrite: "auto",
				},
				0
			);

			if (label) {
				tl.to(
					label,
					{ y: -(h + 8), duration: 2, ease: currentEase, overwrite: "auto" },
					0
				);
			}

			if (white) {
				gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
				tl.to(
					white,
					{
						y: 0,
						opacity: 1,
						duration: 2,
						ease: currentEase,
						overwrite: "auto",
					},
					0
				);
			}

			tlRefs.current[index] = tl;
		}
	}, []);

	useEffect(() => {
		const currentEase = easeRef.current;
		layout();

		const onResize = () => layout();
		window.addEventListener("resize", onResize);

		if (document.fonts?.ready) {
			document.fonts.ready.then(layout).catch(() => undefined);
		}

		const menu = mobileMenuRef.current;
		if (menu) {
			gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });
		}

		if (initialLoadAnimationRef.current) {
			const logoEl = logoRef.current;
			const navItems = navItemsRef.current;

			if (logoEl) {
				gsap.set(logoEl, { scale: 0 });
				gsap.to(logoEl, {
					scale: 1,
					duration: 0.6,
					ease: currentEase,
				});
			}

			if (navItems) {
				gsap.set(navItems, { width: 0, overflow: "hidden" });
				gsap.to(navItems, {
					width: "auto",
					duration: 0.6,
					ease: currentEase,
				});
			}
		}

		return () => window.removeEventListener("resize", onResize);
	}, [layout]);

	const handleEnter = (i: number) => {
		const tl = tlRefs.current[i];
		if (!tl) {
			return;
		}
		activeTweenRefs.current[i]?.kill();
		activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
			duration: 0.3,
			ease,
			overwrite: "auto",
		});
	};

	const handleLeave = (i: number) => {
		const tl = tlRefs.current[i];
		if (!tl) {
			return;
		}
		activeTweenRefs.current[i]?.kill();
		activeTweenRefs.current[i] = tl.tweenTo(0, {
			duration: 0.2,
			ease,
			overwrite: "auto",
		});
	};

	const handleLogoEnter = () => {
		const svgEl = logoSvgRef.current;
		if (!svgEl) {
			return;
		}
		logoTweenRef.current?.kill();
		gsap.set(svgEl, { rotate: 0 });
		logoTweenRef.current = gsap.to(svgEl, {
			rotate: 360,
			duration: 0.2,
			ease,
			overwrite: "auto",
		});
	};

	const toggleMobileMenu = () => {
		const newState = !isMobileMenuOpen;
		setIsMobileMenuOpen(newState);

		const hamburger = hamburgerRef.current;
		const menu = mobileMenuRef.current;

		if (hamburger) {
			const lines =
				hamburger.querySelectorAll<HTMLSpanElement>(".hamburger-line");
			if (newState) {
				gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
				gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
			} else {
				gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
				gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
			}
		}

		if (menu) {
			if (newState) {
				gsap.set(menu, { visibility: "visible" });
				gsap.fromTo(
					menu,
					{ opacity: 0, y: 10, scaleY: 1 },
					{
						opacity: 1,
						y: 0,
						scaleY: 1,
						duration: 0.3,
						ease,
						transformOrigin: "top center",
					}
				);
			} else {
				gsap.to(menu, {
					opacity: 0,
					y: 10,
					scaleY: 1,
					duration: 0.2,
					ease,
					transformOrigin: "top center",
					onComplete: () => {
						gsap.set(menu, { visibility: "hidden" });
					},
				});
			}
		}
	};

	const isAnchorLink = (href: string): boolean => href.startsWith("#");

	const handleScrollTo = (href: string) => {
		if (!isAnchorLink(href)) {
			return;
		}
		const targetId = href.slice(1);
		const target = document.getElementById(targetId);
		if (target) {
			target.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const cssVars = {
		"--base": baseColor,
		"--pill-bg": pillColor,
		"--hover-text": hoveredPillTextColor,
		"--pill-text": resolvedPillTextColor,
	} as React.CSSProperties;

	return (
		<div className="pill-nav-container">
			<nav
				aria-label="Primary"
				className={`pill-nav ${className}`}
				style={cssVars}
			>
				<button
					aria-label="Scroll to top"
					className="pill-logo"
					onClick={handleScrollToTop}
					onMouseEnter={handleLogoEnter}
					ref={logoRef}
					type="button"
				>
					<span ref={logoSvgRef} style={{ display: "inline-flex" }}>
						<Image
							alt="Koustubh Pande"
							height={LOGO_SIZE}
							src="/title-logo.png"
							width={LOGO_SIZE}
						/>
					</span>
				</button>

				<div className="pill-nav-items desktop-only" ref={navItemsRef}>
					<ul className="pill-list">
						{items.map((item, i) => (
							<li key={item.href}>
								{isAnchorLink(item.href) ? (
									<a
										aria-label={item.label}
										className="pill"
										href={item.href}
										onClick={(e) => {
											e.preventDefault();
											handleScrollTo(item.href);
										}}
										onMouseEnter={() => handleEnter(i)}
										onMouseLeave={() => handleLeave(i)}
									>
										<span
											aria-hidden="true"
											className="hover-circle"
											ref={(el) => {
												circleRefs.current[i] = el;
											}}
										/>
										<span className="label-stack">
											<span className="pill-label">{item.label}</span>
											<span aria-hidden="true" className="pill-label-hover">
												{item.label}
											</span>
										</span>
									</a>
								) : (
									<Link
										aria-label={item.label}
										className="pill"
										href={item.href as never}
										onMouseEnter={() => handleEnter(i)}
										onMouseLeave={() => handleLeave(i)}
									>
										<span
											aria-hidden="true"
											className="hover-circle"
											ref={(el) => {
												circleRefs.current[i] = el;
											}}
										/>
										<span className="label-stack">
											<span className="pill-label">{item.label}</span>
											<span aria-hidden="true" className="pill-label-hover">
												{item.label}
											</span>
										</span>
									</Link>
								)}
							</li>
						))}
					</ul>
				</div>

				<button
					aria-label="Toggle menu"
					className="mobile-menu-button mobile-only"
					onClick={toggleMobileMenu}
					ref={hamburgerRef}
					type="button"
				>
					<span className="hamburger-line" />
					<span className="hamburger-line" />
				</button>
			</nav>

			<div
				className="mobile-menu-popover mobile-only"
				ref={mobileMenuRef}
				style={cssVars}
			>
				<ul className="mobile-menu-list">
					{items.map((item) => (
						<li key={item.href}>
							{isAnchorLink(item.href) ? (
								<a
									className="mobile-menu-link"
									href={item.href}
									onClick={(e) => {
										e.preventDefault();
										handleScrollTo(item.href);
										setIsMobileMenuOpen(false);
									}}
								>
									{item.label}
								</a>
							) : (
								<Link
									className="mobile-menu-link"
									href={item.href as never}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{item.label}
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
