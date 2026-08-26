"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PerfumeSearch from "@/components/PerfumeSearch";
import AdminStockBadge from "@/components/AdminStockBadge";
import { Product, families, collections, formatPrice, getProductPrice } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { matchesProductSearch } from "@/lib/search";
import { nextDisplayOrder, parseDisplayOrder, parseStock } from "@/lib/inventory";
import { isBase64Image, slugFromName, uploadPerfumeImage } from "@/lib/image-upload";

const GALLERY = [
  "/images/p-noir-oud.png", "/images/p-rose-elixir.png", "/images/p-citrus-aura.png",
  "/images/p-amber-soul.png", "/images/p-velvet-musk.png", "/images/p-marine-reign.png",
  "/images/hero.png", "/images/atmosphere.png",
];
const GENDERS = ["Unisex", "For Her", "For Him"];
const FAMS = families.filter((f) => f !== "All" && f !== "Women");
const COLLECTIONS = collections;

type Draft = {
  name: string; name_ar: string; collection: string; family: string; gender: string;
  tagline: string; tagline_ar: string; description: string; description_ar: string;
  price: string; price50: string; stock: string; displayOrder: string; image: string; accent: string;
  top: string; heart: string; base: string; top_ar: string; heart_ar: string; base_ar: string;
  bestseller: boolean;
};

const emptyDraft: Draft = {
  name: "", name_ar: "", collection: "General", family: "Woody", gender: "Unisex",
  tagline: "", tagline_ar: "", description: "", description_ar: "",
  price: "120", price50: "70", stock: "50", displayOrder: "0", image: GALLERY[3], accent: "#c6a15b",
  top: "", heart: "", base: "", top_ar: "", heart_ar: "", base_ar: "", bestseller: false,
};

const parse = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const join = (a?: string[]) => (a || []).join(", ");

export default function AdminPage() {
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { products, add, update, remove, reset, saving, moveProduct, reorderProducts } = useProducts();
  const { t, dir } = useLang();
  const A = t.admin;

  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);

  const [open, setOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [dragSlug, setDragSlug] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");

  const visibleProducts = useMemo(
    () => products.filter((p) => matchesProductSearch(p, query)),
    [products, query]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/admin/login", { credentials: "include", cache: "no-store" });
        if (!active || !response.ok) return;
        const data = await response.json();
        if (data.authenticated) {
          setAuthed(true);
          try { sessionStorage.setItem("soul-admin-ok", "1"); } catch {}
        }
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  const submitPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr(false);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: pass }),
      });
      if (response.ok) {
        setAuthed(true);
        try { sessionStorage.setItem("soul-admin-ok", "1"); } catch {}
      } else {
        setPassErr(true);
      }
    } catch {
      setPassErr(true);
    }
  };

  const startAdd = () => {
    setDraft({ ...emptyDraft, displayOrder: String(nextDisplayOrder(products)) });
    setEditSlug(null);
    setSaveError("");
    setUploadError("");
    setOpen(true);
  };

  const startEdit = (p: Product) => {
    setEditSlug(p.slug);
    setSaveError("");
    setUploadError("");
    setDraft({
      name: p.name, name_ar: p.name_ar || "", collection: p.collection, family: p.family, gender: p.gender,
      tagline: p.tagline, tagline_ar: p.tagline_ar || "", description: p.description, description_ar: p.description_ar || "",
      price: String(p.price),
      price50: String(p.price50 ?? getProductPrice(p, 50)),
      stock: String(p.stock ?? 0),
      displayOrder: String(p.displayOrder ?? 0),
      image: p.image, accent: p.accent,
      top: join(p.notes.top), heart: join(p.notes.heart), base: join(p.notes.base),
      top_ar: join(p.notes_ar?.top), heart_ar: join(p.notes_ar?.heart), base_ar: join(p.notes_ar?.base),
      bestseller: !!p.bestseller,
    });
    setOpen(true);
  };

  const buildProduct = (): Product => {
    const hasAr = draft.top_ar || draft.heart_ar || draft.base_ar;
    const price50 = Number(draft.price50);
    return {
      slug: editSlug || "",
      name: draft.name.trim(),
      name_ar: draft.name_ar.trim() || undefined,
      collection: draft.collection,
      family: draft.family,
      gender: draft.gender,
      tagline: draft.tagline.trim() || "A signature composition, crafted with care.",
      tagline_ar: draft.tagline_ar.trim() || undefined,
      description: draft.description.trim() || "An exceptional fragrance from our curated collection.",
      description_ar: draft.description_ar.trim() || undefined,
      price: Number(draft.price) || 0,
      price50: Number.isFinite(price50) && price50 > 0 ? price50 : undefined,
      stock: parseStock(draft.stock, 0),
      displayOrder: parseDisplayOrder(draft.displayOrder) ?? 0,
      image: draft.image || GALLERY[0],
      accent: draft.accent,
      notes: { top: parse(draft.top), heart: parse(draft.heart), base: parse(draft.base) },
      notes_ar: hasAr ? { top: parse(draft.top_ar), heart: parse(draft.heart_ar), base: parse(draft.base_ar) } : undefined,
      bestseller: draft.bestseller,
    };
  };

  const save = async () => {
    if (!draft.name.trim() || saving || uploading) return;
    if (isBase64Image(draft.image)) {
      setSaveError("Upload the image to Supabase Storage before saving.");
      return;
    }

    setSaveError("");
    const p = buildProduct();
    try {
      if (editSlug) await update(editSlug, p);
      else await add(p);
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save product";
      setSaveError(message);
    }
  };

  const onUpload = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadPerfumeImage(file, slugFromName(draft.name || "perfume"));
      setDraft((d) => ({ ...d, image: url }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed";
      setUploadError(message);
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
      const message = error instanceof Error ? error.message : "Could not delete product";
      setSaveError(message);
    }
  };

  const handleReset = async () => {
    if (!confirm(A.resetConfirm) || saving) return;
    setSaveError("");
    try {
      await reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reset catalogue";
      setSaveError(message);
    }
  };

  const set = (k: keyof Draft, v: string | boolean) => setDraft((d) => ({ ...d, [k]: v }));

  const handleMove = async (slug: string, direction: "up" | "down") => {
    if (saving || query.trim()) return;
    setOrderError("");
    try {
      await moveProduct(slug, direction);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reorder product";
      setOrderError(message);
    }
  };

  const handleDrop = async (targetSlug: string) => {
    if (!dragSlug || dragSlug === targetSlug || query.trim() || saving) return;
    const slugs = products.map((p) => p.slug);
    const from = slugs.indexOf(dragSlug);
    const to = slugs.indexOf(targetSlug);
    if (from < 0 || to < 0) return;

    const next = [...slugs];
    next.splice(from, 1);
    next.splice(to, 0, dragSlug);
    setDragSlug(null);
    setOrderError("");
    try {
      await reorderProducts(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reorder products";
      setOrderError(message);
    }
  };

  const stockLabels = { in: A.stockIn, low: A.stockLow, out: A.stockOut };

  if (!authed) {
    return (
      <div dir={dir} style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form onSubmit={submitPass} style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 500, letterSpacing: 6, color: "var(--cream)" }}>
            S<span style={{ color: "var(--gold)" }}>O</span>UL
          </div>
          <div className="eyebrow" style={{ marginTop: 6, marginBottom: 36 }}>{A.title} · {A.subtitle}</div>
          <label style={lbl}>{A.passLabel}</label>
          <input
            type="password" value={pass} autoFocus
            onChange={(e) => { setPass(e.target.value); setPassErr(false); }}
            placeholder={A.passPlaceholder} style={inp}
          />
          {passErr && <div style={{ color: "#e0746a", fontSize: 12, marginTop: 10 }}>{A.wrongPass}</div>}
          <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 20 }}>{A.enter}</button>
          <p style={{ fontSize: 11, color: "#5b5345", marginTop: 22, lineHeight: 1.7 }}>{A.localNote}</p>
        </form>
      </div>
    );
  }

  return (
    <div dir={dir} style={{ minHeight: "100svh", paddingTop: 96 }}>
      <style>{`
        .ag2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .ag3 { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .admin-row {
          display: flex; align-items: center; gap: 12px; padding: 14px 16px;
          border-top: 1px solid var(--line); flex-wrap: wrap; transition: background 0.2s ease;
        }
        .admin-row:first-child { border-top: none; }
        .admin-row.dragging { opacity: 0.45; }
        .admin-row.drag-over { background: rgba(198, 161, 91, 0.06); }
        .admin-order-controls { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
        .admin-order-btn {
          width: 34px; height: 30px; display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: var(--cream); border: 1px solid var(--line); cursor: pointer;
          font-size: 12px; padding: 0;
        }
        .admin-order-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .admin-drag-handle {
          width: 28px; height: 64px; display: inline-flex; align-items: center; justify-content: center;
          color: var(--muted); cursor: grab; flex-shrink: 0; user-select: none; font-size: 16px;
        }
        .admin-drag-handle.disabled { opacity: 0.35; cursor: not-allowed; }
        @media (min-width: 560px) {
          .ag2 { grid-template-columns: 1fr 1fr; }
          .ag3 { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
      <div className="wrap" style={{ padding: "0 20px 90px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div className="eyebrow">{A.subtitle}</div>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 56px)", color: "var(--cream)", marginTop: 8 }}>{A.title}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={startAdd} className="btn-gold" disabled={saving}>+ {A.addProduct}</button>
            <button onClick={() => { void handleReset(); }} className="btn-ghost" disabled={saving}>{A.reset}</button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{products.length} {A.count}</div>
        <p style={{ fontSize: 11.5, color: "#6f6655", marginBottom: 28, maxWidth: 620, lineHeight: 1.7 }}>{A.localNote}</p>
        {saveError && (
          <p style={{ color: "#e0746a", fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>{saveError}</p>
        )}

        {orderError && (
          <p style={{ color: "#e0746a", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>{orderError}</p>
        )}

        <div style={{ marginBottom: 22 }}>
          <PerfumeSearch
            value={query}
            onChange={setQuery}
            placeholder={A.searchPlaceholder}
            ariaLabel={A.searchPlaceholder}
          />
          <p style={{ fontSize: 11, color: "#6f6655", marginTop: 10, lineHeight: 1.6 }}>{A.dragHint}</p>
        </div>

        <div style={{ border: "1px solid var(--line)" }}>
          {visibleProducts.map((p) => {
            const globalIndex = products.findIndex((item) => item.slug === p.slug);
            const canReorder = !query.trim() && !saving;
            return (
              <div
                key={p.slug}
                className={`admin-row${dragSlug === p.slug ? " dragging" : ""}`}
                onDragOver={(e) => {
                  if (!canReorder || !dragSlug) return;
                  e.preventDefault();
                  e.currentTarget.classList.add("drag-over");
                }}
                onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("drag-over");
                  void handleDrop(p.slug);
                }}
              >
                <div
                  className={`admin-drag-handle${canReorder ? "" : " disabled"}`}
                  draggable={canReorder}
                  onDragStart={() => canReorder && setDragSlug(p.slug)}
                  onDragEnd={() => setDragSlug(null)}
                  aria-hidden="true"
                >
                  ⋮⋮
                </div>
                <div className="admin-order-controls">
                  <button
                    type="button"
                    className="admin-order-btn"
                    onClick={() => { void handleMove(p.slug, "up"); }}
                    disabled={!canReorder || globalIndex <= 0}
                    aria-label={A.moveUp}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="admin-order-btn"
                    onClick={() => { void handleMove(p.slug, "down"); }}
                    disabled={!canReorder || globalIndex < 0 || globalIndex >= products.length - 1}
                    aria-label={A.moveDown}
                  >
                    ▼
                  </button>
                </div>
                <div style={{ position: "relative", width: 52, height: 64, background: "var(--noir-card)", flexShrink: 0 }}>
                  <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} sizes="52px" />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "var(--cream)", lineHeight: 1.2, wordBreak: "break-word" }}>
                      {p.name} {p.bestseller && <span style={{ color: "var(--gold)", fontSize: 14 }}>★</span>}
                    </div>
                    <AdminStockBadge stock={p.stock ?? 0} labels={stockLabels} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 1, lineHeight: 1.6 }}>
                    #{ (p.displayOrder ?? 0) + 1} · {p.collection} · {p.family} · {p.gender} · {formatPrice(getProductPrice(p, 50))} / {formatPrice(p.price)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(p)} style={miniBtn} disabled={saving}>{A.edit}</button>
                  <button onClick={() => { void handleDelete(p.slug); }} style={{ ...miniBtn, color: "#e0746a", borderColor: "rgba(224,116,106,0.4)" }} disabled={saving}>{A.delete}</button>
                </div>
              </div>
            );
          })}
          {visibleProducts.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: "40px 16px", fontSize: 13 }}>
              {A.noResults}
            </p>
          )}
        </div>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "5vh 16px" }}>
          <div onClick={(e) => e.stopPropagation()} dir={dir} style={{ width: "100%", maxWidth: 720, background: "var(--noir-soft)", border: "1px solid var(--line)", padding: "clamp(22px,4vw,40px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 28, color: "var(--cream)" }}>{editSlug ? A.editProduct : A.addProduct}</h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 26, cursor: "pointer" }}>×</button>
            </div>

            <div className="ag2">
              <Field label={A.name}><input style={inp} value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label={A.nameAr}><input style={inp} dir="rtl" value={draft.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></Field>
              <Field label={A.collection}>
                <select style={inp} value={draft.collection} onChange={(e) => set("collection", e.target.value)}>
                  {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={A.family}>
                <select style={inp} value={draft.family} onChange={(e) => set("family", e.target.value)}>
                  {FAMS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label={A.gender}>
                <select style={inp} value={draft.gender} onChange={(e) => set("gender", e.target.value)}>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label={A.tagline}><input style={inp} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
              <Field label={A.taglineAr}><input style={inp} dir="rtl" value={draft.tagline_ar} onChange={(e) => set("tagline_ar", e.target.value)} /></Field>
            </div>

            <Field label={A.description}><textarea style={{ ...inp, height: 78, resize: "vertical" }} value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label={A.descriptionAr}><textarea style={{ ...inp, height: 78, resize: "vertical" }} dir="rtl" value={draft.description_ar} onChange={(e) => set("description_ar", e.target.value)} /></Field>

            <div className="ag2">
              <Field label={A.price100}><input style={inp} type="number" min="0" value={draft.price} onChange={(e) => set("price", e.target.value)} /></Field>
              <Field label={A.price50}><input style={inp} type="number" min="0" value={draft.price50} onChange={(e) => set("price50", e.target.value)} /></Field>
              <Field label={A.stock}>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  step="1"
                  value={draft.stock}
                  onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field label={A.displayOrder}>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  step="1"
                  value={draft.displayOrder}
                  onChange={(e) => set("displayOrder", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field label={A.accent}>
                <input style={{ ...inp, padding: 6, height: 44 }} type="color" value={draft.accent} onChange={(e) => set("accent", e.target.value)} />
              </Field>
            </div>

            <div className="ag3">
              <Field label={A.notesTop}><input style={inp} value={draft.top} onChange={(e) => set("top", e.target.value)} /></Field>
              <Field label={A.notesHeart}><input style={inp} value={draft.heart} onChange={(e) => set("heart", e.target.value)} /></Field>
              <Field label={A.notesBase}><input style={inp} value={draft.base} onChange={(e) => set("base", e.target.value)} /></Field>
            </div>
            <div style={{ fontSize: 11, color: "#6f6655", marginTop: -6, marginBottom: 14 }}>{A.notesHint}</div>

            <Field label={A.image}><input style={inp} value={draft.image} onChange={(e) => set("image", e.target.value)} placeholder="/images/... or https://..." /></Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 6px" }}>
              {GALLERY.map((g) => (
                <button key={g} onClick={() => set("image", g)} style={{ position: "relative", width: 46, height: 56, border: `1px solid ${draft.image === g ? "var(--gold)" : "var(--line)"}`, background: "var(--noir-card)", cursor: "pointer", padding: 0 }}>
                  <Image src={g} alt="" fill style={{ objectFit: "cover" }} sizes="46px" />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#6f6655", margin: "0 0 10px", lineHeight: 1.6 }}>
              Pick a gallery image, upload a new one to Supabase Storage, or paste an image URL.
            </p>
            <label style={{ ...miniBtn, display: "inline-block", marginBottom: uploadError ? 8 : 18, opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}>
              {uploading ? `${A.uploadImage}…` : A.uploadImage}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                disabled={uploading || saving}
                onChange={(e) => { void onUpload(e.target.files?.[0]); e.target.value = ""; }}
              />
            </label>
            {uploadError && (
              <div style={{ color: "#e0746a", fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>{uploadError}</div>
            )}
            {isBase64Image(draft.image) && (
              <div style={{ color: "#e0746a", fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>
                This product still has an old embedded image. Upload a new image before saving.
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer", color: "var(--cream)", fontSize: 13 }}>
              <input type="checkbox" checked={draft.bestseller} onChange={(e) => set("bestseller", e.target.checked)} />
              {A.bestseller}
            </label>

            {saveError && (
              <div style={{ color: "#e0746a", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>{saveError}</div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => { void save(); }}
                className="btn-gold"
                style={{ flex: 1 }}
                disabled={saving || uploading || !draft.name.trim() || isBase64Image(draft.image)}
              >
                {saving ? `${A.save}…` : A.save}
              </button>
              <button onClick={() => setOpen(false)} className="btn-ghost" style={{ flex: 1 }}>{A.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 7 };
const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px", background: "var(--noir-card)", border: "1px solid var(--line)",
  color: "var(--cream)", fontFamily: "'Jost', sans-serif", fontSize: 14, outline: "none",
};
const miniBtn: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif", fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase",
  background: "transparent", color: "var(--cream)", border: "1px solid var(--line)", padding: "9px 14px", cursor: "pointer",
};
