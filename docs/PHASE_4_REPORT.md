# Phase 4 — Finance OS

## Current Phase
Phase 4 — Finance OS

## Goal
Implement the shared Finance OS so every system uses one Financial Ledger rather than creating module-specific financial databases.

## Implemented
- Accounts & Wallets
- Shared Financial Ledger
- Categories
- Budgets
- Recurring income/expenses
- Debts & receivables
- Savings goals
- Project-linked transactions
- Account balance calculation
- Finance summary on Command Center
- RLS policies for all Finance tables
- Source/link metadata for cross-module transaction deduplication

## Architecture rules preserved
- The ledger is the only transaction source of truth.
- Project dashboards reference the ledger through `project_id`.
- Finance does not create a duplicate ledger for Home, Commerce, Delivery, or any other module.
- Existing ContentOS is untouched and remains the source of truth for ContentOS data and behavior.

## Acceptance Criteria
- Users can create accounts, categories, budgets, recurring rules, debts, savings goals, and transactions.
- A transaction may be attached to a Project without duplicating the transaction elsewhere.
- Account balances are derived from opening balance plus ledger movements.
- Command Center surfaces finance totals without copying finance records.
- SQL is idempotent for databases created by earlier phases.
- Finance tables are protected by workspace membership RLS.

## Verification
- Static/source checks: PASS
- SQL inspection: PASS
- Existing ContentOS hash preservation: PASS
- Vite runtime build: NOT VERIFIED in the provided environment
- Live Supabase/RLS execution: NOT VERIFIED
