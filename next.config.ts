import type { NextConfig } from 'next';

// Where /api requests are forwarded. The browser only ever talks to this app,
// so auth and CORS stay same-origin. Rewrites are compiled into the build, so
// API_PROXY_URL must be set when running `next build`, not just at start.
const apiUrl = process.env.API_PROXY_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: 'standalone',
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
