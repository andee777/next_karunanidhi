import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type * as React from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

function clsx(...args: unknown[]) {
	return args.filter(Boolean).join(" ");
}
const components = {
	h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h1
			className={clsx(
				"mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h2
			className={clsx(
				"mt-10 scroll-m-20 border-b border-b-zinc-800 dark:border-b-zinc-700 pb-1 text-3xl font-semibold tracking-tight first:mt-0",
				className,
			)}
			{...props}
		/>
	),
	h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h3
			className={clsx(
				"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h4
			className={clsx(
				"mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h5
			className={clsx(
				"mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h6
			className={clsx(
				"mt-8 scroll-m-20 text-base font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	a: ({
		className,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<Link
			href={href ?? "#"}
			className={clsx(
				"font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4",
				className,
			)}
			{...props}
		/>
	),
	p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p
			className={clsx("leading-7 [&:not(:first-child)]:mt-6", className)}
			{...props}
		/>
	),
	ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
		<ul className={clsx("my-6 ml-6 list-disc", className)} {...props} />
	),
	ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
		<ol className={clsx("my-6 ml-6 list-decimal", className)} {...props} />
	),
	li: ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
		<li className={clsx("mt-2", className)} {...props} />
	),
	blockquote: ({
		className,
		...props
	}: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
		<blockquote
			className={clsx(
				"mt-6 border-l-2 border-zinc-300 dark:border-zinc-700 pl-6 italic text-zinc-800 dark:text-zinc-200 [&>*]:text-zinc-600 dark:[&>*]:text-zinc-400",
				className,
			)}
			{...props}
		/>
	),
	img: ({
		className,
		alt,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		// biome-ignore lint/performance/noImgElement: markdown images have no static dimensions for next/image
		<img
			className={clsx(
				"rounded-md border border-zinc-200 dark:border-zinc-700",
				className,
			)}
			alt={alt}
			{...props}
		/>
	),
	hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
		<hr
			className="my-4 border-zinc-200 dark:border-zinc-800 md:my-8"
			{...props}
		/>
	),
	table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
		<div className="w-full my-6 overflow-y-auto">
			<table className={clsx("w-full", className)} {...props} />
		</div>
	),
	tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
		<tr
			className={clsx(
				"m-0 border-t border-zinc-300 dark:border-zinc-700 p-0 even:bg-zinc-100 dark:even:bg-zinc-900",
				className,
			)}
			{...props}
		/>
	),
	th: ({
		className,
		...props
	}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
		<th
			className={clsx(
				"border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	td: ({
		className,
		...props
	}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
		<td
			className={clsx(
				"border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
		<pre
			className={clsx(
				"mt-6 mb-4 overflow-x-auto rounded-lg bg-zinc-900 py-4",
				className,
			)}
			{...props}
		/>
	),
	code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
		<code
			className={clsx(
				"relative rounded border bg-zinc-300/25 py-[0.2rem] px-[0.3rem] font-mono text-sm text-zinc-600 dark:text-zinc-300",
				className,
			)}
			{...props}
		/>
	),
	Image,
};

interface MdxProps {
	source: string;
}

type HastElement = {
	children: Array<{ type: string; value?: string }>;
	properties: { className?: string[] };
};

export function Mdx({ source }: MdxProps) {
	return (
		<div className="mdx">
			<MDXRemote
				source={source}
				components={components}
				options={{
					mdxOptions: {
						remarkPlugins: [remarkGfm],
						rehypePlugins: [
							rehypeSlug,
							[
								rehypePrettyCode,
								{
									theme: "github-dark",
									onVisitLine(node: HastElement) {
										if (node.children.length === 0) {
											node.children = [{ type: "text", value: " " }];
										}
									},
									onVisitHighlightedLine(node: HastElement) {
										node.properties.className?.push("line--highlighted");
									},
									onVisitHighlightedWord(node: HastElement) {
										node.properties.className = ["word--highlighted"];
									},
								},
							],
							[
								rehypeAutolinkHeadings,
								{
									properties: {
										className: ["subheading-anchor"],
										ariaLabel: "Link to section",
									},
								},
							],
						],
					},
				}}
			/>
		</div>
	);
}
