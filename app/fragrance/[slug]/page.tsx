"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProduct, products, SIZES } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductCard from "@/components/ProductCard";

function NoteRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 18, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ width: 90, flexShrink: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", paddingTop: 3 }}>{label}</div>
      <div style={{ color: "var(--cream)", fontSize: 15, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{items.join(" · ")}</div>
    </div>
  );
}

export default function FragrancePage() {
  const params = useParams<{ slug: string }>();
  const product = getProduct(params.slug);
  const { add, setOpen } = useCart();
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const price = useMemo(
    () => (product ? Math.round(product.price * SIZES[sizeIdx].multiplier) : 0),
    [product, sizeIdx]
  );

  if (!product) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24 }}>
        <h1 style={{ fontSize: 40, color: "var(--cream)" }}>Fragrance not found</h1>
        <Link href="/shop" className="btn-gold">Back to the Collection</Link>
      </div>
    );
  }

  const ml = SIZES[sizeIdx].ml;
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <style>{`
        .detail { display: grid; grid-template-columns: 1fr; gap: 0; }
        .detail-img { position: relative; height: 54vh; min-height: 320px; border-bottom: 1px solid var(--line); }
        @media (min-width: 940px) {
          .detail { grid-template-columns: 1fr 1fr; }
          .detail-img { height: min(86vh, 760px); min-height: 420px; border-bottom: none; border-right: 1px solid var(--line); }
        }
        .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 760px) { .related-grid { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
      `}</style>

      <div style={{ paddingTop: 72 }}>
        <div className="detail">
          {/* Image */}
          <div className="detail-img" style={{ background: "#0e0c0b" }}>
            <Image src={product.image} alt={product.name} fill priority style={{ objectFit: "cover" }} sizes="(max-width: 940px) 100vw, 50vw" />
            <span style={{ position: "absolute", top: 90, left: 22, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--cream)", background: "rgba(0,0,0,0.5)", border: "1px solid var(--line)", padding: "6px 12px" }}>
              {product.family} · {product.gender}
            </span>
          </div>

          {/* Info */}
          <div style={{ padding: "clamp(34px, 6vw, 80px) clamp(22px, 5vw, 70px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <nav style={{ fontSize: 11, letterSpacing: 1, color: "var(--muted)", marginBottom: 22 }}>
              <Link href="/shop" style={{ color: "var(--muted)", textDecoration: "none" }}>Collection</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span style={{ color: "var(--cream)" }}>{product.name}</span>
            </nav>

            <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", color: "var(--cream)" }}>{product.name}</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "var(--gold)", marginTop: 8 }}>
              {product.tagline}
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 14.5, margin: "24px 0 30px" }}>
              {product.description}
            </p>

            {/* Size */}
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Size</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              {SIZES.map((s, i) => (
                <button
                  key={s.ml}
                  onClick={() => setSizeIdx(i)}
                  style={{
                    flex: 1, padding: "16px 12px", cursor: "pointer", background: "transparent",
                    border: `1px solid ${i === sizeIdx ? "var(--gold)" : "var(--line)"}`,
                    color: i === sizeIdx ? "var(--gold)" : "var(--cream)", transition: "all 0.25s",
                  }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>{s.ml}ml</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>${Math.round(product.price * s.multiplier)}</div>
                </button>
              ))}
            </div>

            {/* Qty + Add */}
            <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" style={stepBtn}>−</button>
                <span style={{ minWidth: 38, textAlign: "center", color: "var(--cream)" }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" style={stepBtn}>+</button>
              </div>
              <button
                className="btn-gold"
                style={{ flex: 1 }}
                onClick={() => { add({ slug: product.slug, name: product.name, image: product.image, ml, price }, qty); }}
              >
                Add to Bag — ${price * qty}
              </button>
            </div>
            <button
              onClick={() => { add({ slug: product.slug, name: product.name, image: product.image, ml, price }, qty); setOpen(true); }}
              className="btn-ghost" style={{ width: "100%" }}
            >
              Buy Now
            </button>

            {/* Notes pyramid */}
            <div style={{ marginTop: 40 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>The Composition</div>
              <NoteRow label="Top" items={product.notes.top} />
              <NoteRow label="Heart" items={product.notes.heart} />
              <NoteRow label="Base" items={product.notes.base} />
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
              {["Free worldwide shipping", "Samples in every order", "Vegan & cruelty-free"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
                  <span style={{ color: "var(--gold)" }}>✦</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <section className="wrap" style={{ padding: "90px 22px 110px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--cream)", textAlign: "center", marginBottom: 40 }}>
            You may also <em style={{ color: "var(--gold)" }}>love</em>
          </h2>
          <div className="related-grid">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

const stepBtn: React.CSSProperties = {
  width: 44, height: "100%", minHeight: 52, background: "none", border: "none",
  color: "var(--cream)", cursor: "pointer", fontSize: 18,
};
