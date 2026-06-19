# Soul — Maison de Parfum

A mobile-first, luxury perfume storefront built with **Next.js 16** (App Router) and React 19.
Cinematic video hero, an olfactory-family shop filter, product pages with a notes pyramid,
and a shopping bag that checks out via WhatsApp.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `app/page.tsx` — home (video hero, featured collection, brand story, CTA)
- `app/shop/page.tsx` — full collection with olfactory-family filter
- `app/fragrance/[slug]/page.tsx` — product detail (sizes, notes pyramid, add to bag)
- `app/about/page.tsx` — brand story
- `components/` — `Navbar`, `Footer`, `CartDrawer`, `ProductCard`, `Reveal`
- `lib/products.ts` — the fragrance catalogue (edit products here)
- `app/api/products/route.ts` — shared product catalogue API for admin edits
- `lib/cart.tsx` — shopping bag context (persists to `localStorage`)
- `public/images/` — product & lifestyle imagery
- `public/videos/background.mp4` — looping hero background

## Customising

- **Products:** edit `lib/products.ts` for defaults, or use `/admin` to update the shared catalogue.
- **Checkout number:** set `SHOP_WHATSAPP` in `lib/products.ts` to the shop's real WhatsApp number.
- **Hero video:** replace `public/videos/background.mp4`.

## Shared admin catalogue

Admin edits need durable storage to appear for every customer on every device.
Create a Supabase project, open **SQL Editor**, and run:

```sql
create table if not exists public.soul_catalog (
  id text primary key,
  products jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.soul_catalog (id, products)
values ('default', '[]'::jsonb)
on conflict (id) do nothing;

alter table public.soul_catalog enable row level security;
```

Then add these environment variables to the deployment:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_URL` is the project URL. `SUPABASE_SERVICE_ROLE_KEY` is the secret
service-role key from Supabase project settings; keep it server-side only and do
not expose it in browser code. Without these variables, `/admin` can still update
the catalogue locally for testing, but production deployments will not share or
persist those changes across users.

The cart is front-end only — for real payments, wire the checkout to a provider such as Stripe.
