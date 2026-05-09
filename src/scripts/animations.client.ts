import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  ScrollTrigger.getAll().forEach((t) => t.kill());

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

/* ── Generic tracking via [data-track] attributes ──────────────
   Any element with data-track="<event-name>" will fire that event
   on click. data-track-prop-foo="bar" attributes turn into payload.
   Idempotent: rebinds across view-transitions safely. */
function bindTracking(): void {
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
      try {
        const umami = (window as unknown as { umami?: { track?: (e: string, d?: unknown) => void } }).umami;
        umami?.track?.(event, data);
      } catch {
        // never break navigation on tracking failure
      }
    });
  }
}

function initAll(): void {
  initAnimations();
  bindTracking();
}

/* Run on initial load + after every view-transition. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
document.addEventListener("astro:page-load", initAll);
