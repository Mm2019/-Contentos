# CURRENT_DATA_MODEL.md

## New tables (sql/007_contentos_core.sql)

| Table | Purpose | Spec ref |
|---|---|---|
| `content_platforms` | Platform registry (YouTube, TikTok, …) | C-003 |
| `content_types` | Content type registry (Reel, Article, …) | C-004 |
| `content_platform_types` | Which types a platform supports | C-003/C-004 |
| `content_accounts` | A managed account on a platform, optionally linked to a Project | C-002 |
| `content_stage_defs` | Pipeline stages, scoped `global\|platform\|content_type\|account` | C-005, C-007 |
| `content_task_defs` | Per-stage tasks, same scoping | C-005, C-008 |
| `content_field_defs` | Metadata fields, same scoping | C-005, C-009 |
| `content_master` | One row per idea/piece of content | C-019 |
| `content_publishing_records` | One row per (master × account) — the pipeline card | C-019 |
| `content_publishing_workflow_snapshot` | Frozen resolved config at creation time | C-012 |
| `content_publishing_field_values` | Field values per publishing record | C-009 |
| `content_publishing_task_status` | Task completion per publishing record | C-008 |
| `content_publishing_approvals` | Approval gate rows — **schema only**, no enforcement logic yet | C-010 |

## Inheritance resolution
Not stored — computed at read time in `contentService.resolveEffectiveConfig()` by fetching rows scoped to `global`, `platform:<id>`, `content_type:<id>`, `account:<id>` and merging in that precedence order, keyed by `key` (stages/fields) or `stage_key::key` (tasks). Parent rows are never mutated (C-006).

## New tables (sql/009_content_intelligence.sql — session 3)

| Table | Purpose | Spec ref |
|---|---|---|
| `content_layer_groups` / `content_layers` | Content taxonomy (e.g. Pillars → Topics) used to rank content by tag, not just by platform/format | ContentOS preservation item — no C-number |
| `content_publishing_layers` | Tags a publishing record with one or more layer values | — |
| `content_learning_signals` | Reviewable insight cards with an evidence trail and accept/reject/applied lifecycle | C-040 |

The "recommendations engine" (C-041) has no dedicated table — it's a pure function (`src/lib/intelligenceEngine.js`) computed on demand from existing analytics entries, not a stored/cached result.

## New tables (sql/008_content_analytics.sql — session 2)

| Table | Purpose | Spec ref |
|---|---|---|
| `content_raw_metrics` | Raw metric registry (views, likes, revenue, …), scoped like stages/tasks/fields | C-020 |
| `content_kpi_defs` | KPI formulas (`calc` + `inputs` + `target_config` jsonb), same scoping | C-021, C-023, C-024 |
| `content_canonical_metrics` / `content_metric_mappings` | Cross-platform metric normalization — **schema only, no UI yet** | C-026, C-027 |
| `content_post_analytics_entries` | One row per (publishing record × date); `computed` + `kpi_defs_snapshot` frozen at save time, multiple rows = history | C-028, C-030, C-031 |

The KPI formula engine (`src/lib/kpiEngine.js`) is ported near-verbatim from the original ContentOS app's hand-written expression parser — never `eval()`/`new Function()`.

## Explicitly out of scope this phase (still using nothing / not modeled)
- Content experiment tracking (C-042, P2) — hypothesis/control/variant/result — no tables yet.
- Content templates, batch creation, repurposing workflow (C-015/016/017).
- Product/SaaS OS, E-commerce OS, Marketplace OS, Delivery OS, SEO/Affiliate/Digital Products/Creator Business OS (specs §18–25) — no tables, no UI.
- Everything under Phase A/B/C/D/E/G–K in the spec's §58 implementation order that isn't the ContentOS slice above (Task OS, Calendar, Goals, Command Center, Finance ledger hardening, migrations/backup/restore, audit log, etc.)
