/**
 * Tiny Umami tracking helper. Safe to call before umami loads (no-op).
 * Used for funnel events on Lab pages and the AI-Stack-Fit wizard.
 *
 * Usage:
 *   import { track } from "~/lib/track.client";
 *   track("tool.opened");
 *   track("tool.mode.greenfield", { source: "card" });
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
    // Umami v2 signature: umami.track(eventName, eventData)
    const umami = window.umami;
    if (umami && typeof umami.track === "function") {
      // Umami's typings overload makes TS unsure which signature; cast inline.
      (umami.track as (e: string, d?: Record<string, unknown>) => void)(event, data);
    }
  } catch {
    // never break the app on a tracking failure
  }
}

/* ── Funnel event names — single source of truth ──────────────── */
export const FUNNEL = {
  // Lab navigation
  labTileClick: (slug: string) => track(`lab.tile.click`, { slug }),
  labDetailCta: (slug: string, target: string) =>
    track(`lab.detail.cta`, { slug, target }),
  labExternalClick: (target: string) => track(`lab.external.click`, { target }),

  // AI-Stack-Fit wizard
  toolOpened: () => track(`tool.opened`, { tool: "ai-stack-fit" }),
  toolModeSelected: (mode: "greenfield" | "audit", source: "card" | "demo") =>
    track(`tool.mode.selected`, { tool: "ai-stack-fit", mode, source }),
  toolStepCompleted: (step: string) =>
    track(`tool.step.completed`, { tool: "ai-stack-fit", step }),
  toolDemoClicked: (demo: string) =>
    track(`tool.demo.clicked`, { tool: "ai-stack-fit", demo }),
  toolResultShown: (props: TrackData) =>
    track(`tool.result.shown`, { tool: "ai-stack-fit", ...props }),
  toolRestart: () => track(`tool.restart`, { tool: "ai-stack-fit" }),
  toolEditProfile: () => track(`tool.edit_profile`, { tool: "ai-stack-fit" }),
  toolCategoryExpanded: (category: string) =>
    track(`tool.category.expanded`, { tool: "ai-stack-fit", category }),
  toolCtaConsult: () => track(`tool.cta.consult`, { tool: "ai-stack-fit" }),
};
