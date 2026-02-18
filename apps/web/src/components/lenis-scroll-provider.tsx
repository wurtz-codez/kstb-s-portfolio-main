"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function LenisScrollProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		const lenis = new Lenis({
			lerp: 0.4,
			smoothWheel: true,
		});

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.destroy();
		};
	}, []);

	return <>{children}</>;
}
