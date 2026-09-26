import Link from "next/link";
import { getAllProjects, type Project } from "@/lib/projects";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";
import { Article } from "./article";
import { ProjectGrid } from "./project-grid";

function getRequiredProject(projects: Project[], slug: string): Project {
	const project = projects.find((p) => p.slug === slug);
	if (!project) {
		throw new Error(`Missing required project content: ${slug}`);
	}
	return project;
}

export const revalidate = 60;
export default async function ProjectsPage() {
	const allProjects = getAllProjects();
	const featured = getRequiredProject(allProjects, "karuna-technologies");
	const top2 = getRequiredProject(allProjects, "fleet-car-rental");
	const top3 = getRequiredProject(allProjects, "iot-farm-platform");
	const sorted = allProjects
		.filter((p) => p.published)
		.filter(
			(project) =>
				project.slug !== featured.slug &&
				project.slug !== top2.slug &&
				project.slug !== top3.slug,
		)
		.sort(
			(a, b) =>
				new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
				new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
		);

	return (
		<div className="relative pb-16 dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-zinc-800),var(--color-zinc-950))]">
			<Navigation />
			<div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
				<div className="max-w-2xl mx-auto lg:mx-0">
					<h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
						Projects
					</h2>
					<p className="mt-4 text-zinc-400">
						Some of the projects are from work and some are on my own time.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
					<Card>
						<Link href={`/projects/${featured.slug}`}>
							<article className="relative w-full h-full p-4 md:p-8">
								<div className="flex items-center justify-between gap-2">
									<div className="text-xs text-zinc-800 dark:text-zinc-300">
										{featured.date ? (
											<time dateTime={new Date(featured.date).toISOString()}>
												{Intl.DateTimeFormat(undefined, {
													dateStyle: "medium",
												}).format(new Date(featured.date))}
											</time>
										) : (
											<span>SOON</span>
										)}
									</div>
								</div>

								<h2
									id="featured-post"
									className="mt-4 text-3xl font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white sm:text-4xl font-display"
								>
									{featured.title}
								</h2>
								<p className="mt-4 leading-8 duration-150 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300">
									{featured.description}
								</p>
								<div className="absolute bottom-4 md:bottom-8">
									<p className="hidden text-zinc-600 hover:text-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-200 lg:block">
										Read more <span aria-hidden="true">&rarr;</span>
									</p>
								</div>
							</article>
						</Link>
					</Card>

					<div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 dark:border-zinc-100/10 lg:mx-0 lg:border-t-0 ">
						{[top2, top3].map((project) => (
							<Card key={project.slug}>
								<Article project={project} />
							</Card>
						))}
					</div>
				</div>
				<div className="hidden w-full h-px md:block bg-zinc-400 dark:bg-zinc-700" />

				<ProjectGrid projects={sorted} />
			</div>
		</div>
	);
}
