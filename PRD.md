# Product Requirements Document

## Product

Business AI Workspace is a sector-aware business dashboard used to demonstrate a future business intelligence product to prospective clients. It makes a shared platform feel tailored to a clinic, retailer, restaurant, construction company, property business, academy, factory, or IT service provider.

## Target users

- Business owners evaluating an operational dashboard
- Department leads who need a sector-relevant overview
- Sales/demo teams presenting a tailored product concept

## Demo goals

1. A client can open a direct sector link and immediately see relevant terminology, KPIs, colors, navigation, and mock records.
2. Sector switching changes the workspace coherently without a page refresh.
3. Shared screens remain recognizably the same product while adapting titles and context to each sector.
4. The demo is fast, self-contained, and usable without external services.

## In scope

- Sector switcher and shareable `/demo/{sector}` routes
- Sector-specific dashboard metrics, charts, action briefs, sidebar groups, and page titles
- Mock records for finance, customer follow-ups, demand/pipeline, projects/assets, and queues
- Browser-local demo interactions: create/delete records and mark follow-ups complete
- Responsive desktop and mobile navigation

## Supported sector demos

Clinic, IT Services, Retail, Restaurant & Cafe, Construction, Real Estate, Education & Training, and Factory.

## Non-goals for this phase

- Real user accounts, authorization, or tenant isolation
- Supabase/Postgres persistence
- Telegram/file ingestion
- Gemini/LLM calls
- Production accounting, POS, appointment, LMS, CRM, or project-management workflows
- A different full page implementation for every sector

## Success criteria

- Overview/Finance income, expense, profit, chart buckets and category totals reconcile to dated transaction rows in the same selected period.
- Sales funnel, source counts and table use one creation-date cohort. Amounts include quantity; new leads do not count as received income.
- Undefined percentage denominators display an em dash; empty periods show no invented activity.
- Budgets are inclusive calendar-prorated monthly plans, with actual percentages allowed above 100%.
- The UI identifies demo reporting dates and snapshot-only content. Undated queues and operational roster data are not represented as period-derived measurements. Smart Suggestions and action briefs are rule-based calculations, not LLM output.

- Every listed demo URL builds and renders.
- Navigation and page headers match the selected sector.
- No external setup is required to show a realistic demo.
- `npm run build` succeeds.

## Future phase triggers

Move to a backend phase only after a client validates a sector and identifies the specific data sources/workflows they need. The first backend increment should model workspace, sector, users, and source records before AI or messaging integrations.

## Record-based suggestions

Existing Smart Suggestions, dashboard action briefs, and header notifications share `src/lib/insights.ts` through `useInsights()`. Rules flag selected-period expenses above the calendar-prorated budget, recorded income below the calendar-prorated target, and currently outstanding follow-ups due within the period before its end date. Follow-up counts use current completion state; there is no historical completion log. Customer Service uses the same deadline calculation and displays the reporting reference date. Completing a follow-up removes it through the existing context action and immediately recalculates suggestions.

Review links filter existing Customer Service (`?filter=overdue`) and Finance (`?filter=income` or `?filter=expense`) tables. Filters can be cleared; finance KPIs retain the full reporting period. Financial rules use the shared metrics engine. Invalid periods produce no findings; empty periods can still show an income shortfall against a configured target. Suggestions are derived in memory and do not change cached record formats or require a backend. Static sector `aiBriefs` fixtures remain legacy configuration.
