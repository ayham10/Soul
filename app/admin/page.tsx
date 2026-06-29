"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, ADMIN_PASSCODE, families, groups, formatPrice } from "@/lib/products";
import { useProducts } from "@/lib/store";
import { useLang } from "@/lib/lang";

const GALLERY = [
  "/images/p-noir-oud.png", "/images/p-rose-elixir.png", "/images/p-citrus-aura.png",
  "/images/p-amber-soul.png", "/images/p-velvet-musk.png", "/images/p-marine-reign.png",
  "/images/hero.png", "/images/atmosphere.png",
];
const GENDERS = ["Unisex", "For Her", "For Him"];
const FAMS = families.filter((f) => f !== "All");
const GROUPS = groups.filter((g) => g !== "All");

type Draft = {
  name: string; name_ar: string; group: string; family: string; gender: string;
  tagline: string; tagline_ar: string; description: string; description_ar: string;
  price: string; image: string; accent: string;
  top: string; heart: string; base: string; top_ar: string; heart_ar: string; base_ar: string;
  bestseller: boolean;
};

const emptyDraft: Draft = {
  name: "", name_ar: "", group: "General", family: "Woody", gender: "Unisex",
  tagline: "", tagline_ar: "", description: "", description_ar: "",
  price: "195", image: GALLERY[3], accent: "#c6a15b",
  top: "", heart: "", base: "", top_ar: "", heart_ar: "", base_ar: "", bestseller: false,
};

const parse = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const join = (a?: string[]) => (a || []).join(", ");

export default function AdminPage() {
  const { products, add, update, remove, reset } = useProducts();
  const { t, dir } = useLang();
  const A = t.admin;

  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);

  const [open, setOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { if (sessionStorage.getItem("soul-admin-ok") === "1") setAuthed(true); } catch {}
  }, []);

  const submitPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASSCODE) {
      setAuthed(true);
      try { sessionStorage.setItem("soul-admin-ok", "1"); } catch {}
    } else { setPassErr(true); }
  };

  const startAdd = () => { setDraft(emptyDraft); setEditSlug(null); setOpen(true); };
  const startEdit = (p: Product) => {
    setEditSlug(p.slug);
    setDraft({
      name: p.name, name_ar: p.name_ar || "", group: p.group, family: p.family, gender: p.gender,
      tagline: p.tagline, tagline_ar: p.tagline_ar || "", description: p.description, description_ar: p.description_ar || "",
      price: String(p.price), image: p.image, accent: p.accent,
      top: join(p.notes.top), heart: join(p.notes.heart), base: join(p.notes.base),
      top_ar: join(p.notes_ar?.top), heart_ar: join(p.notes_ar?.heart), base_ar: join(p.notes_ar?.base),
      bestseller: !!p.bestseller,
    });
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim()) return;
    const hasAr = draft.top_ar || draft.heart_ar || draft.base_ar;
    const p: Product = {
      slug: editSlug || "",
      name: draft.name.trim(), name_ar: draft.name_ar.trim() || undefined,
      group: draft.group, family: draft.family, gender: draft.gender,
      tagline: draft.tagline.trim(), tagline_ar: draft.tagline_ar.trim() || undefined,
      description: draft.description.trim(), description_ar: draft.description_ar.trim() || undefined,
      price: Number(draft.price) || 0, image: draft.image || GALLERY[0], accent: draft.accent,
      notes: { top: parse(draft.top), heart: parse(draft.heart), base: parse(draft.base) },
      notes_ar: hasAr ? { top: parse(draft.top_ar), heart: parse(draft.heart_ar), base: parse(draft.base_ar) } : undefined,
      bestseller: draft.bestseller,
    };
    if (editSlug) update(editSlug, p); else add(p);
    setOpen(false);
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const set = (k: keyof Draft, v: string | boolean) => setDraft((d) => ({ ...d, [k]: v }));

  // ---- Passcode gate ----
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

  // ---- Dashboard ----
  return (
    <div dir={dir} style={{ minHeight: "100svh", paddingTop: 96 }}>
      <style>{`
        .ag2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .ag3 { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 560px) {
          .ag2 { grid-template-columns: 1fr 1fr; }
          .ag3 { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
      <div className="wrap" style={{ padding: "0 20px 90px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div className="eyebrow">{A.subtitle}</div>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 56px)", color: "var(--cream)", marginTop: 8 }}>{A.title}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={startAdd} className="btn-gold">+ {A.addProduct}</button>
            <button onClick={() => { if (confirm(A.resetConfirm)) reset(); }} className="btn-ghost">{A.reset}</button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{products.length} {A.count}</div>
        <p style={{ fontSize: 11.5, color: "#6f6655", marginBottom: 28, maxWidth: 620, lineHeight: 1.7 }}>{A.localNote}</p>

        {/* Product list */}
        <div style={{ border: "1px solid var(--line)" }}>
          {products.map((p, i) => (
            <div key={p.slug} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
              borderTop: i ? "1px solid var(--line)" : "none", flexWrap: "wrap",
            }}>
              <div style={{ position: "relative", width: 52, height: 64, background: "var(--noir-card)", flexShrink: 0 }}>
                <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} sizes="52px" />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "var(--cream)" }}>
                  {p.name} {p.bestseller && <span style={{ color: "var(--gold)", fontSize: 14 }}>★</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 1 }}>{p.group} · {p.family} · {p.gender} · {formatPrice(p.price)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(p)} style={miniBtn}>{A.edit}</button>
                <button onClick={() => { if (confirm(A.confirmDelete)) remove(p.slug); }} style={{ ...miniBtn, color: "#e0746a", borderColor: "rgba(224,116,106,0.4)" }}>{A.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit modal */}
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
              <Field label={A.group}>
                <select style={inp} value={draft.group} onChange={(e) => set("group", e.target.value)}>
                  {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
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
              <Field label={A.price}><input style={inp} type="number" min="0" value={draft.price} onChange={(e) => set("price", e.target.value)} /></Field>
              <Field label={A.accent}>
                <input style={{ ...inp, padding: 6, height: 44 }} type="color" value={draft.accent} onChange={(e) => set("accent", e.target.value)} />
              </Field>
            </div>

            {/* Notes EN */}
            <div className="ag3">
              <Field label={A.notesTop}><input style={inp} value={draft.top} onChange={(e) => set("top", e.target.value)} /></Field>
              <Field label={A.notesHeart}><input style={inp} value={draft.heart} onChange={(e) => set("heart", e.target.value)} /></Field>
              <Field label={A.notesBase}><input style={inp} value={draft.base} onChange={(e) => set("base", e.target.value)} /></Field>
            </div>
            <div style={{ fontSize: 11, color: "#6f6655", marginTop: -6, marginBottom: 14 }}>{A.notesHint}</div>

            {/* Image */}
            <Field label={A.image}><input style={inp} value={draft.image} onChange={(e) => set("image", e.target.value)} /></Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 6px" }}>
              {GALLERY.map((g) => (
                <button key={g} onClick={() => set("image", g)} style={{ position: "relative", width: 46, height: 56, border: `1px solid ${draft.image === g ? "var(--gold)" : "var(--line)"}`, background: "var(--noir-card)", cursor: "pointer", padding: 0 }}>
                  <Image src={g} alt="" fill style={{ objectFit: "cover" }} sizes="46px" />
                </button>
              ))}
            </div>
            <label style={{ ...miniBtn, display: "inline-block", marginBottom: 18 }}>
              {A.uploadImage}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onUpload(e.target.files?.[0])} />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer", color: "var(--cream)", fontSize: 13 }}>
              <input type="checkbox" checked={draft.bestseller} onChange={(e) => set("bestseller", e.target.checked)} />
              {A.bestseller}
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={save} className="btn-gold" style={{ flex: 1 }}>{A.save}</button>
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
