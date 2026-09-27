# Phase 17 — Global Intelligence Contract

## Purpose

Create a cross-system intelligence layer that reads existing source entities and produces traceable signals. It must not become a replacement database for Projects, Finance, Commerce, Personal systems, or ContentOS.

## Source of Truth

- Finance: `uos_fin_transactions`, `uos_fin_budgets`
- Projects: `uos_projects`
- Tasks: `uos_tasks`
- Goals: `uos_goals`
- Commerce: `uos_commerce_inventory`, `uos_commerce_orders`, `uos_commerce_returns`
- ContentOS: original ContentOS intelligence engine through the existing bridge

## Deterministic Rules

1. Spending increase: current 30-day expense/debt-payment total is at least 20% above the preceding 30-day period and the preceding period is non-zero.
2. Budget pressure: an active budget for the current period has consumed at least 80% of its configured amount.
3. Business-linked revenue decrease: business-profile project revenue is at least 20% below the preceding 30-day period and the prior period is non-zero.
4. Composite financial alert: rules 1 + 2 + 3 must all be true before emitting the cross-system alert.
5. Execution backlog: at least 5 open tasks are overdue.
6. Goals behind: at least one active goal is past due while its current value is below its configured target.
7. Inventory risk: any commerce inventory record is critical/out or at/below reorder point.
8. Commerce backlog: at least 10 orders remain in active fulfillment states.
9. Returns backlog: at least 5 returns remain in requested/approved/received states.
10. Content trend: only emit a Unified OS ContentOS signal when the original ContentOS intelligence engine reports a downward trend. No new ContentOS metric logic is introduced here.

## Traceability

Each signal stores severity, confidence, source entity names, evidence payload, and a deterministic fingerprint. Findings can be acknowledged or dismissed but do not alter their source entities.

## No invention rule

If required source data is missing or insufficient, the signal is not emitted. The UI must say `insufficient data` instead of fabricating a trend.
