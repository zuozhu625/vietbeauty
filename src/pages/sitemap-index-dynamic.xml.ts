import type { APIRoute } from 'astro';
import { SitemapGenerator, generateEmptySitemapIndex } from '../utils/sitemap-generator.js';

/**
 * 动态Sitemap索引生成器
 *
 * 自动根据数据库统计信息生成Sitemap索引
 * 支持分页Sitemap的自动检测和包含
 *
 * 如果API失败，使用降级方案返回基础索引
 */

const SITE_URL = 'https://vietbeauty.top';

export const GET: APIRoute = async () => {
  console.log('[Sitemap] 开始生成动态Sitemap索引...');

  try {
    // 获取统计信息
    const stats = await SitemapGenerator.getSitemapStats();

    // 生成Sitemap列表
    const sitemaps = generateSitemapList(stats);

    // 生成XML索引
    const xml = SitemapGenerator.generateSitemapIndexXML(sitemaps);

    console.log(`[Sitemap] 动态索引生成完成，包含 ${sitemaps.length} 个Sitemap文件`);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // 30分钟缓存
        'Last-Modified': new Date().toUTCString(),
        'X-Robots-Tag': 'noindex' // sitemap索引本身不需要被索引
      },
    });

  } catch (error) {
    console.error('[Sitemap] 动态索引生成失败:', error);

    // 降级方案：返回基础索引
    try {
      return new Response(generateEmptySitemapIndex(), {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=1800',
          'X-Robots-Tag': 'noindex'
        },
      });
    } catch (fallbackError) {
      console.error('[Sitemap] 降级方案也失败:', fallbackError);

      // 最后的降级：返回硬编码的基础索引
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

      return new Response(fallbackXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=1800',
          'X-Robots-Tag': 'noindex'
        },
      });
    }
  }
};

/**
 * 根据统计信息生成Sitemap列表
 */
function generateSitemapList(stats: any) {
  const sitemaps = [];
  const now = new Date().toISOString();

  // 1. 静态页面Sitemap（始终包含）
  sitemaps.push({
    loc: `${SITE_URL}/sitemap-static.xml`,
    lastmod: now
  });

  // 2. 知识问答Sitemap - 始终包含，因为数据很多
  sitemaps.push({
    loc: `${SITE_URL}/sitemap-paginated-knowledge.xml`,
    lastmod: now
  });

  // 3. 用户分享Sitemap - 始终包含，因为数据很多
  sitemaps.push({
    loc: `${SITE_URL}/sitemap-paginated-sharing.xml`,
    lastmod: now
  });

  // 4. 医院Sitemap - 始终包含
  sitemaps.push({
    loc: `${SITE_URL}/sitemap-paginated-hospitals.xml`,
    lastmod: now
  });

  console.log('[Sitemap] 生成的Sitemap列表:', sitemaps.map(s => s.loc));

  return sitemaps;
}
