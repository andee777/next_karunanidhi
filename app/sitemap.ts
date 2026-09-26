import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
	const projectRoutes = getAllProjects()
		.filter((project) => project.published)
		.map((project) => ({
			url: `${siteUrl}/projects/${project.slug}`,
			lastModified: project.date,
		}));

	return [
		{ url: siteUrl, lastModified: new Date() },
		{ url: `${siteUrl}/projects`, lastModified: new Date() },
		{ url: `${siteUrl}/contact`, lastModified: new Date() },
		...projectRoutes,
	];
}
