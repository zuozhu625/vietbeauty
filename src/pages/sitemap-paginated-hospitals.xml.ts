import type { APIRoute } from 'astro';
import { SitemapGenerator, generateEmptySitemap } from '../utils/sitemap-generator.js';

/**
 * 医院分页Sitemap生成器
 *
 * 动态生成医院页面的Sitemap，支持无限分页
 * 如果API失败，返回包含首页的空Sitemap
 */

export const GET: APIRoute = async () => {
  console.log('[Sitemap] 开始生成医院分页Sitemap...');

  try {
    // 获取所有医院数据（自动分页）
    const hospitalItems = await SitemapGenerator.fetchAllPaginatedData('hospitals', 'active');

    // 生成URL列表
    const items = hospitalItems.map(item => ({
      url: SitemapGenerator.generateUrlTemplate('reviews', item), // 医院页面在reviews路径下
      lastmod: SitemapGenerator.formatDate(item.updated_at || item.created_at),
      changefreq: SitemapGenerator.calculateChangefreq(item.updated_at || item.created_at),
      priority: SitemapGenerator.calculatePriority('hospital', item.updated_at || item.created_at)
    }));

    // 生成XML
    const xml = SitemapGenerator.generateSitemapXML({
      baseUrl: 'https://vietbeauty.top',
      items
    });

    console.log(`[Sitemap] 医院Sitemap生成完成，共 ${items.length} 个URL`);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1小时缓存
        'Last-Modified': new Date().toUTCString(),
        'X-Robots-Tag': 'noindex' // sitemap本身不需要被索引
      },
    });

  } catch (error) {
    console.error('[Sitemap] 医院Sitemap生成失败:', error);

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
