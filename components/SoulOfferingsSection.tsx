"use client";
import Reveal from "@/components/Reveal";
import SoulOfferingCard from "@/components/SoulOfferingCard";
import { useSoulOfferings } from "@/lib/offerings-store";
import { SOUL_OFFERINGS_SECTION_ID } from "@/lib/soul-offerings";
import { useLang } from "@/lib/lang";

export default function SoulOfferingsSection() {
  const { offerings, ready } = useSoulOfferings();
  const { t } = useLang();
  const visible = offerings.filter((item) => item.published);

  if (!ready) return null;
  if (!visible.length) return null;

  return (
    <section
      id={SOUL_OFFERINGS_SECTION_ID}
      className="section soul-offerings-section"
      style={{
        background: "var(--noir-soft)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        scrollMarginTop: 88,
      }}
    >
      <style>{`
        .soul-offerings-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: stretch;
        }
        @media (min-width: 700px) {
          .soul-offerings-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
        }
        @media (min-width: 1080px) {
          .soul-offerings-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>

      <div className="wrap">
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow">{t.offerings.eyebrow}</div>
          <h2
            style={{
              fontSize: "clamp(34px, 6vw, 58px)",
              color: "var(--cream)",
              margin: "14px 0 14px",
              fontFamily: "'Noto Naskh Arabic', serif",
            }}
          >
            {t.offerings.title}
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: 620, margin: "0 auto", lineHeight: 1.85, fontSize: 14.5 }}>
            {t.offerings.sub}
          </p>
        </Reveal>

        <div className="soul-offerings-grid">
          {visible.map((offering, index) => (
            <Reveal key={offering.slug} delay={index * 80} style={{ height: "100%" }}>
              <SoulOfferingCard offering={offering} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
