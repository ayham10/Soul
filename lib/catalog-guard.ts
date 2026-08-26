export const EMPTY_CATALOG_ERROR =
  "Catalogue cannot be empty. At least one product is required.";

export const EMPTY_CATALOG_WRITE_ERROR = "Refusing to write empty catalog to Supabase";

export type SecurityRejectionReason =
  | "empty_catalog"
  | "unauthorized"
  | "auth_not_configured";

export type SecurityRejectionLog = {
  event: "catalog_write_rejected" | "admin_access_rejected";
  timestamp: string;
  endpoint: string;
  reason: SecurityRejectionReason;
  authenticated: boolean;
  requestId: string;
};

export function getRequestId(request: Request): string {
  return (
    request.headers.get("x-request-id") ||
    request.headers.get("x-vercel-id") ||
    request.headers.get("x-amzn-trace-id") ||
    crypto.randomUUID()
  );
}

export function logSecurityRejection(input: Omit<SecurityRejectionLog, "event" | "timestamp"> & {
  event?: SecurityRejectionLog["event"];
}) {
  const entry: SecurityRejectionLog = {
    event: input.event ?? "catalog_write_rejected",
    timestamp: new Date().toISOString(),
    endpoint: input.endpoint,
    reason: input.reason,
    authenticated: input.authenticated,
    requestId: input.requestId,
  };
  console.warn(JSON.stringify(entry));
}

export function assertNonEmptyCatalog(products: unknown[]): void {
  if (products.length === 0) {
    throw new Error(EMPTY_CATALOG_WRITE_ERROR);
  }
}
