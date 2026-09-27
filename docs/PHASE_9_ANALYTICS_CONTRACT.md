# Phase 9 Analytics Contract

Unified OS may observe and aggregate analytics from the existing ContentOS, but it must not become a second source of truth.

## Authoritative chain

```text
Raw Metric
  ↓
KPI Input Reference
  ↓
KPI Formula
  ↓
Computed KPI
  ↓
Target / Benchmark / Score
  ↓
Dashboard / Intelligence
```

## Historical rule

Historical measurements remain immutable in meaning. Later changes to definitions, targets, benchmarks, or canonical mappings must not rewrite prior measurement values or snapshots.

## Integration rule

The Unified OS may surface analytics in Command Center, Project dashboards, and future Intelligence layers using read-through integrations. It must not introduce a parallel `content_*` analytics schema for the purpose of recreating ContentOS.
