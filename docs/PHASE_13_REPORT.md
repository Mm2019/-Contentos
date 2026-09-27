# Phase 13 — Marketplace OS Report

## Goal
Implement the Marketplace vertical as a project-capable subsystem while preserving source-of-truth boundaries:

- Marketplace owns listings, categories, deal/dispute/safety state, verification, trust, reviews and reports.
- Commerce owns Products, Orders and Customers.
- Finance owns monetary ledger transactions.
- Shared People/identity remains the identity source; Marketplace stores references rather than a second People database.
- Existing ContentOS remains authoritative for Content and is untouched.

## Delivered

- Listings
- Category-aware dynamic attributes via `attribute_schema` + listing `attributes`
- Deals with optional Commerce Order and Finance Transaction links
- Verification records without storing sensitive evidence blobs in the Marketplace schema
- Trust scores and risk signals
- Reviews
- Reports
- Disputes with optional Finance linkage
- Safety events
- Workspace and Project-scoped Marketplace routes
- Project Profile routing for the Marketplace module
- Marketplace navigation entry
- RLS policies on all Marketplace tables

## Source-of-truth boundaries

```text
Marketplace Listing
      │
      ├── Category attributes (Marketplace)
      ├── Deal state (Marketplace)
      │      ├── Commerce Order (Commerce source of truth)
      │      └── Finance Transaction (Finance source of truth)
      ├── Trust / Verification (Marketplace)
      ├── Reviews / Reports (Marketplace)
      └── Safety / Disputes (Marketplace)
```

No duplicate `content_*` schema is introduced by this phase.

## Validation

- TypeScript parser/static syntax check across all active JS/JSX: PASS.
- ContentOS original `index.html` SHA-256 comparison: MATCH.
- Marketplace table count: 9.
- RLS policy block present and applied to all 9 Marketplace tables.
- Project/global Marketplace routes present.
- Marketplace module is project-linkable.
- Vite/browser runtime: NOT VERIFIED (dependency installation timed out in the execution environment).
- Live Supabase migration: NOT VERIFIED.
