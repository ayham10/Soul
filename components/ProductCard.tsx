"use client";
import Image from "next/image";
import Link from "next/link";
import { Product, localize } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { famLabel, genderLabel } from "@/lib/i18n";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, lang } = useLang();
  const L = localize(product, lang);

  return (
    <div className="product-card">
      <Link href={`/fragrance/${product.slug}`} className="product-media-link">
        <div className="product-media">
          <Image
            src={product.image}
            alt={L.name}
            fill
            sizes="(max-width: 639px) calc(100vw - 36px), (max-width: 899px) 46vw, (max-width: 1280px) 31vw, 370px"
            className="pc-img"
            style={{ objectFit: "cover" }}
          />
          <span className="product-badge product-family">{famLabel(product.family, lang)}</span>
          {product.bestseller && (
            <span className="product-badge product-bestseller">★</span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <div className="product-meta">
          {genderLabel(product.gender, lang)}
        </div>
        <Link href={`/fragrance/${product.slug}`} className="product-title-link">
          <h3 className="product-title">{L.name}</h3>
        </Link>
        <p className="product-tagline">{L.tagline}</p>

        <div className="product-purchase-row">
          <span className="product-price">${product.price}</span>
          <button
            className="quick-add product-add-button"
            onClick={() =>
              add({ slug: product.slug, name: L.name, image: product.image, ml: 50, price: product.price })
            }
          >
            {t.product.addToBag}
          </button>
        </div>
      </div>
    </div>
  );
}
