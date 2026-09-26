import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

export const alt = "Project preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams(): { slug: string }[] {
	return getAllProjects()
		.filter((p) => p.published)
		.map((p) => ({ slug: p.slug }));
}

function truncate(text: string, max: number): string {
	return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);

	const calSans = await readFile(
		join(process.cwd(), "public/fonts/CalSans-SemiBold.ttf"),
	);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "80px",
				background: "linear-gradient(135deg, #09090b 0%, #27272a 100%)",
			}}
		>
			<div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
				karunanidhi.dev
			</div>

			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						display: "flex",
						fontFamily: "CalSans",
						fontSize: 64,
						color: "#fafafa",
						lineHeight: 1.15,
					}}
				>
					{project?.title ?? "Project"}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 28,
						color: "#d4d4d8",
						marginTop: 24,
						maxWidth: 900,
					}}
				>
					{truncate(project?.description ?? "", 160)}
				</div>
				{project && project.tags.length > 0 && (
					<div style={{ display: "flex", gap: 12, marginTop: 32 }}>
						{project.tags.map((tag) => (
							<div
								key={tag}
								style={{
									display: "flex",
									fontSize: 22,
									color: "#e4e4e7",
									border: "1px solid #52525b",
									borderRadius: 999,
									padding: "6px 20px",
								}}
							>
								{tag}
							</div>
						))}
					</div>
				)}
			</div>
		</div>,
		{
			...size,
			fonts: [{ name: "CalSans", data: calSans, style: "normal" }],
		},
	);
}
