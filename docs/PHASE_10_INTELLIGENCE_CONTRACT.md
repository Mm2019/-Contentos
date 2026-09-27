# Phase 10 — Content Intelligence Contract

## Source of truth
The original ContentOS intelligence engine remains authoritative. Unified OS does not create a second recommendation or learning engine.

## Original capabilities verified
- `analyticsIntelligenceReport`
- `getContentLearning`
- `normalizeContentLearning`
- `getAllAnalyticsRecords`
- `createContentLearningSignal`
- `updateContentLearningSignal`
- `CONTENT_INTELLIGENCE_SCHEMA_VERSION`

## Pipeline
```text
Analytics
  ↓
Patterns / Trend / Weakness / Strength / Anomalies
  ↓
Recommendations
  ↓
Learning Signals
  ↓
Human Review
  ↓
Accepted / Applied Knowledge
```

## Safety rules
- Read-only scan from Unified OS.
- No rewriting of raw metrics or historical analytics.
- Recommendations are traceable to a type/title/text and the original report.
- Learning signals retain status and evidence metadata.
- No recommendation is applied automatically.
