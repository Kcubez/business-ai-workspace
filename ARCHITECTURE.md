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
| `src/data/mock-extended-data.ts` | Legacy fixtures retained for safe cache migration |
| `src/lib/curated-demo-data.ts` | Deterministic connected sector sample records |
| `src/lib/demo-data-cache.ts` | Compact browser overrides over source samples |
| `src/lib/demo-data-migration.ts` | Three-way refresh preserving saved changes |
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
- curated data: `demoProfile` services, organizations, cost categories, and seasonal patterns
- dashboard: KPI cards, targets, revenue sources, trends, queue, AI briefs
- shared records: demand/pipeline, finance transactions, follow-ups, assets/projects
- optional `teamMembers`: sector-owned staff roster, supplied by all eight sectors

When adding a sector, add a complete config object, page copy in `sector-page-copy.ts`, an icon mapping if needed, and a demo slug.

## State and persistence

`src/lib/metrics.ts` owns inclusive reporting bounds, calendar budget proration, dated record selection, funnel ratios, transaction/category totals and chart buckets. `use-reporting-metrics.ts` supplies this same result to Overview, Finance and Sales. Financial actuals come only from transactions; demand mutations never change revenue. Funnel qualified counts include quoted, pending and closed records; overall win rate is closed/all, while close rate is closed/qualified. No stage history is available, so velocity is not displayed. Demand `createdDate` is optional for backward compatibility, with an explicit 2026-06-25 legacy snapshot fallback. Follow-up counts use due dates and an explicitly displayed snapshot reference date.

`extended-data-injector.ts` builds curated deterministic samples using `curated-demo-data.ts` and sector profiles in `src/data/industries.ts`. Records span January 2025–September 7, 2026, with June 2026 as the default reporting month and June 25 as the operational queue snapshot. Fictional customers recur naturally; seasonal revenue and periodic expense spikes produce varied comparisons. Closed-demand invoices link through optional `demandRecordId` fields and match unit price × quantity. Daily closing summaries represent separate counter or recurring receipts, not duplicate invoices. Follow-ups link to open demands, sharing contact details and dates. Team rosters and additional assets remain source-owned.

`IndustryProvider` initializes enriched mock data, then restores these browser values:

- `mot_selected_industry`
- `mot_custom_industry_data_v5`

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

## Record-based suggestions

Existing Smart Suggestions, dashboard action briefs, and header notifications share `src/lib/insights.ts` through `useInsights()`. Rules flag selected-period expenses above the calendar-prorated budget, recorded income below the calendar-prorated target, and currently outstanding follow-ups due within the period before its end date. Follow-up counts use current completion state; there is no historical completion log. Customer Service uses the same deadline calculation and displays the reporting reference date. Completing a follow-up removes it through the existing context action and immediately recalculates suggestions.

Review links filter existing Customer Service (`?filter=overdue`) and Finance (`?filter=income` or `?filter=expense`) tables. Filters can be cleared; finance KPIs retain the full reporting period. Financial rules use the shared metrics engine. Invalid periods produce no findings; empty periods can still show an income shortfall against a configured target. Suggestions are derived in memory and do not change cached record formats or require a backend. Static sector `aiBriefs` fixtures remain legacy configuration.


## Operational record views

Projects/Infrastructure, Customer Service, and Team include search, filters, clickable KPI shortcuts, and compact insight panels pairing clickable status, overdue-aging, or department bar charts with priority review lists. Register titles come from sector page copy. Register attention includes non-completed items flagged Expiring Soon or due within 30 days of the selected reporting end; register rows themselves are not period-filtered. Follow-up aging (1–7, 8–14, 15+ days) uses currently outstanding records due within the reporting period, assessed at its end, and preserves overdue deep links. Team availability reflects roster status only; workload and confirmed shift coverage are not inferred. Filtering is local UI state and follow-up completion continues through IndustryProvider actions.


## Curated sample data

All sectors use fictional sample organizations, illustrative prices, specific services, and dated records. These are not real customer records or live market prices. Monthly totals vary by deterministic seasonal factors; some months miss targets or exceed expense budgets so rule-based insights have meaningful evidence. Staff availability and completed/expiring assets have varied states.

Browser data now uses `mot_custom_industry_data_v5`, storing only record upserts and removed IDs; unchanged sample history stays in source. A three-way migration compares v4 records to their legacy seed: untouched samples refresh, while saved edits, additions, intentional deletions, and emptied collections remain. Invalid collections fall back independently. The old cache is removed only after the new one saves successfully. Configuration, team rosters, and assets continue to come from the source. No backend or production integration was added.


Trend charts use calendar spacing. Nonempty reporting periods include zero recorded totals on days/months without ledger rows, labeled “No recorded transactions” in the tooltip; entirely empty periods still show an empty state. Monthly aggregates span the first through last month positions, so December aligns with the final tick rather than leaving a December-to-month-end gap. This describes recorded demo ledger activity, not external feed completeness.
