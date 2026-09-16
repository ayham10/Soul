"use client";
import { useState } from "react";
import Image from "next/image";
import { useSoulOfferings } from "@/lib/offerings-store";
import { useLang } from "@/lib/lang";
import {
  OFFERING_STATUSES,
  OfferingStatus,
  SoulOffering,
  offeringStatusLabel,
} from "@/lib/soul-offerings";
import { isBase64Image, slugFromName, uploadPerfumeImage } from "@/lib/image-upload";
import { formatPrice } from "@/lib/products";

type Draft = {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  price: string;
  priceLabel: string;
  priceLabel_ar: string;
  image: string;
  status: OfferingStatus;
  ctaText: string;
  ctaText_ar: string;
  ctaHref: string;
  displayOrder: string;
  published: boolean;
};

const emptyDraft: Draft = {
  title: "",
  title_ar: "",
  description: "",
  description_ar: "",
  price: "",
  priceLabel: "",
  priceLabel_ar: "",
  image: "/images/atmosphere.png",
  status: "available",
  ctaText: "اطلب عبر واتساب",
  ctaText_ar: "اطلب عبر واتساب",
  ctaHref: "",
  displayOrder: "0",
  published: true,
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 7,
};
const inp: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--noir-card)",
  border: "1px solid var(--line)",
  color: "var(--cream)",
  fontFamily: "'Jost', sans-serif",
  fontSize: 14,
  outline: "none",
};
const miniBtn: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: 10.5,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  background: "transparent",
  color: "var(--cream)",
  border: "1px solid var(--line)",
  padding: "9px 14px",
  cursor: "pointer",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminOfferingsPanel() {
  const { offerings, add, update, remove, saving } = useSoulOfferings();
  const { t, dir } = useLang();
  const A = t.adminOfferings;

  const [open, setOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = (key: keyof Draft, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const startAdd = () => {
    setDraft({
      ...emptyDraft,
      displayOrder: String(
        offerings.reduce((max, item) => Math.max(max, item.displayOrder ?? 0), -1) + 1
      ),
    });
    setEditSlug(null);
    setSaveError("");
    setUploadError("");
    setOpen(true);
  };

  const startEdit = (offering: SoulOffering) => {
    setEditSlug(offering.slug);
    setSaveError("");
    setUploadError("");
    setDraft({
      title: offering.title,
      title_ar: offering.title_ar || "",
      description: offering.description,
      description_ar: offering.description_ar || "",
      price: offering.price == null ? "" : String(offering.price),
      priceLabel: offering.priceLabel || "",
      priceLabel_ar: offering.priceLabel_ar || "",
      image: offering.image,
      status: offering.status,
      ctaText: offering.ctaText,
      ctaText_ar: offering.ctaText_ar || "",
      ctaHref: offering.ctaHref || "",
      displayOrder: String(offering.displayOrder ?? 0),
      published: offering.published,
    });
    setOpen(true);
  };

  const buildOffering = (): SoulOffering => {
    const priceValue = draft.price.trim() ? Number(draft.price) : null;
    return {
      slug: editSlug || "",
      title: draft.title.trim(),
      title_ar: draft.title_ar.trim() || undefined,
      description: draft.description.trim(),
      description_ar: draft.description_ar.trim() || undefined,
      price: Number.isFinite(priceValue) ? priceValue : null,
      priceLabel: draft.priceLabel.trim() || undefined,
      priceLabel_ar: draft.priceLabel_ar.trim() || undefined,
      image: draft.image,
      status: draft.status,
      ctaText: draft.ctaText.trim() || "اطلب عبر واتساب",
      ctaText_ar: draft.ctaText_ar.trim() || undefined,
      ctaHref: draft.ctaHref.trim() || undefined,
      displayOrder: Number(draft.displayOrder) || 0,
      published: draft.published,
    };
  };

  const save = async () => {
    if (!draft.title.trim() || saving || uploading) return;
    if (isBase64Image(draft.image)) {
      setSaveError(A.uploadBeforeSave);
      return;
    }
    setSaveError("");
    const offering = buildOffering();
    try {
      if (editSlug) await update(editSlug, offering);
      else await add(offering);
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : A.saveFailed);
    }
  };

  const onUpload = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadPerfumeImage(file, slugFromName(draft.title || "offering"));
      setDraft((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : A.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(A.confirmDelete) || saving) return;
    setSaveError("");
    try {
      await remove(slug);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : A.deleteFailed);
    }
  };

  return (
    <div dir={dir}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="eyebrow">{A.subtitle}</div>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "var(--cream)", marginTop: 8 }}>{A.title}</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{offerings.length} {A.count}</p>
        </div>
        <button type="button" onClick={startAdd} className="btn-gold" disabled={saving}>
          + {A.add}
        </button>
      </div>

      {saveError && <p style={{ color: "#e0746a", fontSize: 12, marginBottom: 16 }}>{saveError}</p>}

      <div style={{ border: "1px solid var(--line)" }}>
        {offerings.length === 0 && (
          <div style={{ padding: 28, color: "var(--muted)", fontSize: 14 }}>{A.empty}</div>
        )}
        {offerings.map((offering) => (
          <div
            key={offering.slug}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderTop: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", width: 52, height: 64, background: "var(--noir-card)", flexShrink: 0 }}>
              <Image src={offering.image} alt={offering.title} fill style={{ objectFit: "cover" }} sizes="52px" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ color: "var(--cream)", fontSize: 15 }}>{offering.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {offeringStatusLabel(offering.status, dir === "rtl" ? "ar" : "en")}
                {offering.published ? "" : ` · ${A.hidden}`}
              </div>
              <div style={{ color: "var(--gold)", fontSize: 13, marginTop: 4 }}>
                {offering.priceLabel ||
                  (offering.price != null ? formatPrice(offering.price) : A.onRequest)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={miniBtn} onClick={() => startEdit(offering)} disabled={saving}>
                {A.edit}
              </button>
              <button type="button" style={miniBtn} onClick={() => void handleDelete(offering.slug)} disabled={saving}>
                {A.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "rgba(7,6,5,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90svh",
              overflow: "auto",
              background: "var(--noir)",
              border: "1px solid var(--line)",
              padding: "28px 22px",
            }}
          >
            <h3 style={{ fontSize: 28, color: "var(--cream)", marginBottom: 18 }}>
              {editSlug ? A.edit : A.add}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
              <Field label={A.itemTitle}>
                <input style={inp} value={draft.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label={A.itemTitleAr}>
                <input style={inp} dir="rtl" value={draft.title_ar} onChange={(e) => set("title_ar", e.target.value)} />
              </Field>
              <Field label={A.description}>
                <textarea
                  style={{ ...inp, minHeight: 90, resize: "vertical" }}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label={A.descriptionAr}>
                <textarea
                  style={{ ...inp, minHeight: 90, resize: "vertical" }}
                  dir="rtl"
                  value={draft.description_ar}
                  onChange={(e) => set("description_ar", e.target.value)}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={A.price}>
                  <input style={inp} inputMode="decimal" value={draft.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label={A.displayOrder}>
                  <input style={inp} inputMode="numeric" value={draft.displayOrder} onChange={(e) => set("displayOrder", e.target.value)} />
                </Field>
              </div>
              <Field label={A.priceLabel}>
                <input style={inp} value={draft.priceLabel} onChange={(e) => set("priceLabel", e.target.value)} placeholder={A.priceLabelHint} />
              </Field>
              <Field label={A.priceLabelAr}>
                <input style={inp} dir="rtl" value={draft.priceLabel_ar} onChange={(e) => set("priceLabel_ar", e.target.value)} />
              </Field>
              <Field label={A.status}>
                <select
                  style={inp}
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value as OfferingStatus)}
                >
                  {OFFERING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {offeringStatusLabel(status, dir === "rtl" ? "ar" : "en")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={A.ctaText}>
                <input style={inp} value={draft.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
              </Field>
              <Field label={A.ctaTextAr}>
                <input style={inp} dir="rtl" value={draft.ctaText_ar} onChange={(e) => set("ctaText_ar", e.target.value)} />
              </Field>
              <Field label={A.ctaHref}>
                <input style={inp} value={draft.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder={A.ctaHrefHint} />
              </Field>
              <Field label={A.image}>
                <input style={inp} value={draft.image} onChange={(e) => set("image", e.target.value)} />
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <label style={miniBtn}>
                    {uploading ? "…" : A.uploadImage}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => void onUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {uploadError && <p style={{ color: "#e0746a", fontSize: 12, marginTop: 8 }}>{uploadError}</p>}
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: "var(--cream)", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                {A.published}
              </label>
            </div>

            {saveError && <p style={{ color: "#e0746a", fontSize: 12, marginBottom: 12 }}>{saveError}</p>}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn-gold" onClick={() => void save()} disabled={saving || uploading}>
                {A.save}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)} disabled={saving}>
                {A.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
