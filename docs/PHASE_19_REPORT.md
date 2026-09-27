# Phase 19 — Versioning + Recovery

## Goal
Provide explicit schema versioning, migration metadata, workspace snapshots, JSON backup export, safe restore, rollback, and compatibility validation without rebuilding or duplicating ContentOS recovery.

## Scope
- Schema registry
- Migration ledger
- Recovery snapshot metadata + items
- Recovery execution history
- Snapshot checksum validation
- Safe restore as a new workspace
- Rollback of restored workspace
- Versioning & Recovery UI
- Documentation and acceptance state

## Data Model Changes
- `uos_schema_registry`
- `uos_migration_log`
- `uos_recovery_snapshots`
- `uos_recovery_items`
- `uos_recovery_runs`

## UI Changes
- `/system/recovery`
- Schema version / compatibility summary
- Create manual / pre-migration snapshots
- Snapshot validation
- JSON backup download
- Safe restore into a new workspace
- Rollback of restored workspace
- Migration history
- Recovery execution history

## Security
- Recovery management requires workspace manager/admin access.
- Snapshot reads follow workspace membership.
- Restored workspaces are owned by the authenticated actor.
- Restore never overwrites the source workspace.
- Existing ContentOS security/recovery remains authoritative.

## Recovery Design
The Unified OS backup contains only workspace-scoped `uos_*` tables required for its shared-core/modules. `uos_audit_log` and recovery metadata are excluded from the portable snapshot.

The safe restore path creates a new workspace and remaps `workspace_id` while preserving entity identifiers and relations inside the snapshot. This avoids destructive overwrite and makes rollback deterministic by deleting the restored workspace.

## Tests
- TypeScript/JSX parse validation
- Import graph validation
- SQL structure/static checks
- ContentOS SHA-256 preservation check
- ZIP integrity check

## Known Limitations
- Live Supabase migration execution is not available in the current environment.
- Browser/Vite runtime is not verified until dependencies are available.
- The portable Unified OS snapshot is not a substitute for a full Supabase/Postgres physical backup.
- ContentOS native backup/restore remains outside this recovery package by design.

## Final Status
Implemented with local/static validation. Runtime/backend execution remains NOT VERIFIED.

## Next Phase
Phase 20 — Final Integration + Regression Validation.
