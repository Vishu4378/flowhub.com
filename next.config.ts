import type { NextConfig } from 'next';

/**
 * A fully static site (HTML, CSS and JS in `out/`) for Cloudflare Pages.
 * There is no Next server: data comes from the API, called from the browser
 * at NEXT_PUBLIC_API_URL; ids live in query strings (see src/lib/routes.ts).
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
