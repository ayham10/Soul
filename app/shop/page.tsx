"use client";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ShopCatalogSkeleton from "@/components/ShopCatalogSkeleton";
import PerfumeSearch from "@/components/PerfumeSearch";
import { families, Product } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { famLabel } from "@/lib/i18n";
import { matchesProductSearch } from "@/lib/search";

function ShopProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="shop-grid">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const { products, ready } = useProducts();
  const { t, lang } = useLang();
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const byFamily =
      active === "All"
        ? products
        : active === "Women"
          ? products.filter((p) => p.collection === "Women")
          : products.filter((p) => p.family === active);
    return byFamily.filter((p) => matchesProductSearch(p, query));
  }, [products, active, query]);

  return (
    <>
      <style>{`
        .shop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
        .shop-grid > .product-card { height: 100%; }
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
        .shop-search-wrap { padding: 0 22px 22px; }
        .shop-image-note {
          max-width: 520px;
          margin: 12px auto 0;
          padding: 0 8px;
          color: #5b5345;
          font-size: 11px;
          line-height: 1.7;
          text-align: center;
        }
        .skeleton-card { pointer-events: none; }
        .skeleton-card:hover { transform: none; box-shadow: none; border-color: var(--line); }
        .skeleton-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(198,161,91,0.08) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%;
          animation: catalog-shimmer 1.4s ease-in-out infinite;
        }
        .skeleton-line {
          height: 12px;
          border-radius: 2px;
          margin-bottom: 10px;
        }
        .skeleton-line-sm { width: 38%; height: 10px; }
        .skeleton-line-lg { width: 72%; height: 18px; margin-bottom: 12px; }
        .skeleton-line-md { width: 90%; margin-bottom: 18px; }
        .skeleton-line-price { width: 56px; height: 16px; margin-bottom: 0; }
        .skeleton-line-btn { width: 92px; height: 36px; margin-bottom: 0; }
        @keyframes catalog-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
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

      <div className="filter-wrap" style={{ padding: "10px 22px 18px" }}>
        <div className="filter-row">
          {families.map((f) => (
            <button key={f} className={`filter-chip${active === f ? " active" : ""}`} onClick={() => setActive(f)}>
              {famLabel(f, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-search-wrap">
        <PerfumeSearch
          value={query}
          onChange={setQuery}
          placeholder={t.shop.searchPlaceholder}
          ariaLabel={t.shop.searchPlaceholder}
        />
        <p className="shop-image-note">{t.footer.imageNote}</p>
      </div>

      <section className="wrap shop-products-wrap" style={{ padding: "0 22px 110px" }}>
        {!ready ? (
          <ShopCatalogSkeleton />
        ) : list.length > 0 ? (
          <ShopProductGrid products={list} />
        ) : (
          <p style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0" }}>
            {query.trim() ? t.shop.noResults : t.shop.empty}
          </p>
        )}
      </section>
    </>
  );
}
