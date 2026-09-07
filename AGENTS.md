# Agent Guide — Business AI Workspace

## Product state

This is a **frontend-only client demo** built with Next.js 16.2.2, React 19, TypeScript, Tailwind CSS v4, shadcn-style UI components, and local mock data. Do not add Supabase, Telegram, Gemini, Prisma, or production authentication unless the task explicitly requests that phase.

## Commands

```bash
npm run dev      # local development at http://localhost:3000
npm run lint     # ESLint; resolve errors before handoff
npm run build    # production build and TypeScript verification
npm run start    # serve a built app
```

There is no automated test suite. A relevant implementation must pass `npm run build`.

## Architecture rules

- Treat `src/data/industries.ts` as the source of truth for sector identity, theme, KPIs, navigation, and mock records.
- Keep one shared screen per capability. Use `src/lib/sector-page-copy.ts` and the current industry config for labels, descriptions, table copy, and forms rather than duplicating pages by sector.
- Use `useIndustry()` for sector-aware screens. Demo data mutations go through its public actions so state and `localStorage` remain in sync.
- Shareable demo URLs live under `src/app/demo/[sector]`. Add a URL slug in `demoSlugToIndustry` when adding a sector.
- Preserve the stale-cache migration behavior in `IndustryProvider`; new config fields must invalidate or safely fall back from older localStorage payloads.
- UI components live in `src/components/ui`; use Lucide icons and existing Tailwind patterns.

## Next.js 16 notes

- This app uses the App Router.
- Dynamic route `params` are asynchronous in server pages; await them.
- Keep browser-only APIs such as `localStorage` inside client components/effects.

## Documentation

Update `README.md`, `PRD.md`, and `ARCHITECTURE.md` whenever a change materially alters the demo's sectors, routes, data strategy, or backend status.
