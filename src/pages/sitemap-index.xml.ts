import type { APIRoute } from 'astro';

/**
 * Sitemap索引文件
 * 
 * 当网站规模扩大时，可以将sitemap拆分为多个文件：
 * - sitemap-knowledge.xml (知识问答)
 * - sitemap-sharing.xml (用户分享)
 * - sitemap-hospitals.xml (医院评价)
 * - sitemap-static.xml (静态页面)
 * 
 * 目前使用单个sitemap，但保留此文件以便未来扩展
 */

const SITE_URL = 'https://vietbeauty.top';

export const GET: APIRoute = async () => {
  const now = new Date().toISOString().split('T')[0];
  
  // 目前只有一个sitemap，未来可以扩展
  const sitemaps = [
    {
      loc: `${SITE_URL}/sitemap.xml`,
      lastmod: now,
    },
  ];
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
      'X-Robots-Tag': 'noindex',
    },
  });
};

