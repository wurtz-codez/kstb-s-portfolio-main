"use client";

import LenisScrollProvider from "@/components/lenis-scroll-provider";
import { LoaderProvider } from "@/contexts/loader-context";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			disableTransitionOnChange
			enableSystem
		>
			<LenisScrollProvider>
				<LoaderProvider>
					{children}
					<Toaster richColors />
				</LoaderProvider>
			</LenisScrollProvider>
		</ThemeProvider>
	);
}
