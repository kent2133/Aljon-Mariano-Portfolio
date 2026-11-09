create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.app_role as enum ('owner', 'administrator', 'service_advisor', 'technician', 'customer');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.membership_status as enum ('invited', 'active', 'suspended');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.ticket_status as enum (
    'submitted',
    'awaiting_diagnosis',
    'awaiting_approval',
    'approved',
    'in_repair',
    'ready_for_pickup',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.quote_status as enum ('draft', 'sent', 'approved', 'declined', 'expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.quote_item_kind as enum ('part', 'labor', 'fee');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.attachment_kind as enum ('customer_upload', 'diagnostic_photo', 'repair_photo', 'document');
exception when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_length check (char_length(email) between 3 and 254),
  constraint profiles_full_name_length check (char_length(full_name) <= 80)
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  email text,
  phone text,
  timezone text not null default 'Asia/Manila',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length check (char_length(name) between 2 and 100),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'technician',
  status public.membership_status not null default 'invited',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint customers_full_name_length check (char_length(full_name) between 2 and 120),
  constraint customers_email_length check (char_length(email) between 3 and 254)
);

create unique index customers_org_user_unique
  on public.customers (organization_id, user_id)
  where user_id is not null;

create index customers_org_name_idx on public.customers (organization_id, full_name);
create index customers_org_email_idx on public.customers (organization_id, lower(email));

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid not null,
  category text not null,
  brand text not null,
  model text not null,
  serial_number text,
  color text,
  accessories text[] not null default '{}',
  intake_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (customer_id, organization_id)
    references public.customers (id, organization_id) on delete cascade,
  constraint devices_category_length check (char_length(category) between 2 and 60),
  constraint devices_brand_length check (char_length(brand) between 1 and 80),
  constraint devices_model_length check (char_length(model) between 1 and 120)
);

create unique index devices_org_serial_unique
  on public.devices (organization_id, serial_number)
  where serial_number is not null and serial_number <> '';
create index devices_customer_idx on public.devices (customer_id, created_at desc);

create table public.repair_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid not null,
  device_id uuid not null,
  ticket_number text not null default '',
  title text not null,
  problem_description text not null,
  diagnosis text,
  resolution text,
  status public.ticket_status not null default 'submitted',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references auth.users (id) on delete set null,
  opened_by uuid not null references auth.users (id),
  estimated_completion_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, ticket_number),
  foreign key (customer_id, organization_id)
    references public.customers (id, organization_id),
  foreign key (device_id, organization_id)
    references public.devices (id, organization_id),
  constraint repair_tickets_title_length check (char_length(title) between 3 and 160),
  constraint repair_tickets_problem_length check (char_length(problem_description) between 10 and 5000)
);

create index repair_tickets_org_status_idx
  on public.repair_tickets (organization_id, status, updated_at desc);
create index repair_tickets_customer_idx
  on public.repair_tickets (customer_id, created_at desc);
create index repair_tickets_assignee_idx
  on public.repair_tickets (assigned_to, status, updated_at desc)
  where assigned_to is not null;

create table public.ticket_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  from_status public.ticket_status,
  to_status public.ticket_status,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (ticket_id, organization_id)
    references public.repair_tickets (id, organization_id) on delete cascade,
  constraint ticket_history_event_type_length check (char_length(event_type) between 2 and 80),
  constraint ticket_history_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index ticket_history_ticket_created_idx
  on public.ticket_history (ticket_id, created_at desc);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null,
  quote_number text not null default '',
  status public.quote_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'PHP',
  customer_note text,
  internal_note text,
  valid_until date,
  sent_at timestamptz,
  responded_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, quote_number),
  foreign key (ticket_id, organization_id)
    references public.repair_tickets (id, organization_id) on delete cascade,
  constraint quotes_amounts_nonnegative check (
    subtotal >= 0 and tax >= 0 and discount >= 0 and total >= 0
  ),
  constraint quotes_currency_format check (currency ~ '^[A-Z]{3}$')
);

create index quotes_ticket_created_idx on public.quotes (ticket_id, created_at desc);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  quote_id uuid not null,
  position integer not null default 0,
  kind public.quote_item_kind not null default 'part',
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamptz not null default now(),
  foreign key (quote_id, organization_id)
    references public.quotes (id, organization_id) on delete cascade,
  constraint quote_items_quantity_positive check (quantity > 0),
  constraint quote_items_unit_price_nonnegative check (unit_price >= 0),
  constraint quote_items_description_length check (char_length(description) between 2 and 240)
);

create index quote_items_quote_position_idx on public.quote_items (quote_id, position, created_at);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null,
  uploaded_by uuid not null references auth.users (id),
  bucket_id text not null default 'repair-attachments',
  object_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  kind public.attachment_kind not null default 'customer_upload',
  created_at timestamptz not null default now(),
  foreign key (ticket_id, organization_id)
    references public.repair_tickets (id, organization_id) on delete cascade,
  unique (bucket_id, object_path),
  constraint attachments_bucket check (bucket_id = 'repair-attachments'),
  constraint attachments_size check (size_bytes between 0 and 10485760),
  constraint attachments_path check (object_path !~ '(^|/)\.\.(/|$)')
);

create index attachments_ticket_created_idx on public.attachments (ticket_id, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null,
  author_id uuid not null references auth.users (id),
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (ticket_id, organization_id)
    references public.repair_tickets (id, organization_id) on delete cascade,
  constraint comments_body_length check (char_length(body) between 1 and 4000)
);

create index comments_ticket_created_idx on public.comments (ticket_id, created_at);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null,
  quote_id uuid,
  invoice_number text not null default '',
  status public.invoice_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  currency text not null default 'PHP',
  due_at timestamptz,
  issued_at timestamptz,
  paid_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, invoice_number),
  foreign key (ticket_id, organization_id)
    references public.repair_tickets (id, organization_id),
  foreign key (quote_id, organization_id)
    references public.quotes (id, organization_id),
  constraint invoices_amounts_nonnegative check (
    subtotal >= 0 and tax >= 0 and discount >= 0 and total >= 0 and amount_paid >= 0
  ),
  constraint invoices_payment_limit check (amount_paid <= total),
  constraint invoices_currency_format check (currency ~ '^[A-Z]{3}$')
);

create index invoices_ticket_created_idx on public.invoices (ticket_id, created_at desc);
create index invoices_org_status_idx on public.invoices (organization_id, status, due_at);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_action_length check (char_length(action) between 2 and 120),
  constraint audit_events_entity_type_length check (char_length(entity_type) between 2 and 80),
  constraint audit_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index audit_events_org_created_idx
  on public.audit_events (organization_id, created_at desc);
create index audit_events_entity_idx
  on public.audit_events (entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_human_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'repair_tickets' and coalesce(new.ticket_number, '') = '' then
    new.ticket_number = 'RF-' || to_char(now(), 'YYMM') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));
  elsif tg_table_name = 'quotes' and coalesce(new.quote_number, '') = '' then
    new.quote_number = 'Q-' || to_char(now(), 'YYMM') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));
  elsif tg_table_name = 'invoices' and coalesce(new.invoice_number, '') = '' then
    new.invoice_number = 'INV-' || to_char(now(), 'YYMM') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@user.local'),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'RepairFlow user'
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when public.profiles.full_name = '' then excluded.full_name
          else public.profiles.full_name
        end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  users.id,
  coalesce(users.email, users.id::text || '@user.local'),
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'RepairFlow user'
  )
from auth.users as users
on conflict (id) do nothing;

create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.memberships (organization_id, user_id, role, status)
  values (new.id, new.created_by, 'owner', 'active')
  on conflict (organization_id, user_id) do update
    set role = 'owner', status = 'active';
  return new;
end;
$$;

drop trigger if exists on_organization_created on public.organizations;
create trigger on_organization_created
  after insert on public.organizations
  for each row execute function public.handle_new_organization();

create or replace function public.recalculate_quote_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_quote_id uuid;
  calculated_subtotal numeric(12, 2);
begin
  target_quote_id = coalesce(new.quote_id, old.quote_id);

  select coalesce(sum(item.line_total), 0)
    into calculated_subtotal
  from public.quote_items as item
  where item.quote_id = target_quote_id;

  update public.quotes
  set subtotal = calculated_subtotal,
      total = greatest(0, calculated_subtotal + tax - discount)
  where id = target_quote_id;

  if tg_op = 'UPDATE' and old.quote_id is distinct from new.quote_id then
    select coalesce(sum(item.line_total), 0)
      into calculated_subtotal
    from public.quote_items as item
    where item.quote_id = old.quote_id;

    update public.quotes
    set subtotal = calculated_subtotal,
        total = greatest(0, calculated_subtotal + tax - discount)
    where id = old.quote_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_quote_item_changed on public.quote_items;
create trigger on_quote_item_changed
  after insert or update or delete on public.quote_items
  for each row execute function public.recalculate_quote_totals();

create or replace function public.normalize_quote_total()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.total = greatest(0, new.subtotal + new.tax - new.discount);
  if new.status = 'sent' and new.sent_at is null then new.sent_at = now(); end if;
  return new;
end;
$$;

drop trigger if exists before_quote_write on public.quotes;
create trigger before_quote_write
  before insert or update of subtotal, tax, discount, status on public.quotes
  for each row execute function public.normalize_quote_total();

create or replace function public.normalize_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.total = greatest(0, new.subtotal + new.tax - new.discount);
  if new.amount_paid > new.total then
    raise exception 'Amount paid cannot exceed the invoice total.';
  end if;
  if new.amount_paid = new.total and new.total > 0 then
    new.status = 'paid';
    new.paid_at = coalesce(new.paid_at, now());
  elsif new.amount_paid > 0 and new.status not in ('void', 'paid') then
    new.status = 'partially_paid';
  end if;
  if new.status = 'issued' and new.issued_at is null then new.issued_at = now(); end if;
  return new;
end;
$$;

drop trigger if exists before_invoice_write on public.invoices;
create trigger before_invoice_write
  before insert or update on public.invoices
  for each row execute function public.normalize_invoice();

create or replace function public.record_ticket_timeline()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.ticket_history (
      organization_id, ticket_id, actor_id, event_type, to_status, message
    ) values (
      new.organization_id, new.id, new.opened_by, 'ticket_created', new.status, 'Repair request created.'
    );
    insert into public.audit_events (
      organization_id, actor_id, action, entity_type, entity_id, metadata
    ) values (
      new.organization_id, new.opened_by, 'ticket.created', 'repair_ticket', new.id,
      jsonb_build_object('ticket_number', new.ticket_number, 'status', new.status)
    );
  elsif old.status is distinct from new.status then
    insert into public.ticket_history (
      organization_id, ticket_id, actor_id, event_type, from_status, to_status, message
    ) values (
      new.organization_id, new.id, auth.uid(), 'status_changed', old.status, new.status, 'Repair status updated.'
    );
    insert into public.audit_events (
      organization_id, actor_id, action, entity_type, entity_id, metadata
    ) values (
      new.organization_id, auth.uid(), 'ticket.status_changed', 'repair_ticket', new.id,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_ticket_timeline on public.repair_tickets;
create trigger on_ticket_timeline
  after insert or update of status on public.repair_tickets
  for each row execute function public.record_ticket_timeline();

drop trigger if exists before_ticket_reference on public.repair_tickets;
create trigger before_ticket_reference
  before insert on public.repair_tickets
  for each row execute function public.set_human_reference();

drop trigger if exists before_quote_reference on public.quotes;
create trigger before_quote_reference
  before insert on public.quotes
  for each row execute function public.set_human_reference();

drop trigger if exists before_invoice_reference on public.invoices;
create trigger before_invoice_reference
  before insert on public.invoices
  for each row execute function public.set_human_reference();

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'profiles', 'organizations', 'memberships', 'customers', 'devices',
    'repair_tickets', 'quotes', 'comments', 'invoices'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', target_table);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      target_table
    );
  end loop;
end $$;

create or replace function public.has_org_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(
    target_organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  );
$$;

create or replace function public.shares_organization_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as mine
    join public.memberships as theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = target_user_id
      and theirs.status = 'active'
  );
$$;

create or replace function public.is_ticket_customer(target_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.repair_tickets as ticket
    join public.customers as customer on customer.id = ticket.customer_id
    where ticket.id = target_ticket_id
      and customer.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_ticket(target_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.repair_tickets as ticket
    where ticket.id = target_ticket_id
      and (
        public.is_org_member(ticket.organization_id)
        or public.is_ticket_customer(ticket.id)
      )
  );
$$;

create or replace function public.can_access_storage_path(target_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[];
  path_organization_id uuid;
  path_ticket_id uuid;
begin
  folders = storage.foldername(target_path);
  if array_length(folders, 1) < 2 then return false; end if;
  path_organization_id = folders[1]::uuid;
  path_ticket_id = folders[2]::uuid;

  return exists (
    select 1
    from public.repair_tickets as ticket
    where ticket.id = path_ticket_id
      and ticket.organization_id = path_organization_id
      and public.can_access_ticket(ticket.id)
  );
exception when others then
  return false;
end;
$$;

create or replace function public.can_manage_storage_object(target_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[];
  path_organization_id uuid;
begin
  folders = storage.foldername(target_path);
  if array_length(folders, 1) < 2 then return false; end if;
  path_organization_id = folders[1]::uuid;

  return public.has_org_role(
    path_organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ) or exists (
    select 1
    from public.attachments as attachment
    where attachment.object_path = target_path
      and attachment.uploaded_by = auth.uid()
  );
exception when others then
  return false;
end;
$$;

create or replace function public.respond_to_quote(
  target_quote_id uuid,
  decision public.quote_status
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_quote public.quotes;
  updated_quote public.quotes;
begin
  if decision not in ('approved', 'declined') then
    raise exception 'A quote can only be approved or declined.';
  end if;

  select * into target_quote
  from public.quotes
  where id = target_quote_id
  for update;

  if target_quote.id is null then raise exception 'Quote not found.'; end if;
  if target_quote.status <> 'sent' then raise exception 'Only a sent quote can be answered.'; end if;

  if not public.is_ticket_customer(target_quote.ticket_id)
    and not public.has_org_role(
      target_quote.organization_id,
      array['owner', 'administrator', 'service_advisor']::public.app_role[]
    ) then
    raise exception 'You do not have access to this quote.';
  end if;

  update public.quotes
  set status = decision,
      responded_at = now()
  where id = target_quote_id
  returning * into updated_quote;

  if decision = 'approved' then
    update public.repair_tickets
    set status = 'approved'
    where id = target_quote.ticket_id
      and status = 'awaiting_approval';
  end if;

  insert into public.audit_events (
    organization_id, actor_id, action, entity_type, entity_id, metadata
  ) values (
    target_quote.organization_id,
    auth.uid(),
    'quote.' || decision::text,
    'quote',
    target_quote.id,
    jsonb_build_object('quote_number', target_quote.quote_number)
  );

  return updated_quote;
end;
$$;

create or replace function public.bootstrap_personal_organization()
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_user auth.users%rowtype;
  existing_organization public.organizations;
  created_organization public.organizations;
  owner_name text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;

  select organization.* into existing_organization
  from public.organizations as organization
  join public.memberships as membership
    on membership.organization_id = organization.id
  where membership.user_id = auth.uid()
    and membership.status = 'active'
    and membership.role in ('owner', 'administrator')
  order by membership.created_at
  limit 1;

  if existing_organization.id is not null then return existing_organization; end if;

  select * into auth_user from auth.users where id = auth.uid();
  owner_name := coalesce(
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(auth_user.email, ''), '@', 1),
    'My'
  );

  insert into public.organizations (name, slug, email, created_by)
  values (
    owner_name || '''s Repair Desk',
    'repair-' || substr(replace(auth.uid()::text, '-', ''), 1, 12),
    auth_user.email,
    auth.uid()
  )
  on conflict (slug) do update set updated_at = now()
  returning * into created_organization;

  return created_organization;
end;
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.customers enable row level security;
alter table public.devices enable row level security;
alter table public.repair_tickets enable row level security;
alter table public.ticket_history enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.attachments enable row level security;
alter table public.comments enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_visible_users"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_organization_with(id));
create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations_select_members"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));
create policy "organizations_insert_creator"
  on public.organizations for insert to authenticated
  with check (created_by = auth.uid());
create policy "organizations_update_admins"
  on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner', 'administrator']::public.app_role[]))
  with check (public.has_org_role(id, array['owner', 'administrator']::public.app_role[]));
create policy "organizations_delete_owners"
  on public.organizations for delete to authenticated
  using (public.has_org_role(id, array['owner']::public.app_role[]));

create policy "memberships_select_members"
  on public.memberships for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy "memberships_insert_admins"
  on public.memberships for insert to authenticated
  with check (
    public.has_org_role(organization_id, array['owner']::public.app_role[])
    or (
      role <> 'owner'
      and public.has_org_role(organization_id, array['administrator']::public.app_role[])
    )
  );
create policy "memberships_update_admins"
  on public.memberships for update to authenticated
  using (
    public.has_org_role(organization_id, array['owner']::public.app_role[])
    or (
      role <> 'owner'
      and public.has_org_role(organization_id, array['administrator']::public.app_role[])
    )
  )
  with check (
    public.has_org_role(organization_id, array['owner']::public.app_role[])
    or (
      role <> 'owner'
      and public.has_org_role(organization_id, array['administrator']::public.app_role[])
    )
  );
create policy "memberships_delete_admins"
  on public.memberships for delete to authenticated
  using (
    public.has_org_role(organization_id, array['owner']::public.app_role[])
    or (
      role <> 'owner'
      and public.has_org_role(organization_id, array['administrator']::public.app_role[])
    )
  );

create policy "customers_select_authorized"
  on public.customers for select to authenticated
  using (public.is_org_member(organization_id) or user_id = auth.uid());
create policy "customers_insert_staff"
  on public.customers for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.has_org_role(
      organization_id,
      array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
    )
  );
create policy "customers_update_authorized"
  on public.customers for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[]));
create policy "customers_delete_admins"
  on public.customers for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator']::public.app_role[]));

create policy "devices_select_authorized"
  on public.devices for select to authenticated
  using (
    public.is_org_member(organization_id)
    or exists (
      select 1 from public.customers as customer
      where customer.id = customer_id and customer.user_id = auth.uid()
    )
  );
create policy "devices_insert_authorized"
  on public.devices for insert to authenticated
  with check (
    public.has_org_role(
      organization_id,
      array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
    )
    or exists (
      select 1 from public.customers as customer
      where customer.id = customer_id
        and customer.organization_id = organization_id
        and customer.user_id = auth.uid()
    )
  );
create policy "devices_update_staff"
  on public.devices for update to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  ))
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  ));
create policy "devices_delete_admins"
  on public.devices for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[]));

create policy "tickets_select_authorized"
  on public.repair_tickets for select to authenticated
  using (public.can_access_ticket(id));
create policy "tickets_insert_authorized"
  on public.repair_tickets for insert to authenticated
  with check (
    opened_by = auth.uid()
    and (
      public.has_org_role(
        organization_id,
        array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
      )
      or exists (
        select 1 from public.customers as customer
        where customer.id = customer_id
          and customer.organization_id = organization_id
          and customer.user_id = auth.uid()
      )
    )
  );
create policy "tickets_update_staff"
  on public.repair_tickets for update to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  ))
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  ));
create policy "tickets_delete_admins"
  on public.repair_tickets for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator']::public.app_role[]));

create policy "history_select_ticket_access"
  on public.ticket_history for select to authenticated
  using (public.can_access_ticket(ticket_id));
create policy "history_insert_staff"
  on public.ticket_history for insert to authenticated
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
  ));

create policy "quotes_select_ticket_access"
  on public.quotes for select to authenticated
  using (public.can_access_ticket(ticket_id));
create policy "quotes_insert_staff"
  on public.quotes for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.has_org_role(
      organization_id,
      array['owner', 'administrator', 'service_advisor']::public.app_role[]
    )
  );
create policy "quotes_update_staff"
  on public.quotes for update to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ))
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ));
create policy "quotes_delete_admins"
  on public.quotes for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator']::public.app_role[]));

create policy "quote_items_select_ticket_access"
  on public.quote_items for select to authenticated
  using (exists (
    select 1 from public.quotes as quote
    where quote.id = quote_id and public.can_access_ticket(quote.ticket_id)
  ));
create policy "quote_items_insert_staff"
  on public.quote_items for insert to authenticated
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ));
create policy "quote_items_update_staff"
  on public.quote_items for update to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ))
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ));
create policy "quote_items_delete_staff"
  on public.quote_items for delete to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ));

create policy "attachments_select_ticket_access"
  on public.attachments for select to authenticated
  using (public.can_access_ticket(ticket_id));
create policy "attachments_insert_ticket_access"
  on public.attachments for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.can_access_ticket(ticket_id)
    and (storage.foldername(object_path))[1] = organization_id::text
    and (storage.foldername(object_path))[2] = ticket_id::text
  );
create policy "attachments_update_owner_or_staff"
  on public.attachments for update to authenticated
  using (
    uploaded_by = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[])
  )
  with check (
    public.can_access_ticket(ticket_id)
    and (storage.foldername(object_path))[1] = organization_id::text
    and (storage.foldername(object_path))[2] = ticket_id::text
  );
create policy "attachments_delete_owner_or_staff"
  on public.attachments for delete to authenticated
  using (
    uploaded_by = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[])
  );

create policy "comments_select_visible"
  on public.comments for select to authenticated
  using (
    public.can_access_ticket(ticket_id)
    and (
      not is_internal
      or public.has_org_role(
        organization_id,
        array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
      )
    )
  );
create policy "comments_insert_authorized"
  on public.comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.can_access_ticket(ticket_id)
    and (
      not is_internal
      or public.has_org_role(
        organization_id,
        array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
      )
    )
  );
create policy "comments_update_author"
  on public.comments for update to authenticated
  using (author_id = auth.uid())
  with check (
    author_id = auth.uid()
    and (
      not is_internal
      or public.has_org_role(
        organization_id,
        array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
      )
    )
  );
create policy "comments_delete_author_or_admin"
  on public.comments for delete to authenticated
  using (
    author_id = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'administrator', 'service_advisor']::public.app_role[])
  );

create policy "invoices_select_ticket_access"
  on public.invoices for select to authenticated
  using (public.can_access_ticket(ticket_id));
create policy "invoices_insert_staff"
  on public.invoices for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.has_org_role(
      organization_id,
      array['owner', 'administrator', 'service_advisor']::public.app_role[]
    )
  );
create policy "invoices_update_staff"
  on public.invoices for update to authenticated
  using (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ))
  with check (public.has_org_role(
    organization_id,
    array['owner', 'administrator', 'service_advisor']::public.app_role[]
  ));
create policy "invoices_delete_admins"
  on public.invoices for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator']::public.app_role[]));

create policy "audit_select_admins"
  on public.audit_events for select to authenticated
  using (public.has_org_role(organization_id, array['owner', 'administrator']::public.app_role[]));
create policy "audit_insert_staff"
  on public.audit_events for insert to authenticated
  with check (
    actor_id = auth.uid()
    and public.has_org_role(
      organization_id,
      array['owner', 'administrator', 'service_advisor', 'technician']::public.app_role[]
    )
  );

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'repair-attachments',
  'repair-attachments',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "repair_attachments_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'repair-attachments'
    and public.can_access_storage_path(name)
  );
create policy "repair_attachments_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'repair-attachments'
    and public.can_access_storage_path(name)
  );
create policy "repair_attachments_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'repair-attachments'
    and public.can_manage_storage_object(name)
  )
  with check (
    bucket_id = 'repair-attachments'
    and public.can_access_storage_path(name)
  );
create policy "repair_attachments_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'repair-attachments'
    and public.can_manage_storage_object(name)
  );

revoke all on function public.has_org_role(uuid, public.app_role[]) from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.shares_organization_with(uuid) from public;
revoke all on function public.is_ticket_customer(uuid) from public;
revoke all on function public.can_access_ticket(uuid) from public;
revoke all on function public.can_access_storage_path(text) from public;
revoke all on function public.can_manage_storage_object(text) from public;
revoke all on function public.respond_to_quote(uuid, public.quote_status) from public;
revoke all on function public.bootstrap_personal_organization() from public;

grant execute on function public.has_org_role(uuid, public.app_role[]) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.shares_organization_with(uuid) to authenticated;
grant execute on function public.is_ticket_customer(uuid) to authenticated;
grant execute on function public.can_access_ticket(uuid) to authenticated;
grant execute on function public.can_access_storage_path(text) to authenticated;
grant execute on function public.can_manage_storage_object(text) to authenticated;
grant execute on function public.respond_to_quote(uuid, public.quote_status) to authenticated;
grant execute on function public.bootstrap_personal_organization() to authenticated;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table
  public.profiles,
  public.organizations,
  public.memberships,
  public.customers,
  public.devices,
  public.repair_tickets,
  public.ticket_history,
  public.quotes,
  public.quote_items,
  public.attachments,
  public.comments,
  public.invoices,
  public.audit_events
to authenticated;
