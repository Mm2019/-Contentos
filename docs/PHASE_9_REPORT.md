# Phase 9 — ContentOS Analytics Engine Hardening

## Goal
Harden and verify the analytics engine that already exists inside the original ContentOS without creating a second analytics subsystem in Unified OS.

## Implemented
- Read-only Analytics Integrity bridge to the existing ContentOS runtime.
- Verification of Content Type Raw Metrics definitions and KPI input metric references.
- Verification of Platform Analytics metric definitions and optional Canonical Metric mapping.
- Verification of the Canonical Metric Registry without replacing platform-native metrics.
- Verification of KPI calculation types and target/benchmark configuration.
- Verification of historical analytics entries for `revision`, `recordedAt`, `source`, `definitionSnapshot`, and `history`.
- Read-only smoke test against the original ContentOS formula evaluator and KPI scoring function.
- Unified OS route: `/contentos/analytics`.
- Unified OS navigation entry for Analytics Integrity.

## Non-goals
- No duplicate analytics tables.
- No second KPI engine.
- No copied Raw Metrics repository.
- No mutation of historical Analytics records by the Unified OS verifier.
- No external analytics API connector is claimed or introduced.

## Source of Truth
Existing ContentOS remains authoritative for Raw Metrics, Platform Analytics, Canonical Metrics, KPI formulas, targets, benchmarks, scoring, revisions, snapshots, and history.

## Runtime status
Static/source validation is performed locally on this phase package. Browser/Vite runtime and live Supabase execution remain `NOT VERIFIED` when the environment cannot provide the project's external runtime dependencies/backend.
