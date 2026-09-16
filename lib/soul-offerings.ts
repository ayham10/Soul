import { Lang } from "@/lib/i18n";
import { formatPrice, SHOP_WHATSAPP } from "@/lib/products";

export const SOUL_OFFERINGS_SECTION_ID = "soul-offerings";

export type OfferingStatus = "available" | "limited" | "coming_soon" | "unavailable";

export interface SoulOffering {
  slug: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  price: number | null;
  priceLabel?: string;
  priceLabel_ar?: string;
  image: string;
  status: OfferingStatus;
  ctaText: string;
  ctaText_ar?: string;
  ctaHref?: string;
  displayOrder: number;
  published: boolean;
}

export const OFFERING_STATUSES: OfferingStatus[] = [
  "available",
  "limited",
  "coming_soon",
  "unavailable",
];

export function localizeOffering(offering: SoulOffering, lang: Lang): SoulOffering {
  if (lang === "en") return offering;
  return {
    ...offering,
    title: offering.title_ar?.trim() || offering.title,
    description: offering.description_ar?.trim() || offering.description,
    priceLabel: offering.priceLabel_ar?.trim() || offering.priceLabel,
    ctaText: offering.ctaText_ar?.trim() || offering.ctaText,
  };
}

export function formatOfferingPrice(offering: SoulOffering, lang: Lang): string {
  const localized = localizeOffering(offering, lang);
  if (localized.priceLabel) return localized.priceLabel;
  if (offering.price == null || !Number.isFinite(offering.price)) {
    return lang === "ar" ? "حسب الطلب" : "On request";
  }
  return formatPrice(offering.price);
}

export function offeringStatusLabel(status: OfferingStatus, lang: Lang): string {
  const labels: Record<OfferingStatus, { en: string; ar: string }> = {
    available: { en: "Available", ar: "متوفر" },
    limited: { en: "Limited", ar: "كمية محدودة" },
    coming_soon: { en: "Coming soon", ar: "قريباً" },
    unavailable: { en: "Unavailable", ar: "غير متوفر" },
  };
  return labels[status][lang];
}

export function buildOfferingCtaHref(offering: SoulOffering, lang: Lang): string {
  if (offering.ctaHref?.trim()) return offering.ctaHref.trim();
  const localized = localizeOffering(offering, lang);
  const message = encodeURIComponent(
    `مرحباً Soul، أريد الاستفسار عن: ${localized.title}`
  );
  return `https://wa.me/${SHOP_WHATSAPP}?text=${message}`;
}

export function sortOfferings(offerings: SoulOffering[]): SoulOffering[] {
  return [...offerings].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export function prepareOfferings(offerings: SoulOffering[]): SoulOffering[] {
  return sortOfferings(
    offerings.map((item, index) => ({
      ...item,
      displayOrder: Number.isFinite(item.displayOrder) ? item.displayOrder : index,
      published: item.published !== false,
    }))
  );
}
