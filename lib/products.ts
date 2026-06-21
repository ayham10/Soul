import { Lang } from "@/lib/i18n";

export interface Note {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  slug: string;
  name: string;
  name_ar?: string;
  family: string;        // Woody | Floral | Citrus | Oriental | Musk | Aquatic
  gender: string;        // For Her | For Him | Unisex
  tagline: string;
  tagline_ar?: string;
  description: string;
  description_ar?: string;
  price: number;         // base price for 50ml (ILS)
  image: string;
  accent: string;        // accent color derived from the bottle
  notes: Note;
  notes_ar?: Note;
  bestseller?: boolean;
}

// WhatsApp requires international format without the leading local zero.
export const SHOP_WHATSAPP = "972532286019";

// Passcode for the /admin product manager (demo). Change before going live.
export const ADMIN_PASSCODE = "soul2024";

export const SIZES = [
  { ml: 50, multiplier: 1 },
  { ml: 100, multiplier: 1.6 },
];

export function formatPrice(price: number): string {
  return `₪${Math.round(price)}`;
}

export const products: Product[] = [
  {
    slug: "noir-oud",
    name: "Noir Oud", name_ar: "نوار عود",
    family: "Woody", gender: "Unisex",
    tagline: "Smoke, saffron and rare agarwood.",
    tagline_ar: "دخان وزعفران وعود نادر.",
    description:
      "A nocturnal signature built around rare agarwood. Saffron and bergamot open like a struck match, before a heart of oud and Damask rose settles into a base of amber and supple leather. Worn close to the skin, it lingers for hours.",
    description_ar:
      "توقيع ليلي مبني حول العود النادر. يفتتح الزعفران والبرغموت كعود ثقاب يُشعل، قبل أن يستقرّ قلب من العود والورد الدمشقي على قاعدة من العنبر والجلد الطيّع. قريباً من البشرة، يدوم لساعات.",
    price: 245, image: "/images/p-noir-oud.png", accent: "#b5854a",
    notes: { top: ["Saffron", "Bergamot"], heart: ["Agarwood (Oud)", "Damask Rose"], base: ["Amber", "Leather"] },
    notes_ar: { top: ["زعفران", "برغموت"], heart: ["عود", "ورد دمشقي"], base: ["عنبر", "جلد"] },
    bestseller: true,
  },
  {
    slug: "rose-elixir",
    name: "Rose Élixir", name_ar: "إكسير الورد",
    family: "Floral", gender: "For Her",
    tagline: "A modern rose, dressed in velvet.",
    tagline_ar: "ورد عصري بثوب مخملي.",
    description:
      "Thousands of petals distilled into a single, luminous accord. Lychee and pink pepper sparkle over a heart of Damask rose and peony, while musk and vanilla wrap the composition in warmth. Romantic, never sweet.",
    description_ar:
      "آلاف البتلات مقطّرة في أكورد واحد مضيء. يتلألأ الليتشي والفلفل الوردي فوق قلب من الورد الدمشقي والبيوني، بينما يغلّف المسك والفانيلا التركيبة بالدفء. رومانسي، دون إفراط في الحلاوة.",
    price: 230, image: "/images/p-rose-elixir.png", accent: "#c98a8a",
    notes: { top: ["Lychee", "Pink Pepper"], heart: ["Damask Rose", "Peony"], base: ["White Musk", "Vanilla"] },
    notes_ar: { top: ["ليتشي", "فلفل وردي"], heart: ["ورد دمشقي", "بيوني"], base: ["مسك أبيض", "فانيلا"] },
    bestseller: true,
  },
  {
    slug: "citrus-aura",
    name: "Citrus Aura", name_ar: "هالة الحمضيات",
    family: "Citrus", gender: "Unisex",
    tagline: "Sunlight, captured at first light.",
    tagline_ar: "ضوء الشمس، عند أوّل النهار.",
    description:
      "An effervescent eau built for golden hours. Sicilian lemon and bergamot burst at the top, neroli and petitgrain give a green floral heart, and white musk with cedar leave a clean, radiant trail.",
    description_ar:
      "عطر منعش صُنع للساعات الذهبية. ينفجر الليمون الصقلي والبرغموت في المقدّمة، ويمنح زهر النارنج والبتيتغرين قلباً زهرياً أخضر، بينما يترك المسك الأبيض والأرز أثراً نقياً مشعّاً.",
    price: 195, image: "/images/p-citrus-aura.png", accent: "#cdab5e",
    notes: { top: ["Sicilian Lemon", "Bergamot"], heart: ["Neroli", "Petitgrain"], base: ["White Musk", "Cedar"] },
    notes_ar: { top: ["ليمون صقلي", "برغموت"], heart: ["زهر النارنج", "بتيتغرين"], base: ["مسك أبيض", "أرز"] },
  },
  {
    slug: "amber-soul",
    name: "Amber Soul", name_ar: "عنبر سول",
    family: "Oriental", gender: "Unisex",
    tagline: "The house signature. Warm and golden.",
    tagline_ar: "توقيع الدار. دافئ وذهبي.",
    description:
      "Our namesake — the scent of warmth itself. Cardamom and mandarin lead into a glowing amber and labdanum heart, finished with vanilla and tonka bean. An enveloping, addictive oriental.",
    description_ar:
      "عطرنا الذي يحمل اسمنا — رائحة الدفء ذاته. يقود الهيل والماندرين إلى قلب متوهّج من العنبر واللبدانم، يُختتم بالفانيلا وحبة التونكا. شرقيّ غامر وآسر.",
    price: 260, image: "/images/p-amber-soul.png", accent: "#c47a35",
    notes: { top: ["Cardamom", "Mandarin"], heart: ["Amber", "Labdanum"], base: ["Vanilla", "Tonka Bean"] },
    notes_ar: { top: ["هيل", "ماندرين"], heart: ["عنبر", "لبدانم"], base: ["فانيلا", "تونكا"] },
    bestseller: true,
  },
  {
    slug: "velvet-musk",
    name: "Velvet Musk", name_ar: "مسك مخملي",
    family: "Musk", gender: "For Her",
    tagline: "Skin, only softer.",
    tagline_ar: "كالبشرة، لكن أنعم.",
    description:
      "An intimate second-skin musk. Aldehydes and pear lend an airy lift, iris and white musk form a powdery heart, and sandalwood with cashmere wood give a quiet, lasting softness.",
    description_ar:
      "مسك حميم كطبقة ثانية من البشرة. تمنح الألدهيدات والكمثرى انتعاشاً خفيفاً، ويشكّل السوسن والمسك الأبيض قلباً بودرياً، بينما يمنح خشب الصندل والكشمير نعومة هادئة تدوم.",
    price: 215, image: "/images/p-velvet-musk.png", accent: "#b9a98c",
    notes: { top: ["Aldehydes", "Pear"], heart: ["White Musk", "Iris"], base: ["Sandalwood", "Cashmere Wood"] },
    notes_ar: { top: ["ألدهيدات", "كمثرى"], heart: ["مسك أبيض", "سوسن"], base: ["خشب الصندل", "كشمير"] },
  },
  {
    slug: "marine-reign",
    name: "Marine Reign", name_ar: "سطوة البحر",
    family: "Aquatic", gender: "For Him",
    tagline: "The open sea, bottled.",
    tagline_ar: "البحر المفتوح، في زجاجة.",
    description:
      "A bracing aquatic for the bold. Sea salt and grapefruit crash over a marine accord with sage, drying down to driftwood and ambergris. Fresh, mineral and undeniably masculine.",
    description_ar:
      "عطر مائي منعش للجريئين. يتلاطم ملح البحر والجريب فروت فوق أكورد بحري مع المريمية، لينتهي إلى خشب الطافي والعنبر البحري. منعش ومعدني ورجوليّ بلا منازع.",
    price: 205, image: "/images/p-marine-reign.png", accent: "#5e8ca0",
    notes: { top: ["Sea Salt", "Grapefruit"], heart: ["Marine Accord", "Sage"], base: ["Driftwood", "Ambergris"] },
    notes_ar: { top: ["ملح البحر", "جريب فروت"], heart: ["أكورد بحري", "مريمية"], base: ["خشب الطافي", "عنبر بحري"] },
  },
];

export const families = ["All", "Woody", "Floral", "Citrus", "Oriental", "Musk", "Aquatic"];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// Return the product's localized text fields for the chosen language (with EN fallback).
export function localize(p: Product, lang: Lang) {
  if (lang === "ar") {
    return {
      name: p.name_ar || p.name,
      tagline: p.tagline_ar || p.tagline,
      description: p.description_ar || p.description,
      notes: p.notes_ar || p.notes,
    };
  }
  return { name: p.name, tagline: p.tagline, description: p.description, notes: p.notes };
}
