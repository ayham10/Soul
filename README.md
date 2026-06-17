# Soul — Maison de Parfum

A mobile-first, luxury perfume storefront built with **Next.js 16** (App Router) and React 19.
Cinematic video hero, an olfactory-family shop filter, product pages with a notes pyramid,
and a client-side shopping bag that checks out via WhatsApp.

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
- `lib/cart.tsx` — shopping bag context (persists to `localStorage`)
- `public/images/` — product & lifestyle imagery
- `public/videos/hero.mp4` — looping hero background

## Customising

- **Products:** edit `lib/products.ts`.
- **Checkout number:** set `SHOP_WHATSAPP` in `lib/products.ts` to the shop's real WhatsApp number.
- **Hero video:** replace `public/videos/hero.mp4` (and the `public/images/hero.png` poster).

The cart is front-end only — for real payments, wire the checkout to a provider such as Stripe.
