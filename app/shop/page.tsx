"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { groups } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { groupLabel } from "@/lib/i18n";

export default function ShopPage() {
  const { products } = useProducts();
  const { t, lang } = useLang();
  const [active, setActive] = useState("All");
  const list = active === "All" ? products : products.filter((p) => p.group === active);

  return (
    <>
      <style>{`
        .shop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
        @media (min-width: 640px) { .shop-grid { gap: 20px; } }
        @media (min-width: 920px) { .shop-grid { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
        .filter-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .filter-chip {
          font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          min-height: 44px; padding: 9px 18px; cursor: pointer; background: transparent; color: var(--muted);
          border: 1px solid var(--line); transition: all 0.25s;
        }
        .filter-chip:hover { color: var(--cream); border-color: rgba(198,161,91,0.5); }
        .filter-chip.active { background: var(--gold); color: #1a140a; border-color: var(--gold); }
        @media (max-width: 639px) {
          .shop-header { padding: 118px 18px 18px !important; }
          .filter-wrap { padding: 10px 18px 34px !important; }
          .filter-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            max-width: 460px;
            margin: 0 auto;
          }
          .filter-chip {
            min-height: 46px;
            padding: 10px 12px;
            font-size: 10.5px;
            letter-spacing: 1.4px;
          }
          .filter-chip:first-child { grid-column: 1 / -1; }
          .shop-products-wrap { padding: 0 18px 92px !important; }
        }
        @media (max-width: 340px) {
          .shop-header,
          .filter-wrap,
          .shop-products-wrap { padding-left: 16px !important; padding-right: 16px !important; }
          .filter-chip { font-size: 10px; letter-spacing: 1px; }
          .shop-grid { gap: 10px; }
        }
      `}</style>

      <header className="shop-header" style={{ textAlign: "center", padding: "124px 20px 16px" }}>
        <div className="eyebrow">{t.shop.eyebrow}</div>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 78px)", color: "var(--cream)", margin: "14px 0 16px" }}>
          {t.shop.title} <em style={{ color: "var(--gold)" }}>{t.shop.titleEm}</em>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontSize: 14.5 }}>
          {t.shop.sub}
        </p>
      </header>

      <div className="filter-wrap" style={{ padding: "10px 22px 34px" }}>
        <div className="filter-row">
          {groups.map((g) => (
            <button key={g} className={`filter-chip${active === g ? " active" : ""}`} onClick={() => setActive(g)}>
              {groupLabel(g, lang)}
            </button>
          ))}
        </div>
      </div>

      <section className="wrap shop-products-wrap" style={{ padding: "0 22px 110px" }}>
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
