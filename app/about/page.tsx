import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-split { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 900px) { .about-split { grid-template-columns: 1fr 1fr; } }
        .values { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--line); border: 1px solid var(--line); }
        @media (min-width: 760px) { .values { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      {/* Hero */}
      <section style={{ position: "relative", height: "62svh", minHeight: 420, overflow: "hidden" }}>
        <Image src="/images/atmosphere.png" alt="Soul ingredients" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,6,5,0.6), rgba(7,6,5,0.55) 50%, var(--noir) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 22px" }}>
          <div className="eyebrow" style={{ color: "var(--gold-light)" }}>Our Story</div>
          <h1 style={{ fontSize: "clamp(44px, 9vw, 96px)", color: "#fff", marginTop: 16, maxWidth: 800 }}>
            Scent is <em style={{ color: "var(--gold)" }}>memory</em>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="section wrap" style={{ maxWidth: 760, textAlign: "center" }}>
        <Reveal>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.6, color: "var(--cream)", fontStyle: "italic" }}>
            “We started Soul with a simple belief — that a fragrance should feel like a part of you,
            not a mask over it.”
          </p>
          <div style={{ marginTop: 24, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)" }}>
            — The Founders
          </div>
        </Reveal>
      </section>

      {/* Split story */}
      <section className="about-split" style={{ borderTop: "1px solid var(--line)", background: "var(--noir-soft)" }}>
        <Reveal style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(48px, 7vw, 96px)" }}>
          <div className="eyebrow">From Grasse, with patience</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", color: "var(--cream)", margin: "16px 0 22px" }}>
            A house built on <em style={{ color: "var(--gold)" }}>raw materials</em>
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 18 }}>
            In the hills of Grasse — the birthplace of modern perfumery — we work with growers and
            distillers who have perfected their craft over generations. Our oud is aged. Our roses are
            picked by hand before sunrise. Nothing is rushed.
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15 }}>
            Each composition is poured at extrait strength and rested before it ever reaches you, so the
            first spray is as honest as the last.
          </p>
        </Reveal>
        <div style={{ position: "relative", minHeight: 380, order: -1 }}>
          <Image src="/images/hero.png" alt="Soul perfume" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
      </section>

      {/* Values */}
      <section className="section wrap">
        <Reveal style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="eyebrow">What we stand for</div>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", color: "var(--cream)", marginTop: 14 }}>
            The Soul <em style={{ color: "var(--gold)" }}>promise</em>
          </h2>
        </Reveal>
        <div className="values">
          {[
            { t: "Sustainably Sourced", d: "Traceable ingredients and partnerships that respect the land and the people who tend it." },
            { t: "Made to Last", d: "High-concentration extraits and refillable bottles, so beauty never becomes waste." },
            { t: "Honestly Priced", d: "Sold direct, never through endless middlemen — luxury without the markup." },
          ].map((v) => (
            <div key={v.t} style={{ background: "var(--noir-card)", padding: "44px 34px" }}>
              <h3 style={{ fontSize: 24, color: "var(--cream)", marginBottom: 14 }}>{v.t}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.85, fontSize: 14 }}>{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "0 22px 110px" }}>
        <Link href="/shop" className="btn-gold">Shop the Collection</Link>
      </section>
    </>
  );
}
