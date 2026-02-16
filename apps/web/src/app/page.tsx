"use client";

import HeroSection from "@/components/hero-section";
import IntroLoader from "@/components/intro-loader";
import WorksSection from "@/components/works-section";

export default function Home() {
	return (
		<IntroLoader>
			<HeroSection />
			<WorksSection />
		</IntroLoader>
	);
}
