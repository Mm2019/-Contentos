# Phase 12 — Commerce Contract

Commerce is a project/workspace vertical over the Shared Core. It owns the catalog, order, inventory, customer, supplier, return, promotion and campaign records described in the Master Prompt.

## Source of truth rules

- Products and product variants are Commerce source-of-truth records.
- Inventory is scoped to a variant and location; `available` is derived from on-hand, reserved and damaged quantities.
- Orders are the Commerce order source of truth.
- Financial movements are not duplicated here. Orders and returns may link to the Shared Finance Ledger through `finance_transaction_id`.
- Tasks remain Shared Core.
- Marketing content continues to use the existing ContentOS rather than a second content table.

## Order statuses

Pending → Confirmed → Processing → Packed → Shipped → Delivered, with Cancelled / Returned / Refunded terminal branches.

## Product lifecycle

Idea → Draft → Ready → Published → Archived.

## Inventory states

On Hand, Reserved, Available (derived), Damaged, Returned; stock attention uses Good / Low / Critical / Out.

## External integrations

The phase is schema-ready for external commerce systems. It does not claim real-time connectors that are not implemented.
