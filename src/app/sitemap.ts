import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** Public, indexable pages only. Add new marketing routes here. */
const PUBLIC_PATHS = ['/', '/pricing', '/login', '/register'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${site.url}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.5,
  }));
}
