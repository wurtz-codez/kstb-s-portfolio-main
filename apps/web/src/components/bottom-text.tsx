"use client";

import { DecryptedText } from "@/components/decrypted-text";

import { useLoader } from "@/contexts/loader-context";

const POINTS = [
	"Full-Stack Product Builder",
	"AI-Driven System Designer",
	"Co-Founder of Singularity Works",
	"iOS Application Developer",
] as const;

export default function BottomText() {
	const { loaderComplete } = useLoader();

	return (
		<div
			className="bottom-text-points"
			style={{
				position: "absolute",
				bottom: "clamp(1.5rem, 5vw, 4rem)",
				left: 0,
				right: 0,
				display: "flex",
				justifyContent: "space-between",
				padding: "0 clamp(1.5rem, 5vw, 4rem)",
				gap: "1rem",
			}}
		>
			{POINTS.map((point, index) => (
				<DecryptedText
					className="text-sm md:text-base"
					delay={500 + index * 200}
					duration={3500 + index * 250}
					key={point}
					startWhen={loaderComplete}
					style={{
						fontFamily: "var(--font-jetbrains-mono), monospace",
						fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
						letterSpacing: "0.03em",
						lineHeight: 1.5,
						color: "rgb(128, 128, 128)",
						whiteSpace: "nowrap",
					}}
				>
					{point}
				</DecryptedText>
			))}
		</div>
	);
}
