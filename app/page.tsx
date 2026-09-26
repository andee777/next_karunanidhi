import type { Metadata } from "next";
import { defaultOpenGraphImages, openGraphDefaults } from "@/lib/metadata";
import { HomeHero } from "./components/home-hero";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
	openGraph: {
		...openGraphDefaults,
		images: defaultOpenGraphImages,
		title: "karunanidhi.dev",
		description: "Founder of karunatech.ca",
		url: "/",
	},
};

export default function Home() {
	return <HomeHero />;
}
