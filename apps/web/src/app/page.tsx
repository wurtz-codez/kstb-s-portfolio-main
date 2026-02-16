"use client";

import { DecryptedText } from "@/components/decrypted-text";
import HeroSection from "@/components/hero-section";
import IntroLoader from "@/components/intro-loader";

import { useLoader } from "@/contexts/loader-context";

function BottomText() {
	const { loaderComplete } = useLoader();

	return (
		<div
			style={{
				position: "fixed",
				bottom: "2rem",
				left: 0,
				right: 0,
				display: "flex",
				justifyContent: "center",
				padding: "0 1rem",
			}}
		>
			<DecryptedText
				className="text-sm md:text-base"
				delay={500}
				duration={4000}
				startWhen={loaderComplete}
				style={{
					fontFamily: "var(--font-jetbrains-mono), monospace",
					fontSize: "clamp(0.875rem, 2vw, 1rem)",
					letterSpacing: "0.05em",
					lineHeight: 1.6,
					color: "rgba(255, 255, 255, 0.7)",
					textAlign: "center",
				}}
			>
				Turn ideas into production-ready digital experiences with me.
			</DecryptedText>
		</div>
	);
}

export default function Home() {
	return (
		<IntroLoader>
			<HeroSection />
			<BottomText />
		</IntroLoader>
	);
}
