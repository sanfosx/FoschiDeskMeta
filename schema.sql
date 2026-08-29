-- FoschiDesk OS - Schema completo para InsForge
create extension if not exists "uuid-ossp";
create extension if not exists vector;

create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  plan text default 'start',
  modules text[] default '{crm}',
  created_at timestamp default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  full_name text,
  role text default 'admin',
  created_at timestamp default now()
);

create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) not null,
  name text,
  phone text,
  email text,
  source text,
  status text default 'lead',
  metadata jsonb,
  created_at timestamp default now()
);

create table public.deals (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) not null,
  contact_id uuid references public.contacts(id),
  title text,
  amount numeric,
  stage text default 'nuevo',
  created_at timestamp default now()
);

create table public.stock_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) not null,
  name text,
  sku text,
  stock numeric default 0,
  price numeric,
  created_at timestamp default now()
);

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) not null,
  contact_id uuid references public.contacts(id),
  start_at timestamp,
  end_at timestamp,
  status text default 'confirmado',
  notes text,
  created_at timestamp default now()
);

create table public.automation_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) not null,
  process_name text,
  hours_saved numeric default 0,
  execution_time_ms int,
  payload jsonb,
  created_at timestamp default now()
);

create table public.knowledge_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid,
  problem text,
  process text,
  solution text,
  component_name text,
  tags text[],
  embedding vector(1536),
  created_at timestamp default now()
);

create table public.workflows (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  name text,
  trigger_type text,
  config jsonb,
  is_active boolean default true
);

create table public.diagnostics (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  business_name text,
  tools_used text[],
  repetitive_tasks jsonb,
  bottlenecks jsonb,
  roadmap jsonb,
  hours_estimated numeric,
  status text default 'pendiente',
  created_at timestamp default now()
);

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id),
  amount numeric,
  currency text default 'ARS',
  status text default 'pending',
  mercadopago_id text,
  created_at timestamp default now()
);

-- RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.stock_items enable row level security;
alter table public.appointments enable row level security;
alter table public.automation_logs enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.workflows enable row level security;
alter table public.diagnostics enable row level security;
alter table public.invoices enable row level security;

create policy "tenant isolation contacts" on public.contacts for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation deals" on public.deals for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation stock" on public.stock_items for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation appointments" on public.appointments for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation logs" on public.automation_logs for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation knowledge" on public.knowledge_items for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()) or tenant_id is null);
create policy "tenant isolation workflows" on public.workflows for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation diagnostics" on public.diagnostics for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenant isolation invoices" on public.invoices for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "profiles isolation" on public.profiles for all using (id = auth.uid() OR tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
create policy "tenants read" on public.tenants for select using (id in (select tenant_id from public.profiles where id = auth.uid()));

create index on public.contacts(tenant_id);
create index on public.automation_logs(tenant_id, created_at);
