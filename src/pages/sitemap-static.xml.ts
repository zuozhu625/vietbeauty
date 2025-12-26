import type { APIRoute } from 'astro';

/**
 * 静态页面Sitemap生成器
 *
 * 包含网站的所有静态页面和主要导航页面
 * 这些页面不需要从数据库动态生成
 */

const SITE_URL = 'https://vietbeauty.top';

export const GET: APIRoute = async () => {
  console.log('[Sitemap] 开始生成静态页面Sitemap...');

  // 静态页面列表 - 根据实际网站结构定义
  const staticPages = [
    // 核心页面
    { loc: '/', changefreq: 'daily' as const, priority: '1.0' },
    { loc: '/services', changefreq: 'weekly' as const, priority: '0.9' },
    { loc: '/reviews', changefreq: 'daily' as const, priority: '0.8' },
    { loc: '/knowledge', changefreq: 'daily' as const, priority: '0.8' },
    { loc: '/sharing', changefreq: 'daily' as const, priority: '0.8' },

    // 辅助页面
    { loc: '/contact', changefreq: 'monthly' as const, priority: '0.6' },

    // 列表页面
    { loc: '/knowledge/', changefreq: 'daily' as const, priority: '0.7' },
    { loc: '/sharing/', changefreq: 'daily' as const, priority: '0.7' },
    { loc: '/reviews/', changefreq: 'daily' as const, priority: '0.7' },
  ];

  // 生成XML
  const now = new Date().toISOString().split('T')[0];
  const urlEntries = staticPages.map(page => {
    return `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  console.log(`[Sitemap] 静态页面Sitemap生成完成，共 ${staticPages.length} 个URL`);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 1小时缓存
      'Last-Modified': new Date().toUTCString(),
      'X-Robots-Tag': 'noindex' // sitemap本身不需要被索引
    },
  });
};
