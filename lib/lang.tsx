"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Lang, translations } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (typeof translations)["en"];
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangContextType | null>(null);
const STORAGE_KEY = "soul-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "ar") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const dir = translations[lang].dir;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };
  const toggle = () => setLang(lang === "en" ? "ar" : "en");

  return (
    <LangContext.Provider value={{ lang, dir: translations[lang].dir, t: translations[lang], setLang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
