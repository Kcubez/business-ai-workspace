# Architecture Essentials

Use this as the compact context file for an AI coding agent.

## What this app is

Frontend-only Next.js 16.2.2 / React 19 demo for a multi-sector business dashboard. No Supabase, Prisma, Telegram, Gemini, or real auth is currently connected.

## Core rule

One shared UI, configured per sector. Do not duplicate pages by industry.

## Important files

- `src/data/industries.ts`: sector source of truth — identity, theme, sidebar, KPIs, mock data
- `src/context/industry-context.tsx`: sector selection, dates, localStorage persistence, demo mutations
- `src/lib/sector-page-copy.ts`: shared-page labels and `/demo/{slug}` mapping
- `src/components/layout/dashboard-layout-client.tsx`: config-driven sidebar
- `src/app/demo/[sector]`: shareable demo pages

## Current sectors and URLs

`/demo/clinic`, `/demo/it`, `/demo/retail`, `/demo/restaurant`, `/demo/construction`, `/demo/real-estate`, `/demo/education`.

## Implementation rules

1. Add sector-specific labels/data to config first.
2. Use `useIndustry()` in sector-aware screens.
3. Keep localStorage cache compatibility when changing `IndustryConfig`.
4. Build a new page only for a genuinely distinct workflow.
5. Run `npm run build` before finishing.
