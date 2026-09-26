import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";

const baseUrl = "https://karunanidhi.dev";

export default function sitemap(): MetadataRoute.Sitemap {
	const projectRoutes = getAllProjects()
		.filter((project) => project.published)
		.map((project) => ({
			url: `${baseUrl}/projects/${project.slug}`,
			lastModified: project.date,
		}));

	return [
		{ url: baseUrl, lastModified: new Date() },
		{ url: `${baseUrl}/projects`, lastModified: new Date() },
		{ url: `${baseUrl}/contact`, lastModified: new Date() },
		...projectRoutes,
	];
}
