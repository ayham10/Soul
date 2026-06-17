export interface Note {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  slug: string;
  name: string;
  family: string;        // Woody | Floral | Citrus | Oriental | Musk | Aquatic
  gender: string;        // For Her | For Him | Unisex
  tagline: string;
  description: string;
  price: number;         // base price for 50ml (USD)
  image: string;
  accent: string;        // accent color derived from the bottle
  notes: Note;
  bestseller?: boolean;
}

// Whatsapp number used for the demo checkout / order flow.
// Replace with the shop's real number before going live.
export const SHOP_WHATSAPP = "972500000000";
export const SIZES = [
  { ml: 50, multiplier: 1 },
  { ml: 100, multiplier: 1.6 },
];

export const products: Product[] = [
  {
    slug: "noir-oud",
    name: "Noir Oud",
    family: "Woody",
    gender: "Unisex",
    tagline: "Smoke, saffron and rare agarwood.",
    description:
      "A nocturnal signature built around rare agarwood. Saffron and bergamot open like a struck match, before a heart of oud and Damask rose settles into a base of amber and supple leather. Worn close to the skin, it lingers for hours.",
    price: 245,
    image: "/images/p-noir-oud.png",
    accent: "#b5854a",
    notes: {
      top: ["Saffron", "Bergamot"],
      heart: ["Agarwood (Oud)", "Damask Rose"],
      base: ["Amber", "Leather"],
    },
    bestseller: true,
  },
  {
    slug: "rose-elixir",
    name: "Rose Élixir",
    family: "Floral",
    gender: "For Her",
    tagline: "A modern rose, dressed in velvet.",
    description:
      "Thousands of petals distilled into a single, luminous accord. Lychee and pink pepper sparkle over a heart of Damask rose and peony, while musk and vanilla wrap the composition in warmth. Romantic, never sweet.",
    price: 230,
    image: "/images/p-rose-elixir.png",
    accent: "#c98a8a",
    notes: {
      top: ["Lychee", "Pink Pepper"],
      heart: ["Damask Rose", "Peony"],
      base: ["White Musk", "Vanilla"],
    },
    bestseller: true,
  },
  {
    slug: "citrus-aura",
    name: "Citrus Aura",
    family: "Citrus",
    gender: "Unisex",
    tagline: "Sunlight, captured at first light.",
    description:
      "An effervescent eau built for golden hours. Sicilian lemon and bergamot burst at the top, neroli and petitgrain give a green floral heart, and white musk with cedar leave a clean, radiant trail.",
    price: 195,
    image: "/images/p-citrus-aura.png",
    accent: "#cdab5e",
    notes: {
      top: ["Sicilian Lemon", "Bergamot"],
      heart: ["Neroli", "Petitgrain"],
      base: ["White Musk", "Cedar"],
    },
  },
  {
    slug: "amber-soul",
    name: "Amber Soul",
    family: "Oriental",
    gender: "Unisex",
    tagline: "The house signature. Warm and golden.",
    description:
      "Our namesake — the scent of warmth itself. Cardamom and mandarin lead into a glowing amber and labdanum heart, finished with vanilla and tonka bean. An enveloping, addictive oriental.",
    price: 260,
    image: "/images/p-amber-soul.png",
    accent: "#c47a35",
    notes: {
      top: ["Cardamom", "Mandarin"],
      heart: ["Amber", "Labdanum"],
      base: ["Vanilla", "Tonka Bean"],
    },
    bestseller: true,
  },
  {
    slug: "velvet-musk",
    name: "Velvet Musk",
    family: "Musk",
    gender: "For Her",
    tagline: "Skin, only softer.",
    description:
      "An intimate second-skin musk. Aldehydes and pear lend an airy lift, iris and white musk form a powdery heart, and sandalwood with cashmere wood give a quiet, lasting softness.",
    price: 215,
    image: "/images/p-velvet-musk.png",
    accent: "#b9a98c",
    notes: {
      top: ["Aldehydes", "Pear"],
      heart: ["White Musk", "Iris"],
      base: ["Sandalwood", "Cashmere Wood"],
    },
  },
  {
    slug: "marine-reign",
    name: "Marine Reign",
    family: "Aquatic",
    gender: "For Him",
    tagline: "The open sea, bottled.",
    description:
      "A bracing aquatic for the bold. Sea salt and grapefruit crash over a marine accord with sage, drying down to driftwood and ambergris. Fresh, mineral and undeniably masculine.",
    price: 205,
    image: "/images/p-marine-reign.png",
    accent: "#5e8ca0",
    notes: {
      top: ["Sea Salt", "Grapefruit"],
      heart: ["Marine Accord", "Sage"],
      base: ["Driftwood", "Ambergris"],
    },
  },
];

export const families = ["All", "Woody", "Floral", "Citrus", "Oriental", "Musk", "Aquatic"];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
