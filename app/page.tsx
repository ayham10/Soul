"use client";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { SHOP_WHATSAPP, formatPrice } from "@/lib/products";
import SoulOfferingsSection from "@/components/SoulOfferingsSection";
import { SOUL_OFFERINGS_SECTION_ID } from "@/lib/soul-offerings";

export default function HomePage() {
  const { products } = useProducts();
  const { t } = useLang();

  const scrollToOfferings = () => {
    document.getElementById(SOUL_OFFERINGS_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bestsellers = products.filter((p) => p.bestseller);
  const featured = (bestsellers.length ? bestsellers : products).slice(0, 3);
  const wellnessPrice = 150;
  const wellnessMessage = encodeURIComponent(
    `مرحباً Soul، أريد طلب مرش علاجي للعضلات والمفاصل والرُكب بسعر ${formatPrice(wellnessPrice)}. يرجى إرسال طريقة الاستخدام وخيارات التوصيل.`
  );

  return (
    <>
      <link rel="preload" href="/videos/background.mp4" as="video" type="video/mp4" />
      <style>{`
        .hero-section { position: relative; height: 100svh; min-height: 560px; overflow: hidden; }
        .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .hero-content {
          position: relative; z-index: 2; height: 100%; max-width: 1280px; margin: 0 auto;
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 clamp(22px, 5vw, 64px);
        }
        .hero-title { font-size: clamp(48px, 11vw, 128px); }
        .hero-sub { font-size: clamp(13px, 1.6vw, 16px); }
        .hero-scroll { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; }
        .hero-cta-stack {
          margin-top: 38px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          animation: heroCtaReveal 1.15s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both;
        }
        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .hero-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 15px 30px;
          text-decoration: none;
          cursor: pointer;
          overflow: hidden;
          isolation: isolate;
          font-family: 'Noto Naskh Arabic', 'Cormorant Garamond', serif;
          font-size: clamp(15px, 3.6vw, 17px);
          font-weight: 500;
          line-height: 1.2;
          transition:
            color 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-cta__label { position: relative; z-index: 1; }
        .hero-cta--primary {
          color: #1a140a;
          border: 1px solid rgba(227, 199, 137, 0.55);
          background:
            linear-gradient(135deg, rgba(227, 199, 137, 0.98) 0%, rgba(198, 161, 91, 0.94) 48%, rgba(156, 124, 63, 0.92) 100%);
          box-shadow:
            0 14px 40px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }
        .hero-cta--primary::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.28) 50%, transparent 65%);
          transform: translateX(-120%);
          transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 0;
        }
        .hero-cta--primary:hover::before,
        .hero-cta--primary:focus-visible::before { transform: translateX(120%); }
        .hero-cta--primary:hover,
        .hero-cta--primary:focus-visible {
          transform: translateY(-2px);
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.34),
            0 0 0 1px rgba(227, 199, 137, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }
        .hero-cta--primary:active { transform: translateY(0); }
        .hero-cta--secondary {
          color: rgba(239, 231, 216, 0.92);
          background: rgba(7, 6, 5, 0.22);
          border: 1px solid rgba(198, 161, 91, 0.42);
          backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        }
        .hero-cta--secondary:hover,
        .hero-cta--secondary:focus-visible {
          color: var(--gold-light);
          border-color: rgba(227, 199, 137, 0.72);
          background: rgba(198, 161, 91, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
        }
        .hero-cta--secondary:active { transform: translateY(0); }
        .hero-cta:focus-visible {
          outline: 1px solid var(--gold-light);
          outline-offset: 3px;
        }
        .hero-scroll-ind {
          margin-top: 26px;
          padding: 8px 2px 0;
          border: none;
          background: none;
          cursor: pointer;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.62);
          transition: color 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-scroll-ind:hover,
        .hero-scroll-ind:focus-visible { color: var(--gold-light); }
        .hero-scroll-ind:focus-visible {
          outline: 1px solid rgba(198, 161, 91, 0.45);
          outline-offset: 6px;
        }
        .hero-scroll-ind__text {
          font-family: 'Noto Naskh Arabic', serif;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
        }
        .hero-scroll-ind__track {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 18px;
        }
        .hero-scroll-ind__line {
          width: 1px;
          height: 34px;
          background: linear-gradient(to bottom, rgba(198, 161, 91, 0.05), rgba(198, 161, 91, 0.75));
          transform-origin: top center;
          animation: heroScrollLine 2.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .hero-scroll-ind__chev {
          width: 8px;
          height: 8px;
          border-right: 1px solid var(--gold);
          border-bottom: 1px solid var(--gold);
          transform: rotate(45deg);
          margin-top: -4px;
          animation: heroScrollChevron 2.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          opacity: 0.85;
        }
        @keyframes heroCtaReveal {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScrollChevron {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.55; }
          50% { transform: rotate(45deg) translateY(7px); opacity: 1; }
        }
        @keyframes heroScrollLine {
          0%, 100% { transform: scaleY(0.72); opacity: 0.45; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-cta-stack { animation: none; opacity: 1; transform: none; }
          .hero-scroll-ind__line,
          .hero-scroll-ind__chev { animation: none; opacity: 0.75; }
          .hero-cta--primary::before { display: none; }
          .hero-cta--primary:hover,
          .hero-cta--primary:focus-visible,
          .hero-cta--secondary:hover,
          .hero-cta--secondary:focus-visible { transform: none; }
        }
        .split { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 900px) { .split { grid-template-columns: 1fr 1fr; } }
        .trio { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 760px) { .trio { grid-template-columns: repeat(3, 1fr); } }
        .wellness-shell {
          position: relative; overflow: hidden; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
          background: radial-gradient(90% 65% at 70% 12%, rgba(198,161,91,0.16), transparent 58%), var(--noir-soft);
        }
        .wellness-shell .reveal { opacity: 1; }
        .wellness-grid {
          display: grid; grid-template-columns: 1fr; gap: 0; max-width: 1280px; margin: 0 auto;
        }
        .wellness-copy { padding: clamp(58px, 8vw, 110px) clamp(20px, 5vw, 64px); }
        .wellness-card {
          position: relative; display: flex; flex-direction: column; justify-content: flex-end; min-height: 520px;
          padding: clamp(26px, 5vw, 54px); border-inline-start: 1px solid var(--line); overflow: hidden;
        }
        .wellness-card::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(7,6,5,0.92), rgba(7,6,5,0.44) 48%, rgba(7,6,5,0.12));
        }
        .wellness-card-content { position: relative; z-index: 2; max-width: 430px; }
        .wellness-price {
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--gold); font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 42px); line-height: 1; margin: 18px 0 2px;
        }
        .wellness-bullets { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 24px 0 26px; }
        @media (min-width: 900px) {
          .wellness-grid { grid-template-columns: 0.92fr 1.08fr; }
          .wellness-card { min-height: 610px; }
        }
        .grid-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
        .grid-products > .reveal { height: 100%; }
        @media (min-width: 640px) { .grid-products { gap: 20px; } }
        @media (min-width: 900px) { .grid-products { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
        @media (max-width: 340px) { .grid-products { gap: 10px; } }
        @media (max-width: 560px) {
          .hero-section { min-height: 640px; }
          .hero-content { justify-content: flex-end; padding: 0 20px 92px; }
          .hero-title { font-size: clamp(44px, 15vw, 64px); line-height: 0.96; }
          .hero-sub { font-size: 14px; line-height: 1.75; margin-top: 22px !important; }
          .hero-scroll { display: none; }
          .hero-cta-stack { margin-top: 30px; width: 100%; max-width: 340px; }
          .hero-cta-row { flex-direction: column; align-items: stretch; width: 100%; gap: 10px; }
          .hero-cta { width: 100%; min-height: 50px; padding: 14px 22px; }
          .hero-scroll-ind { margin-top: 22px; align-self: center; }
          .wellness-copy { padding: 58px 18px 46px; }
          .wellness-card { min-height: 460px; border-inline-start: none; border-top: 1px solid var(--line); padding: 24px 18px; }
        }
        @media (max-width: 340px) {
          .hero-section { min-height: 600px; }
          .hero-content { padding-inline: 18px; padding-bottom: 82px; }
          .hero-title { font-size: 42px; }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(7,6,5,0.82) 0%, rgba(7,6,5,0.48) 42%, rgba(7,6,5,0.18) 70%, rgba(7,6,5,0.48) 100%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,6,5,0.92) 0%, rgba(7,6,5,0.38) 42%, transparent 76%)" }} />

        <div className="hero-content">
          <div className="eyebrow" style={{ animation: "fadeUp 0.8s ease both", color: "var(--gold-light)" }}>
            {t.hero.eyebrow}
          </div>
          <h1 className="hero-title" style={{ color: "#fff", margin: "18px 0 0", maxWidth: 900, animation: "fadeUp 0.9s ease 0.1s both" }}>
            {t.hero.line1}<br /><em style={{ color: "var(--gold)" }}>{t.hero.italic}</em>
          </h1>
          <p className="hero-sub" style={{ color: "rgba(255,255,255,0.78)", maxWidth: 460, lineHeight: 1.8, marginTop: 26, animation: "fadeUp 0.9s ease 0.2s both" }}>
            {t.hero.sub}
          </p>
          <div className="hero-cta-stack">
            <div className="hero-cta-row">
              <Link href="/shop" className="hero-cta hero-cta--primary">
                <span className="hero-cta__label">{t.hero.shop}</span>
              </Link>
              <Link href="/about" className="hero-cta hero-cta--secondary">
                <span className="hero-cta__label">{t.hero.story}</span>
              </Link>
            </div>
            <button
              type="button"
              className="hero-scroll-ind"
              onClick={scrollToOfferings}
              aria-label={`${t.hero.discoverMore} — ${t.hero.scroll}`}
            >
              <span className="hero-scroll-ind__text">{t.hero.discoverMore}</span>
              <span className="hero-scroll-ind__track" aria-hidden="true">
                <span className="hero-scroll-ind__line" />
                <span className="hero-scroll-ind__chev" />
              </span>
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>{t.hero.scroll}</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold), transparent)", margin: "0 auto" }} />
        </div>
      </section>

      <SoulOfferingsSection />

      {/* ============ MARQUEE ============ */}
      <div style={{ background: "#070605", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "18px 0", overflow: "hidden" }}>
        <div className="marquee-track">
          {[...t.marquee, ...t.marquee].map((f, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 28, padding: "0 28px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {f} <span style={{ color: "var(--gold)" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ FEATURED COLLECTION ============ */}
      <section className="section wrap">
        <Reveal style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="eyebrow">{t.featured.eyebrow}</div>
          <h2 style={{ fontSize: "clamp(34px, 6vw, 60px)", color: "var(--cream)", margin: "14px 0 14px" }}>
            {t.featured.title} <em style={{ color: "var(--gold)" }}>{t.featured.titleEm}</em>
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontSize: 14.5 }}>
            {t.featured.sub}
          </p>
        </Reveal>

        <div className="grid-products">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/shop" className="btn-ghost">{t.featured.viewAll}</Link>
        </Reveal>
      </section>

      {/* ============ BRAND STORY SPLIT ============ */}
      <section className="split" style={{ background: "var(--noir-soft)", borderTop: "1px solid var(--line)" }}>
        <div style={{ position: "relative", minHeight: 420 }}>
          <Image src="/images/atmosphere.png" alt="The art of scent" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <Reveal style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(48px, 7vw, 96px)" }}>
          <div className="eyebrow">{t.storyBlock.eyebrow}</div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", color: "var(--cream)", margin: "16px 0 22px" }}>
            {t.storyBlock.title} <em style={{ color: "var(--gold)" }}>{t.storyBlock.titleEm}</em>
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 18 }}>
            {t.storyBlock.p1}
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 32 }}>
            {t.storyBlock.p2}
          </p>
          <Link href="/about" className="btn-gold" style={{ alignSelf: "flex-start" }}>{t.storyBlock.cta}</Link>
        </Reveal>
      </section>

      {/* ============ THE TRIO / PROMISE ============ */}
      <section className="section wrap">
        <div className="trio">
          {t.trio.items.map((c, i) => (
            <Reveal key={i} delay={i * 100} style={{ textAlign: "center", padding: "8px 12px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: "var(--gold)", marginBottom: 14 }}>
                0{i + 1}
              </div>
              <h3 style={{ fontSize: 24, color: "var(--cream)", marginBottom: 12 }}>{c.t}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 14, maxWidth: 300, margin: "0 auto" }}>{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ WELLNESS / BODY CARE ============ */}
      <section id="wellness" className="wellness-shell">
        <div className="wellness-grid">
          <Reveal className="wellness-copy">
            <div className="eyebrow">{t.wellness.eyebrow}</div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 58px)", color: "var(--cream)", margin: "16px 0 20px" }}>
              {t.wellness.title} <em style={{ color: "var(--gold)" }}>{t.wellness.titleEm}</em>
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.9, fontSize: 15, maxWidth: 560, marginBottom: 28 }}>
              {t.wellness.sub}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <a
                href={`https://wa.me/${SHOP_WHATSAPP}?text=${wellnessMessage}`}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                {t.wellness.cta}
              </a>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "var(--gold)" }}>
                {formatPrice(wellnessPrice)}
              </span>
            </div>
          </Reveal>

          <Reveal className="wellness-card">
            <Image src="/images/Med.jpeg" alt={t.wellness.cardTitle} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 55vw" />
            <div className="wellness-card-content">
              <div style={{
                display: "inline-flex", color: "#1a140a", background: "var(--gold)", fontSize: 9,
                letterSpacing: 2, textTransform: "uppercase", padding: "7px 11px", marginBottom: 18,
              }}>
                {t.wellness.badge}
              </div>
              <h3 style={{ fontSize: "clamp(30px, 4vw, 46px)", color: "#fff", marginBottom: 12 }}>
                {t.wellness.cardTitle}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.8, fontSize: 14.5 }}>
                {t.wellness.cardSub}
              </p>
              <div className="wellness-price">{formatPrice(wellnessPrice)}</div>
              <div className="wellness-bullets">
                {t.wellness.bullets.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--cream)", fontSize: 13 }}>
                    <span style={{ color: "var(--gold)" }}>✦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.52)", lineHeight: 1.7, fontSize: 11.5 }}>
                {t.wellness.note}
              </p>
              <a
                href={`https://wa.me/${SHOP_WHATSAPP}?text=${wellnessMessage}`}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
                style={{ marginTop: 20, width: "100%" }}
              >
                {t.wellness.cta}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Image src="/images/hero.png" alt="" fill style={{ objectFit: "cover" }} sizes="100vw" />
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,6,5,0.72)" }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "clamp(72px, 12vw, 150px) 22px" }}>
          <div className="eyebrow">{t.cta.eyebrow}</div>
          <h2 style={{ fontSize: "clamp(32px, 6vw, 64px)", color: "#fff", margin: "16px auto 24px", maxWidth: 760 }}>
            {t.cta.title} <em style={{ color: "var(--gold)" }}>{t.cta.titleEm}</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.8, fontSize: 14.5 }}>
            {t.cta.sub}
          </p>
          <Link href="/shop" className="btn-gold">{t.cta.btn}</Link>
        </div>
      </section>
    </>
  );
}
