# Maintenance checks (2026-10-03)

The root project is the active city-event PWA. `rybinsk-events/` is a retained
React/Vite starter; it is upgraded and checked independently, without replacing
or deleting either project or changing the published 2025/2026 programmes.

Use Node 24 (`.nvmrc`) and `npm ci` at the root, then:

- `npm run check`: correctness lint, source/config/test typechecks, unit tests,
  production build and generated service worker
- `TZ=America/Los_Angeles npm test` and `TZ=Asia/Tokyo npm test`: timezone regression checks
- `npx playwright install chromium && npm run test:browser`: production-preview
  browser checks for responsive layouts/themes, stored routes, archive switching,
  search, blocked storage, city-time status and offline PWA startup
- `cd rybinsk-events && npm ci && npm run lint && npm run build`: retained starter

All direct packages were checked against stable npm releases. The root uses
React 19.3, Vite 8, TypeScript 7, Tailwind 4.3, Vitest 5 and current PWA tooling.
The nested starter keeps TypeScript 6.0.3 because the current typescript-eslint
peer range is `<6.1`; Node types remain on the runtime-matching 24.x LTS line.
Both lockfiles are committed and the PR CI checks both applications.

## Regression fixes

- Event instants and calendar export now use the published Rybinsk city time
  (UTC+03 in 2025/2026), independent of the viewer's device zone. Previously a
  UTC date parsed as local time moved events to the preceding day west of UTC;
  six of seven existing tests failed in that environment. Calendar values and
  DTSTAMP are exported as UTC instants. The archive's “В течение дня” entry is
  explicitly supported, and tests parse every existing event without edits.
- Storage access failures no longer crash the theme during initial render or
  toggling. Malformed favorites are validated instead of treating a stored
  string as an iterable list of single-character event IDs.
- Repeated online/offline events clear obsolete hide timers and unmount cleanup
  prevents a stale online timer from hiding a newly displayed offline warning.

No live deployment, external API calls, event content edits or service-worker
cache policy changes are included. Browser emulation does not replace testing
installation on a physical iOS/Android device before a release.
