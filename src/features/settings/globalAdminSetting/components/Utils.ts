
// ─────────────────────────────────────────────────────────────
//  String helpers
// ─────────────────────────────────────────────────────────────

import type { GrantedPermissionItem } from "../Globalsettingapislice";

/** Convert a display label into a SCREAMING_SNAKE_CASE slug */
export const slug = (s: string): string =>
  s
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/, "");

/** Generate a random negative integer for locally-created items */
export const newLocalId = (): number =>
  -(Math.floor(Math.random() * 900_000) + 100_000);

// ─────────────────────────────────────────────────────────────
//  Permission parsing
// ─────────────────────────────────────────────────────────────

export function parseGrantedPermissions(
  raw: string | null | undefined,
): GrantedPermissionItem[] {
  if (!raw || raw === "null") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GrantedPermissionItem[]) : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  API error helpers
// ─────────────────────────────────────────────────────────────

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    err.data &&
    typeof err.data === "object" &&
    "message" in err.data &&
    typeof (err.data as { message: unknown }).message === "string"
  ) {
    return (err.data as { message: string }).message;
  }
  return fallback;
}

export function extractErrorStatus(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  ) {
    return (err as { status: number }).status;
  }
  return null;
}