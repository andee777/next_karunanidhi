"use client";

import { useMemo, useState } from "react";
import type { ProjectSummary } from "@/lib/projects";
import { Card } from "../components/card";
import { Article } from "./article";

type Props = {
	projects: ProjectSummary[];
};

export function ProjectGrid({ projects }: Props) {
	const [activeTag, setActiveTag] = useState<string | null>(null);

	const tags = useMemo(
		() =>
			Array.from(new Set(projects.flatMap((project) => project.tags))).sort(),
		[projects],
	);

	const filtered = activeTag
		? projects.filter((project) => project.tags.includes(activeTag))
		: projects;

	return (
		<div className="space-y-8">
			{tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setActiveTag(null)}
						aria-pressed={activeTag === null}
						className={`px-3 py-1 text-sm rounded-full border duration-200 ${
							activeTag === null
								? "bg-zinc-800 text-zinc-50 border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
								: "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
						}`}
					>
						All
					</button>
					{tags.map((tag) => (
						<button
							key={tag}
							type="button"
							onClick={() => setActiveTag(tag)}
							aria-pressed={activeTag === tag}
							className={`px-3 py-1 text-sm rounded-full border duration-200 ${
								activeTag === tag
									? "bg-zinc-800 text-zinc-50 border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
									: "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
							}`}
						>
							{tag}
						</button>
					))}
				</div>
			)}

			{filtered.length === 0 ? (
				<p className="text-zinc-600 dark:text-zinc-400">
					No projects tagged &ldquo;{activeTag}&rdquo; yet.
				</p>
			) : (
				<div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
					{[0, 1, 2].map((column) => (
						<div key={column} className="grid grid-cols-1 gap-4">
							{filtered
								.filter((_, i) => i % 3 === column)
								.map((project) => (
									<Card key={project.slug}>
										<Article project={project} />
									</Card>
								))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
