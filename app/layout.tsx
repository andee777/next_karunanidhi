import "../global.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import {
	defaultOpenGraphImages,
	openGraphDefaults,
	siteUrl,
} from "@/lib/metadata";
import { Analytics } from "./components/analytics";
import { ThemeProvider } from "./components/theme-provider";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "karunanidhi.dev",
		template: "%s | karunanidhi.dev",
	},
	description: "Founder of karunatech.ca",
	openGraph: {
		...openGraphDefaults,
		images: defaultOpenGraphImages,
		title: "karunanidhi.dev",
		description: "Founder of karunatech.ca",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	twitter: {
		card: "summary_large_image",
	},
	icons: {
		shortcut: "/favicon.png",
	},
};
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const calSans = LocalFont({
	src: "../public/fonts/CalSans-SemiBold.ttf",
	variable: "--font-calsans",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={[
				inter.variable,
				calSans.variable,
				"bg-zinc-50 dark:bg-zinc-950",
			].join(" ")}
			suppressHydrationWarning
		>
			<head>
				<Analytics />
			</head>
			<body className="bg-zinc-50 dark:bg-zinc-950">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
