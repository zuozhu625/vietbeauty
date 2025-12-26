/**
 * 动态Sitemap生成工具 - 医疗整形项目专用
 *
 * 基于泰国汽车网站的成功经验，为越南医疗整形项目实现动态分页Sitemap系统
 *
 * 核心特性：
 * - 支持无限分页数据获取
 * - 智能错误恢复机制
 * - 请求频率控制防止API压力
 * - 标准XML格式生成
 * - TypeScript类型安全
 */

const SITE_URL = 'https://vietbeauty.top';
const API_BASE_URL = 'http://localhost:3001/api';

// 请求延迟配置（毫秒）
const REQUEST_DELAY = 100;
const MAX_RETRIES = 3;

// 类型定义
interface SitemapConfig {
  baseUrl: string;
  items: Array<{
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority?: string;
  }>;
  urlTemplate?: string;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

interface PaginationResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

interface StatsResponse {
  success: boolean;
  data: {
    knowledge: { total: number; sitemaps: number };
    sharing: { total: number; sitemaps: number };
    hospitals: { total: number; sitemaps: number };
  };
  summary: {
    totalItems: number;
    totalSitemaps: number;
  };
}

interface Item {
  id: number;
  updated_at?: string;
  created_at?: string;
  view_count?: number;
  title?: string;
  question?: string;
  name?: string;
}

/**
 * Sitemap生成工具类
 */
export class SitemapGenerator {
  private static readonly REQUEST_DELAY = REQUEST_DELAY;
  private static readonly MAX_RETRIES = MAX_RETRIES;

  /**
   * 生成XML格式的Sitemap
   */
  static generateSitemapXML(config: SitemapConfig): string {
    const { baseUrl, items } = config;

    const urlEntries = items.map(item => {
      const loc = item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`;

      return `  <url>
    <loc>${this.escapeXml(loc)}</loc>${item.lastmod ? `
    <lastmod>${item.lastmod}</lastmod>` : ''}${item.changefreq ? `
    <changefreq>${item.changefreq}</changefreq>` : ''}${item.priority ? `
    <priority>${item.priority}</priority>` : ''}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  /**
   * 生成Sitemap索引XML
   */
  static generateSitemapIndexXML(sitemaps: SitemapEntry[]): string {
    const sitemapEntries = sitemaps.map(sitemap => `  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
  }

  /**
   * 获取所有分页数据（自动处理分页）
   */
  static async fetchAllPaginatedData(endpoint: string, status: string = 'published'): Promise<Item[]> {
    const allItems: Item[] = [];
    let page = 1;
    let hasNextPage = true;
    let retryCount = 0;

    console.log(`[SitemapGenerator] 开始获取 ${endpoint} 数据...`);

    while (hasNextPage && retryCount < this.MAX_RETRIES) {
      try {
        const response = await fetch(`${API_BASE_URL}/sitemap-paginated/${endpoint}?page=${page}&limit=5000&status=${status}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: PaginationResponse = await response.json();

        if (!data.success) {
          throw new Error(`API返回错误: ${JSON.stringify(data)}`);
        }

        allItems.push(...data.data);
        hasNextPage = data.pagination.hasNextPage;
        page++;

        console.log(`[SitemapGenerator] ${endpoint} - 已获取 ${allItems.length}/${data.pagination.total} 条数据`);

        // 防止API压力
        if (hasNextPage) {
          await this.delay(this.REQUEST_DELAY);
        }

        // 重置重试计数
        retryCount = 0;

      } catch (error) {
        retryCount++;
        console.error(`[SitemapGenerator] ${endpoint} 第${page}页获取失败 (重试 ${retryCount}/${this.MAX_RETRIES}):`, error);

        if (retryCount >= this.MAX_RETRIES) {
          console.error(`[SitemapGenerator] ${endpoint} 获取失败，已达到最大重试次数`);
          break;
        }

        // 重试前等待更长时间
        await this.delay(this.REQUEST_DELAY * 2);
      }
    }

    console.log(`[SitemapGenerator] ${endpoint} 数据获取完成，共 ${allItems.length} 条`);
    return allItems;
  }

  /**
   * 获取统计信息
   */
  static async getSitemapStats(): Promise<StatsResponse> {
    try {
      console.log('[SitemapGenerator] 获取统计信息...');

      const response = await fetch(`${API_BASE_URL}/sitemap-paginated/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StatsResponse = await response.json();

      if (!data.success) {
        throw new Error(`统计API返回错误: ${JSON.stringify(data)}`);
      }

      console.log('[SitemapGenerator] 统计信息获取成功:', data.summary);
      return data;

    } catch (error) {
      console.error('[SitemapGenerator] 获取统计信息失败:', error);

      // 返回默认统计信息（降级方案）
      return {
        success: true,
        data: {
          knowledge: { total: 1000, sitemaps: 1 },
          sharing: { total: 1000, sitemaps: 1 },
          hospitals: { total: 100, sitemaps: 1 }
        },
        summary: {
          totalItems: 2100,
          totalSitemaps: 4
        }
      };
    }
  }

  /**
   * 生成URL模板
   */
  static generateUrlTemplate(basePath: string, item: Item): string {
    return `/${basePath}/${item.id}`;
  }

  /**
   * 格式化日期为ISO 8601
   */
  static formatDate(date: string | Date | undefined): string {
    if (!date) return '';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  /**
   * 根据内容年龄计算更新频率
   */
  static calculateChangefreq(lastModified: string | Date | undefined): 'daily' | 'weekly' | 'monthly' | 'yearly' {
    if (!lastModified) return 'monthly';

    try {
      const lastMod = typeof lastModified === 'string' ? new Date(lastModified) : lastModified;
      const now = new Date();
      const daysSinceUpdate = Math.floor((now.getTime() - lastMod.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceUpdate <= 7) return 'daily';
      if (daysSinceUpdate <= 30) return 'weekly';
      if (daysSinceUpdate <= 90) return 'monthly';
      return 'yearly';
    } catch (e) {
      return 'monthly';
    }
  }

  /**
   * 根据内容类型计算优先级
   */
  static calculatePriority(contentType: 'static' | 'knowledge' | 'sharing' | 'hospital', lastModified?: string | Date): string {
    const basePriority: Record<string, number> = {
      'static': 0.9,
      'knowledge': 0.6,
      'sharing': 0.6,
      'hospital': 0.5,
    };

    let priority = basePriority[contentType] || 0.5;

    // 根据内容新鲜度调整优先级
    if (lastModified) {
      try {
        const lastMod = typeof lastModified === 'string' ? new Date(lastModified) : lastModified;
        const now = new Date();
        const daysSinceUpdate = Math.floor((now.getTime() - lastMod.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceUpdate <= 3) {
          priority = Math.min(priority + 0.2, 0.9);
        } else if (daysSinceUpdate <= 14) {
          priority = Math.min(priority + 0.1, 0.8);
        } else if (daysSinceUpdate > 180) {
          priority = Math.max(priority - 0.1, 0.3);
        }
      } catch (e) {
        // 忽略错误
      }
    }

    return priority.toFixed(1);
  }

  /**
   * XML转义
   */
  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&#39;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 生成空Sitemap（错误恢复用）
 */
export function generateEmptySitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

/**
 * 生成空Sitemap索引（错误恢复用）
 */
export function generateEmptySitemapIndex(): string {
  const now = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
}
