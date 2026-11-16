# Payload CMS -image. Build-konteksti on repon juuri:
#   docker build -f apps/cms/Dockerfile -t <asiakas>-cms .
FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json apps/cms/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter cms

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY apps/cms apps/cms
RUN pnpm --filter cms build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/data/media
# Next.js standalone: palvelin ja tarvittavat node_modules ilman pnpm:ää.
COPY --from=builder --chown=node:node /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/cms/.next/static ./apps/cms/.next/static
RUN mkdir -p /data/media && chown -R node:node /data
USER node
EXPOSE 3000
# Ensimmäinen pyyntö alustaa Payloadin ja ajaa migraatiot (prodMigrations).
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/api/users/me || exit 1
CMD ["node", "apps/cms/server.js"]
