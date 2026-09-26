# CLAUDE.md

@AGENTS.md

## Claude Code notes

- `.claude/launch.json` has `autoPort: true` for the dev server preview — this machine often has other local Next.js projects already holding port 3000, so the preview tool picks a free port automatically. Use the port it reports back, not 3000. There's also a `prod` config (`pnpm start`) for checking a production build.
- Canvas/animation testing in the browser pane: while the pane is hidden (or the app window is behind another window), `requestAnimationFrame` does not fire at all — even when `document.hidden` reports `false` — and screenshots/keyboard input time out. Before trusting any animation observation, measure an actual rAF tick rate in the page. To test the particles loop without a visible pane, stub `requestAnimationFrame` in a same-origin iframe, seed `Math.random`, client-navigate to `/` so `Particles` mounts fresh, and step the loop manually.
