# Business AI Workspace

A frontend-only, multi-sector business dashboard for client demonstrations. It presents the same product shell with sector-specific navigation, KPIs, mock records, charts, and AI action briefs.

## Current mode

This repository is a static Next.js demo. It does **not** currently connect to Supabase, Telegram, Gemini, or a production authentication service. Interactive changes are held in browser `localStorage` and are suitable for demos only.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Useful checks:

```bash
npm run lint
npm run build
npm run start
```

## Demo links

- `/demo/clinic`
- `/demo/it`
- `/demo/retail`
- `/demo/restaurant`
- `/demo/construction`
- `/demo/real-estate`
- `/demo/education`

The selected sector is also persisted locally, so standard workspace pages continue in that sector after navigation.

## Included sectors

| Demo sector | Focus |
| --- | --- |
| Clinic & Healthcare | Patients, appointments, doctors, pharmacy |
| IT Services | Clients, service pipeline, projects, delivery |
| Retail | Sales, POS, inventory, customers |
| Restaurant & Cafe | Orders, menu performance, kitchen stock |
| Construction | Projects, BOQ/materials, site teams |
| Real Estate | Properties, leads, viewings, commissions |
| Education & Training | Students, courses, fees, teachers |

## Project map

Reporting uses recorded demo rows: Overview and Finance reconcile to the same dated ledger; Sales counts the same demand cohort as its table and channels. Date ranges are inclusive, from 2024-01-01 through the demo reporting cutoff 2026-09-07. Periods without records show zero/empty states. Legacy undated demands belong to the 2026-06-25 seed snapshot; new entries have an explicit record date. Monthly targets/budgets are calendar-prorated, not multiplied into actuals. Queues and AI briefs remain labeled/static demo snapshots rather than calculated live insights.

Each sector includes historical demo transactions, leads, and follow-ups for every month in 2025 and from January through August 2026. The September 2026 cutoff remains September 7.

Run calculation regression checks with `node --test tests/metrics.test.cjs`.

- `src/data/industries.ts` — sector data, navigation, colors, KPIs, and mock records
- `src/context/industry-context.tsx` — current sector, date range, and local demo mutations
- `src/lib/sector-page-copy.ts` — shared-page titles and demo URL-to-sector mapping
- `src/app/demo/[sector]` — statically generated shareable demo pages
- `src/app/*/page.tsx` — shared workspace screens reused across sectors

## Future production plan

1. Replace mock data/localStorage with Supabase and typed server APIs.
2. Add workspace, user, role, and sector data models.
3. Integrate report ingestion (Telegram/files) and AI analysis after the data model is stable.
4. Add real sector-specific modules only where their workflows require them.

See [PRD.md](PRD.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [ARCHITECTURE-ESSENTIALS.md](ARCHITECTURE-ESSENTIALS.md) for product and implementation context.
