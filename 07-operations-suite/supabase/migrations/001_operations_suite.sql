create table if not exists public.portfolio_audit_events (
  id uuid primary key,
  system text not null check (system in ('pulsedesk', 'stockflow', 'approve', 'carequeue', 'routeops')),
  action text not null,
  record_id text,
  actor_name text not null,
  actor_role text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_audit_events_system_created_idx
  on public.portfolio_audit_events (system, created_at desc);

alter table public.portfolio_audit_events enable row level security;

-- The public demo never talks to this table directly. Only server-side route
-- handlers use the service role, so no browser-facing policy is intentionally added.
