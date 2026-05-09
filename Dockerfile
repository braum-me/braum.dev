# =============================================================================
# braum.org · Multi-Stage Dockerfile
# =============================================================================
# Node 22 LTS Alpine · pnpm · Astro SSR (Node-Adapter)
# =============================================================================

ARG NODE_VERSION=22-alpine

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 3: Prod-Dependencies (flat node_modules)
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

RUN apk add --no-cache curl \
    && curl -sfL https://gobinaries.com/tj/node-prune | sh -s -- -b /usr/local/bin

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts \
      --config.node-linker=hoisted \
      --config.package-import-method=copy \
    && node-prune \
    && find node_modules -type d \( -name test -o -name tests -o -name __tests__ -o -name example -o -name examples -o -name docs \) -prune -exec rm -rf {} + \
    && find node_modules -type f \( -name "*.md" -o -name "*.markdown" -o -name "*.ts.map" -o -name "*.js.map" -o -name "*.d.ts.map" -o -name ".npmignore" -o -name ".eslintrc*" -o -name ".prettierrc*" -o -name "CHANGELOG*" -o -name "HISTORY*" -o -name "LICENSE*" -o -name "license*" -o -name "AUTHORS*" \) -delete

# -----------------------------------------------------------------------------
# Stage 4: Runtime
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN apk add --no-cache tini \
    && addgroup -g 1001 -S nodejs \
    && adduser -S astro -u 1001 -G nodejs

COPY --from=prod-deps --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

USER astro

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:4321/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./dist/server/entry.mjs"]
