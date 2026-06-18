"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { families } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { famLabel } from "@/lib/i18n";

export default function ShopPage() {
  const { products } = useProducts();
  const { t, lang } = useLang();
  const [active, setActive] = useState("All");
  const list = active === "All" ? products : products.filter((p) => p.family === active);

  return (
    <>
      <style>{`
        .shop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 720px) { .shop-grid { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
        .filter-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .filter-chip {
          font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          padding: 9px 18px; cursor: pointer; background: transparent; color: var(--muted);
          border: 1px solid var(--line); transition: all 0.25s;
        }
        .filter-chip:hover { color: var(--cream); border-color: rgba(198,161,91,0.5); }
        .filter-chip.active { background: var(--gold); color: #1a140a; border-color: var(--gold); }
      `}</style>

      <header style={{ textAlign: "center", padding: "124px 20px 16px" }}>
        <div className="eyebrow">{t.shop.eyebrow}</div>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 78px)", color: "var(--cream)", margin: "14px 0 16px" }}>
          {t.shop.title} <em style={{ color: "var(--gold)" }}>{t.shop.titleEm}</em>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontSize: 14.5 }}>
          {t.shop.sub}
        </p>
      </header>

      <div style={{ padding: "10px 22px 34px" }}>
        <div className="filter-row">
          {families.map((f) => (
            <button key={f} className={`filter-chip${active === f ? " active" : ""}`} onClick={() => setActive(f)}>
              {famLabel(f, lang)}
            </button>
          ))}
        </div>
      </div>

      <section className="wrap" style={{ padding: "0 22px 110px" }}>
        <div className="shop-grid">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        {list.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0" }}>{t.shop.empty}</p>
        )}
      </section>
    </>
  );
}
