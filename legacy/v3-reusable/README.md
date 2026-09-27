# Unified OS — Frontend (Phase 1 slice)

Vite + React + Supabase. Reads directly from the SQL views built in `sql/001`–`006`.

## Setup
```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

## What's included (all core modules + critical gaps closed)
- Auth (sign in / sign up / password reset) via Supabase Auth
- Team workspaces: create workspace, switch between workspaces, invite members by email + role
- Home command center: net worth + today's habits
- **Finance**: accounts, **manual transaction entry (income/expense/transfer)**, net worth,
  6-month cash flow chart, category budgets, goals (+ **contribute to goal**), debts
  (+ **pay down debt**), recurring transactions (+ generate due)
- **Projects**: create/list projects, per-project revenue/expenses/net (linked via the ledger)
- Home Hub: due tasks, shopping list (auto-posts to Finance, idempotent), maintenance, low/out-of-stock inventory
- Learning: area progress (time-weighted), course/module/lesson creation, today's lessons
- Habits: one-tap logging, tiers, bad-habit "days clean" + relapse logger
- Fitness: program/workout/exercise creation, today's workout, one-tap completion, streak, week %
- Setup page: quick-add for Areas, Accounts, Categories, Habits, Rooms

## Still not built (see GAP_ANALYSIS_FULL.md for the complete list)
- Knowledge & Resource OS (Bookmarks/Ideas/Meetings/Events) — entirely new system, no SQL yet
- Fitness: Video Library UI, Progress (body/performance) entries UI, Accessory Routines UI,
  Workout Log detail fields (energy/difficulty/bodyweight)
- Learning: Study Streak, Weekly Score, Skill Matrix, Next Lesson/Continue widget
- Habits: quantitative quick-entry (typed number vs. tap-only), Weekly Focus UI, Insights
- Home: auto-add low-stock items to shopping list, "expiring soon" view
- Advanced/deferred-by-design: Assets & Investments, multi-period Budgets, ROI, Habit Health
  Score, 12-Week Fitness Score

## ContentOS module (new)
Run, in order, in the Supabase SQL editor **after** `sql/001`–`006`:
1. `sql/007_contentos_core.sql` — platforms, content types, accounts, inheritance-scoped stage/task/field
   definitions, content master + publishing records, workflow snapshots.
2. `sql/008_content_analytics.sql` — raw metrics + KPI definitions (same inheritance model), post
   analytics entries with frozen computed values/definition snapshots per entry.
3. `sql/009_content_intelligence.sql` — Content Layers taxonomy (tagging), Learning Signals.

Defaults are seeded automatically the first time you open `/content` (pipeline),
`/content/:accountId/analytics` (analytics), and `/content/:accountId/intelligence` (intelligence)
in a workspace. See `STATUS_MATRIX.md` for a phase-by-phase progress table, and `CURRENT_STATE.md`
for session-by-session detail on exactly which functions/components were reused verbatim from the
original `ContentOS_fixed_cross_browser.zip` vs. newly written, and what from the original app
hasn't been ported yet.

## Deploying
`npm run build` outputs static files to `dist/` — deployable to Vercel/Netlify/any static host,
same as the existing ContentOS app.
