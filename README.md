# FlowHub web

Website and app for FlowHub, backed by [flowhub-services](https://github.com/Vishu4378/flowhub-services).

Next.js 16 (App Router) · React 19 · TanStack Query · Tailwind CSS v4

## Getting started

Requires Node 22+ and pnpm.

```bash
cp .env.example .env.local
pnpm install
pnpm dev        # http://localhost:3000 by default; use -p 3001 if the API holds 3000
```

Next forwards `/api/*` to `API_PROXY_URL` (default `http://localhost:3000`), so
the browser only ever talks to this app. Start flowhub-services first, on a
different port from this app, for example `PORT=3100 pnpm start:dev` there and
`API_PROXY_URL=http://localhost:3100 pnpm dev -p 3001` here.

> **`API_PROXY_URL` is read at build time.** Next compiles rewrites into the
> build output, so set it before `pnpm build`; changing it only at `pnpm start`
> has no effect.

```bash
pnpm build && pnpm start
pnpm test         # Vitest + Testing Library
pnpm lint
pnpm typecheck
```

### Docker

The image uses Next's standalone output. Because rewrites are compiled in,
pass the API address as a build arg:

```bash
docker build --build-arg API_PROXY_URL=http://api:3000 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://flowhub.com -t flowhub-web .
docker run -p 3000:3000 flowhub-web
```

## How it is split

| Area | Routes | Rendering | Indexed |
|---|---|---|---|
| Marketing | `/`, `/pricing` | Static HTML; pricing re-fetches plans every 5 min (ISR) | Yes |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` | Static shell, client form | Login/register only |
| Email links | `/verify-email`, `/invite/[token]` | Client | No |
| Dashboard | `/app/**` | Client-rendered behind login | No (`noindex`, disallowed in robots.txt) |

`sitemap.xml` and `robots.txt` are generated from `src/app/sitemap.ts` and
`src/app/robots.ts`. Add new public pages under `src/app/(marketing)/` and list
them in the sitemap. Set `NEXT_PUBLIC_SITE_URL` so canonical and Open Graph
URLs point at the real domain.

## Layout

```
src/
├── app/
│   ├── layout.tsx              # <html>, font, site-wide metadata, providers
│   ├── (marketing)/            # public pages: header, footer, landing
│   ├── (auth)/                 # /login, /register (signed-in users are sent to /app)
│   ├── (public)/               # /verify-email, /invite/[token]: work signed in or out
│   └── app/                    # dashboard, wrapped in RequireAuth
│       └── orgs/[orgId]/       # sidebar shell + overview, projects, members, billing, settings
├── views/                      # client page components rendered by the routes
├── components/                 # UI primitives, dashboard shell, notifications, charts, plan card
├── auth/                       # session context and route guards
└── lib/                        # API client, React Query hooks, types
```

The access token is kept in `localStorage`; any 401 signs the user out, and
signing out in one tab signs out all of them.
