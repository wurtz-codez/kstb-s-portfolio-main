"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { LoaderProvider } from "@/contexts/loader-context";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);
		const lenis = new Lenis({
			smoothWheel: true,
		});

		const onLenisScroll = () => {
			ScrollTrigger.update();
		};

		lenis.on("scroll", onLenisScroll);

		const raf = (time: number) => {
			lenis.raf(time);
			requestAnimationFrame(raf);
		};

		const rafId = requestAnimationFrame(raf);

		return () => {
			lenis.off("scroll", onLenisScroll);
			lenis.destroy();
			cancelAnimationFrame(rafId);
		};
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			disableTransitionOnChange
			enableSystem
		>
			<LoaderProvider>
				{children}
				<Toaster richColors />
			</LoaderProvider>
		</ThemeProvider>
	);
}
