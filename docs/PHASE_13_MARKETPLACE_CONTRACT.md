# Phase 13 Marketplace Contract

## Marketplace responsibilities

- Listing lifecycle and category-aware attributes.
- Buyer/seller deal state.
- Verification metadata and status.
- Trust score and risk signals.
- Reviews, reports, disputes and safety events.

## Not duplicated here

### Commerce

Commerce remains authoritative for:

- Products
- Product Variants
- Customers
- Orders
- Inventory
- Returns
- Promotions
- Campaigns

Marketplace Deals may reference a Commerce Order but must not recreate order items or order state.

### Finance

Finance remains the only ledger. Marketplace may store an optional `finance_transaction_id` for reconciliation; it must not create a parallel ledger.

### People / identity

Marketplace uses `*_ref` identifiers to point to existing people/users/actors. It does not create a second identity master.

### ContentOS

Marketplace may connect to ContentOS later as a marketing/content subsystem, but Phase 13 does not alter or clone ContentOS.

## Category-aware listing model

Categories define `attribute_schema` and Listings store their actual `attributes`. This allows categories such as Real Estate and Cars to have different fields without forcing one global property set on every listing.
