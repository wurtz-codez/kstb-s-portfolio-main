"use client";

import BottomText from "@/components/bottom-text";
import HeroSection from "@/components/hero-section";
import IntroLoader from "@/components/intro-loader";

export default function Home() {
	return (
		<IntroLoader>
			<HeroSection />
			<BottomText />
		</IntroLoader>
	);
}
