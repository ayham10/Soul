import { Product } from "../products";

export const TEST_ADMIN_PASSCODE = "test-admin-passcode";
export const TEST_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

export function applyTestAuthEnv() {
  process.env.ADMIN_PASSCODE = TEST_ADMIN_PASSCODE;
  process.env.CATALOG_SESSION_SECRET = TEST_SESSION_SECRET;
  delete process.env.SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.KV_REST_API_URL;
}

export function applyTestSupabaseEnv() {
  applyTestAuthEnv();
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
}

export function sampleProduct(overrides: Partial<Product> = {}): Product {
  return {
    slug: "test-perfume",
    name: "Test Perfume",
    collection: "General",
    family: "Woody",
    gender: "Unisex",
    tagline: "Test tagline",
    description: "Test description",
    price: 100,
    image: "https://example.supabase.co/storage/v1/object/public/perfumes/test.jpg",
    accent: "#c6a15b",
    notes: { top: ["Bergamot"], heart: ["Rose"], base: ["Musk"] },
    stock: 10,
    displayOrder: 0,
    ...overrides,
  };
}

export function adminSessionCookie(token: string): string {
  return `soul_admin_session=${encodeURIComponent(token)}`;
}
