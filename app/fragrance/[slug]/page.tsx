"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SIZES, localize } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { famLabel, genderLabel } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

function NoteRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 18, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ width: 96, flexShrink: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", paddingTop: 3 }}>{label}</div>
      <div style={{ color: "var(--cream)", fontSize: 15, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{items.join(" · ")}</div>
    </div>
  );
}

export default function FragrancePage() {
  const params = useParams<{ slug: string }>();
  const { get, products, ready } = useProducts();
  const { t, lang } = useLang();
  const { add, setOpen } = useCart();
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const product = get(params.slug);
  const price = useMemo(
    () => (product ? Math.round(product.price * SIZES[sizeIdx].multiplier) : 0),
    [product, sizeIdx]
  );

  if (!product) {
    if (!ready) {
      return <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>…</div>;
    }
    return (
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24 }}>
        <h1 style={{ fontSize: 40, color: "var(--cream)" }}>{t.product.notFound}</h1>
        <Link href="/shop" className="btn-gold">{t.product.back}</Link>
      </div>
    );
  }

  const L = localize(product, lang);
  const ml = SIZES[sizeIdx].ml;
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const addToCart = () => add({ slug: product.slug, name: L.name, image: product.image, ml, price }, qty);

  return (
    <>
      <style>{`
        .detail { display: grid; grid-template-columns: 1fr; gap: 0; }
        .detail-img { position: relative; height: 54vh; min-height: 320px; border-bottom: 1px solid var(--line); }
        @media (min-width: 940px) {
          .detail { grid-template-columns: 1fr 1fr; }
          .detail-img { height: min(86vh, 760px); min-height: 420px; border-bottom: none; border-inline-end: 1px solid var(--line); }
        }
        .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 760px) { .related-grid { grid-template-columns: repeat(3, 1fr); gap: 22px; } }

        /* Purchase controls — mobile-first, fully responsive */
        .size-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .size-opt { padding: 16px 12px; cursor: pointer; background: transparent; transition: all 0.25s; text-align: center; }
        .buy-row { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
        .qty-box { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--line); height: 54px; }
        .qty-box button { width: 52px; height: 100%; background: none; border: none; color: var(--cream); cursor: pointer; font-size: 20px; line-height: 1; }
        .qty-box .num { flex: 1; text-align: center; color: var(--cream); font-size: 15px; }
        .add-btn { flex: 1; min-height: 54px; }
        @media (min-width: 520px) {
          .buy-row { flex-direction: row; }
          .qty-box { width: 150px; flex: 0 0 auto; }
        }
      `}</style>

      <div style={{ paddingTop: 72 }}>
        <div className="detail">
          {/* Image */}
          <div className="detail-img" style={{ background: "#0e0c0b" }}>
            <Image src={product.image} alt={L.name} fill priority style={{ objectFit: "cover" }} sizes="(max-width: 940px) 100vw, 50vw" />
            <span style={{ position: "absolute", top: 90, insetInlineStart: 22, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--cream)", background: "rgba(0,0,0,0.5)", border: "1px solid var(--line)", padding: "6px 12px" }}>
              {famLabel(product.family, lang)} · {genderLabel(product.gender, lang)}
            </span>
          </div>

          {/* Info */}
          <div style={{ padding: "clamp(34px, 6vw, 80px) clamp(20px, 5vw, 70px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <nav style={{ fontSize: 11, letterSpacing: 1, color: "var(--muted)", marginBottom: 22 }}>
              <Link href="/shop" style={{ color: "var(--muted)", textDecoration: "none" }}>{t.product.breadcrumb}</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span style={{ color: "var(--cream)" }}>{L.name}</span>
            </nav>

            <h1 style={{ fontSize: "clamp(38px, 6vw, 66px)", color: "var(--cream)" }}>{L.name}</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "var(--gold)", marginTop: 8 }}>
              {L.tagline}
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 14.5, margin: "24px 0 30px" }}>
              {L.description}
            </p>

            {/* Size */}
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>{t.product.size}</div>
            <div className="size-row" style={{ marginBottom: 26 }}>
              {SIZES.map((s, i) => (
                <button
                  key={s.ml}
                  className="size-opt"
                  onClick={() => setSizeIdx(i)}
                  style={{
                    border: `1px solid ${i === sizeIdx ? "var(--gold)" : "var(--line)"}`,
                    color: i === sizeIdx ? "var(--gold)" : "var(--cream)",
                  }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>{s.ml}ml</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>${Math.round(product.price * s.multiplier)}</div>
                </button>
              ))}
            </div>

            {/* Qty + Add */}
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>{t.product.quantity}</div>
            <div className="buy-row" style={{ marginBottom: 12 }}>
              <div className="qty-box">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span className="num">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
              </div>
              <button className="btn-gold add-btn" onClick={addToCart}>
                {t.product.addToBag} · ${price * qty}
              </button>
            </div>
            <button onClick={() => { addToCart(); setOpen(true); }} className="btn-ghost" style={{ width: "100%", minHeight: 52 }}>
              {t.product.buyNow}
            </button>

            {/* Notes pyramid */}
            <div style={{ marginTop: 40 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{t.product.composition}</div>
              <NoteRow label={t.product.top} items={L.notes.top} />
              <NoteRow label={t.product.heart} items={L.notes.heart} />
              <NoteRow label={t.product.base} items={L.notes.base} />
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
              {t.product.perks.map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
                  <span style={{ color: "var(--gold)" }}>✦</span> {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="wrap" style={{ padding: "90px 22px 110px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--cream)", textAlign: "center", marginBottom: 40 }}>
              {t.product.related} <em style={{ color: "var(--gold)" }}>{t.product.relatedEm}</em>
            </h2>
            <div className="related-grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
