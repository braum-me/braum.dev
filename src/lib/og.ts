/**
 * Per-lab OG-image cards. Pure-SVG, no runtime deps. 1200×630, brand-locked.
 *
 * Why SVG: lightweight, no native deps, no build step. Most modern crawlers
 * (LinkedIn, Discord, Slack, Telegram, Facebook) honour SVG og:image. Twitter
 * is the holdout — for /x.com previews, layer a static fallback PNG later.
 */

export interface OgCard {
  /** Big eyebrow line: BRAUM · LABS · L_NN · NAME */
  eyebrow: string;
  /** Headline (≤ 32 chars renders cleanly). */
  title: string;
  /** Short tagline under the title (≤ 72 chars). */
  tagline: string;
  /** Status badge label. */
  status: "LIVE" | "WIP" | "COMING SOON";
}

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);

// Coarse char-class advance widths for Inter Bold, in em. Used to position the
// trailing mint dot after the title — resvg won't give us a real bbox at
// build time, so we approximate. Calibrated visually against the live PNGs.
const interBoldEmAdvance = (c: string): number => {
  if (/[ijl1!|.,:; \-']/.test(c)) return 0.27;
  if (/[frt]/.test(c)) return 0.42;
  if (/[mwMW]/.test(c)) return 0.78;
  return 0.55;
};
const measureInterBold = (s: string, fontSize: number): number =>
  Array.from(s).reduce((sum, c) => sum + interBoldEmAdvance(c) * fontSize, 0);

export function renderOgSvg(card: OgCard): string {
  const eyebrow = escapeXml(card.eyebrow);
  const title = escapeXml(card.title);
  const tagline = escapeXml(card.tagline);
  const status = escapeXml(card.status);
  const statusFill = card.status === "LIVE" ? "#00C896" : "#F2EFE4";
  const statusOpacity = card.status === "LIVE" ? 1 : 0.45;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D3D2E"/>
      <stop offset="55%" stop-color="#051E16"/>
      <stop offset="100%" stop-color="#020E0A"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#00C896" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#00C896" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#2F8264" stroke-width="1" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- crosshair corners -->
  <g stroke="#F2EFE4" stroke-opacity="0.18" stroke-width="1" fill="none">
    <path d="M40 40 L40 64 M40 40 L64 40"/>
    <path d="M1160 40 L1160 64 M1160 40 L1136 40"/>
    <path d="M40 590 L40 566 M40 590 L64 590"/>
    <path d="M1160 590 L1160 566 M1160 590 L1136 590"/>
  </g>

  <!-- eyebrow -->
  <text x="80" y="120" fill="#00C896" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="22" font-weight="500" letter-spacing="4">${eyebrow}</text>

  <!-- title -->
  <text x="80" y="320" fill="#F2EFE4" font-family="'Inter', system-ui, sans-serif" font-size="112" font-weight="700" letter-spacing="-3">${title}</text>
  <circle cx="${Math.round(80 + measureInterBold(card.title, 112) - card.title.length * 3 + 18)}" cy="320" r="8" fill="#00C896"/>

  <!-- tagline -->
  <text x="80" y="400" fill="#F2EFE4" fill-opacity="0.75" font-family="'Geist', system-ui, sans-serif" font-size="30" font-weight="400">${tagline}</text>

  <!-- status badge -->
  <g transform="translate(80 510)">
    <rect x="0" y="0" width="${status.length * 14 + 48}" height="44" rx="4" fill="#000" fill-opacity="0.35" stroke="${statusFill}" stroke-opacity="${statusOpacity * 0.55}"/>
    <circle cx="22" cy="22" r="5" fill="${statusFill}" fill-opacity="${statusOpacity}"/>
    <text x="38" y="29" fill="${statusFill}" fill-opacity="${statusOpacity}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="16" font-weight="500" letter-spacing="3">${status}</text>
  </g>

  <!-- footer mark -->
  <text x="80" y="585" fill="#F2EFE4" fill-opacity="0.45" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" letter-spacing="2.5">BRAUM.DEV · PUBLIC LABS</text>
  <text x="1120" y="585" fill="#00C896" fill-opacity="0.7" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" letter-spacing="2.5" text-anchor="end">SB·</text>
</svg>`;
}

/* ── Per-lab card definitions ───────────────────────────────────── */

export const CARDS: Record<string, OgCard> = {
  default: {
    eyebrow: "BRAUM · LABS · ∞ · INDEX",
    title: "Public Labs",
    tagline: "Experimente, Tools, halbfertige Ideen.",
    status: "LIVE",
  },
  "ai-stack-fit": {
    eyebrow: "BRAUM · LABS · L_01 · AI-STACK-FIT",
    title: "AI-Stack-Fit",
    tagline: "Stack-Empfehlung mit Synergie-Score in 90 Sekunden.",
    status: "LIVE",
  },
  "agi-jetzt": {
    eyebrow: "BRAUM · LABS · L_02 · AGI.JETZT",
    title: "agi.jetzt",
    tagline: "Was tun wir, wenn AGI morgen ankommt — Notizbuch.",
    status: "LIVE",
  },
};
