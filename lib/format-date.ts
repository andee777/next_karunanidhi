// Frontmatter dates are calendar dates parsed as UTC midnight. Formatting them
// with the runtime's default locale/time zone shifts them by a day west of UTC
// and makes the build machine's output differ from the browser's (hydration
// mismatch in the client-rendered project grid), so both are pinned here.
const formatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeZone: "UTC",
});

export function formatDate(date: Date): string {
	return formatter.format(date);
}
