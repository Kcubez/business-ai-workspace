# Architecture

## Overview

The app is a static Next.js App Router demo that renders one shared business workspace through a selected industry configuration. It is deliberately frontend-only: mock data is loaded in the browser and persisted in `localStorage`.

```text
URL / sidebar switcher
        ↓
IndustryProvider (selected sector + local demo state)
        ↓
IndustryConfig + sector page copy
        ↓
Shared dashboard and workspace pages
```

## Main modules

| Location | Responsibility |
| --- | --- |
| `src/data/industries.ts` | `IndustryId`, full sector config, sidebar groups, color, KPI/chart/mock data |
| `src/data/mock-extended-data.ts` | Larger mock record sets used for pagination |
| `src/lib/extended-data-injector.ts` | Enriches base sector records for the demo |
| `src/context/industry-context.tsx` | Current sector, period state, local mutations, cache migration |
| `src/lib/sector-page-copy.ts` | Sector-aware names/subtitles for shared pages and URL slug mapping |
| `src/components/layout/dashboard-layout-client.tsx` | Desktop/mobile shell and config-driven sidebar |
| `src/app/demo/[sector]` | Static, shareable sector demo URLs |
| `src/app/*/page.tsx` | Shared capability screens: overview, finance, pipeline, follow-ups, assets, team, planning |

## Sector configuration

`IndustryConfig` keeps all presentation data required to make a shared UI sector-aware:

- identity: id, name, badge, icon, color, tagline
- navigation: `sidebarGroups`
- dashboard: KPI cards, targets, revenue sources, trends, queue, AI briefs
- shared records: demand/pipeline, finance transactions, follow-ups, assets/projects
- optional `teamMembers`: sector-owned staff roster, currently supplied by Factory

When adding a sector, add a complete config object, page copy in `sector-page-copy.ts`, an icon mapping if needed, and a demo slug.

## State and persistence

`src/lib/metrics.ts` owns inclusive reporting bounds, calendar budget proration, dated record selection, funnel ratios, transaction/category totals and chart buckets. `use-reporting-metrics.ts` supplies this same result to Overview, Finance and Sales. Financial actuals come only from transactions; demand mutations never change revenue. Funnel qualified counts include quoted, pending and closed records; overall win rate is closed/all, while close rate is closed/qualified. No stage history is available, so velocity is not displayed. Demand `createdDate` is optional for backward compatibility, with an explicit 2026-06-25 legacy snapshot fallback. Follow-up counts use due dates and an explicitly displayed snapshot reference date.

`extended-data-injector.ts` appends deterministic historical mock rows for every month in 2025 and January–August 2026. It keeps current June 2026 seed rows intact and gives every generated lead, transaction, and follow-up a real date so period selection remains a true filter.

`IndustryProvider` initializes enriched mock data, then restores these browser values:

- `mot_selected_industry`
- `mot_custom_industry_data_v4`

Record actions update in-memory state and write it back to localStorage. Cache restoration merges valid saved record collections into current source configuration, preserving empty arrays and intentional deletions. Invalid collections fall back independently to enriched seed data. Cached targets/navigation never override source configuration. Newly added sectors and optional configuration fields (such as Factory’s team roster) come from fresh source defaults even when older cached payloads omit them. Legacy actual KPI and trend fixtures are retained in the data schema but are no longer used as calculated reporting actuals.

## Top Header Bar & Shell Polish

The workspace shell features a unified sticky `TopHeaderBar` providing:
- Global command search (⌘K shortcut styling with live filter for sector operations & project items)
- Dynamic sector notifications center with unread counters and AI action brief digests
- Period selector dropdown for rapid month switching
- Collapsible desktop sidebar (256px wide vs 80px compact icon-only mode) with smooth transition

## Shareable demo routes

`/demo/[sector]` uses `generateStaticParams` to publish a fixed set of sector pages. The route translates its slug with `demoSlugToIndustry`, then the client demo wrapper selects that industry before rendering the shared dashboard.

Current slugs: `clinic`, `it`, `retail`, `restaurant`, `construction`, `real-estate`, `education`, and `factory`.

## Shared-page strategy

Avoid cloning pages such as `retail/finance` and `clinic/finance`. Shared pages read `currentIndustry` for data and use `getSectorPageCopy()` for context-sensitive headings. Extend config/page copy for terminology differences; create a dedicated route only when a sector needs a genuinely different workflow.

## Future backend boundary

When integrating a backend, replace the context's mock-state adapter while preserving the UI contract. Start with workspaces, selected sector, users, and source records. Then add integrations and AI features behind server APIs. Do not let a Telegram or LLM integration dictate the core domain model.
