export type Lang = "en" | "ar";

export const FAMILY_LABELS: Record<string, { en: string; ar: string }> = {
  All: { en: "All", ar: "الكل" },
  Women: { en: "Women", ar: "نسائي" },
  Oud: { en: "Oud", ar: "عود" },
  Sweet: { en: "Sweet", ar: "سُكري" },
  Woody: { en: "Woody", ar: "خشبي" },
  Floral: { en: "Rosy", ar: "وردي" },
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
  nav: { home: string; collection: string; wellness: string; story: string; admin: string; shopCta: string; tagline: string; brandSub: string };
  hero: { eyebrow: string; line1: string; italic: string; sub: string; shop: string; story: string; scroll: string };
  marquee: string[];
  featured: { eyebrow: string; title: string; titleEm: string; sub: string; viewAll: string };
  storyBlock: { eyebrow: string; title: string; titleEm: string; p1: string; p2: string; cta: string };
  trio: { eyebrow: string; items: { t: string; d: string }[] };
  wellness: {
    eyebrow: string; title: string; titleEm: string; sub: string; badge: string;
    cardTitle: string; cardSub: string; bullets: string[]; note: string; cta: string;
  };
  cta: { eyebrow: string; title: string; titleEm: string; sub: string; btn: string };
  shop: { eyebrow: string; title: string; titleEm: string; sub: string; empty: string; searchPlaceholder: string; noResults: string };
  product: {
    breadcrumb: string; size: string; quantity: string; addToBag: string; buyNow: string;
    composition: string; top: string; heart: string; base: string; related: string; relatedEm: string;
    perks: string[]; notFound: string; back: string;
  };
  cart: {
    selection: string; bag: string; empty: string; discover: string; subtotal: string;
    checkout: string; note: string; edp: string; remove: string;
  };
  footer: { blurb: string; explore: string; care: string; careItems: string[]; list: string; listSub: string; email: string; rights: string; imageNote: string };
  about: {
    eyebrow: string; title: string; titleEm: string; quote: string; quoteBy: string;
    sEyebrow: string; sTitle: string; sTitleEm: string; sp1: string; sp2: string;
    vEyebrow: string; vTitle: string; vTitleEm: string; values: { t: string; d: string }[]; cta: string;
  };
  intro: { discover: string; enter: string; skip: string };
  admin: {
    title: string; subtitle: string; passLabel: string; passPlaceholder: string; enter: string; wrongPass: string;
    signOut: string; addProduct: string; editProduct: string; products: string; count: string;
    name: string; nameAr: string; collection: string; family: string; gender: string; tagline: string; taglineAr: string;
    description: string; descriptionAr: string; price100: string; price50: string; image: string; accent: string;
    notesTop: string; notesHeart: string; notesBase: string; notesHint: string; bestseller: string;
    save: string; cancel: string; edit: string; delete: string; confirmDelete: string; reset: string;
    resetConfirm: string; resetBaseline: string; resetBaselineTitle: string; resetBaselineDescription: string;
    resetBaselineVersion: string; resetBaselineCount: string; resetBaselineDate: string;
    resetBaselineConfirmLabel: string; resetBaselineConfirmMismatch: string; localNote: string; uploadImage: string; or: string; searchPlaceholder: string; noResults: string;
    stock: string; displayOrder: string; stockIn: string; stockLow: string; stockOut: string;
    moveUp: string; moveDown: string; dragHint: string; order: string;
  };
}

export const translations: Record<Lang, Dict> = {
  en: {
    dir: "ltr",
    nav: { home: "Home", collection: "The Collection", wellness: "Wellness", story: "Our Tale", admin: "Admin", shopCta: "Shop the Collection", tagline: "Maison de Parfum", brandSub: "Crafted in the Land of Olives · Worldwide Shipping" },
    hero: {
      eyebrow: "Maison de Parfum · Land of Olives",
      line1: "Adorn yourself", italic: "with scent.",
      sub: "Some perfumes are not merely a fragrance; they are identity, history, and a story told without words.",
      shop: "Shop the Collection", story: "Our Tale", scroll: "Scroll",
    },
    marquee: ["Oud", "Rose", "Amber", "Citrus", "Musk", "Marine", "Saffron", "Vanilla"],
    featured: { eyebrow: "Signature Scents", title: "The", titleEm: "Collection", sub: "Eight compositions, each an obsession. Discover the fragrances our clients return to again and again.", viewAll: "View All Fragrances" },
    storyBlock: { eyebrow: "From Jerusalem's Grasse", title: "The Land of Olives,", titleEm: "cradle of scent", p1: "Oud, amber, and vanilla form the heart of our house, balanced with measured touches of tobacco, patchouli, and bergamot. We do not rely on fast commercial production or exaggerated slogans; we hand-blend in limited quantities to preserve the highest possible quality and purity. Nothing is made in haste.", p2: "Each composition is poured at a high concentration of the finest perfume oils, ranging between 30% and 50% oil.", cta: "Discover Our Tale" },
    trio: { eyebrow: "", items: [
      { t: "Pure Perfume Strength", d: "Perfume oil reaches 30–50%. A few drops are made to last from morning into the night." },
      { t: "Rare Materials", d: "Natural oud, rose absolute and ambergris — sourced, never synthesised." },
      { t: "Cruelty-Free", d: "Vegan formulas, recyclable glass, refillable by design." },
    ] },
    wellness: {
      eyebrow: "Wellness Atelier",
      title: "Beyond fragrance,",
      titleEm: "body care",
      sub: "A dedicated space for premium care essentials that support daily rituals after training, long workdays, or moments when the body needs attention.",
      badge: "Available Now",
      cardTitle: "Therapeutic Muscle & Joint Spray",
      cardSub: "A therapeutic spray from our own blend, made with natural oils that help relieve muscle, joint, and knee discomfort.",
      bullets: ["Natural oil blend", "For muscles, joints, and knees", "Fast topical application"],
      note: "For external comfort use only. Not a substitute for medical advice; consult a healthcare professional for injuries, persistent pain, or medical conditions.",
      cta: "Order on WhatsApp",
    },
    cta: { eyebrow: "Not sure where to begin?", title: "Find the scent that", titleEm: "feels like you", sub: "Every order ships with a curated set of samples, so you can fall in love before you commit.", btn: "Explore the Collection" },
    shop: { eyebrow: "Pure Perfume", title: "The", titleEm: "Collection", sub: "Fragrances composed in the Land of Olives. Choose your olfactory family to find your scent.", empty: "No fragrances in this family yet.", searchPlaceholder: "Search by name, notes, or family…", noResults: "No fragrances match your search." },
    product: {
      breadcrumb: "Collection", size: "Size", quantity: "Quantity", addToBag: "Add to Bag", buyNow: "Buy Now",
      composition: "The Composition", top: "Top", heart: "Heart", base: "Base", related: "You may also", relatedEm: "love",
      perks: ["Delivery available across all regions", "Distinctive scents with high concentration & longevity", "Premium, comfortable oils for daily wear"], notFound: "Fragrance not found", back: "Back to the Collection",
    },
    cart: { selection: "Your Selection", bag: "Shopping Bag", empty: "Your bag is empty", discover: "Discover the collection →", subtotal: "Subtotal", checkout: "Checkout via WhatsApp", note: "Complimentary shipping & samples on every order.", edp: "Pure Perfume", remove: "Remove" },
    footer: { blurb: "Oud • Amber • Vanilla • Tobacco • Patchouli", explore: "Explore", care: "Client Care", careItems: ["Shipping & Returns", "Find Your Scent", "Contact"], list: "The List", listSub: "Private launches and 10% off your first order.", email: "Email address", rights: "Soul Maison de Parfum. All rights reserved.", imageNote: "Note: Images are for illustration purposes only and may not exactly represent the actual product." },
    about: {
      eyebrow: "Our Tale", title: "Scent is", titleEm: "memory",
      quote: "We started Soul with a simple belief — that a fragrance should feel like a part of you, not a mask over it.", quoteBy: "— The Founders",
      sEyebrow: "From Jerusalem's Grasse", sTitle: "The Land of Olives,", sTitleEm: "cradle of scent",
      sp1: "Oud, amber, and vanilla form the heart of our house, balanced with measured touches of tobacco, patchouli, and bergamot. We do not rely on fast commercial production or exaggerated slogans; we hand-blend in limited quantities to preserve the highest possible quality and purity. Nothing is made in haste.",
      sp2: "Each composition is poured at a high concentration of the finest perfume oils, ranging between 30% and 50% oil.",
      vEyebrow: "What we stand for", vTitle: "The Soul", vTitleEm: "promise",
      values: [
        { t: "Sustainably Sourced", d: "Traceable ingredients and partnerships that respect the land and the people who tend it." },
        { t: "Made to Last", d: "High-concentration extraits and refillable bottles, so beauty never becomes waste." },
        { t: "Honestly Priced", d: "Sold direct, never through endless middlemen — luxury without the markup." },
      ], cta: "Shop the Collection",
    },
    intro: { discover: "Discover Your Signature Scent", enter: "Enter", skip: "Skip" },
    admin: {
      title: "Atelier", subtitle: "Product Management", passLabel: "Passcode", passPlaceholder: "Enter passcode", enter: "Enter", wrongPass: "Incorrect passcode.",
      signOut: "Sign out", addProduct: "Add Fragrance", editProduct: "Edit Fragrance", products: "Fragrances", count: "in catalogue",
      name: "Name (EN)", nameAr: "Name (AR)", collection: "Collection", family: "Family", gender: "Audience", tagline: "Tagline (EN)", taglineAr: "Tagline (AR)",
      description: "Description (EN)", descriptionAr: "Description (AR)", price100: "Price (100ml, ILS)", price50: "Price (50ml, ILS)", image: "Image URL / path", accent: "Accent color",
      notesTop: "Top notes", notesHeart: "Heart notes", notesBase: "Base notes", notesHint: "Separate notes with commas", bestseller: "Mark as bestseller",
      save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", confirmDelete: "Delete this fragrance?", reset: "Reset catalogue",
      resetConfirm: "Reset the catalogue to the original fragrances? Your changes will be lost.",
      resetBaseline: "Reset to 103-product baseline",
      resetBaselineTitle: "Reset to approved baseline",
      resetBaselineDescription: "This will replace the current catalogue with the approved 103-product baseline. Your current catalogue changes will be lost. Storage images will not be deleted.",
      resetBaselineVersion: "Baseline version",
      resetBaselineCount: "Products",
      resetBaselineDate: "Baseline date",
      resetBaselineConfirmLabel: "Type RESET TO 103 BASELINE to confirm",
      resetBaselineConfirmMismatch: "Confirmation phrase does not match.",
      localNote: "For all customers to see admin edits, configure Supabase database environment variables on the deployed site.",
      uploadImage: "Upload image", or: "or", searchPlaceholder: "Search fragrances…", noResults: "No fragrances match your search.",
      stock: "Stock quantity", displayOrder: "Display order", stockIn: "In stock", stockLow: "Low stock", stockOut: "Out of stock",
      moveUp: "Move up", moveDown: "Move down", dragHint: "Drag rows to reorder (disabled while searching)", order: "Order",
    },
  },
  ar: {
    dir: "rtl",
    nav: { home: "الرئيسية", collection: "المجموعة", wellness: "العناية", story: "حكايتنا", admin: "الإدارة", shopCta: "تسوّق المجموعة", tagline: "دار العطور", brandSub: "صُنع في أرض الزيتون · شحن لكل العالم" },
    hero: {
      eyebrow: "دار العطور · أرض الزيتون",
      line1: "تأنّق", italic: "بعُطرك.",
      sub: "بعض العطور ليست مجرد رائحة، بل هي هويةٌ، وتاريخٌ، وحكايةٌ تُروى دون كلمات.",
      shop: "تسوّق المجموعة", story: "حكايتنا", scroll: "مرّر",
    },
    marquee: ["عود", "ورد", "عنبر", "حمضيات", "مسك", "بحري", "زعفران", "فانيلا"],
    featured: { eyebrow: "عطور مميّزة", title: "", titleEm: "المجموعة", sub: "٨ تركيبات، كلٌّ منها شغف. اكتشف العطور التي يعود إليها عملاؤنا مرّة بعد مرّة.", viewAll: "عرض كل العطور" },
    storyBlock: { eyebrow: "من غِراس القُدس", title: "أرض الزيتون،", titleEm: "مهدُ العطور", p1: "العود والعنبر والفانيليا، وندعمها بلمساتٍ متوازنة من التوباكو، الباتشولي، والبرغموت. لا نعتمد على الإنتاج التجاري السريع أو الشعارات المبالغ فيها؛ بل نركّب عطورنا يدوياً وبكميات محدودة لضمان أعلى مستويات الجودة والنقاء الممكنة. لا شيء يُصنع على عجل.", p2: "كل تركيبة تُسكب بتركيز عالٍ من أجود أنواع الزيت العطري وتتراوح من بين 30% - 50% زيت.", cta: "اكتشف حكايتنا" },
    trio: { eyebrow: "", items: [
      { t: "تركيز عطر نقي", d: "زيت عطري يصل لنسبة ٣٠–٥٠٪. بضع قطرات تدوم من الصباح حتى الليل." },
      { t: "مكوّنات نادرة", d: "عطور بتركيبة فريدة بتعطيك ثبات وجمال بناسب ذوقك الراقي." },
      { t: "راحة وأناقة", d: "عطورنا مصنوعة لترافقك بكل راحة وأمان معبأة في زجاج مميز، ليدوم معك كقطعة تذكارية فخمة." },
    ] },
    wellness: {
      eyebrow: "أتيليه العناية",
      title: "ما بعد العطر،",
      titleEm: "عناية بالجسم",
      sub: "مساحة مخصصة لمنتجات عناية راقية تناسب الروتين اليومي بعد التمرين أو أيام العمل الطويلة أو عند حاجة الجسم للاهتمام.",
      badge: "متوفر الآن",
      cardTitle: "مرش علاجي للعضلات والمفاصل",
      cardSub: "مرش علاجي، من تركيبتنا الخاصة يحتوي على زيوت طبيعية تساعد في تخفيف آلام العضلات والمفاصل والرُكب.",
      bullets: ["تركيبة زيوت طبيعية", "للعضلات والمفاصل والرُكب", "استخدام موضعي سريع"],
      note: "للاستخدام الخارجي للراحة فقط. لا يُعد بديلاً عن الاستشارة الطبية؛ يُرجى استشارة مختص عند الإصابات أو الألم المستمر أو الحالات الطبية.",
      cta: "اطلب عبر واتساب",
    },
    cta: { eyebrow: "لا تعرف من أين تبدأ؟", title: "اعثر على العطر الذي", titleEm: "يشبهك", sub: "كل عطر بتركيبتنا إله قصة.. تصفّح مجموعتنا وتنقّى الريحة اللي تعبر عنك.", btn: "استكشف المجموعة" },
    shop: { eyebrow: "Pure Perfume", title: "", titleEm: "المجموعة", sub: "عطور مركبة في أرض الزيتون، اختر عائلتك العُطرية لتجد عطرك.", empty: "لا توجد عطور في هذه العائلة بعد.", searchPlaceholder: "ابحث بالاسم أو النوتات أو العائلة…", noResults: "لا توجد عطور تطابق بحثك." },
    product: {
      breadcrumb: "المجموعة", size: "الحجم", quantity: "الكمية", addToBag: "أضف إلى الحقيبة", buyNow: "اشترِ الآن",
      composition: "التركيبة", top: "المقدّمة", heart: "القلب", base: "القاعدة", related: "قد يعجبك", relatedEm: "أيضاً",
      perks: ["خدمة التوصيل متوفرة لكامل المناطق", "روائح مميزة بتركيز وثبات عالٍ", "زيوت فخمة ومريحة للاستخدام"], notFound: "العطر غير موجود", back: "العودة إلى المجموعة",
    },
    cart: { selection: "اختيارك", bag: "حقيبة التسوّق", empty: "حقيبتك فارغة", discover: "اكتشف المجموعة →", subtotal: "المجموع", checkout: "إتمام الطلب عبر واتساب", note: "شحن وعيّنات مجانية مع كل طلب.", edp: "Pure Perfume", remove: "حذف" },
    footer: { blurb: "عود • عَنْبَر • فَانِلْيَا • تُوبَاكُو • بَاتْشُولِي", explore: "استكشف", care: "خدمة العملاء", careItems: ["الشحن والإرجاع", "اعثر على عطرك", "تواصل معنا"], list: "القائمة", listSub: "إطلاقات خاصة وخصم ١٠٪ على طلبك الأول.", email: "البريد الإلكتروني", rights: "سول دار العطور. جميع الحقوق محفوظة.", imageNote: "ملاحظة: الصور لأغراض توضيحية فقط وقد لا تمثل المنتج الفعلي بدقة." },
    about: {
      eyebrow: "حكايتنا", title: "العطر", titleEm: "ذاكرة",
      quote: "بدأنا سول بإيمان بسيط — أن العطر يجب أن يكون جزءاً منك، لا قناعاً فوقك.", quoteBy: "— المؤسّسون",
      sEyebrow: "من غِراس القُدس", sTitle: "أرض الزيتون،", sTitleEm: "مهدُ العطور",
      sp1: "العود والعنبر والفانيليا، وندعمها بلمساتٍ متوازنة من التوباكو، الباتشولي، والبرغموت. لا نعتمد على الإنتاج التجاري السريع أو الشعارات المبالغ فيها؛ بل نركّب عطورنا يدوياً وبكميات محدودة لضمان أعلى مستويات الجودة والنقاء الممكنة. لا شيء يُصنع على عجل.",
      sp2: "كل تركيبة تُسكب بتركيز عالٍ من أجود أنواع الزيت العطري وتتراوح من بين 30% - 50% زيت.",
      vEyebrow: "ما نؤمن به", vTitle: "وعد", vTitleEm: "سول",
      values: [
        { t: "مصادر مستدامة", d: "مكوّنات يمكن تتبّعها وشراكات تحترم الأرض ومن يعتني بها." },
        { t: "صُنع ليدوم", d: "تركيزات عالية وزجاجات قابلة لإعادة التعبئة، فلا يتحوّل الجمال إلى هدر." },
        { t: "سعر عادل", d: "نبيع مباشرة، دون وسطاء لا نهاية لهم — فخامة دون مبالغة في السعر." },
      ], cta: "تسوّق المجموعة",
    },
    intro: { discover: "اكتشف عطرك الخاص", enter: "ادخل", skip: "تخطّي" },
    admin: {
      title: "الأتيليه", subtitle: "إدارة المنتجات", passLabel: "رمز الدخول", passPlaceholder: "أدخل رمز الدخول", enter: "دخول", wrongPass: "رمز غير صحيح.",
      signOut: "تسجيل الخروج", addProduct: "إضافة عطر", editProduct: "تعديل عطر", products: "العطور", count: "في الكتالوج",
      name: "الاسم (إنجليزي)", nameAr: "الاسم (عربي)", collection: "المجموعة", family: "العائلة", gender: "الفئة", tagline: "الشعار (إنجليزي)", taglineAr: "الشعار (عربي)",
      description: "الوصف (إنجليزي)", descriptionAr: "الوصف (عربي)", price100: "السعر (١٠٠مل، شيكل)", price50: "السعر (٥٠مل، شيكل)", image: "رابط/مسار الصورة", accent: "اللون المميّز",
      notesTop: "مقدّمة العطر", notesHeart: "قلب العطر", notesBase: "قاعدة العطر", notesHint: "افصل بين النوتات بفواصل", bestseller: "تمييز كأفضل مبيعاً",
      save: "حفظ", cancel: "إلغاء", edit: "تعديل", delete: "حذف", confirmDelete: "حذف هذا العطر؟", reset: "إعادة ضبط الكتالوج",
      resetConfirm: "إعادة الكتالوج إلى العطور الأصلية؟ ستفقد تغييراتك.",
      resetBaseline: "إعادة ضبط إلى خط الأساس 103 منتج",
      resetBaselineTitle: "إعادة ضبط إلى خط الأساس المعتمد",
      resetBaselineDescription: "سيؤدي هذا إلى استبدال الكتالوج الحالي بخط الأساس المعتمد المكوّن من 103 منتجات. ستفقد تغييرات الكتالوج الحالية. لن تُحذف صور التخزين.",
      resetBaselineVersion: "إصدار خط الأساس",
      resetBaselineCount: "المنتجات",
      resetBaselineDate: "تاريخ خط الأساس",
      resetBaselineConfirmLabel: "اكتب RESET TO 103 BASELINE للتأكيد",
      resetBaselineConfirmMismatch: "عبارة التأكيد غير صحيحة.",
      localNote: "لكي يرى كل العملاء تعديلات الإدارة، يجب ضبط متغيرات قاعدة بيانات Supabase في الموقع المنشور.",
      uploadImage: "رفع صورة", or: "أو", searchPlaceholder: "ابحث في العطور…", noResults: "لا توجد عطور تطابق بحثك.",
      stock: "كمية المخزون", displayOrder: "ترتيب العرض", stockIn: "متوفر", stockLow: "مخزون منخفض", stockOut: "نفد المخزون",
      moveUp: "تحريك لأعلى", moveDown: "تحريك لأسفل", dragHint: "اسحب الصفوف لإعادة الترتيب (معطّل أثناء البحث)", order: "الترتيب",
    },
  },
};
