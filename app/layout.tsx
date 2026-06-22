import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { LangProvider } from "@/lib/lang";
import { ProductsProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Intro from "@/components/Intro";

export const metadata: Metadata = {
  title: "Soul — Maison de Parfum | Niche Luxury Fragrance",
  description:
    "Soul is a niche perfume house crafting extrait-strength fragrances from rare ingredients. Discover oud, rose, amber and aquatic scents. Worldwide shipping.",
  keywords: "luxury perfume, niche fragrance, oud, eau de parfum, soul parfum, perfume online",
  openGraph: {
    title: "Soul — Maison de Parfum",
    description: "Rare ingredients, composed slowly. Discover the collection.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a09",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LangProvider>
          <ProductsProvider>
            <CartProvider>
              <Intro />
              <Navbar />
              <CartDrawer />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </ProductsProvider>
        </LangProvider>
      </body>
    </html>
  );
}
