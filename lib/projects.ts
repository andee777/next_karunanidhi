import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const projectsDirectory = path.join(process.cwd(), "content/projects");

const frontmatterSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.coerce.date().optional(),
	url: z.string().optional(),
	repository: z.string().optional(),
	published: z.boolean().default(false),
	tags: z.array(z.string()).default([]),
});

export type Project = z.infer<typeof frontmatterSchema> & {
	slug: string;
	content: string;
};

// Everything a card needs — keeps the MDX body out of client component props.
export type ProjectSummary = Omit<Project, "content">;

let cachedProjects: Project[] | null = null;

export function getAllProjects(): Project[] {
	if (cachedProjects) {
		return cachedProjects;
	}

	const files = fs
		.readdirSync(projectsDirectory)
		.filter((file) => file.endsWith(".mdx"));

	cachedProjects = files.map((file) => {
		const slug = file.replace(/\.mdx$/, "");
		const raw = fs.readFileSync(path.join(projectsDirectory, file), "utf8");
		const { data, content } = matter(raw);
		const frontmatter = frontmatterSchema.parse(data);

		return { slug, content, ...frontmatter };
	});

	return cachedProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
	return getAllProjects().find((project) => project.slug === slug);
}
