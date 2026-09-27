# Phase 11 — Product / SaaS Contract

## Source of truth

Product/SaaS is a vertical over the Shared Core. Existing `Projects`, `Tasks`, `Goals`, `Finance`, `ContentOS`, and authentication remain authoritative for their own entities.

## Product hierarchy

```text
Product
 ↓
PRD
 ↓
Requirement
 ↓
Epic
 ↓
Feature
 ↓
Shared Core Task
```

## Feature lifecycle

```text
Idea → Discovery → Spec → Ready → In Development → QA → Beta → Released → Deprecated
```

The database stores the state; project-specific customization can be added later without creating another feature table.

## Release / quality

Releases group product work. Bugs link to Features and Releases. QA uses Test Cases, Test Runs, and Results with pass/fail/blocked evidence.

## Support / feedback

Feedback is product input and can link to a Feature. Support Tickets cover requests, complaints, disputes, questions, and product bugs with status, priority, customer, and SLA fields.

## Product analytics

Product analytics events are operational/product measurements. They are distinct from ContentOS analytics and do not replace ContentOS metrics. External connectors remain connector-ready; no real-time provider integration is claimed by this phase.

## Architectural invariants

- No duplicate Task database.
- No duplicate Finance ledger.
- No duplicate ContentOS.
- Project-scoped product records reference `project_id`.
- Backend RLS uses the existing workspace membership function.
