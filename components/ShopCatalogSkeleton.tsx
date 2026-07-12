const SKELETON_COUNT = 6;

export default function ShopCatalogSkeleton() {
  return (
    <div className="shop-grid shop-grid-skeleton" aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="product-media skeleton-shimmer" />
          <div className="product-info">
            <div className="skeleton-line skeleton-line-sm skeleton-shimmer" />
            <div className="skeleton-line skeleton-line-lg skeleton-shimmer" />
            <div className="skeleton-line skeleton-line-md skeleton-shimmer" />
            <div className="product-purchase-row">
              <div className="skeleton-line skeleton-line-price skeleton-shimmer" />
              <div className="skeleton-line skeleton-line-btn skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
