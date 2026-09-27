# MASTER BUILD PROMPT — Unified OS Built Around Existing ContentOS

## 0. Mission

You are taking over an existing software ecosystem consisting of:

1. **Existing ContentOS** — the original, feature-complete ContentOS application and its current data/behavior.
2. **Unified OS v3** — a newer React/Vite/Supabase codebase that contains useful infrastructure and a partial ContentOS integration, but whose ContentOS layer must NOT be treated as the final ContentOS implementation.

Your mission is to build the **Unified OS around the existing ContentOS**, not to rebuild ContentOS inside Unified OS.

The final system must behave as one coherent OS while preserving the existing ContentOS as a first-class subsystem and source of truth for content operations.

The core rule is:

> **Existing ContentOS is an integrated subsystem and a source of truth. It must be embedded into the Unified OS without reimplementing, duplicating, simplifying, replacing, or silently changing any existing ContentOS capability. The Unified OS may extend ContentOS, provide shared services around it, and connect it to Projects, Finance, Tasks, Calendar, Goals, Business, and Personal systems while preserving all existing ContentOS behavior, data, workflows, analytics, configurations, history, permissions, snapshots, exports, backups, recovery mechanisms, and compatibility paths.**

---

# 1. Source Artifacts — Read These First

The uploaded artifacts are the authoritative starting point for the implementation audit:

- `ContentOS_fixed_cross_browser.zip` — existing ContentOS build; treat this as the existing ContentOS implementation.
- `unified-os-frontend-contentos-v3.zip` — current Unified OS v3 prototype/integration attempt.
- `Pasted markdown.md` — architectural review and correction direction supplied with the task.

Do not start by coding.

First inspect the two codebases and produce an internal architecture map that answers:

- What is the actual source of truth for ContentOS data?
- What ContentOS capabilities already exist?
- What data structures, workflows, permissions, analytics, snapshots, and recovery mechanisms already exist?
- Which parts of v3 are genuinely reusable infrastructure?
- Which v3 parts duplicate or partially reimplement ContentOS?
- Which v3 parts should be deleted, isolated, or replaced by adapters?
- What Unified OS capabilities are still missing?
- What is the minimum-safe integration path that avoids a second ContentOS?

Do not infer that a feature exists merely because a route, table, component, comment, or status file mentions it. Verify the implementation.

Do not claim something is “complete”, “verified”, “production-ready”, or “passing” unless the required validation was actually executed.

---

# 2. Non-Negotiable Architectural Decision

## Correct architecture

```text
                    UNIFIED OS
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Personal       Projects       Business
        │              │              │
        │        ┌─────┴─────┐        │
        │        │           │        │
        │      Project A   Project B  │
        │        │           │        │
        │        └─────┬─────┘        │
        │              │              │
        │         CONTENT OS          │
        │              │              │
        │    ┌─────────┼──────────┐   │
        │    │         │          │   │
        │ Accounts   Workflow   Analytics
        │ Platforms  Stages      KPIs
        │ Content    Tasks       Intelligence
        │ Types      Fields      History
        │ Approval   Publishing  Snapshots
        │
        └──────── Shared Core ────────┘
```

The relationship is:

```text
Existing ContentOS
      │
      │ preserved, wrapped, integrated
      ▼
Unified OS Shell / Shared Core
      │
      ├── Personal
      ├── Projects
      ├── Business
      ├── Finance
      ├── Tasks
      ├── Calendar
      ├── Goals
      ├── People
      ├── Resources
      ├── Search
      └── Command Center
```

The Unified OS is **built around** ContentOS, not the other way around.

---

# 3. Absolute Prohibitions

The following are architectural violations unless explicitly approved as a documented migration with a rollback plan:

### DO NOT

- Create a second ContentOS implementation.
- Create a second set of ContentOS concepts merely under different table names.
- Copy ContentOS Accounts into another “accounts” system that becomes authoritative.
- Copy ContentOS Workflows into a Unified OS workflow engine.
- Copy ContentOS KPIs into a second KPI engine.
- Copy ContentOS analytics history into another analytics history.
- Create a second intelligence engine for the same ContentOS domain.
- Create parallel ContentOS settings screens that mutate different data.
- Maintain two active sources of truth and synchronize them indefinitely.
- Rebuild working ContentOS screens merely because Unified OS uses React components elsewhere.
- Replace historical snapshots with live definitions.
- Rewrite historical analytics when current definitions change.
- Rewrite existing ContentOS post workflows when account configuration changes.
- Flatten or simplify ContentOS inheritance.
- Remove legacy compatibility fields simply because new structures look cleaner.
- Replace a working feature with a placeholder, demo, or “future” stub.
- Mark validation as PASS based only on a status file, README, or prior report.

### NEVER accept this architecture

```text
Unified OS
   └── New ContentOS tables
          └── New ContentOS UI
                 ↕ synchronization ↕
            Existing ContentOS
```

That creates **ContentOS A + ContentOS B** and is forbidden.

---

# 4. Source-of-Truth Rules

Use these rules throughout the system:

## 4.1 Existing ContentOS remains authoritative

The original ContentOS implementation and its actual persistence model remain authoritative for ContentOS behavior until a deliberate migration is designed, executed, validated, and made reversible.

A new Unified OS table is not a ContentOS source of truth just because it is normalized, relational, or easier to query.

## 4.2 Unified OS owns shared concepts

Unified OS may own concepts that are genuinely cross-domain, such as:

- users
- workspace membership
- projects
- tasks
- calendar events
- goals
- people
- resources
- notes
- meetings
- decisions
- finance transactions/ledger primitives
- global search/indexing
- notifications
- command-center aggregation
- permissions/audit infrastructure where it is truly shared

These shared services must reference ContentOS entities instead of duplicating them.

## 4.3 Integration uses references and adapters

When Unified OS needs ContentOS information:

```text
Unified OS module
      ↓
ContentOS integration contract / adapter
      ↓
Existing ContentOS source of truth
```

Do not create duplicated records merely to make the integration easier.

If a read model, cache, or search index is genuinely required for performance, it must be explicitly documented as a **derived projection**, never an authority, and must have:

- source entity ID
- source-of-truth declaration
- refresh/invalidation strategy
- rebuild path
- no mutation path that bypasses the authority

---

# 5. ContentOS Preservation Contract

When working inside or around ContentOS, preserve every existing capability that exists in the uploaded ContentOS build.

The current ContentOS architecture explicitly covers the following classes of behavior; verify each one in code and preserve it during integration.

## 5.1 Account configuration

Each Account can have isolated configuration without mutating parent/default configuration.

Preserve the inheritance chain:

```text
Global Defaults
      ↓
Platform
      ↓
Content Type
      ↓
Account Override
      ↓
Workflow / Analytics Snapshot
      ↓
Post-level Override / Historical Context
```

The implementation must preserve the distinction between:

- inherited configuration
- customized configuration
- reset-to-default behavior
- historical snapshots

## 5.2 Workflow

Preserve account-specific workflow behavior:

```text
Stage
  ↓
Tasks
  ↓
Approval
  ↓
Next Stage
```

Account-level configuration may customize stages, tasks, and fields without mutating parent defaults.

## 5.3 Historical workflow safety

For existing posts/content instances:

```text
Old Post
   ↓
existing workflow snapshot remains authoritative
```

If configuration changes today:

```text
Old Post  → old snapshot
New Post  → new effective configuration
```

Never silently rewrite old instances because defaults changed.

## 5.4 Publishing

Preserve existing publishing concepts, scheduling behavior, records, and status semantics.

If Unified OS exposes publishing information, it should link to ContentOS rather than recreate publishing logic.

## 5.5 Analytics

Preserve this architecture:

```text
Raw Metrics
      ↓
Metric Mapping / Canonical Mapping
      ↓
KPI Formula
      ↓
Computed KPI
      ↓
Target / Benchmark / Scoring
      ↓
Dashboard / Rollups
      ↓
Intelligence
```

Do not create a second KPI calculation engine for the same ContentOS domain.

## 5.6 Analytics history

Historical analytics must retain their context, including the applicable definition/snapshot, revision information, source, and recording time/date as implemented by the existing ContentOS.

Changing a KPI definition later must not retroactively change old historical results.

## 5.7 Intelligence

Preserve the existing intelligence pipeline:

```text
Analytics
   ↓
Patterns / Trends / Signals
   ↓
Insights
   ↓
Recommendations / Learning Signals
```

Intelligence outputs are derived from source analytics and must remain reviewable and traceable.

Do not silently mutate source data because an intelligence rule produced an insight.

## 5.8 Permissions and ownership

Preserve existing permission behavior and ownership semantics.

Unified OS may provide shared permission infrastructure, but it must not silently broaden ContentOS access.

Any permission migration must be explicit, testable, attributable, and backward-compatible.

## 5.9 History / audit

Preserve ContentOS history and audit semantics.

A Unified OS audit layer may aggregate or extend them, but it must not make the historical record ambiguous.

## 5.10 Automation

Preserve existing automation settings and automation behavior.

Do not replace working automation with generic task automation unless the existing behavior remains intact and clearly integrated.

## 5.11 Templates / batch creation / repurposing

Preserve all existing template, batch creation, repurposing, and related workflows found in the original ContentOS build.

Do not treat these as optional “future” features merely because they are inconvenient to port.

## 5.12 Rollups and intelligence layers

Preserve existing platform rollups, format/content-type rollups, layer intelligence, content learning, and analytics intelligence.

## 5.13 Export / backup / recovery

Preserve:

- system HTML/export behavior
- JSON backup/export/import
- version snapshots
- recovery paths
- migration compatibility
- restore behavior

Do not conflate browser/local recovery metadata with the live source of truth.

---

# 6. How to Treat Unified OS v3

The v3 codebase is **not** the final architecture. It is a pool of reusable infrastructure plus a partial ContentOS reimplementation.

Extract and reuse valuable infrastructure where it is technically sound, including patterns such as:

- React/Vite shell
- Auth foundation
- Workspace foundation
- shared validation patterns
- error handling patterns
- Supabase integration patterns
- KPI parser/engine patterns
- analytics service patterns
- intelligence service patterns
- Arabic / RTL UI patterns
- reusable layout/UI primitives

However:

> **Do not carry forward the v3 duplicated ContentOS data model as the final ContentOS source of truth.**

The v3 `content_*` schema may be used as reference material, migration research, adapter material, or reusable infrastructure only when it does not create a parallel ContentOS authority.

Before keeping any v3 ContentOS table/component/service, classify it as exactly one of:

1. reusable non-ContentOS infrastructure;
2. ContentOS adapter/integration layer;
3. derived projection/read model;
4. temporary migration tooling;
5. duplicate implementation that must be removed/deprecated.

Every retained ContentOS-related artifact must have one classification.

---

# 7. Unified OS Core

The first real building block after the integration audit is the shared Unified OS Core.

It should provide common primitives around all subsystems without absorbing their domain logic.

Core domains:

```text
Tasks
Calendar
Goals
Areas
People
Resources
Notes
Ideas
Meetings
Decisions
Reviews
Search
Notifications
Permissions
Audit
```

The shared core must provide common IDs, relationships, status conventions, validation, error handling, permissions, and navigation patterns without rewriting domain-specific engines.

---

# 8. Project Engine — The New Heart of the OS

Projects are the main bridge between Unified OS and ContentOS.

Each Project has:

```text
Project
├── Profile
├── Enabled Modules
├── Tasks
├── Goals
├── Finance
├── Calendar
├── Resources
├── ContentOS
├── Product
├── Commerce
├── CRM
├── Marketing
└── Analytics
```

Modules are configurable per project.

The OS must NOT force every project to use every subsystem.

## Example: Personal YouTube

```text
Personal YouTube
├── Overview
├── Tasks
├── Goals
├── Finance
├── Calendar
└── ContentOS
    ├── Accounts
    ├── Platforms
    ├── Content
    ├── Workflow
    ├── Publishing
    ├── Analytics
    ├── KPIs
    ├── Intelligence
    ├── History
    └── Settings
```

## Example: Koumma

```text
Koumma
├── Product
├── PRD
├── Features
├── Releases
├── QA
├── Finance
├── Marketing
├── Marketplace
└── ContentOS
    ├── YouTube Account
    ├── TikTok Account
    ├── Instagram Account
    ├── Content Pipeline
    ├── Publishing
    ├── Analytics
    ├── KPIs
    └── Intelligence
```

## Critical relationship

A Content Account can be associated with a Project.

The relationship should be:

```text
Project
   └── references ContentOS Account
```

not:

```text
Project
   └── copy of ContentOS Account
```

The ContentOS account remains the authoritative account entity.

---

# 9. Command Center / Home

The Unified OS Home must be an **aggregator**, not another database.

Conceptually:

```text
                  COMMAND CENTER
                       │
        ┌──────────────┼───────────────┐
        │              │               │
       TODAY       ATTENTION       QUICK ACTIONS
        │              │               │
        │        overdue tasks        new task
        │        budget alerts        new project
        │        pending approvals    transaction
        │        blocked projects     new idea
        │        maintenance         ...
        │
        ├── Projects
        ├── Finance
        ├── ContentOS
        ├── Learning
        ├── Habits
        ├── Fitness
        └── Home
```

The Home page must not own duplicate ContentOS data.

It queries/aggregates data from the owning systems.

---

# 10. Cross-System Integration Rules

## 10.1 No duplicated ownership

For every entity, document:

- owner subsystem
- canonical ID
- source of truth
- references from other systems
- derived projections, if any

## 10.2 Linking instead of copying

Examples:

```text
Project → Content Account
Project → Campaign
Project → Finance category
Project → Task
Project → Goal
```

should be links/relationships.

## 10.3 ContentOS remains domain-specific

Unified OS may display ContentOS data globally and connect it to other systems, but it must not absorb ContentOS-specific business rules into generic services.

ContentOS owns:

- content accounts
- platforms
- content types
- workflows
- publishing
- content analytics
- KPI definitions
- analytics history
- content intelligence
- content configuration
- content-specific permissions/history/recovery

Unified OS owns:

- global navigation
- projects
- shared tasks
- calendar
- goals
- finance integration
- global search
- notifications
- command center
- cross-system aggregations

---

# 11. Shared Services Contract

Build shared services so domain systems can integrate without duplication.

Examples:

```text
AuthService
WorkspaceService
ProjectService
TaskService
CalendarService
GoalService
FinanceService
SearchService
NotificationService
PermissionService
AuditService
```

And a specific integration boundary:

```text
ContentOSAdapter / ContentOSIntegrationService
```

This adapter should expose the minimum stable interface needed by Unified OS, such as:

- list Accounts for a project
- read Account metadata
- read Content status/pipeline summaries
- read analytics summaries
- read pending approvals
- read intelligence/attention signals
- navigate into ContentOS
- create/open supported ContentOS actions only through the authoritative ContentOS API/service boundary

Do not make Unified OS depend on internal ContentOS implementation details when a stable adapter can isolate them.

---

# 12. Data Ownership Registry

Create and maintain a living architecture document like:

```text
ENTITY                    OWNER
------------------------------------------------
User                      Unified OS shared core
Workspace                 Unified OS shared core
Project                   Unified OS
Task                      Unified OS
Calendar Event            Unified OS
Goal                      Unified OS
Finance Transaction       Finance subsystem
Content Account           Existing ContentOS
Content Platform          Existing ContentOS
Content Type              Existing ContentOS
Content Item/Post         Existing ContentOS
Workflow Definition       Existing ContentOS
Workflow Snapshot         Existing ContentOS
Publishing Record         Existing ContentOS
Analytics Measurement     Existing ContentOS
KPI Definition            Existing ContentOS
Analytics Snapshot        Existing ContentOS
Content Intelligence      Existing ContentOS
Content History           Existing ContentOS
Content Recovery          Existing ContentOS
```

Adjust this registry to the actual audited implementation, but never allow ownership ambiguity.

---

# 13. Migration Rules

Migration is allowed only when necessary and must be explicit.

A migration must include:

1. pre-migration backup;
2. source schema/version identification;
3. deterministic transformation rules;
4. stable ID mapping;
5. compatibility strategy;
6. validation checks;
7. rollback/recovery path;
8. post-migration reconciliation;
9. evidence of successful execution.

Do not run a “silent migration” merely because a relational schema looks nicer.

Do not keep both systems live as permanent synchronized authorities.

Preferred pattern:

```text
Existing ContentOS
      ↓
Controlled migration / adapter (when required)
      ↓
One canonical destination
```

not:

```text
Existing ContentOS ↔ New ContentOS forever
```

---

# 14. Authentication / Supabase / Cross-Browser Safety

Preserve the existing ContentOS cross-browser authentication/data safety behavior.

Specifically verify:

- Auth session restoration before protected data load;
- no reliance on localStorage as the backend source of truth when Supabase is available;
- no sign-out on temporary database read failures;
- authenticated RLS policies;
- correct user/team matching behavior;
- no `anon` access to sensitive workspace-wide data.

When integrating, do not regress these protections.

Any RLS changes must be reviewed as security changes, not treated as incidental schema work.

---

# 15. UI / Navigation Rules

The final application should feel like one OS, but ContentOS should remain recognizably complete inside it.

Example navigation:

```text
Unified OS
│
├── Home / Command Center
├── Tasks
├── Calendar
├── Goals
├── Finance
├── Projects
│   ├── Personal YouTube
│   │   └── ContentOS
│   └── Koumma
│       └── ContentOS
├── Personal
├── Business
└── Settings
```

Inside a project:

```text
Project
├── Overview
├── Tasks
├── Goals
├── Calendar
├── Finance
└── ContentOS
    ├── Accounts
    ├── Content
    ├── Workflow
    ├── Publishing
    ├── Analytics
    ├── KPIs
    ├── Intelligence
    ├── History
    └── Settings
```

Do not simplify ContentOS navigation to a single “Content” page.

---

# 16. Architecture Quality Rules

## 16.1 No page-level data access where service boundaries are required

Prefer:

```text
UI → domain service → source of truth
```

over:

```text
UI → direct database mutation
```

Retrofit legacy Unified OS modules gradually, without changing behavior accidentally.

## 16.2 Validation and errors

Use consistent validation and error handling across the Unified OS.

Do not replace user-facing ContentOS recovery/error behavior with generic errors that lose context.

## 16.3 Loading / empty / error states

Every new screen must explicitly handle:

- loading
- empty
- error
- success
- retry where meaningful
- permission-denied states

## 16.4 Accessibility / RTL

Preserve Arabic/RTL behavior and ensure new Unified OS screens follow the same localization/layout discipline.

---

# 17. Implementation Order

Follow this order unless the audit proves a safer dependency ordering.

```text
PHASE 0
Existing ContentOS + Unified OS full audit
        ↓
PHASE 1
Unified Architecture Foundation
        ↓
PHASE 2
Shared Core
Tasks / Calendar / Goals / Areas / People / Resources / Notes / Ideas / Meetings / Decisions / Reviews
        ↓
PHASE 3
Project Engine
Profiles / Enabled Modules / Project Dashboard / Milestones / Risks
        ↓
PHASE 4
Global Command Center
Today / Alerts / Quick Actions / Search / Aggregations
        ↓
PHASE 5
Finance OS Integration
        ↓
PHASE 6
Personal OS
Learning / Habits / Fitness / Home
        ↓
PHASE 7
Product / SaaS
        ↓
PHASE 8
E-commerce
        ↓
PHASE 9
Marketplace
        ↓
PHASE 10
SEO / Affiliate / Digital Products / Creator Business
        ↓
PHASE 11
Permissions + Audit Hardening
        ↓
PHASE 12
Migration + Backup + Recovery Hardening
        ↓
PHASE 13
Full Integration + Regression
```

Throughout every phase:

```text
                  ┌────────────────┐
                  │ EXISTING       │
                  │ CONTENTOS      │
                  │                │
                  │ DO NOT REBUILD │
                  └───────┬────────┘
                          │
                          ▼
                   USE AS SUBSYSTEM
```

---

# 18. Phase 0 Deliverables — Mandatory Before Major Coding

Produce these artifacts first:

### A. Existing ContentOS capability map

List all verified capabilities grouped by:

- Accounts
- Platforms
- Content Types
- Workflow
- Tasks
- Fields
- Approvals
- Publishing
- Calendar
- Analytics
- KPIs
- Canonical metrics
- Dashboard configuration
- Intelligence
- Learning signals
- Automation
- Templates
- Batch creation
- Repurposing
- Rollups
- Permissions
- Team
- History
- Audit
- Export
- Backup
- Recovery
- Migration
- PWA / packaging where applicable

### B. Existing ContentOS data map

For every important entity/field, document:

- where it currently lives;
- how it is loaded;
- how it is mutated;
- what owns it;
- what snapshot/history protects it;
- compatibility requirements.

### C. v3 reuse map

Classify v3 code into:

- KEEP
- ADAPT
- RELOCATE
- DEPRECATE
- REMOVE

and explain why.

### D. Integration boundary document

Define exactly how Unified OS communicates with ContentOS without becoming a second ContentOS.

### E. Migration/risk register

For every planned architectural change list:

- risk
- affected source of truth
- migration requirement
- rollback strategy
- validation requirement

Do not proceed to broad implementation until this audit is internally consistent.

---

# 19. Acceptance Criteria for ContentOS Integration

ContentOS integration is complete only when ALL of the following are true:

### Source of truth

- There is exactly one authoritative ContentOS implementation.
- There is no permanent duplicate ContentOS data model.
- There is no bidirectional synchronization between two ContentOS authorities.

### Functional preservation

- Existing ContentOS account configuration still works.
- Existing inheritance still works.
- Existing workflow behavior still works.
- Existing snapshots still protect historical instances.
- Existing analytics entry works.
- Existing analytics history works.
- Existing KPI formulas still work.
- Existing targets/benchmarks/scoring still work.
- Existing dashboard/rollups still work.
- Existing intelligence still works.
- Existing learning/intelligence feedback behavior still works.
- Existing permissions still work.
- Existing automation still works.
- Existing history/audit behavior still works.
- Existing templates/batch/repurposing behavior still works where present.
- Existing exports/backups/recovery still work.

### Unified OS integration

- Projects can reference ContentOS Accounts without copying them.
- Project dashboards can surface ContentOS summaries.
- Command Center can aggregate ContentOS attention items.
- Global search can locate ContentOS entities without becoming their source of truth.
- Tasks/Calendar/Goals/Finance can relate to Projects and ContentOS through explicit relationships.

### Historical safety

- Changing current configuration does not rewrite historical ContentOS state.
- Old workflow snapshots remain stable.
- Old analytics definition snapshots remain stable.
- Recovery paths remain usable.

### Security

- Auth/RLS protections remain intact.
- Temporary read failures do not silently sign users out.
- Sensitive workspace-wide data is not exposed to anonymous clients.

### Validation

- Build actually executed successfully.
- Lint/type checks are executed if configured.
- Automated tests actually executed if present.
- Relevant integration tests actually executed.
- Browser/runtime smoke tests are executed where feasible.
- Any environment limitation is reported as a limitation, not a PASS.

---

# 20. Regression Test Matrix

At minimum, test:

## ContentOS

- create/read/update/delete Account
- Platform inheritance
- Content Type inheritance
- Account override
- reset to default
- create new post/content item
- change defaults after old post exists
- verify old workflow snapshot remains unchanged
- advance workflow
- task completion
- approval behavior
- schedule/publishing flow
- analytics entry
- edit analytics measurement
- revision/history creation
- KPI calculation
- target/benchmark evaluation
- dashboard aggregation
- canonical metric mapping
- intelligence diagnosis
- learning signal lifecycle
- permissions
- audit/history
- backup/export
- import/restore
- version recovery

## Unified OS

- create project
- enable/disable modules
- attach existing ContentOS account to project
- detach relationship without deleting ContentOS data
- project dashboard aggregation
- command center aggregation
- search
- cross-module navigation
- shared task/calendar/goal relations
- permission boundaries

## Cross-browser

Verify:

- fresh browser login
- returning browser session
- second device/browser
- missing local cache/localStorage
- temporary network/database failure
- authenticated RLS access

---

# 21. Performance / Projection Rules

Do not introduce duplicated stores just to make dashboards easier.

For expensive global dashboards:

- prefer explicit read models/materialized projections only when justified;
- mark them as derived;
- keep source entity IDs;
- document refresh rules;
- never allow silent source divergence;
- make rebuild deterministic.

The Command Center is an aggregator, not a second database of everything.

---

# 22. Code Review Rules for Every Change

For every architectural change, ask:

1. Did this create a new source of truth?
2. Did this duplicate a ContentOS entity?
3. Did this move ContentOS business rules into a generic Unified OS service?
4. Did this mutate historical state?
5. Did this remove a compatibility path?
6. Did this weaken permissions/RLS?
7. Did this bypass a service boundary?
8. Did this introduce a second implementation of an existing ContentOS engine?
9. Is this truly a shared concern, or is it ContentOS-specific?
10. How will this be rolled back?

If any answer reveals a second authority or destructive behavior, stop and redesign before continuing.

---

# 23. Definition of Done

A phase is DONE only if:

- implementation exists;
- source-of-truth ownership is documented;
- existing behavior is preserved;
- migration/backward compatibility is addressed;
- permissions are addressed;
- loading/empty/error states exist;
- relevant tests/checks are executed;
- regression checks are executed;
- no duplicate domain authority was introduced;
- actual validation evidence is recorded.

Use explicit states:

```text
NOT STARTED
IN PROGRESS
IMPLEMENTED — NOT VERIFIED
VERIFIED
BLOCKED
```

Do not use “PASS” or “COMPLETE” as a substitute for actual verification.

---

# 24. Required Final Documentation

Maintain these living documents:

```text
ARCHITECTURE.md
DATA_OWNERSHIP.md
INTEGRATION_CONTRACTS.md
MIGRATION_PLAN.md
REGRESSION_MATRIX.md
CHANGELOG.md
VALIDATION_REPORT.md
```

Each major implementation session must update:

- what changed;
- what was deliberately not changed;
- what remains incomplete;
- what was actually verified;
- what could not be verified and why.

---

# 25. Final Operating Principle

When uncertain between:

```text
A) building a cleaner new ContentOS implementation
```

and:

```text
B) integrating the existing ContentOS through a stable boundary
```

choose **B**.

When uncertain between:

```text
A) copying ContentOS data into Unified OS
```

and:

```text
B) referencing the existing ContentOS entity
```

choose **B**.

When uncertain between:

```text
A) replacing a working ContentOS capability
```

and:

```text
B) preserving it and integrating around it
```

choose **B**.

The objective is not to make ContentOS smaller.

The objective is to make the overall system larger **without making ContentOS weaker, duplicated, fragmented, or historically unsafe**.

---

# 26. Master Principle

> **Unified OS is the operating system shell and shared platform. Existing ContentOS is the authoritative content subsystem inside that OS. Build around it, connect to it, extend it safely, and surface it globally — but do not rebuild it, duplicate it, simplify it, replace it, or create a second source of truth.**
