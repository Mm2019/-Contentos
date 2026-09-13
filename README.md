# ContentOS v30 — Phase 20

Phase 20: Final Integration & Regression Validation.

Final release-hardening pass over the Phase 19 build.

Validated:
- inheritance and account override isolation
- stages, tasks, fields, KPIs, raw/canonical metrics
- analytics history and definition snapshots
- formula engine and target/scoring configuration
- dashboard, intelligence, learning signals
- permissions, ownership, and audit hooks
- versioning, migration, backup, snapshot, and restore paths
- system HTML download vs JSON backup separation
- PWA and Android WebView package assets
- backward-compatible migration paths

No new destructive feature was introduced.
Final application version: 30.20.

Runtime note: a full Chromium smoke test could not be completed in the build sandbox because the app waits on external runtime dependencies; this is documented in PHASE20_VALIDATION_REPORT.md.


## Supabase cross-browser authentication/data fix

The app was hardened for fresh browsers/devices. Previously, an old browser
could appear to work because it had `cos_v8` in localStorage, while a second
browser had no local copy and immediately hit the Supabase query before/without
a usable Auth session. That surfaced as "تعذر الاتصال بقاعدة البيانات".

The new build:
- restores the Supabase Auth session explicitly before loading `content_os_data`;
- never treats localStorage as the source of truth when Supabase is available;
- defers Auth-state work outside Supabase's Auth callback to avoid lock/race issues;
- matches team profiles by `authUid` first and email only as a legacy fallback;
- keeps an authenticated session when a database read temporarily fails instead
  of silently signing the user out;
- includes `SUPABASE_RLS_REPAIR.sql` with the required authenticated SELECT,
  INSERT and UPDATE policies.

Run the SQL file once in Supabase SQL Editor. Do not allow `anon` SELECT on
`content_os_data`, because that row contains the whole workspace.
