#!/usr/bin/env node
/**
 * Generates lib/catalog.ts from the perfume list.
 * Run: node scripts/generate-catalog.mjs
 */

const IMAGES = [
  "/images/p-noir-oud.png",
  "/images/p-rose-elixir.png",
  "/images/p-citrus-aura.png",
  "/images/p-amber-soul.png",
  "/images/p-velvet-musk.png",
  "/images/p-marine-reign.png",
  "/images/hero.png",
  "/images/atmosphere.png",
];

const ACCENTS = ["#b5854a", "#c98a8a", "#cdab5e", "#c47a35", "#b9a98c", "#5e8ca0", "#c6a15b", "#8a7a6a"];

const GROUP_PRICE = {
  "Louis Vuitton": 150,
  "Black Afghano": 200,
  Women: 120,
  General: 120,
};

const ENTRIES = [
  ["Louis Vuitton - Pacific Chill", "Louis Vuitton", "Unisex"],
  ["Louis Vuitton - Imagination", "Louis Vuitton", "For Him"],
  ["Louis Vuitton - L'Immensité", "Louis Vuitton", "For Him"],
  ["Louis Vuitton - Stellar Times", "Louis Vuitton", "Unisex"],
  ["Louis Vuitton - Ombre Nomade", "Louis Vuitton", "Unisex"],
  ["Louis Vuitton - Orage", "Louis Vuitton", "For Him"],
  ["Louis Vuitton - Afternoon Swim", "Louis Vuitton", "Unisex"],
  ["Nasomatto - Black Afghano", "Black Afghano", "Unisex"],
  ["Mugler - Angel", "Women", "For Her"],
  ["Dior - Miss Dior", "Women", "For Her"],
  ["Xerjoff - Erba Pura (Accento)", "Women", "For Her"],
  ["Yves Saint Laurent - Black Opium", "Women", "For Her"],
  ["Giorgio Armani - Because It's You", "Women", "For Her"],
  ["Prada - Paradoxe", "Women", "For Her"],
  ["Giorgio Armani - Si", "Women", "For Her"],
  ["Dior - J'adore", "Women", "For Her"],
  ["Mancera - Coco Vanille", "Women", "For Her"],
  ["Mancera - Roses Vanille", "Women", "For Her"],
  ["Chanel - Coco Mademoiselle", "Women", "For Her"],
  ["Britney Spears - Fantasy", "Women", "For Her"],
  ["Valentino - Born In Roma (Women)", "Women", "For Her"],
  ["Thomas Kosmala - No. 4", "General", "Unisex"],
  ["Givenchy - Gentleman", "General", "For Him"],
  ["Dolce & Gabbana - The One Mysterious Night", "General", "For Him"],
  ["Issey Miyake", "General", "For Him"],
  ["Yves Saint Laurent - Y", "General", "For Him"],
  ["Xerjoff - Alexandria II", "General", "Unisex"],
  ["Yves Saint Laurent - Babycat", "General", "Unisex"],
  ["Vilhelm Parfumerie - Vilhelmina", "General", "For Her"],
  ["Parfums de Marly - Delina", "General", "For Her"],
  ["Carolina Herrera - Bad Boy", "General", "For Him"],
  ["Giorgio Armani - Acqua Di Gio", "General", "For Him"],
  ["Giorgio Armani - Acqua Di Gio Profumo", "General", "For Him"],
  ["Giorgio Armani - Code Profumo", "General", "For Him"],
  ["Giorgio Armani - Code", "General", "For Him"],
  ["Parfums de Marly - Kalan", "General", "For Him"],
  ["Parfums de Marly - Athair", "General", "For Him"],
  ["Parfums de Marly - Pegasus", "General", "For Him"],
  ["Parfums de Marly - Layton", "General", "For Him"],
  ["Amouage - Purpose 50", "General", "Unisex"],
  ["Amouage - Opus VII", "General", "Unisex"],
  ["Amouage - Interlude", "General", "Unisex"],
  ["Lancôme - Oud Bouquet", "General", "Unisex"],
  ["Tom Ford - Soleil Blanc", "General", "Unisex"],
  ["Tom Ford - Myrrhe Mystère", "General", "Unisex"],
  ["Tom Ford - Tobacco Vanille", "General", "Unisex"],
  ["Tom Ford - Oud Wood", "General", "Unisex"],
  ["Tom Ford - Ombré Leather", "General", "For Him"],
  ["Tom Ford - Black Orchid", "General", "For Her"],
  ["Tom Ford - Noir", "General", "For Him"],
  ["Carolina Herrera - 212 VIP Black", "General", "For Him"],
  ["Hugo Boss", "General", "For Him"],
  ["Chanel - Bleu de Chanel", "General", "For Him"],
  ["Versace - Eros", "General", "For Him"],
  ["Dior - Sauvage Elixir", "General", "For Him"],
  ["Dior - Sauvage", "General", "For Him"],
  ["Creed - Viking", "General", "For Him"],
  ["Creed - Aventus Absolu", "General", "For Him"],
  ["Creed - Aventus", "General", "For Him"],
  ["Jean Paul Gaultier - Le Male Elixir", "General", "For Him"],
  ["Jean Paul Gaultier - Le Male Pride", "General", "For Him"],
  ["Jean Paul Gaultier - Le Male", "General", "For Him"],
  ["Paco Rabanne - Invictus Victory Elixir", "General", "For Him"],
  ["Paco Rabanne - Invictus", "General", "For Him"],
  ["Valentino - Born In Roma (Green)", "General", "For Him"],
  ["Valentino - Born In Roma Uomo", "General", "For Him"],
  ["Jean Paul Gaultier - Scandal", "General", "For Her"],
  ["Jean Paul Gaultier - Scandal Absolu", "General", "For Her"],
  ["Giorgio Armani - Stronger With You", "General", "For Him"],
  ["Giorgio Armani - Stronger With You Intensely", "General", "For Him"],
  ["Giorgio Armani - Stronger With You Leather", "General", "For Him"],
  ["Lattafa - Khamrah Qahwa", "General", "Unisex"],
  ["Lattafa - Khamrah", "General", "Unisex"],
  ["Rochas - Moustache", "General", "For Him"],
  ["Arabian Oud - Resala", "General", "Unisex"],
  ["Swiss Arabian - Shaghaf", "General", "Unisex"],
  ["Gucci - Gucci Oud", "General", "Unisex"],
  ["Dior - Oud Ispahan", "General", "Unisex"],
  ["Dior - Homme Intense", "General", "For Him"],
  ["Dolce & Gabbana - Intense", "General", "For Him"],
  ["Dolce & Gabbana - The One", "General", "For Him"],
  ["Mashaer", "General", "Unisex"],
  ["Initio - Side Effect", "General", "Unisex"],
  ["Nishane - Ani", "General", "Unisex"],
  ["Nishane - Hacivat", "General", "For Him"],
  ["Burberry - Hero", "General", "For Him"],
  ["Ghoubar Al Thahab", "General", "Unisex"],
  ["Burberry - Her", "General", "For Her"],
  ["Jacques Bogart - Silver Scent", "General", "For Him"],
  ["Viktor & Rolf - Spicebomb", "General", "For Him"],
  ["Versace - Blue Jeans", "General", "For Him"],
  ["Dunhill - Desire Red", "General", "For Him"],
  ["Paco Rabanne - One Million", "General", "For Him"],
];

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const slugs = new Set();
const lines = ENTRIES.map(([name, group, gender], i) => {
  let slug = slugify(name);
  if (slugs.has(slug)) {
    let n = 2;
    while (slugs.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  slugs.add(slug);

  const price = GROUP_PRICE[group];
  const image = IMAGES[i % IMAGES.length];
  const accent = ACCENTS[i % ACCENTS.length];
  const family = gender === "For Her" ? "Floral" : gender === "For Him" ? "Woody" : "Oriental";

  return `  {
    slug: "${esc(slug)}",
    name: "${esc(name)}",
    group: "${esc(group)}",
    family: "${family}", gender: "${gender}",
    tagline: "A signature composition, crafted with care.",
    description: "An exceptional fragrance from our curated collection. Available in 50ml and 100ml.",
    price: ${price}, image: "${image}", accent: "${accent}",
    notes: { top: ["Bergamot", "Citrus"], heart: ["Floral Accord", "Spice"], base: ["Musk", "Wood"] },
  }`;
});

const out = `import { Product } from "@/lib/products";

/** Branded catalogue entries — pricing follows group rules in products.ts */
export const catalogProducts: Product[] = [
${lines.join(",\n")},
];
`;

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const dir = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, "..", "lib", "catalog.ts"), out);
console.log(`Generated ${ENTRIES.length} products -> lib/catalog.ts`);
