import type { APIRoute } from "astro";
import { CARDS, renderOgSvg } from "~/lib/og.ts";

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const slug = (params.slug ?? "default").replace(/\.svg$/, "");
  const card = CARDS[slug] ?? CARDS.default;
  if (!card) {
    return new Response("not found", { status: 404 });
  }

  return new Response(renderOgSvg(card), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
};
