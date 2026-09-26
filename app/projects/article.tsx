import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import type { ProjectSummary } from "@/lib/projects";

type Props = {
	project: ProjectSummary;
};

export const Article: React.FC<Props> = ({ project }) => {
	return (
		<Link href={`/projects/${project.slug}`}>
			<article className="p-4 md:p-8">
				<div className="flex justify-between gap-2 items-center">
					<span className="text-xs duration-1000 text-zinc-800 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
						{project.date ? (
							<time dateTime={project.date.toISOString()}>
								{formatDate(project.date)}
							</time>
						) : (
							<span>SOON</span>
						)}
					</span>
				</div>
				<h2 className="z-20 text-xl font-medium duration-1000 lg:text-3xl text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white font-display">
					{project.title}
				</h2>
				<p className="z-20 mt-4 text-sm  duration-1000 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
					{project.description}
				</p>
				{project.tags.length > 0 && (
					<div className="z-20 flex flex-wrap gap-2 mt-4">
						{project.tags.map((tag) => (
							<span
								key={tag}
								className="px-2 py-0.5 text-xs rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</article>
		</Link>
	);
};
