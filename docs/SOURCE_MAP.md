# Source map

## Authoritative
`public/contentos/index.html` — original ContentOS v30.20 application. SHA-256 is recorded in the build log and matches the extracted source.

## Reference only
`legacy/v3-reusable/` — reusable infrastructure/service patterns extracted from the v3 prototype. These are not mounted as a second ContentOS runtime.

## Specifications
`docs/master-build-prompt-unified-os-contentos-v1.md` — architecture direction created after the initial audit.
`docs/ContentOS_Unified_OS_Master_Build_Prompt.md` — full uploaded master specification.

## Unified OS code
`src/` — shared shell/core/project engine/command center/finance/personal/project profile bridge/integrity screens.

## ContentOS integration rules
- `src/lib/contentosBridge.js` stores only Project ↔ Existing ContentOS Account links.
- `src/lib/contentosConfigBridge.js` is read-only and validates existing configuration/inheritance/snapshots.
- `src/lib/contentosAnalyticsBridge.js` is read-only and validates existing analytics structures, formula/scoring functions, canonical metrics, and historical snapshots.
- No duplicate `content_*` analytics schema is introduced by Unified OS.

## SQL
`sql/010_unified_os_core.sql` — shared core database.
`sql/011_finance_os.sql` — finance database.
`sql/012_personal_os.sql` — personal database.
`sql/013_project_profiles_modules.sql` — project profile/module configuration.
`sql/014_contentos_unified_integration.sql` — link-only Project ↔ ContentOS Account references.
