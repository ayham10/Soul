export const REQUIRED_PRODUCT_FIELDS = [
  "slug",
  "name",
  "price",
  "collection",
  "family",
  "gender",
  "tagline",
  "description",
  "notes",
  "image",
  "accent",
];

export const SECRET_FIELD_PATTERNS = [
  /secret/i,
  /password/i,
  /passcode/i,
  /token/i,
  /apikey/i,
  /service_role/i,
];

export function assertNoSecretFields(value, path = "catalog") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecretFields(item, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, nested] of Object.entries(value)) {
    if (SECRET_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
      throw new Error(`Refusing to serialize sensitive field at ${path}.${key}`);
    }
    assertNoSecretFields(nested, `${path}.${key}`);
  }
}

export function validateProduct(product, index) {
  if (!product || typeof product !== "object") {
    return { ok: false, error: `product at index ${index} is not an object` };
  }

  for (const field of REQUIRED_PRODUCT_FIELDS) {
    if (!(field in product)) {
      return { ok: false, error: `product at index ${index} missing field: ${field}` };
    }
  }

  if (typeof product.slug !== "string" || !product.slug) {
    return { ok: false, error: `product at index ${index} has invalid slug` };
  }
  if (typeof product.image !== "string" || !product.image) {
    return { ok: false, error: `product at index ${index} has invalid image` };
  }
  if (typeof product.price !== "number" || !Number.isFinite(product.price)) {
    return { ok: false, error: `product at index ${index} has invalid price` };
  }
  if (!product.notes || typeof product.notes !== "object") {
    return { ok: false, error: `product at index ${index} has invalid notes` };
  }

  return { ok: true };
}

export function validateCatalogProducts(products) {
  if (!Array.isArray(products)) {
    return { ok: false, error: "catalog products must be an array" };
  }
  if (products.length === 0) {
    return { ok: false, error: "catalog is empty (0 products)" };
  }

  for (let i = 0; i < products.length; i++) {
    const result = validateProduct(products[i], i);
    if (!result.ok) return result;
  }

  return { ok: true, count: products.length };
}

export function cloneCatalogProducts(products) {
  return structuredClone(products);
}
