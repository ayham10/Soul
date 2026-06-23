"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ background: "#070605", borderTop: "1px solid var(--line)" }}>
      <style>{`
        .footer-grid {
          display: grid; grid-template-columns: 1fr; gap: 44px;
          padding: 64px 22px 40px; max-width: 1280px; margin: 0 auto;
        }
        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1fr; gap: 48px; padding: 84px 48px 48px; }
        }
        .footer-link { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; background: none; border: none; cursor: pointer; text-align: inherit; padding: 0; font-f[...]
        .footer-link:hover { color: var(--gold); }
        @media (max-width: 560px) {
          .footer-grid { padding: 58px 18px 38px; gap: 38px; }
          .footer-bottom { padding-inline: 18px !important; align-items: flex-start !important; }
        }
        @media (max-width: 340px) {
          .footer-grid { padding-left: 16px; padding-right: 16px; }
          .footer-bottom { padding-left: 16px !important; padding-right: 16px !important; }
        }
        .admin-link { display: none; }
      `}</style>

      <div className="footer-grid">
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, letterSpacing: 6, color: "var(--cream)" }}>
            S<span style={{ color: "var(--gold)" }}>O</span>UL
          </div>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", marginTop: 4, marginBottom: 22 }}>
            {t.nav.tagline}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.9, maxWidth: 300 }}>
            {t.footer.blurb}
          </p>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 22 }}>{t.footer.explore}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/" className="footer-link">{t.nav.home}</Link>
            <Link href="/shop" className="footer-link">{t.nav.collection}</Link>
            <Link href="/about" className="footer-link">{t.nav.story}</Link>
            <Link href="/admin" className="footer-link admin-link">{t.nav.admin}</Link>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 22 }}>{t.footer.care}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {t.footer.careItems.map((c) => (
              <span key={c} className="footer-link">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom" style={{
        borderTop: "1px solid var(--line)", padding: "20px 22px", maxWidth: 1280, margin: "0 auto",
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, color: "#5b5345", letterSpacing: 1 }}>© {new Date().getFullYear()} {t.footer.rights}</span>
        <span style={{ fontSize: 11, color: "#5b5345", letterSpacing: 1.4 }}>
          Owner: Sqr Daghash · Developer: Ayham Huss
        </span>
        <span style={{ fontSize: 11, color: "#5b5345", letterSpacing: 2 }}>@soul.parfum</span>
      </div>
    </footer>
  );
}
