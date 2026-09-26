// Shared by the site nav (nav.tsx) and the homepage's own inline nav
// (app/page.tsx), and deliberately the same rounded-full pill shape as the tag
// filter chips on /projects. The pill fades in on hover and stays on for the
// current page. Callers add their own padding and text colors.
export const navPill =
	"rounded-full duration-200 hover:bg-zinc-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100";

export const navPillIdle =
	"text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export const navPillActive =
	"bg-zinc-200/70 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100";
