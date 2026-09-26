import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mdx } from "@/app/components/mdx";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { Header } from "./header";
import "./mdx.css";

export const revalidate = 60;

type Props = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getAllProjects()
		.filter((p) => p.published)
		.map((p) => ({
			slug: p.slug,
		}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const project = getProjectBySlug(slug);

	if (!project) {
		return {};
	}

	return {
		title: project.title,
		description: project.description,
		openGraph: {
			title: project.title,
			description: project.description,
			type: "article",
		},
		twitter: {
			title: project.title,
			description: project.description,
		},
	};
}

export default async function PostPage({ params }: Props) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);

	if (!project) {
		notFound();
	}

	return (
		<div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
			<Header project={project} />

			<article className="px-4 py-12 mx-auto prose prose-zinc dark:prose-invert prose-quoteless">
				<Mdx source={project.content} />
			</article>
		</div>
	);
}
