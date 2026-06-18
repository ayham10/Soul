"use client";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useLang } from "@/lib/lang";

export default function AboutPage() {
  const { t } = useLang();
  const a = t.about;
  return (
    <>
      <style>{`
        .about-split { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 900px) { .about-split { grid-template-columns: 1fr 1fr; } }
        .values { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--line); border: 1px solid var(--line); }
        @media (min-width: 760px) { .values { grid-template-columns: repeat(3, 1fr); } }
        .about-copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(48px, 7vw, 96px); }
        .value-card { background: var(--noir-card); padding: 44px 34px; }
        @media (max-width: 560px) {
          .about-hero { min-height: 460px !important; }
          .about-copy { padding: 44px 18px 52px; }
          .about-media { min-height: 340px !important; }
          .value-card { padding: 36px 24px; }
          .about-cta { padding: 0 18px 90px !important; }
        }
        @media (max-width: 340px) {
          .about-copy { padding-left: 16px; padding-right: 16px; }
          .value-card { padding-left: 20px; padding-right: 20px; }
          .about-cta { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="about-hero" style={{ position: "relative", height: "62svh", minHeight: 420, overflow: "hidden" }}>
        <Image src="/images/atmosphere.png" alt="Soul ingredients" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,6,5,0.6), rgba(7,6,5,0.55) 50%, var(--noir) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 22px" }}>
          <div className="eyebrow" style={{ color: "var(--gold-light)" }}>{a.eyebrow}</div>
          <h1 style={{ fontSize: "clamp(44px, 9vw, 96px)", color: "#fff", marginTop: 16, maxWidth: 800 }}>
            {a.title} <em style={{ color: "var(--gold)" }}>{a.titleEm}</em>
          </h1>
        </div>
      </section>

      {/* Intro quote */}
      <section className="section wrap" style={{ maxWidth: 760, textAlign: "center" }}>
        <Reveal>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.6, color: "var(--cream)", fontStyle: "italic" }}>
            “{a.quote}”
          </p>
          <div style={{ marginTop: 24, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>
            {a.quoteBy}
          </div>
        </Reveal>
      </section>

      {/* Split story */}
      <section className="about-split" style={{ borderTop: "1px solid var(--line)", background: "var(--noir-soft)" }}>
        <Reveal className="about-copy">
          <div className="eyebrow">{a.sEyebrow}</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", color: "var(--cream)", margin: "16px 0 22px" }}>
            {a.sTitle} <em style={{ color: "var(--gold)" }}>{a.sTitleEm}</em>
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 18 }}>{a.sp1}</p>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15 }}>{a.sp2}</p>
        </Reveal>
        <div className="about-media" style={{ position: "relative", minHeight: 380, order: -1 }}>
          <Image src="/images/hero.png" alt="Soul perfume" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
      </section>

      {/* Values */}
      <section className="section wrap">
        <Reveal style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="eyebrow">{a.vEyebrow}</div>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", color: "var(--cream)", marginTop: 14 }}>
            {a.vTitle} <em style={{ color: "var(--gold)" }}>{a.vTitleEm}</em>
          </h2>
        </Reveal>
        <div className="values">
          {a.values.map((v) => (
            <div key={v.t} className="value-card">
              <h3 style={{ fontSize: 24, color: "var(--cream)", marginBottom: 14 }}>{v.t}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.85, fontSize: 14 }}>{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta" style={{ textAlign: "center", padding: "0 22px 110px" }}>
        <Link href="/shop" className="btn-gold">{a.cta}</Link>
      </section>
    </>
  );
}
