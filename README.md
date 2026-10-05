# FlowHub web

Website and app for FlowHub, backed by [flowhub-services](https://github.com/Vishu4378/flowhub-services).

Next.js 16 (App Router) · React 19 · TanStack Query · Tailwind CSS v4

## Getting started

Requires Node 22+ and pnpm.

```bash
cp .env.example .env.local
pnpm install
pnpm dev -p 3001        # http://localhost:3001
```

The site is a **static export**: there is no Next server. The browser calls
the API directly at `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`),
so start flowhub-services first and make sure its `CORS_ORIGIN` includes this
site's origin (`http://localhost:3001` in development).

```bash
pnpm build        # writes the static site to out/
pnpm test         # Vitest + Testing Library
pnpm lint
pnpm typecheck
```

### Deploying to Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the GitHub repo.
2. Build command `pnpm build`, output directory `out`.
3. Environment variables: `NEXT_PUBLIC_API_URL=https://api.flowhub.com`,
   `NEXT_PUBLIC_SITE_URL=https://flowhub.com`, and `NODE_VERSION=24`.
4. Add the custom domain, and add `https://flowhub.com` to the API's `CORS_ORIGIN`.

Every push to `main` deploys; every PR gets a preview URL. `NEXT_PUBLIC_*`
values are baked in at build time, so changing them needs a redeploy.

### URLs carry ids in the query string

A static export has one HTML file per page, so ids can't be path segments
(`/app/orgs/abc123` would 404 before any JavaScript runs). Pages read them from
the query string instead: `/app/projects?org=…`, `/app/project?org=…&id=…`,
`/invite?token=…`. All of them are built by `src/lib/routes.ts`; the API builds
the same links for emails in `src/common/utils/app-url.ts`.

## How it is split

| Area | Routes | Rendering | Indexed |
|---|---|---|---|
| Marketing | `/`, `/pricing` | Static HTML; pricing has plans baked in at build time, refreshed in the browser | Yes |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` | Static shell, client form | Login/register only |
| Email links | `/verify-email`, `/invite` | Client | No |
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
│   ├── (public)/               # /verify-email, /invite: work signed in or out
│   └── app/                    # dashboard, wrapped in RequireAuth
│       ├── (org)/              # /app/<page>?org=…: sidebar shell + overview, projects, members, billing, settings
│       └── admin/              # super admin
├── views/                      # client page components rendered by the routes
├── components/                 # UI primitives, dashboard shell, notifications, charts, plan card
├── auth/                       # session context and route guards
└── lib/                        # API client, React Query hooks, types
```

The access token is kept in `localStorage`; any 401 signs the user out, and
signing out in one tab signs out all of them.
