"use client";

import type { Project } from "@/components/tilted-card";
import { useLoader } from "@/contexts/loader-context";
import InfiniteMenu from "./infinite-menu";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PROJECTS: Project[] = [
	{
		title: "verq",
		description: "A comprehensive AI-based platform.",
		category: "work",
		tags: ["Next.js", "AI", "React"],
		github: "https://github.com/wurtz-codez/verq",
		live: "https://verqai.vercel.app",
		gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
	},
	{
		title: "arkaiv",
		description: "AI based tools and models discovery platform.",
		category: "work",
		tags: ["Discovery", "AI"],
		github: "https://github.com/wurtz-codez/arkaiv",
		live: "https://arkaiv.vercel.app",
		gradient: "linear-gradient(135deg, #2d1b33 0%, #1a1a2e 50%, #0d1117 100%)",
	},
	{
		title: "Jewelry by LUNA",
		description: "E-commerce platform for Jewelry by LUNA.",
		category: "work",
		tags: ["E-commerce", "React"],
		github: "https://github.com/wurtz-codez/Jewelry-by-LUNA",
		live: "https://www.jewelrybyluna.in",
		gradient: "linear-gradient(135deg, #1b2838 0%, #171a21 50%, #1e2d3d 100%)",
	},
	{
		title: "ALLROUND",
		description: "Private repository from singularityworks-xyz.",
		category: "project",
		tags: ["singularityworks"],
		github: "https://github.com/singularityworks-xyz/ALLROUND",
		live: "#",
		gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a2a 50%, #1a2a2a 100%)",
	},
	{
		title: "singularityworks",
		description: "Private repository from singularityworks-xyz.",
		category: "project",
		tags: ["singularityworks"],
		github: "https://github.com/singularityworks-xyz/singularityworks",
		live: "#",
		gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1a2e 100%)",
	},
];

const items = PROJECTS.map((project, index) => ({
	image: `https://picsum.photos/${300 + index * 100}/${300 + index * 100}?grayscale`,
	link: (project.live !== "#" ? project.live : project.github) || "#",
	title: project.title,
	description: project.description,
}));

// ---------------------------------------------------------------------------
// WorksSection
// ---------------------------------------------------------------------------

export default function WorksSection() {
	const { loaderComplete } = useLoader();

	if (!loaderComplete) {
		return null; // Or some loading state if needed, though usually handled centrally
	}

	return (
		<section
			id="works"
			style={{
				position: "relative",
				overflow: "hidden",
				backgroundColor: "#000",
				zIndex: 10,
				width: "100%",
				paddingTop: "10rem",
				paddingBottom: "10rem",
			}}
		>
			<div style={{ height: "800px", position: "relative", width: "100%" }}>
				<InfiniteMenu items={items} scale={2} />
			</div>
		</section>
	);
}
