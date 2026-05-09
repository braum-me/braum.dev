import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── DIY SplitText ─────────────────────────────────────────────── */
function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === "1") {
    return Array.from(el.querySelectorAll<HTMLElement>(".split-char"));
  }
  const text = el.textContent ?? "";
  el.textContent = "";
  el.dataset.split = "1";
  const chars: HTMLElement[] = [];
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "split-char";
    span.textContent = ch === " " ? " " : ch;
    span.style.display = "inline-block";
    span.style.willChange = "transform, opacity";
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

/* ── Init ──────────────────────────────────────────────────────── */
function initAnimations(): void {
  for (const t of ScrollTrigger.getAll()) {
    t.kill();
  }

  if (reduced()) {
    // Make sure split chars are visible if we previously animated them out
    document.querySelectorAll<HTMLElement>(".split-char").forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
    return;
  }

  /* 1. Hero title — SplitText reveal */
  const titleTargets = document.querySelectorAll<HTMLElement>(
    ".labs-title-text, .detail-hero-title",
  );
  titleTargets.forEach((target) => {
    // For detail page: the title contains a mint-dot span; split only the text node
    let splitTarget = target;
    const isDetailHero = target.classList.contains("detail-hero-title");
    if (isDetailHero) {
      // Wrap title text into an inner span if not already
      let inner = target.querySelector<HTMLElement>(".detail-hero-title-text");
      if (!inner) {
        const dot = target.querySelector<HTMLElement>(".mint-dot");
        const textNode = target.childNodes[0];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          inner = document.createElement("span");
          inner.className = "detail-hero-title-text";
          inner.textContent = textNode.nodeValue ?? "";
          target.replaceChild(inner, textNode);
          if (dot) target.appendChild(dot);
        }
      }
      if (inner) splitTarget = inner;
    }
    const chars = splitChars(splitTarget);
    if (chars.length > 0) {
      gsap.fromTo(
        chars,
        { opacity: 0, y: "0.4em" },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.025,
        },
      );
    }
  });

  /* 2. Hero group: stagger reveal of remaining items */
  document.querySelectorAll<HTMLElement>('[data-anim-group="hero"]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>(
      '[data-anim="back-link"], [data-anim="cat"], [data-anim="sub"], [data-anim="status"]',
    );
    if (items.length === 0) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.25,
      },
    );
  });

  /* 3. Meta-bar cells (both index and detail) */
  document.querySelectorAll<HTMLElement>('[data-anim-group="meta"]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-anim="meta-cell"]');
    if (items.length === 0) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.5,
      },
    );
  });

  /* 4. Tiles — ScrollTrigger reveal */
  const tiles = document.querySelectorAll<HTMLElement>('[data-anim="tile"]');
  if (tiles.length > 0) {
    const first = tiles[0];
    if (first) {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: first,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }
  }

  /* 5. Typewriter caret labels (already CSS, but reveal label) */
  document.querySelectorAll<HTMLElement>('[data-anim="typewriter"]').forEach((el) => {
    if (el.dataset.typed === "1") return;
    el.dataset.typed = "1";
    const fullText = el.dataset.text ?? el.textContent ?? "";
    el.dataset.text = fullText;
    el.textContent = "";
    const chars = [...fullText];
    let i = 0;
    const tick = () => {
      if (i > chars.length) return;
      el.textContent = chars.slice(0, i).join("");
      i++;
      if (i <= chars.length) setTimeout(tick, 24);
    };
    tick();
  });

  /* 6. Detail sections (why/how/stack/cta) — ScrollTrigger */
  ["why", "how", "stack", "cta"].forEach((g) => {
    const group = document.querySelector<HTMLElement>(`[data-anim-group="${g}"]`);
    if (!group) return;
    gsap.fromTo(
      group,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: group,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    );
  });
}

/* ── Tracking ───────────────────────────────────────────────────
   Wraps Umami in a try/catch so tracking failures never break the page.
   Three event-sources:
     - click events bound via [data-track] attributes
     - page-view fired once per navigation, derived from <main data-page-type>
     - section.view + scroll.depth via IntersectionObserver on detail pages */
function trackSafe(event: string, data?: Record<string, string | number>): void {
  try {
    const umami = (window as unknown as { umami?: { track?: (e: string, d?: unknown) => void } })
      .umami;
    umami?.track?.(event, data);
  } catch {
    // never break the app on a tracking failure
  }
}

/* Click-based tracking via [data-track] attributes. Idempotent: rebinds
   across view-transitions safely. */
function bindClickTracking(): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-track]");
  for (const el of elements) {
    if (el.dataset.trackBound === "1") continue;
    el.dataset.trackBound = "1";
    el.addEventListener("click", () => {
      const event = el.dataset.track;
      if (!event) return;
      const data: Record<string, string> = {};
      for (const key of Object.keys(el.dataset)) {
        if (key.startsWith("trackProp") && key !== "trackBound") {
          const prop = key.slice("trackProp".length).toLowerCase();
          const value = el.dataset[key];
          if (value !== undefined) data[prop] = value;
        }
      }
      trackSafe(event, data);
    });
  }
}

/* Fire one synthetic page-view per navigation. Derives event name and
   payload from <main data-page-type> + <main data-lab-slug>. */
function trackPageView(): void {
  const main = document.querySelector<HTMLElement>("main[data-page-type]");
  if (!main) return;
  const pageType = main.dataset.pageType;
  const slug = main.dataset.labSlug;
  if (pageType === "home") trackSafe("home.viewed");
  else if (pageType === "lab" && slug) trackSafe("lab.detail.viewed", { slug });
  else if (pageType === "404") trackSafe("lab.404", { path: location.pathname });
}

/* IntersectionObserver-based section-view + scroll-depth tracking.
   Only active on detail pages (pageType=lab). Each section/milestone
   fires at most once per page-load. */
let depthObserver: IntersectionObserver | null = null;
let sectionObserver: IntersectionObserver | null = null;

function bindDetailScrollTracking(): void {
  // Tear down any observer from a previous navigation.
  if (depthObserver) {
    depthObserver.disconnect();
    depthObserver = null;
  }
  if (sectionObserver) {
    sectionObserver.disconnect();
    sectionObserver = null;
  }

  const main = document.querySelector<HTMLElement>("main[data-page-type='lab']");
  if (!main) return;
  const slug = main.dataset.labSlug;
  if (!slug) return;

  // Section-view events for why/how/stack/cta
  const sectionTargets = main.querySelectorAll<HTMLElement>("[data-anim-group]");
  if (sectionTargets.length > 0) {
    const seen = new Set<string>();
    sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const section = (e.target as HTMLElement).dataset.animGroup;
          if (!section || seen.has(section)) continue;
          if (section === "hero" || section === "meta") continue; // visible above the fold
          seen.add(section);
          trackSafe("lab.detail.section.view", { slug, section });
        }
      },
      { threshold: 0.55 },
    );
    for (const t of sectionTargets) sectionObserver.observe(t);
  }

  // Scroll-depth milestones — sentinels positioned at 25/50/75/100% of body.
  // We use sentinels instead of scroll-listeners to keep it cheap and SSR-safe.
  const milestones: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];
  const seenDepth = new Set<number>();

  // Remove any leftover sentinels from a previous nav.
  for (const el of document.querySelectorAll(".depth-sentinel")) {
    el.remove();
  }

  // Use document height; if too short, skip depth tracking.
  const docHeight = document.documentElement.scrollHeight;
  if (docHeight < window.innerHeight * 1.4) return;

  depthObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const depth = Number((e.target as HTMLElement).dataset.depth);
        if (!seenDepth.has(depth)) {
          seenDepth.add(depth);
          trackSafe("lab.detail.scroll.depth", { slug, depth });
        }
      }
    },
    { threshold: 0 },
  );

  for (const pct of milestones) {
    const sentinel = document.createElement("div");
    sentinel.className = "depth-sentinel";
    sentinel.dataset.depth = String(pct);
    Object.assign(sentinel.style, {
      position: "absolute",
      left: "0",
      top: `${pct}%`,
      width: "1px",
      height: "1px",
      pointerEvents: "none",
    });
    document.body.appendChild(sentinel);
    depthObserver.observe(sentinel);
  }
}

function initAll(): void {
  initAnimations();
  bindClickTracking();
  trackPageView();
  bindDetailScrollTracking();
}

/* Run on initial load + after every view-transition. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
document.addEventListener("astro:page-load", initAll);
