/** Extract a human message from an RTK Query error union. */
export function errMsg(error: unknown): string {
  if (!error) return "Something went wrong.";
  if (typeof error === "object" && error !== null) {
    const e = error as { data?: { message?: string }; message?: string; error?: string };
    return e.data?.message ?? e.message ?? e.error ?? "Request failed.";
  }
  return String(error);
}
