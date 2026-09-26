import type { Metadata } from "next";

export const siteUrl = "https://karunanidhi.dev";

// Next.js replaces a parent segment's `openGraph` wholesale (no deep merge),
// so any page that sets its own `openGraph` has to spread these back in.
export const openGraphDefaults = {
	siteName: "karunanidhi.dev",
	locale: "en-US",
	type: "website",
} satisfies Metadata["openGraph"];

// Kept out of openGraphDefaults: an explicit `images` entry takes precedence
// over a route's own opengraph-image file (e.g. /projects/[slug]).
export const defaultOpenGraphImages = [
	{ url: "/logo1.png", width: 1023, height: 207 },
];
