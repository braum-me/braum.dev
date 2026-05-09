/**
 * Env helper. Reads from process.env first (Docker/Prod), falls back to
 * import.meta.env (Astro dev). Keeps code compatible across `pnpm dev`
 * and Docker runtime.
 */

export function env(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  const m = import.meta.env as Record<string, string | undefined>;
  return m[key];
}
