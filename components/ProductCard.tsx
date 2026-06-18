"use client";
import Image from "next/image";
import Link from "next/link";
import { Product, localize } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { famLabel, genderLabel } from "@/lib/i18n";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, lang } = useLang();
  const L = localize(product, lang);

  return (
    <div className="product-card" style={{ position: "relative", background: "var(--noir-card)", border: "1px solid var(--line)" }}>
      <style>{`
        .product-card { transition: border-color 0.3s ease, transform 0.3s ease; }
        .product-card:hover { border-color: rgba(198,161,91,0.5); transform: translateY(-4px); }
        .product-card .pc-img { transition: transform 0.8s cubic-bezier(0.22,1,0.36,1); }
        .product-card:hover .pc-img { transform: scale(1.06); }
        .product-card .quick-add { opacity: 0; transform: translateY(8px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .product-card:hover .quick-add { opacity: 1; transform: translateY(0); }
        @media (hover: none) { .product-card .quick-add { opacity: 1; transform: none; } }
      `}</style>

      <Link href={`/fragrance/${product.slug}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "#0e0c0b" }}>
          <Image
            src={product.image}
            alt={L.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="pc-img"
            style={{ objectFit: "cover" }}
          />
          <span style={{
            position: "absolute", top: 14, insetInlineStart: 14, fontSize: 9, letterSpacing: 2,
            textTransform: "uppercase", color: "var(--cream)", background: "rgba(0,0,0,0.45)",
            border: "1px solid var(--line)", padding: "5px 10px", backdropFilter: "blur(4px)",
          }}>{famLabel(product.family, lang)}</span>
          {product.bestseller && (
            <span style={{
              position: "absolute", top: 14, insetInlineEnd: 14, fontSize: 9, letterSpacing: 2,
              textTransform: "uppercase", color: "#1a140a", background: "var(--gold)", padding: "5px 10px",
            }}>★</span>
          )}
        </div>
      </Link>

      <div style={{ padding: "20px 20px 22px" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 7 }}>
          {genderLabel(product.gender, lang)}
        </div>
        <Link href={`/fragrance/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 25, color: "var(--cream)", marginBottom: 6 }}>{L.name}</h3>
        </Link>
        <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, minHeight: 40 }}>{L.tagline}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "var(--gold)" }}>${product.price}</span>
          <button
            className="quick-add"
            onClick={() =>
              add({ slug: product.slug, name: L.name, image: product.image, ml: 50, price: product.price })
            }
            style={{
              fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Jost', sans-serif",
              background: "transparent", color: "var(--cream)", border: "1px solid rgba(233,225,211,0.35)",
              padding: "10px 16px", cursor: "pointer", transition: "all 0.25s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "#1a140a"; e.currentTarget.style.borderColor = "var(--gold)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cream)"; e.currentTarget.style.borderColor = "rgba(233,225,211,0.35)"; }}
          >
            {t.product.addToBag}
          </button>
        </div>
      </div>
    </div>
  );
}
