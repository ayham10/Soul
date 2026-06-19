"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { SHOP_WHATSAPP, formatPrice } from "@/lib/products";

export default function CartDrawer() {
  const { items, open, setOpen, total, setQty, remove, count } = useCart();
  const { t, dir } = useLang();

  const checkout = () => {
    const lines = items
      .map((i) => `• ${i.name} — ${i.ml}ml × ${i.qty} — ${formatPrice(i.price * i.qty)}`)
      .join("\n");
    const msg = encodeURIComponent(
      `Hello Soul,\n\nI'd like to order:\n${lines}\n\nTotal: ${formatPrice(total)}\n\nName:\nDelivery address:`
    );
    window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${msg}`, "_blank");
  };

  return (
    <>
      <style>{`
        .cart-close {
          width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
        }
        .cart-item-name { overflow-wrap: break-word; }
        @media (max-width: 420px) {
          .cart-header { padding: 20px 18px !important; }
          .cart-body { padding: 8px 18px !important; }
          .cart-item { gap: 13px !important; }
          .cart-thumb { width: 68px !important; height: 86px !important; }
          .cart-footer { padding: 22px 18px !important; }
        }
        @media (max-width: 340px) {
          .cart-header { padding-inline: 16px !important; }
          .cart-body { padding-inline: 16px !important; }
          .cart-item { gap: 12px !important; }
          .cart-thumb { width: 62px !important; height: 80px !important; }
          .cart-footer { padding-inline: 16px !important; }
        }
      `}</style>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 1500, background: "rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />
      <aside
        dir={dir}
        aria-hidden={!open}
        style={{
          position: "fixed", top: 0, insetInlineEnd: 0, bottom: 0, zIndex: 1600,
          width: "min(420px, 100vw)", background: "var(--noir-soft)",
          borderInlineStart: "1px solid var(--line)",
          transform: open ? "translateX(0)" : (dir === "rtl" ? "translateX(-100%)" : "translateX(100%)"),
          transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div className="cart-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="eyebrow">{t.cart.selection}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "var(--cream)", marginTop: 2 }}>
              {t.cart.bag} {count > 0 && <span style={{ color: "var(--gold)" }}>({count})</span>}
            </div>
          </div>
          <button className="cart-close" onClick={() => setOpen(false)} aria-label="Close cart" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 26, lineHeight: 1 }}>×</button>
        </div>

        <div className="cart-body" style={{ flex: 1, overflowY: "auto", padding: "8px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#6f6655", marginBottom: 10 }}>{t.cart.empty}</div>
              <Link href="/shop" onClick={() => setOpen(false)} className="footer-link" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: 1 }}>
                {t.cart.discover}
              </Link>
            </div>
          ) : (
            items.map((i) => (
              <div className="cart-item" key={`${i.slug}-${i.ml}`} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="cart-thumb" style={{ position: "relative", width: 72, height: 90, background: "var(--noir-card)", flexShrink: 0 }}>
                  <Image src={i.image} alt={i.name} fill style={{ objectFit: "cover" }} sizes="72px" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div className="cart-item-name" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "var(--cream)" }}>{i.name}</div>
                    <button onClick={() => remove(i.slug, i.ml)} aria-label="Remove" style={{ background: "none", border: "none", color: "#6f6655", cursor: "pointer", fontSize: 16, width: 32, height: 32, flex: "0 0 auto" }}>×</button>
                  </div>
                  <div style={{ fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", margin: "3px 0 12px" }}>
                    {t.cart.edp} · {i.ml}ml
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                      <button onClick={() => setQty(i.slug, i.ml, i.qty - 1)} aria-label="Decrease" style={qtyBtn}>−</button>
                      <span style={{ minWidth: 28, textAlign: "center", fontSize: 13, color: "var(--cream)" }}>{i.qty}</span>
                      <button onClick={() => setQty(i.slug, i.ml, i.qty + 1)} aria-label="Increase" style={qtyBtn}>+</button>
                    </div>
                    <div style={{ color: "var(--gold)", fontSize: 14, fontFamily: "'Jost', sans-serif" }}>{formatPrice(i.price * i.qty)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer" style={{ padding: 24, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)" }}>{t.cart.subtotal}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "var(--cream)" }}>{formatPrice(total)}</span>
            </div>
            <button onClick={checkout} className="btn-gold" style={{ width: "100%" }}>
              {t.cart.checkout}
            </button>
            <p style={{ fontSize: 10.5, color: "#5b5345", textAlign: "center", marginTop: 12, letterSpacing: 0.5 }}>
              {t.cart.note}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 44, height: 44, background: "none", border: "none",
  color: "var(--cream)", cursor: "pointer", fontSize: 16, lineHeight: 1,
};
