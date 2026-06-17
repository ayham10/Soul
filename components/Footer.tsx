import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#070605", borderTop: "1px solid var(--line)" }}>
      <style>{`
        .footer-grid {
          display: grid; grid-template-columns: 1fr; gap: 44px;
          padding: 64px 22px 40px; max-width: 1280px; margin: 0 auto;
        }
        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1fr 1.4fr; gap: 48px; padding: 84px 48px 48px; }
        }
        .footer-link { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: var(--gold); }
        .news-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--cream); font-family: 'Jost', sans-serif; font-size: 13px; padding: 12px 4px;
        }
        .news-input::placeholder { color: #6f6655; }
      `}</style>

      <div className="footer-grid">
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, letterSpacing: 6, color: "var(--cream)" }}>
            S<span style={{ color: "var(--gold)" }}>O</span>UL
          </div>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", marginTop: 4, marginBottom: 22 }}>
            Maison de Parfum
          </div>
          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.9, maxWidth: 300 }}>
            Rare ingredients, composed slowly. Soul is a small fragrance house crafting
            extrait-strength perfumes for those who wear scent like a signature.
          </p>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 22 }}>Explore</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/shop" className="footer-link">The Collection</Link>
            <Link href="/about" className="footer-link">Our Story</Link>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 22 }}>Client Care</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="footer-link">Shipping &amp; Returns</span>
            <span className="footer-link">Find Your Scent</span>
            <span className="footer-link">Contact</span>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 22 }}>The List</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8, marginBottom: 16 }}>
            Private launches and 10% off your first order.
          </p>
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
            <input className="news-input" type="email" placeholder="Email address" aria-label="Email address" />
            <button aria-label="Subscribe" style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: "0 4px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: "1px solid var(--line)", padding: "20px 22px", maxWidth: 1280, margin: "0 auto",
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, color: "#5b5345", letterSpacing: 1 }}>© {new Date().getFullYear()} Soul Maison de Parfum. All rights reserved.</span>
        <span style={{ fontSize: 11, color: "#5b5345", letterSpacing: 2 }}>@soul.parfum</span>
      </div>
    </footer>
  );
}
