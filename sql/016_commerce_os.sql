-- Phase 12 — Commerce OS. Shared catalog + inventory + order source of truth.
create extension if not exists pgcrypto;

create table if not exists uos_commerce_products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  supplier_id uuid,
  name text not null,
  sku text,
  category text,
  type text not null default 'physical' check (type in ('physical','digital','service')),
  cost numeric not null default 0 check (cost >= 0),
  price numeric not null default 0 check (price >= 0),
  status text not null default 'draft' check (status in ('idea','draft','ready','published','archived')),
  assets text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, sku)
);

create table if not exists uos_commerce_variants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  product_id uuid not null references uos_commerce_products(id) on delete cascade,
  sku text,
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  cost numeric not null default 0 check (cost >= 0),
  price numeric not null default 0 check (price >= 0),
  barcode text,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, sku)
);

create table if not exists uos_commerce_inventory (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  variant_id uuid not null references uos_commerce_variants(id) on delete cascade,
  on_hand numeric not null default 0 check (on_hand >= 0),
  reserved numeric not null default 0 check (reserved >= 0),
  damaged numeric not null default 0 check (damaged >= 0),
  returned numeric not null default 0 check (returned >= 0),
  location text,
  reorder_point numeric not null default 0 check (reorder_point >= 0),
  stock_status text not null default 'good' check (stock_status in ('good','low','critical','out')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, variant_id, location)
);

create table if not exists uos_commerce_customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null,
  email text,
  phone text,
  type text not null default 'individual' check (type in ('individual','business')),
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_commerce_suppliers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  name text not null,
  contact_name text,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_commerce_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  customer_id uuid references uos_commerce_customers(id) on delete set null,
  order_number text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','packed','shipped','delivered','cancelled','returned','refunded')),
  currency text not null default 'EGP',
  subtotal numeric not null default 0 check (subtotal >= 0),
  discount numeric not null default 0 check (discount >= 0),
  shipping numeric not null default 0 check (shipping >= 0),
  tax numeric not null default 0 check (tax >= 0),
  total numeric not null default 0 check (total >= 0),
  finance_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  campaign_id uuid,
  source_entity_type text,
  source_entity_id text,
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, order_number),
  unique(workspace_id, source_entity_type, source_entity_id, external_id)
);

create table if not exists uos_commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  order_id uuid not null references uos_commerce_orders(id) on delete cascade,
  variant_id uuid not null references uos_commerce_variants(id) on delete restrict,
  quantity numeric not null default 1 check (quantity > 0),
  unit_price numeric not null default 0 check (unit_price >= 0),
  discount numeric not null default 0 check (discount >= 0),
  line_total numeric not null default 0 check (line_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_commerce_returns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  order_id uuid not null references uos_commerce_orders(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','approved','received','rejected','refunded')),
  reason text,
  amount numeric not null default 0 check (amount >= 0),
  received_at timestamptz,
  refunded_at timestamptz,
  finance_transaction_id uuid references uos_fin_transactions(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_commerce_promotions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  product_id uuid references uos_commerce_products(id) on delete set null,
  name text not null,
  code text,
  type text not null default 'percentage' check (type in ('percentage','fixed','free_shipping')),
  value numeric not null default 0 check (value >= 0),
  min_order_value numeric not null default 0 check (min_order_value >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','active','expired','paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uos_commerce_campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references uos_workspaces(id) on delete cascade,
  project_id uuid references uos_projects(id) on delete set null,
  product_id uuid references uos_commerce_products(id) on delete set null,
  name text not null,
  type text not null default 'product',
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  budget numeric not null default 0 check (budget >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['uos_commerce_products','uos_commerce_variants','uos_commerce_inventory','uos_commerce_customers','uos_commerce_suppliers','uos_commerce_orders','uos_commerce_order_items','uos_commerce_returns','uos_commerce_promotions','uos_commerce_campaigns'] LOOP
    EXECUTE format('alter table %I enable row level security', t);
    EXECUTE format('drop policy if exists %I_member_all on %I', t, t);
    EXECUTE format('create policy %I_member_all on %I for all using (uos_is_member(workspace_id)) with check (uos_is_member(workspace_id))', t, t);
  END LOOP;
END $$;

create index if not exists idx_uos_commerce_products_ws on uos_commerce_products(workspace_id,project_id,status);
create index if not exists idx_uos_commerce_variants_product on uos_commerce_variants(product_id,status);
create index if not exists idx_uos_commerce_inventory_variant on uos_commerce_inventory(variant_id,stock_status);
create index if not exists idx_uos_commerce_customers_ws on uos_commerce_customers(workspace_id,project_id,status);
create index if not exists idx_uos_commerce_suppliers_ws on uos_commerce_suppliers(workspace_id,project_id,status);
create index if not exists idx_uos_commerce_orders_ws on uos_commerce_orders(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_commerce_order_items_order on uos_commerce_order_items(order_id);
create index if not exists idx_uos_commerce_returns_ws on uos_commerce_returns(workspace_id,project_id,status,created_at desc);
create index if not exists idx_uos_commerce_promotions_ws on uos_commerce_promotions(workspace_id,project_id,status);
create index if not exists idx_uos_commerce_campaigns_ws on uos_commerce_campaigns(workspace_id,project_id,status);

create or replace view uos_commerce_inventory_available as
select
  i.id,
  i.workspace_id,
  i.project_id,
  i.variant_id,
  i.on_hand,
  i.reserved,
  greatest(i.on_hand - i.reserved - i.damaged, 0) as available,
  i.damaged,
  i.returned,
  i.location,
  i.reorder_point,
  i.stock_status
from uos_commerce_inventory i;
