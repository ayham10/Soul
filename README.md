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
Create an Upstash Redis database (or Vercel KV store) and add these environment
variables to the deployment:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Vercel KV names are also supported:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Without these variables, `/admin` can still update the catalogue locally for
testing, but production serverless deployments may not share or persist those
changes across users.

The cart is front-end only — for real payments, wire the checkout to a provider such as Stripe.
