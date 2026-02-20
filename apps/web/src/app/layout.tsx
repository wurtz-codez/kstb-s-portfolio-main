import type { Metadata } from "next";

import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

const telma = localFont({
	src: [
		{
			path: "../../public/fonts/Telma-Variable.woff2",
			weight: "300 900",
			style: "normal",
		},
		{
			path: "../../public/fonts/Telma-Variable.woff",
			weight: "300 900",
			style: "normal",
		},
		{
			path: "../../public/fonts/Telma-Variable.woff2",
			weight: "300 900",
			style: "italic",
		},
		{
			path: "../../public/fonts/Telma-Variable.woff",
			weight: "300 900",
			style: "italic",
		},
	],
	variable: "--font-telma",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Koustubh Pande",
	description: "This is who I am.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${telma.variable} antialiased`}
			>
				<Providers>
					<div className="min-h-svh">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
