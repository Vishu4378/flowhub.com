# ---- deps: install with the lockfile ----
FROM node:24-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@11.9.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: compile the standalone server ----
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.9.0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Rewrites (and NEXT_PUBLIC_*) are baked in at build time, so they are build args.
ARG API_PROXY_URL=http://api:3000
ARG NEXT_PUBLIC_SITE_URL=https://flowhub.com
ENV API_PROXY_URL=$API_PROXY_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- runtime: only the standalone output ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Pricing is regenerated at runtime (ISR) and fetches the API directly.
ARG API_PROXY_URL=http://api:3000
ENV API_PROXY_URL=$API_PROXY_URL
COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
