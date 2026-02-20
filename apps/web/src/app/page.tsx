"use client";

import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntroLoader from "@/components/intro-loader";
import WorksSection from "@/components/works-section";

export default function Home() {
	return (
		<IntroLoader>
			<div className="grid min-h-svh grid-rows-[auto_1fr]">
				<Header />
				<HeroSection />
				<WorksSection />
			</div>
		</IntroLoader>
	);
}
