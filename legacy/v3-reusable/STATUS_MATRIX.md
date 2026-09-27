# STATUS_MATRIX.md
_Maintained every session from here on, per user request (session 3). Legend: ✅ done · 🟡 partial · ⬜ not started._

This tracks progress against the gap spec's own Phase A–K structure (§58) and the ContentOS item numbers (C-xxx, §14–17). It does **not** mean "production-ready" — see the acceptance rule in spec §57 (Data Model + UI + Validation + Permissions + Error handling + Loading/Empty state + Relationships + Audit + Migration + Tests + Regression). Nothing in this project has been run against a live database yet (no Supabase credentials in this environment), so treat everything below as "built and compiles," not "verified in production."

## Phase A — Architecture safety
| Item | Status | Notes |
|---|---|---|
| Shared data model | 🟡 | Exists for ContentOS only (`CURRENT_DATA_MODEL.md`). Not documented for Finance/Habits/Fitness/etc. |
| Data access/service layer | 🟡 | `contentService.js`, `contentAnalyticsService.js`, `contentIntelligenceService.js` exist. Finance/Learning/Habits/Fitness pages still call Supabase directly. |
| Validation | 🟡 | `validation.js` exists, used only by ContentOS pages. |
| Error system | 🟡 | `errors.js` exists, used only by ContentOS pages; the rest still use `alert()`/unhandled. |
| Permissions model | ⬜ | Not started anywhere in the app. |
| Audit foundation | ⬜ | Not started. |
| Schema/migration framework | ⬜ | `sql/007`–`009` are plain, non-reversible scripts, same as the presumed `sql/001`–`006`. No versioning/rollback tooling. |
| Reusable UI system | 🟡 | ContentOS pages reuse the existing app's `.card`/`.badge`/`.btn` classes and now `Charts.jsx`; no formal component library/design system doc. |

## Phase B — Core OS
⬜ Not started. (Tasks, Calendar, Goals, Areas, People, Resources, Ideas, Notes, Meetings, Decisions, Reviews)

## Phase C — Global Home
⬜ Not started. (Command Center, Today engine, Quick actions, Alerts, Search, Dashboard widgets)

## Phase D — Finance hardening
⬜ Not started this project. (Existing `Finance.jsx` from the original zip is unchanged.)

## Phase E — Project engine
⬜ Not started. (Project detail, Profiles, Enabled modules, Dynamic dashboard, Milestones, Risks, Project permissions)

## Phase F — ContentOS integration
| Item | Status | Notes |
|---|---|---|
| 1. Content accounts | ✅ | `ContentDashboard.jsx`, CRUD working |
| 2. Platform registry | ✅ | Seeded, admin via SQL only (no UI to add custom platforms yet) |
| 3. Content types | ✅ | Seeded, same as above |
| 4. Inheritance (global→platform→content type→account) | ✅ | `contentService.resolveEffectiveConfig` |
| 5. Account overrides | 🟡 | Schema + service functions support it; **UI only edits global scope** (`ContentSettings.jsx`). No per-account/per-platform override screen yet. |
| 6. Workflows | ✅ | Data-driven stage/task pipeline, gated advance |
| 7. Approvals | 🟡 | Schema exists (`content_publishing_approvals`); **no enforcement logic or UI** |
| 8. Post snapshots | ✅ | Frozen at content creation (`content_publishing_workflow_snapshot`) |
| 9. Publishing | 🟡 | Scheduling columns + `schedule()` function exist; **no UI control to set a schedule** |
| C-013 Post-level overrides | ⬜ | Not started |
| C-015 Content templates | ⬜ | Not started |
| C-016 Batch creation | ⬜ | Not started |
| C-017 Repurposing workflow | ⬜ | Not started |

## Phase G — Content analytics
| Item | Status | Notes |
|---|---|---|
| 1. Raw Metrics | ✅ | `content_raw_metrics`, admin UI in `ContentSettings.jsx` |
| 2. Platform analytics | ⬜ | "Page health" (periodic, non-post metrics) from the original app not ported |
| 3. Canonical Metrics | 🟡 | Schema only (`content_canonical_metrics`, `content_metric_mappings`); no admin UI |
| 4. KPI engine | ✅ | `kpiEngine.js`, ported verbatim from ContentOS, no eval |
| 5. Analytics entry | ✅ | `PostAnalyticsEntry.jsx`, ported from `PostKpiEntryForm` |
| 6. History/revisions | ✅ | One row per (record × date) in `content_post_analytics_entries` |
| 7. Definition snapshots | ✅ | `computed` + `kpi_defs_snapshot` frozen per entry |
| 8. Account analytics overrides | 🟡 | Schema supports account-scoped KPI defs; no UI to author them (global-only UI) |
| 9. Dashboard configuration | ⬜ | `AccountAnalytics.jsx` is a fixed layout; the original's per-account configurable widget list not ported |
| 10. Intelligence | 🟡 | **This session**: Diagnostics (`analyticsIntelligenceReport`), Layer ranking (`KpiLayerIntelligence`), Learning Signals (`KpiContentLearning`) all ported into `IntelligenceHub.jsx`. Recommendations engine (C-041) is the same pure-function report, no AI model involved, as required. **Not ported:** C-042 experiment tracking (P2, intentionally skipped) |

## Phase H — Product / SaaS
⬜ Not started.

## Phase I — Business modules
⬜ Not started. (E-commerce, Marketplace, Operations, SEO, Affiliate, Digital Products, Creator Business)

## Phase J — Personal deepening
⬜ Not started this project. (Learning/Habits/Fitness/Home pages from the original zip are unchanged — still using their original, simpler implementation.)

## Phase K — Reliability
⬜ Not started. (Security, Audit, Migrations, Backup, Restore, Observability, Performance, E2E — also see Phase A gaps above, which overlap.)

---

## Session log
- **Session 1:** Phase F items 1–4, 6, 8 (core ContentOS integration slice). Phase A items 3–4 started (`errors.js`, `validation.js`, ContentOS-only).
- **Session 2:** Phase G items 1, 4–7 (raw metrics, KPI engine, analytics entry, history, snapshots) — UI and formula engine ported directly from `ContentOS_guarded/index.html` per explicit instruction to reuse rather than rebuild.
- **Session 3 (this one):** Phase G item 10 (Intelligence: diagnostics, layer ranking, learning signals) — ported from `KpiAnalyticsIntelligence`, `KpiLayerIntelligence`, `KpiContentLearning`. Added the Content Layers taxonomy (tagging) needed to make layer ranking possible, since it didn't exist in the new schema yet. Started this status matrix.

## Recommended next steps (unchanged priority questions)
1. Canonical metrics admin UI + Phase G item 2 (platform-level "page health" metrics) — natural continuation of analytics.
2. Phase F remaining items (approval enforcement, scheduling UI, account-level override screens, templates/batch/repurposing).
3. Circle back to Phase A properly — it has now been deferred three times and every other phase depends on it.
Will keep asking before choosing, per your steer.
