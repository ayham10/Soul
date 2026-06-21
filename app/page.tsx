"use client";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { SHOP_WHATSAPP } from "@/lib/products";

export default function HomePage() {
  const { products } = useProducts();
  const { t } = useLang();

  const bestsellers = products.filter((p) => p.bestseller);
  const featured = (bestsellers.length ? bestsellers : products).slice(0, 3);
  const wellnessMessage = encodeURIComponent(
    "مرحباً Soul، أريد الاستفسار عن رذاذ راحة العضلات والمفاصل: السعر، التوفر، وطريقة الاستخدام والتوصيل."
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
          <div className="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 38, animation: "fadeUp 0.9s ease 0.3s both" }}>
            <Link href="/shop" className="btn-gold">{t.hero.shop}</Link>
            <Link href="/about" className="btn-ghost">{t.hero.story}</Link>
          </div>
        </div>

        <div className="hero-scroll">
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>{t.hero.scroll}</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold), transparent)", margin: "0 auto" }} />
        </div>
      </section>

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
      <section className="wellness-shell">
        <div className="wellness-grid">
          <Reveal className="wellness-copy">
            <div className="eyebrow">{t.wellness.eyebrow}</div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 58px)", color: "var(--cream)", margin: "16px 0 20px" }}>
              {t.wellness.title} <em style={{ color: "var(--gold)" }}>{t.wellness.titleEm}</em>
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.9, fontSize: 15, maxWidth: 560, marginBottom: 28 }}>
              {t.wellness.sub}
            </p>
            <a
              href={`https://wa.me/${SHOP_WHATSAPP}?text=${wellnessMessage}`}
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
            >
              {t.wellness.cta}
            </a>
          </Reveal>

          <Reveal className="wellness-card">
            <Image src="/images/atmosphere.png" alt="" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 55vw" />
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
