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
- The UI identifies demo reporting dates and snapshot-only content. AI briefs, undated queues and operational roster data are not represented as period-derived measurements.

- Every listed demo URL builds and renders.
- Navigation and page headers match the selected sector.
- No external setup is required to show a realistic demo.
- `npm run build` succeeds.

## Future phase triggers

Move to a backend phase only after a client validates a sector and identifies the specific data sources/workflows they need. The first backend increment should model workspace, sector, users, and source records before AI or messaging integrations.
