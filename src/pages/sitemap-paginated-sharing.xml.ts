import type { APIRoute } from 'astro';
import { SitemapGenerator, generateEmptySitemap } from '../utils/sitemap-generator.js';

/**
 * 用户分享分页Sitemap生成器
 *
 * 动态生成用户分享页面的Sitemap，支持无限分页
 * 如果API失败，返回包含首页的空Sitemap
 */

export const GET: APIRoute = async () => {
  console.log('[Sitemap] 开始生成用户分享分页Sitemap...');

  try {
    // 获取所有用户分享数据（自动分页）
    const sharingItems = await SitemapGenerator.fetchAllPaginatedData('sharing', 'published');

    // 生成URL列表
    const items = sharingItems.map(item => ({
      url: SitemapGenerator.generateUrlTemplate('sharing', item),
      lastmod: SitemapGenerator.formatDate(item.updated_at || item.created_at),
      changefreq: SitemapGenerator.calculateChangefreq(item.updated_at || item.created_at),
      priority: SitemapGenerator.calculatePriority('sharing', item.updated_at || item.created_at)
    }));

    // 生成XML
    const xml = SitemapGenerator.generateSitemapXML({
      baseUrl: 'https://vietbeauty.top',
      items
    });

    console.log(`[Sitemap] 用户分享Sitemap生成完成，共 ${items.length} 个URL`);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1小时缓存
        'Last-Modified': new Date().toUTCString(),
        'X-Robots-Tag': 'noindex' // sitemap本身不需要被索引
      },
    });

  } catch (error) {
    console.error('[Sitemap] 用户分享Sitemap生成失败:', error);

    // 错误恢复：返回空Sitemap
    return new Response(generateEmptySitemap(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
        'X-Robots-Tag': 'noindex'
      },
    });
  }
};
