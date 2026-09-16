"use client";
import Image from "next/image";
import {
  SoulOffering,
  buildOfferingCtaHref,
  formatOfferingPrice,
  localizeOffering,
  offeringStatusLabel,
} from "@/lib/soul-offerings";
import { useLang } from "@/lib/lang";

export default function SoulOfferingCard({ offering }: { offering: SoulOffering }) {
  const { lang } = useLang();
  const localized = localizeOffering(offering, lang);
  const ctaHref = buildOfferingCtaHref(offering, lang);
  const statusLabel = offeringStatusLabel(offering.status, lang);
  const isActionable = offering.status === "available" || offering.status === "limited";

  return (
    <article
      className="soul-offering-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid var(--line)",
        background: "linear-gradient(180deg, rgba(198,161,91,0.05), rgba(11,10,9,0.92))",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
        <Image
          src={offering.image}
          alt={localized.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            insetInlineStart: 14,
            top: 14,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "6px 10px",
            background: "rgba(7,6,5,0.72)",
            border: "1px solid rgba(198,161,91,0.35)",
            color: "var(--gold)",
          }}
        >
          {statusLabel}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "22px 20px 24px" }}>
        <h3
          style={{
            fontFamily: lang === "ar" ? "'Noto Naskh Arabic', serif" : "'Cormorant Garamond', serif",
            fontSize: "clamp(24px, 3.2vw, 30px)",
            fontWeight: 400,
            color: "var(--cream)",
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          {localized.title}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.85, marginBottom: 18, flex: 1 }}>
          {localized.description}
        </p>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            color: "var(--gold)",
            marginBottom: 16,
          }}
        >
          {formatOfferingPrice(offering, lang)}
        </div>
        {isActionable ? (
          <a href={ctaHref} target="_blank" rel="noreferrer" className="btn-gold" style={{ textAlign: "center" }}>
            {localized.ctaText}
          </a>
        ) : (
          <span
            className="btn-ghost"
            style={{ textAlign: "center", opacity: 0.55, cursor: "not-allowed", pointerEvents: "none" }}
          >
            {localized.ctaText}
          </span>
        )}
      </div>
    </article>
  );
}
