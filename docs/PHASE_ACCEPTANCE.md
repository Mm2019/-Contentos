# Phase acceptance gates

## Track A — Unified OS foundation

### Gate A0 — Baseline
- Original ContentOS source preserved unchanged.
- ContentOS PWA assets preserved.
- Original Android WebView source preserved.
- Master specifications preserved.

### Gate A1 — Shared Core
- A single core project/task/goal/event/resource model exists.
- Dashboards read source records; no dashboard-local data copies.
- ContentOS does not get mirrored into new `content_*` tables.

### Gate A2 — Project Engine
- Project profile is configuration, not a new project entity.
- Enabled modules are per project.
- Project detail renders enabled modules only.
- A Project may link to ContentOS without owning a duplicate content engine.

### Gate A3 — Command Center
- Home aggregates Today, Attention and Project summaries.
- Quick navigation opens the source system/entity.
- Command Center does not become another source of truth.

### Gate A4 — Finance
- Financial Ledger is the one source of truth for transactions.
- Source metadata/external id prevents duplicate synced transactions.
- Project and future module views must link to the ledger instead of creating a second ledger.

## Track B — Uploaded master specification
The uploaded master specification explicitly requires phased implementation, preserving the existing ContentOS architecture and completing each phase before moving onward. fileciteturn1file0L46-L59

The first uploaded-spec ContentOS constraint is to preserve Account Configuration, inheritance, snapshots, analytics history, intelligence, permissions, migration, backup and recovery. fileciteturn1file0L65-L124

Its implementation roadmap then moves from baseline/reverse-engineering through protecting ContentOS, shared core, navigation, finance, personal OS, project profiles, and later vertical modules. fileciteturn1file0L2588-L2696 fileciteturn1file0L2700-L2750
