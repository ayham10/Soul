import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function HomePage() {
  const featured = products.filter((p) => p.bestseller);
  const families = ["Oud", "Rose", "Amber", "Citrus", "Musk", "Marine", "Saffron", "Vanilla"];

  return (
    <>
      <style>{`
        .hero-title { font-size: clamp(48px, 11vw, 128px); }
        .hero-sub { font-size: clamp(13px, 1.6vw, 16px); }
        .split { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 900px) { .split { grid-template-columns: 1fr 1fr; } }
        .trio { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 760px) { .trio { grid-template-columns: repeat(3, 1fr); } }
        .grid-products { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 900px) { .grid-products { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
      `}</style>

      {/* ============ HERO ============ */}
      <section style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden" }}>
        <video
          autoPlay muted loop playsInline poster="/images/hero.png"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(7,6,5,0.86) 0%, rgba(7,6,5,0.5) 42%, rgba(7,6,5,0.15) 70%, rgba(7,6,5,0.45) 100%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,6,5,0.9) 0%, transparent 32%)" }} />

        <div style={{
          position: "relative", zIndex: 2, height: "100%", maxWidth: 1280, margin: "0 auto",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 clamp(22px, 5vw, 64px)",
        }}>
          <div className="eyebrow" style={{ animation: "fadeUp 0.8s ease both", color: "var(--gold-light)" }}>
            Maison de Parfum · Est. Grasse
          </div>
          <h1 className="hero-title" style={{ color: "#fff", margin: "18px 0 0", maxWidth: 900, animation: "fadeUp 0.9s ease 0.1s both" }}>
            Wear your<br /><em style={{ color: "var(--gold)" }}>Soul.</em>
          </h1>
          <p className="hero-sub" style={{ color: "rgba(255,255,255,0.78)", maxWidth: 440, lineHeight: 1.8, marginTop: 26, animation: "fadeUp 0.9s ease 0.2s both" }}>
            Extrait-strength fragrances composed from the world&apos;s rarest materials —
            oud, rose absolute, ambergris. Scent, made unforgettable.
          </p>
          <div className="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 38, animation: "fadeUp 0.9s ease 0.3s both" }}>
            <Link href="/shop" className="btn-gold">Shop the Collection</Link>
            <Link href="/about" className="btn-ghost">Our Story</Link>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Scroll</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold), transparent)", margin: "0 auto" }} />
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div style={{ background: "#070605", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "18px 0", overflow: "hidden" }}>
        <div className="marquee-track">
          {[...families, ...families].map((f, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 28, padding: "0 28px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {f} <span style={{ color: "var(--gold)" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ FEATURED COLLECTION ============ */}
      <section className="section wrap">
        <Reveal style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="eyebrow">Signature Scents</div>
          <h2 style={{ fontSize: "clamp(34px, 6vw, 60px)", color: "var(--cream)", margin: "14px 0 14px" }}>
            The <em style={{ color: "var(--gold)" }}>Collection</em>
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontSize: 14.5 }}>
            Six compositions, each an obsession. Discover the fragrances our clients return to again and again.
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
          <Link href="/shop" className="btn-ghost">View All Fragrances</Link>
        </Reveal>
      </section>

      {/* ============ BRAND STORY SPLIT ============ */}
      <section className="split" style={{ background: "var(--noir-soft)", borderTop: "1px solid var(--line)" }}>
        <div style={{ position: "relative", minHeight: 420 }}>
          <Image src="/images/atmosphere.png" alt="The art of scent" fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <Reveal style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(48px, 7vw, 96px)" }}>
          <div className="eyebrow">The House of Soul</div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", color: "var(--cream)", margin: "16px 0 22px" }}>
            The art of <em style={{ color: "var(--gold)" }}>slow</em> perfumery
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 18 }}>
            Every Soul fragrance begins with a raw material worth waiting for — agarwood aged for years,
            roses picked before dawn, resins sourced from a single grove. We compose in small batches,
            never compromising on concentration.
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.95, fontSize: 15, marginBottom: 32 }}>
            The result is a scent that unfolds for hours and becomes, unmistakably, your own.
          </p>
          <Link href="/about" className="btn-gold" style={{ alignSelf: "flex-start" }}>Discover Our Story</Link>
        </Reveal>
      </section>

      {/* ============ THE TRIO / PROMISE ============ */}
      <section className="section wrap">
        <div className="trio">
          {[
            { t: "Extrait Strength", d: "20–30% perfume oil. A few drops last from morning into the night." },
            { t: "Rare Materials", d: "Natural oud, rose absolute and ambergris — sourced, never synthesised." },
            { t: "Cruelty-Free", d: "Vegan formulas, recyclable glass, refillable by design." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100} style={{ textAlign: "center", padding: "8px 12px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: "var(--gold)", marginBottom: 14 }}>
                0{i + 1}
              </div>
              <h3 style={{ fontSize: 24, color: "var(--cream)", marginBottom: 12 }}>{c.t}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 14, maxWidth: 300, margin: "0 auto" }}>{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Image src="/images/hero.png" alt="" fill style={{ objectFit: "cover" }} sizes="100vw" />
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,6,5,0.72)" }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "clamp(72px, 12vw, 150px) 22px" }}>
          <div className="eyebrow">Not sure where to begin?</div>
          <h2 style={{ fontSize: "clamp(32px, 6vw, 64px)", color: "#fff", margin: "16px auto 24px", maxWidth: 760 }}>
            Find the scent that <em style={{ color: "var(--gold)" }}>feels like you</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.8, fontSize: 14.5 }}>
            Every order ships with a curated set of samples, so you can fall in love before you commit.
          </p>
          <Link href="/shop" className="btn-gold">Explore the Collection</Link>
        </div>
      </section>
    </>
  );
}
