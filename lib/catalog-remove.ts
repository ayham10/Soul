export const LAST_PRODUCT_DELETE_ERROR =
  "Cannot delete the last product. The catalogue must contain at least one item.";

export function assertCanRemoveFromCatalog(currentCount: number): void {
  if (currentCount <= 1) {
    throw new Error(LAST_PRODUCT_DELETE_ERROR);
  }
}
