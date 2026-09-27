# CURRENT_ARCHITECTURE.md

## Stack
Vite + React 18 + React Router 6 + Supabase (Postgres + Auth + RLS). No SSR, no server code beyond Postgres functions/RPCs.

## Layers
- **UI (`src/pages/**`)** — one file per screen, reads `{ workspaceId, currency, role }` from `useOutletContext()` set by `Layout.jsx`.
- **Service layer (`src/lib/*Service.js`)** — new in this phase for ContentOS (`contentService.js`). Older modules (Finance, Learning, etc.) still call `supabase.from(...)` directly from the page; **this is an open Phase-A gap** — see `CURRENT_STATE.md`.
- **Shared infra (`src/lib/errors.js`, `src/lib/validation.js`)** — new in this phase (G-004, G-005). Not yet retrofitted onto the pre-existing pages.
- **Data (Postgres)** — `sql/001`–`006` (workspaces/auth/finance/etc.) were **not included** in the audited zip and are assumed, not verified. `sql/007_contentos_core.sql` (this phase) is new and self-contained, but its RLS policies assume the same `workspaces` / `workspace_members` / `projects` shape referenced by the existing frontend code — verify column names against your actual `sql/001`–`006` before running it.

## ContentOS integration model (this phase)
```
Project (optional)
  └── Content Account (platform + handle)
        └── effective config = merge(global, platform, content_type, account)
              ├── stages
              ├── tasks (per stage)
              └── fields
        └── Content Master (one idea/piece)
              └── Publishing Record (one per account/platform) ← pipeline card
                    ├── workflow snapshot (frozen at creation — C-012)
                    ├── field values
                    ├── task completion
                    └── stage (current_stage_key)
```
This intentionally does **not** reuse ContentOS's original single `content_os_data jsonb` blob table (see `ContentOS_guarded/index.html`). That model fails non-negotiable rule #8 ("do not treat localStorage/a single blob as backend source of truth") and rule #16 ("every major entity must have a clear source of truth"). Each entity now has its own table with real RLS.

## What was NOT ported from the original ContentOS app
The original `ContentOS_guarded/index.html` (7,808 lines, in-browser Babel, no build step) contains a working KPI/analytics engine, approval UI, and more account-settings screens than were rebuilt here. Only the **data model and the registry/pipeline slice** were ported into the new architecture this phase. See `CURRENT_STATE.md` for the itemized list of what's carried over vs. still pending.
