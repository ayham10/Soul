"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { Lang } from "@/lib/i18n";

function LangButton({ lang, toggle, onClick }: { lang: Lang; toggle: () => void; onClick?: () => void }) {
  return (
    <button
      onClick={() => { toggle(); onClick?.(); }}
      aria-label="Switch language"
      style={{
        fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "1.5px",
        background: "transparent", border: "1px solid rgba(198,161,91,0.45)", color: "var(--gold)",
        minHeight: 44, padding: "0 13px", cursor: "pointer", lineHeight: 1.2,
      }}
    >
      {lang === "en" ? "العربية" : "EN"}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { count, setOpen: setCartOpen } = useCart();
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/shop", label: t.nav.collection },
    { href: "/about", label: t.nav.story },
  ];

  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overHero || scrolled;
  const textColor = solid ? "var(--text)" : "rgba(255,255,255,0.95)";

  return (
    <>
      <style>{`
        .nav-links { display: flex; gap: 34px; align-items: center; }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .nav-burger {
          display: none; background: none; border: none; cursor: pointer; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px; min-width: 44px; min-height: 44px; padding: 8px;
        }
        .nav-link {
          position: relative; font-family: 'Jost', sans-serif;
          font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
          text-decoration: none; transition: color 0.25s; padding: 4px 0;
        }
        .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 0; background: var(--gold); transition: width 0.3s ease; }
        .nav-link:hover { color: var(--gold) !important; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .nav-lang-desktop { display: inline-flex; }
        @media (max-width: 880px) {
          .nav-links { display: none; }
          .nav-lang-desktop { display: none; }
          .nav-burger { display: flex; }
          .nav-actions { gap: 8px; }
        }
        .mobile-panel {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(8,7,6,0.98); backdrop-filter: blur(8px);
          display: flex; flex-direction: column; padding: 104px 28px 40px;
          transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        [dir="rtl"] .mobile-panel { transform: translateX(-100%); }
        .mobile-panel.open { transform: translateX(0); }
        .mobile-link {
          font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 300;
          color: var(--cream); text-decoration: none; padding: 18px 0;
          border-bottom: 1px solid rgba(198,161,91,0.14);
        }
        [dir="rtl"] .mobile-link { font-family: 'Noto Naskh Arabic', serif; }
      `}</style>

      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300,
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(18px, 4vw, 48px)",
          background: solid ? "rgba(11,10,9,0.82)" : "transparent",
          backdropFilter: solid ? "blur(14px)" : "none",
          borderBottom: solid ? "1px solid var(--line)" : "1px solid transparent",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", lineHeight: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, letterSpacing: 6, color: textColor }}>
            S<span style={{ color: "var(--gold)" }}>O</span>UL
          </div>
          <div style={{ fontSize: 7.5, letterSpacing: lang === "ar" ? 0 : 4, textTransform: "uppercase", color: "var(--gold)", marginTop: 2, textAlign: "center" }}>
            {t.nav.tagline}
          </div>
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname === l.href ? " active" : ""}`}
              style={{ color: pathname === l.href ? "var(--gold)" : textColor }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <span className="nav-lang-desktop"><LangButton lang={lang} toggle={toggle} /></span>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            style={{ background: "none", border: "none", cursor: "pointer", position: "relative", color: textColor, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 7h12l-1 13H7L6 7z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && (
              <span style={{
                position: "absolute", top: -6, insetInlineEnd: -8, background: "var(--gold)", color: "#1a140a",
                fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                fontFamily: "'Jost', sans-serif",
              }}>{count}</span>
            )}
          </button>

          <button className="nav-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <span style={{ width: 24, height: 1.5, background: menuOpen ? "var(--gold)" : textColor, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(4px,5px)" : "none" }} />
            <span style={{ width: 18, height: 1.5, background: "var(--gold)", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ width: 24, height: 1.5, background: menuOpen ? "var(--gold)" : textColor, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(4px,-5px)" : "none" }} />
          </button>
        </div>
      </nav>

      <div className={`mobile-panel${menuOpen ? " open" : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/shop" className="btn-gold" style={{ marginTop: 32 }} onClick={() => setMenuOpen(false)}>
          {t.nav.shopCta}
        </Link>
        <div style={{ marginTop: 24 }}>
          <LangButton lang={lang} toggle={toggle} onClick={() => setMenuOpen(false)} />
        </div>
        <div style={{ marginTop: "auto", fontSize: 10, color: "var(--muted)" }}>
          {t.nav.brandSub}
        </div>
      </div>
    </>
  );
}
