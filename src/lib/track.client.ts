/**
 * Tiny Umami tracking helper. Safe to call before umami loads (no-op).
 *
 * Funnel events for the public Labs hub:
 *   - lab.tile.click          (slug, status, target)        — index tile click
 *   - lab.external.click      (target)                      — direct external tile
 *   - lab.detail.cta          (slug, target)                — detail-page primary CTA
 *   - lab.detail.title-cta    (slug, target)                — detail-page hero-title CTA
 *   - lab.detail.viewed       (slug)                        — detail-page rendered
 *   - lab.detail.section.view (slug, section)               — section scrolled into view
 *   - lab.detail.scroll.depth (slug, depth=25|50|75|100)    — scroll milestone
 *   - home.viewed             ()                            — index rendered
 *
 * Most events are wired declaratively via [data-track] attributes in
 * `animations.client.ts`. Page-view + scroll events fire from there too.
 */

declare global {
  interface Window {
    umami?: {
      track:
        | ((event: string, data?: Record<string, unknown>) => void)
        | ((cb: (props: Record<string, unknown>) => Record<string, unknown>) => void);
      identify?: (id: string, data?: Record<string, unknown>) => void;
    };
  }
}

export type TrackData = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, data?: TrackData): void {
  if (typeof window === "undefined") return;
  try {
    const umami = window.umami;
    if (umami && typeof umami.track === "function") {
      (umami.track as (e: string, d?: Record<string, unknown>) => void)(event, data);
    }
  } catch {
    // never break the app on a tracking failure
  }
}
