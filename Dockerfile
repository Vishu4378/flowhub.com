# Optional: self-host the static site with nginx (Cloudflare Pages is the
# default deploy). NEXT_PUBLIC_* values are baked in at build time.
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.9.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_API_URL=https://api.flowhub.com
ARG NEXT_PUBLIC_SITE_URL=https://flowhub.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
# /login → login.html, unknown paths → the generated 404 page.
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri $uri.html $uri/ =404; }\n  error_page 404 /404.html;\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
