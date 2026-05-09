# OG-Card Fonts

Static font files used **only at build time** by `scripts/build-og.ts` to render
the social-share PNGs in `public/og/`. They are not shipped to clients.

| File                          | Family         | License        | Source |
| ----------------------------- | -------------- | -------------- | ------ |
| `Inter-Variable.ttf`          | Inter          | SIL OFL 1.1    | https://github.com/rsms/inter |
| `JetBrainsMono-Variable.ttf`  | JetBrains Mono | SIL OFL 1.1    | https://github.com/JetBrains/JetBrainsMono |
| `Geist-Regular.ttf`           | Geist          | SIL OFL 1.1    | https://github.com/vercel/geist-font |

All three fonts are distributed under the SIL Open Font License 1.1, which
permits redistribution including embedding in projects. Full license text:
https://openfontlicense.org

If a card needs additional weights or italics, drop the matching TTF next to
these files — `build-og.ts` registers the entire directory automatically.
