import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeOfferingsList } from "../offerings-persistence";
import { buildOfferingCtaHref, formatOfferingPrice } from "../soul-offerings";

describe("soul offerings", () => {
  it("normalizes valid offerings payloads", () => {
    const offerings = normalizeOfferingsList([
      {
        slug: "wellness-spray",
        title: "Therapeutic Spray",
        description: "Natural oil blend",
        price: 150,
        image: "https://example.supabase.co/storage/v1/object/public/perfumes/test.jpg",
        status: "available",
        ctaText: "Order on WhatsApp",
        displayOrder: 0,
        published: true,
      },
    ]);

    assert.ok(offerings);
    assert.equal(offerings?.length, 1);
    assert.equal(offerings?.[0]?.slug, "wellness-spray");
  });

  it("formats offering price labels", () => {
    const priced = formatOfferingPrice(
      {
        slug: "a",
        title: "A",
        description: "D",
        price: 120,
        image: "/x.jpg",
        status: "available",
        ctaText: "Buy",
        displayOrder: 0,
        published: true,
      },
      "ar"
    );
    assert.match(priced, /₪|ILS|120/);

    const custom = formatOfferingPrice(
      {
        slug: "b",
        title: "B",
        description: "D",
        price: null,
        priceLabel_ar: "حسب الطلب",
        image: "/x.jpg",
        status: "available",
        ctaText: "Buy",
        displayOrder: 0,
        published: true,
      },
      "ar"
    );
    assert.equal(custom, "حسب الطلب");
  });

  it("builds whatsapp CTA when href is missing", () => {
    const href = buildOfferingCtaHref(
      {
        slug: "c",
        title: "مرش علاجي",
        description: "D",
        price: 150,
        image: "/x.jpg",
        status: "available",
        ctaText: "اطلب",
        displayOrder: 0,
        published: true,
        title_ar: "مرش علاجي",
      },
      "ar"
    );
    assert.match(href, /^https:\/\/wa\.me\//);
  });
});
