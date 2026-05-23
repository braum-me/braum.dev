import type { APIRoute } from "astro";
import { env } from "~/lib/env.ts";

export const prerender = false;

const ROUTES: Array<{ path: string; changefreq: string; priority: number; lastmod: string }> = [
  { path: "/", changefreq: "weekly", priority: 1.0, lastmod: "2026-05-12" },
  { path: "/labs/ai-stack-fit", changefreq: "monthly", priority: 0.8, lastmod: "2026-05-09" },
  { path: "/labs/agi-jetzt", changefreq: "monthly", priority: 0.8, lastmod: "2026-05-09" },
];

export const GET: APIRoute = ({ site }) => {
  const base = env("PUBLIC_SITE_URL") ?? site?.toString() ?? "https://braum.dev";
  const origin = base.replace(/\/+$/, "");

  const urls = ROUTES.map(
    (r) => `  <url>
    <loc>${origin}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
