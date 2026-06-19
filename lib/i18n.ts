export type Lang = "en" | "ar";

export const FAMILY_LABELS: Record<string, { en: string; ar: string }> = {
  All: { en: "All", ar: "الكل" },
  Woody: { en: "Woody", ar: "خشبي" },
  Floral: { en: "Floral", ar: "زهري" },
  Citrus: { en: "Citrus", ar: "حمضي" },
  Oriental: { en: "Oriental", ar: "شرقي" },
  Musk: { en: "Musk", ar: "مسكي" },
  Aquatic: { en: "Aquatic", ar: "مائي" },
};

export const GENDER_LABELS: Record<string, { en: string; ar: string }> = {
  "Unisex": { en: "Unisex", ar: "للجنسين" },
  "For Her": { en: "For Her", ar: "لها" },
  "For Him": { en: "For Him", ar: "له" },
};

export function famLabel(family: string, lang: Lang) {
  return FAMILY_LABELS[family]?.[lang] ?? family;
}
export function genderLabel(gender: string, lang: Lang) {
  return GENDER_LABELS[gender]?.[lang] ?? gender;
}

interface Dict {
  dir: "ltr" | "rtl";
  nav: { home: string; collection: string; story: string; admin: string; shopCta: string; tagline: string; brandSub: string };
  hero: { eyebrow: string; line1: string; italic: string; sub: string; shop: string; story: string; scroll: string };
  marquee: string[];
  featured: { eyebrow: string; title: string; titleEm: string; sub: string; viewAll: string };
  storyBlock: { eyebrow: string; title: string; titleEm: string; p1: string; p2: string; cta: string };
  trio: { eyebrow: string; items: { t: string; d: string }[] };
  cta: { eyebrow: string; title: string; titleEm: string; sub: string; btn: string };
  shop: { eyebrow: string; title: string; titleEm: string; sub: string; empty: string };
  product: {
    breadcrumb: string; size: string; quantity: string; addToBag: string; buyNow: string;
    composition: string; top: string; heart: string; base: string; related: string; relatedEm: string;
    perks: string[]; notFound: string; back: string;
  };
  cart: {
    selection: string; bag: string; empty: string; discover: string; subtotal: string;
    checkout: string; note: string; edp: string; remove: string;
  };
  footer: { blurb: string; explore: string; care: string; careItems: string[]; list: string; listSub: string; email: string; rights: string };
  about: {
    eyebrow: string; title: string; titleEm: string; quote: string; quoteBy: string;
    sEyebrow: string; sTitle: string; sTitleEm: string; sp1: string; sp2: string;
    vEyebrow: string; vTitle: string; vTitleEm: string; values: { t: string; d: string }[]; cta: string;
  };
  intro: { discover: string; enter: string; skip: string };
  admin: {
    title: string; subtitle: string; passLabel: string; passPlaceholder: string; enter: string; wrongPass: string;
    signOut: string; addProduct: string; editProduct: string; products: string; count: string;
    name: string; nameAr: string; family: string; gender: string; tagline: string; taglineAr: string;
    description: string; descriptionAr: string; price: string; image: string; accent: string;
    notesTop: string; notesHeart: string; notesBase: string; notesHint: string; bestseller: string;
    save: string; cancel: string; edit: string; delete: string; confirmDelete: string; reset: string;
    resetConfirm: string; localNote: string; uploadImage: string; or: string;
  };
}

export const translations: Record<Lang, Dict> = {
  en: {
    dir: "ltr",
    nav: { home: "Home", collection: "The Collection", story: "Our Story", admin: "Admin", shopCta: "Shop the Collection", tagline: "Maison de Parfum", brandSub: "Crafted in Grasse · Worldwide Shipping" },
    hero: {
      eyebrow: "Maison de Parfum · Est. Grasse",
      line1: "Wear your", italic: "Soul.",
      sub: "Extrait-strength fragrances composed from the world's rarest materials — oud, rose absolute, ambergris. Scent, made unforgettable.",
      shop: "Shop the Collection", story: "Our Story", scroll: "Scroll",
    },
    marquee: ["Oud", "Rose", "Amber", "Citrus", "Musk", "Marine", "Saffron", "Vanilla"],
    featured: { eyebrow: "Signature Scents", title: "The", titleEm: "Collection", sub: "Six compositions, each an obsession. Discover the fragrances our clients return to again and again.", viewAll: "View All Fragrances" },
    storyBlock: { eyebrow: "The House of Soul", title: "The art of", titleEm: "slow perfumery", p1: "Every Soul fragrance begins with a raw material worth waiting for — agarwood aged for years, roses picked before dawn, resins sourced from a single grove. We compose in small batches, never compromising on concentration.", p2: "The result is a scent that unfolds for hours and becomes, unmistakably, your own.", cta: "Discover Our Story" },
    trio: { eyebrow: "", items: [
      { t: "Extrait Strength", d: "20–30% perfume oil. A few drops last from morning into the night." },
      { t: "Rare Materials", d: "Natural oud, rose absolute and ambergris — sourced, never synthesised." },
      { t: "Cruelty-Free", d: "Vegan formulas, recyclable glass, refillable by design." },
    ] },
    cta: { eyebrow: "Not sure where to begin?", title: "Find the scent that", titleEm: "feels like you", sub: "Every order ships with a curated set of samples, so you can fall in love before you commit.", btn: "Explore the Collection" },
    shop: { eyebrow: "Eau de Parfum", title: "The", titleEm: "Collection", sub: "Fragrances composed in Grasse. Filter by olfactory family to find your signature.", empty: "No fragrances in this family yet." },
    product: {
      breadcrumb: "Collection", size: "Size", quantity: "Quantity", addToBag: "Add to Bag", buyNow: "Buy Now",
      composition: "The Composition", top: "Top", heart: "Heart", base: "Base", related: "You may also", relatedEm: "love",
      perks: ["Free worldwide shipping", "Samples in every order", "Vegan & cruelty-free"], notFound: "Fragrance not found", back: "Back to the Collection",
    },
    cart: { selection: "Your Selection", bag: "Shopping Bag", empty: "Your bag is empty", discover: "Discover the collection →", subtotal: "Subtotal", checkout: "Checkout via WhatsApp", note: "Complimentary shipping & samples on every order.", edp: "Eau de Parfum", remove: "Remove" },
    footer: { blurb: "Rare ingredients, composed slowly. Soul is a small fragrance house crafting extrait-strength perfumes for those who wear scent like a signature.", explore: "Explore", care: "Client Care", careItems: ["Shipping & Returns", "Find Your Scent", "Contact"], list: "The List", listSub: "Private launches and 10% off your first order.", email: "Email address", rights: "Soul Maison de Parfum. All rights reserved." },
    about: {
      eyebrow: "Our Story", title: "Scent is", titleEm: "memory",
      quote: "We started Soul with a simple belief — that a fragrance should feel like a part of you, not a mask over it.", quoteBy: "— The Founders",
      sEyebrow: "From Grasse, with patience", sTitle: "A house built on", sTitleEm: "raw materials",
      sp1: "In the hills of Grasse — the birthplace of modern perfumery — we work with growers and distillers who have perfected their craft over generations. Our oud is aged. Our roses are picked by hand before sunrise. Nothing is rushed.",
      sp2: "Each composition is poured at extrait strength and rested before it ever reaches you, so the first spray is as honest as the last.",
      vEyebrow: "What we stand for", vTitle: "The Soul", vTitleEm: "promise",
      values: [
        { t: "Sustainably Sourced", d: "Traceable ingredients and partnerships that respect the land and the people who tend it." },
        { t: "Made to Last", d: "High-concentration extraits and refillable bottles, so beauty never becomes waste." },
        { t: "Honestly Priced", d: "Sold direct, never through endless middlemen — luxury without the markup." },
      ], cta: "Shop the Collection",
    },
    intro: { discover: "Discover Your Signature", enter: "Enter", skip: "Skip" },
    admin: {
      title: "Atelier", subtitle: "Product Management", passLabel: "Passcode", passPlaceholder: "Enter passcode", enter: "Enter", wrongPass: "Incorrect passcode.",
      signOut: "Sign out", addProduct: "Add Fragrance", editProduct: "Edit Fragrance", products: "Fragrances", count: "in catalogue",
      name: "Name (EN)", nameAr: "Name (AR)", family: "Family", gender: "Audience", tagline: "Tagline (EN)", taglineAr: "Tagline (AR)",
      description: "Description (EN)", descriptionAr: "Description (AR)", price: "Price (50ml, ILS)", image: "Image URL / path", accent: "Accent color",
      notesTop: "Top notes", notesHeart: "Heart notes", notesBase: "Base notes", notesHint: "Separate notes with commas", bestseller: "Mark as bestseller",
      save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", confirmDelete: "Delete this fragrance?", reset: "Reset catalogue",
      resetConfirm: "Reset the catalogue to the original fragrances? Your changes will be lost.", localNote: "For all customers to see admin edits, configure Supabase database environment variables on the deployed site.",
      uploadImage: "Upload image", or: "or",
    },
  },
  ar: {
    dir: "rtl",
    nav: { home: "الرئيسية", collection: "المجموعة", story: "قصتنا", admin: "الإدارة", shopCta: "تسوّق المجموعة", tagline: "دار العطور", brandSub: "صُنع في غراس · شحن لكل العالم" },
    hero: {
      eyebrow: "دار العطور · غراس",
      line1: "ارتدِ", italic: "روحك.",
      sub: "عطور بتركيز الإكستريت مصنوعة من أندر المكوّنات في العالم — العود، خلاصة الورد، العنبر. عطرٌ لا يُنسى.",
      shop: "تسوّق المجموعة", story: "قصتنا", scroll: "مرّر",
    },
    marquee: ["عود", "ورد", "عنبر", "حمضيات", "مسك", "بحري", "زعفران", "فانيلا"],
    featured: { eyebrow: "عطور مميّزة", title: "", titleEm: "المجموعة", sub: "ستّة تركيبات، كلٌّ منها شغف. اكتشف العطور التي يعود إليها عملاؤنا مرّة بعد مرّة.", viewAll: "عرض كل العطور" },
    storyBlock: { eyebrow: "دار سول", title: "فنّ العطور", titleEm: "البطيء", p1: "يبدأ كل عطر من سول بمكوّن خام يستحق الانتظار — عود مُعتّق لسنوات، ورود تُقطف قبل الفجر، وراتنجات من بستان واحد. نركّب بكميات صغيرة، دون أي تنازل عن التركيز.", p2: "والنتيجة عطرٌ يتفتّح لساعات ويصبح، بلا شك، عطرك أنت.", cta: "اكتشف قصتنا" },
    trio: { eyebrow: "", items: [
      { t: "تركيز إكستريت", d: "زيت عطري بنسبة ٢٠–٣٠٪. بضع قطرات تدوم من الصباح حتى الليل." },
      { t: "مكوّنات نادرة", d: "عود طبيعي وخلاصة ورد وعنبر — مصدرها الطبيعة، لا التصنيع." },
      { t: "خالٍ من القسوة", d: "تركيبات نباتية، زجاج قابل لإعادة التدوير، وقابل لإعادة التعبئة." },
    ] },
    cta: { eyebrow: "لا تعرف من أين تبدأ؟", title: "اعثر على العطر الذي", titleEm: "يشبهك", sub: "كل طلب يصلك مع مجموعة عيّنات منتقاة، لتقع في الحب قبل أن تقرّر.", btn: "استكشف المجموعة" },
    shop: { eyebrow: "أو دو بارفان", title: "", titleEm: "المجموعة", sub: "عطور مُركّبة في غراس. صنّف حسب العائلة العطرية لتجد عطرك.", empty: "لا توجد عطور في هذه العائلة بعد." },
    product: {
      breadcrumb: "المجموعة", size: "الحجم", quantity: "الكمية", addToBag: "أضف إلى الحقيبة", buyNow: "اشترِ الآن",
      composition: "التركيبة", top: "المقدّمة", heart: "القلب", base: "القاعدة", related: "قد يعجبك", relatedEm: "أيضاً",
      perks: ["شحن مجاني لكل العالم", "عيّنات مع كل طلب", "نباتي وخالٍ من القسوة"], notFound: "العطر غير موجود", back: "العودة إلى المجموعة",
    },
    cart: { selection: "اختيارك", bag: "حقيبة التسوّق", empty: "حقيبتك فارغة", discover: "اكتشف المجموعة →", subtotal: "المجموع", checkout: "إتمام الطلب عبر واتساب", note: "شحن وعيّنات مجانية مع كل طلب.", edp: "أو دو بارفان", remove: "حذف" },
    footer: { blurb: "مكوّنات نادرة، تُركّب على مهل. سول دار عطور صغيرة تصنع عطوراً بتركيز الإكستريت لمن يرتدون العطر كتوقيع خاص.", explore: "استكشف", care: "خدمة العملاء", careItems: ["الشحن والإرجاع", "اعثر على عطرك", "تواصل معنا"], list: "القائمة", listSub: "إطلاقات خاصة وخصم ١٠٪ على طلبك الأول.", email: "البريد الإلكتروني", rights: "سول دار العطور. جميع الحقوق محفوظة." },
    about: {
      eyebrow: "قصتنا", title: "العطر", titleEm: "ذاكرة",
      quote: "بدأنا سول بإيمان بسيط — أن العطر يجب أن يكون جزءاً منك، لا قناعاً فوقك.", quoteBy: "— المؤسّسون",
      sEyebrow: "من غراس، بصبر", sTitle: "دار قائمة على", sTitleEm: "المكوّنات الخام",
      sp1: "في تلال غراس — مهد العطور الحديثة — نعمل مع مزارعين ومقطّرين أتقنوا حرفتهم عبر الأجيال. عودنا مُعتّق. ورودنا تُقطف يدوياً قبل الشروق. لا شيء على عجل.",
      sp2: "كل تركيبة تُسكب بتركيز الإكستريت وتُترك لترتاح قبل أن تصلك، فتكون أول رشّة صادقة كآخرها.",
      vEyebrow: "ما نؤمن به", vTitle: "وعد", vTitleEm: "سول",
      values: [
        { t: "مصادر مستدامة", d: "مكوّنات يمكن تتبّعها وشراكات تحترم الأرض ومن يعتني بها." },
        { t: "صُنع ليدوم", d: "تركيزات عالية وزجاجات قابلة لإعادة التعبئة، فلا يتحوّل الجمال إلى هدر." },
        { t: "سعر عادل", d: "نبيع مباشرة، دون وسطاء لا نهاية لهم — فخامة دون مبالغة في السعر." },
      ], cta: "تسوّق المجموعة",
    },
    intro: { discover: "اكتشف توقيعك", enter: "ادخل", skip: "تخطّي" },
    admin: {
      title: "الأتيليه", subtitle: "إدارة المنتجات", passLabel: "رمز الدخول", passPlaceholder: "أدخل رمز الدخول", enter: "دخول", wrongPass: "رمز غير صحيح.",
      signOut: "تسجيل الخروج", addProduct: "إضافة عطر", editProduct: "تعديل عطر", products: "العطور", count: "في الكتالوج",
      name: "الاسم (إنجليزي)", nameAr: "الاسم (عربي)", family: "العائلة", gender: "الفئة", tagline: "الشعار (إنجليزي)", taglineAr: "الشعار (عربي)",
      description: "الوصف (إنجليزي)", descriptionAr: "الوصف (عربي)", price: "السعر (٥٠مل، شيكل)", image: "رابط/مسار الصورة", accent: "اللون المميّز",
      notesTop: "مقدّمة العطر", notesHeart: "قلب العطر", notesBase: "قاعدة العطر", notesHint: "افصل بين النوتات بفواصل", bestseller: "تمييز كأفضل مبيعاً",
      save: "حفظ", cancel: "إلغاء", edit: "تعديل", delete: "حذف", confirmDelete: "حذف هذا العطر؟", reset: "إعادة ضبط الكتالوج",
      resetConfirm: "إعادة الكتالوج إلى العطور الأصلية؟ ستفقد تغييراتك.", localNote: "لكي يرى كل العملاء تعديلات الإدارة، يجب ضبط متغيرات قاعدة بيانات Supabase في الموقع المنشور.",
      uploadImage: "رفع صورة", or: "أو",
    },
  },
};
