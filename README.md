# FlowHub web

React frontend for [flowhub-services](https://github.com/Vishu4378/flowhub-services).

Vite · React 19 · React Router · TanStack Query · Tailwind CSS v4

## Getting started

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

The dev server proxies `/api` to the API at `http://localhost:3000`. Start
flowhub-services first (`pnpm start:dev` in that repo), or point the proxy
elsewhere with `VITE_API_PROXY=http://host:port pnpm dev`.

For a production build served from a different origin than the API, set
`VITE_API_URL` (see `.env.example`) and add this app's origin to the API's
`CORS_ORIGIN`.

```bash
pnpm build      # type-checks, then outputs to dist/
pnpm preview
```

## Layout

```
src/
├── main.tsx            # providers: React Query, auth, router
├── router.tsx          # all routes
├── auth/               # session context and route guards
├── layouts/            # app shell (sidebar, org switcher) and auth pages shell
├── pages/              # one file per screen
├── components/         # UI primitives (Button, Field, Modal, …)
└── lib/
    ├── api.ts          # typed fetch client for every endpoint
    ├── queries.ts      # React Query hooks and cache keys
    └── types.ts        # API response shapes
```

Routes are scoped by organization: `/orgs/:orgId/projects`, `/members`,
`/settings`. The access token lives in `localStorage`; any 401 signs the user out.
