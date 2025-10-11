import type { APIRoute } from 'astro';

const SITE_URL = 'https://vietbeauty.top';

export const GET: APIRoute = () => {
  const robotsTxt = `# Vietnam Medical Beauty SEO Configuration
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /

# Disallow admin and API endpoints
Disallow: /api/
Disallow: /admin/

# Allow all content pages
Allow: /services
Allow: /reviews
Allow: /knowledge
Allow: /sharing
Allow: /contact

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (be nice to servers)
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 缓存24小时
    },
  });
};

