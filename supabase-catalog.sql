create table if not exists public.soul_catalog (
  id text primary key,
  products jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.soul_catalog (id, products)
values ('default', '[]'::jsonb)
on conflict (id) do nothing;

alter table public.soul_catalog enable row level security;
