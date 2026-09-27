# Phase 7 — ContentOS Unified Integration

## Objective
Connect the Unified OS Project Engine to the existing ContentOS without rebuilding, copying, simplifying, or replacing ContentOS.

## Implemented
- Existing ContentOS remains at `public/contentos/index.html` unchanged.
- Added a Project ↔ Existing ContentOS Account bridge.
- Unified OS stores only `content_account_id` references in `uos_project_content_accounts`.
- Account details remain in the original `content_os_data.data._accounts` structure.
- Project Detail surfaces linked ContentOS accounts.
- ContentOS page can discover existing accounts from the authoritative ContentOS data source.
- LocalStorage is read only as a fallback for discovery when the original Supabase source is unavailable; no local copy is written by Unified OS.
- ContentOS continues to run as the full original application inside Unified OS.

## Non-goals
- No new `content_accounts` table.
- No new workflow/analytics/KPI engine.
- No content migration.
- No ContentOS schema translation.
- No destructive changes to the original ContentOS application.

## Acceptance
- One ContentOS source of truth remains.
- Project-to-account relation exists without duplicating account data.
- Existing ContentOS remains separately usable at `/contentos`.
- Project-scoped ContentOS route exists at `/projects/:id/contentos`.
- ContentOS original file hash must remain unchanged.
