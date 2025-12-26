import type { APIRoute } from 'astro';
import { userShareAPI, knowledgeAPI, hospitalAPI } from '../utils/api.js';

/**
 * 动态Sitemap生成器 - SEO优化版
 * 
 * 关键防御性编程实践：
 * 1. 不假设API返回格式
 * 2. 检查数据是数组还是对象
 * 3. 提供降级方案
 * 4. 记录详细日志便于调试
 * 
 * SEO优化实践（修复Google抓取问题）：
 * 1. 合理的优先级分配（避免所有页面都是高优先级）
 * 2. changefreq与实际更新频率一致
 * 3. 使用真实的lastmod日期（从数据库获取）
 * 4. 根据内容新鲜度动态调整changefreq
 */

// 站点基础URL
const SITE_URL = 'https://vietbeauty.top';

// 安全提取数据数组（防御性编程）
function safeExtractArray(data: any, possibleKeys: string[] = ['data', 'items', 'results']): any[] {
  // 情况1：已经是数组
  if (Array.isArray(data)) {
    return data;
  }
  
  // 情况2：对象里包含数组
  if (data && typeof data === 'object') {
    // 尝试常见的键名
    for (const key of possibleKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    // 尝试找第一个是数组的属性
    for (const key in data) {
      if (Array.isArray(data[key])) {
        console.warn(`[Sitemap] Found array at unexpected key: ${key}`);
        return data[key];
      }
    }
  }
  
  // 情况3：都不是，返回空数组
  console.error('[Sitemap] Could not extract array from data:', typeof data);
  return [];
}

// 生成sitemap条目
function generateUrl(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
}

// 格式化日期为ISO 8601
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';  // 如果没有日期，返回空字符串，不使用当前日期
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    // 验证日期是否有效
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';  // 出错时返回空字符串，而不是当前日期
  }
}

// 根据内容年龄计算更新频率
function calculateChangefreq(lastModified: Date | string | undefined): string {
  if (!lastModified) return 'monthly';
  
  try {
    const lastMod = typeof lastModified === 'string' ? new Date(lastModified) : lastModified;
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastMod.getTime()) / (1000 * 60 * 60 * 24));
    
    // 根据实际更新时间动态设置频率
    if (daysSinceUpdate <= 7) return 'daily';      // 最近7天更新的内容
    if (daysSinceUpdate <= 30) return 'weekly';    // 最近30天更新的内容
    if (daysSinceUpdate <= 90) return 'monthly';   // 最近90天更新的内容
    return 'yearly';                                // 更老的内容
  } catch (e) {
    return 'monthly';
  }
}

// 根据内容类型和新鲜度计算优先级
function calculatePriority(contentType: 'static' | 'knowledge' | 'sharing' | 'hospital', lastModified: Date | string | undefined): string {
  // 基础优先级 - 降低基础值，避免过多高优先级
  const basePriority: Record<string, number> = {
    'static': 0.9,      // 静态页面
    'knowledge': 0.5,   // 知识问答（降低）
    'sharing': 0.5,     // 用户分享（降低）
    'hospital': 0.4,    // 医院页面（降低）
  };
  
  let priority = basePriority[contentType] || 0.4;
  
  // 根据内容新鲜度调整优先级
  if (lastModified) {
    try {
      const lastMod = typeof lastModified === 'string' ? new Date(lastModified) : lastModified;
      const now = new Date();
      const daysSinceUpdate = Math.floor((now.getTime() - lastMod.getTime()) / (1000 * 60 * 60 * 24));
      
      // 只有非常新的内容才提高优先级
      if (daysSinceUpdate <= 3) {
        priority = Math.min(priority + 0.2, 0.9);  // 最近3天
      } else if (daysSinceUpdate <= 14) {
        priority = Math.min(priority + 0.1, 0.8);  // 最近2周
      } else if (daysSinceUpdate > 180) {
        // 很久没更新的内容降低优先级
        priority = Math.max(priority - 0.1, 0.3);
      }
    } catch (e) {
      // 忽略错误
    }
  }
  
  return priority.toFixed(1);
}

export const GET: APIRoute = async () => {
  console.log('[Sitemap] Starting generation...');
  
  const urls: string[] = [];
  
  // 1. 静态页面（最高优先级）
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/services', changefreq: 'weekly', priority: '0.8' },
    { loc: '/reviews', changefreq: 'daily', priority: '0.8' },
    { loc: '/knowledge', changefreq: 'daily', priority: '0.8' },
    { loc: '/sharing', changefreq: 'daily', priority: '0.8' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  ];
  
  // 静态页面不使用lastmod，因为它们不是基于数据库内容
  staticPages.forEach(page => {
    urls.push(generateUrl(page.loc, '', page.changefreq, page.priority));
  });
  
  console.log(`[Sitemap] Added ${staticPages.length} static pages`);
  
  // 2. 知识问答页面（防御性编程）
  try {
    const knowledgeResponse = await knowledgeAPI.getList({ 
      limit: 5000, 
      status: 'published' 
    });
    
    // 使用防御性编程提取数组
    const knowledgeItems = safeExtractArray(knowledgeResponse, ['data', 'items', 'knowledgeItems']);
    
    console.log(`[Sitemap] Fetched knowledge items. Type: ${typeof knowledgeResponse}, Array: ${Array.isArray(knowledgeResponse)}, Count: ${knowledgeItems.length}`);
    
    knowledgeItems.forEach((item: any) => {
      if (item && item.id) {
        const lastModified = item.updated_at || item.updatedAt || item.created_at || item.createdAt;
        const lastmod = formatDate(lastModified);
        const changefreq = calculateChangefreq(lastModified);
        const priority = calculatePriority('knowledge', lastModified);
        urls.push(generateUrl(`/knowledge/${item.id}`, lastmod, changefreq, priority));
      }
    });
    
    console.log(`[Sitemap] Added ${knowledgeItems.length} knowledge pages`);
  } catch (error) {
    console.error('[Sitemap] Error fetching knowledge:', error);
    // 继续执行，不因为一个API失败而导致整个sitemap失败
  }
  
  // 3. 用户分享页面（防御性编程）
  try {
    const sharingResponse = await userShareAPI.getList({ 
      limit: 5000, 
      status: 'published' 
    });
    
    // 使用防御性编程提取数组
    const sharingItems = safeExtractArray(sharingResponse, ['data', 'items', 'shares', 'userShares']);
    
    console.log(`[Sitemap] Fetched sharing items. Type: ${typeof sharingResponse}, Array: ${Array.isArray(sharingResponse)}, Count: ${sharingItems.length}`);
    
    sharingItems.forEach((item: any) => {
      if (item && item.id) {
        const lastModified = item.updated_at || item.updatedAt || item.created_at || item.createdAt;
        const lastmod = formatDate(lastModified);
        const changefreq = calculateChangefreq(lastModified);
        const priority = calculatePriority('sharing', lastModified);
        urls.push(generateUrl(`/sharing/${item.id}`, lastmod, changefreq, priority));
      }
    });
    
    console.log(`[Sitemap] Added ${sharingItems.length} sharing pages`);
  } catch (error) {
    console.error('[Sitemap] Error fetching sharing:', error);
    // 继续执行
  }
  
  // 4. 医院页面（防御性编程）
  try {
    const hospitalResponse = await hospitalAPI.getList({ 
      limit: 5000, 
      status: 'active' 
    });
    
    // 使用防御性编程提取数组
    const hospitalItems = safeExtractArray(hospitalResponse, ['data', 'items', 'hospitals']);
    
    console.log(`[Sitemap] Fetched hospital items. Type: ${typeof hospitalResponse}, Array: ${Array.isArray(hospitalResponse)}, Count: ${hospitalItems.length}`);
    
    hospitalItems.forEach((item: any) => {
      if (item && item.id) {
        const lastModified = item.updated_at || item.updatedAt || item.created_at || item.createdAt;
        const lastmod = formatDate(lastModified);
        const changefreq = calculateChangefreq(lastModified);
        const priority = calculatePriority('hospital', lastModified);
        urls.push(generateUrl(`/reviews/${item.id}`, lastmod, changefreq, priority));
      }
    });
    
    console.log(`[Sitemap] Added ${hospitalItems.length} hospital pages`);
  } catch (error) {
    console.error('[Sitemap] Error fetching hospitals:', error);
    // 继续执行
  }
  
  // 生成完整的sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  
  console.log(`[Sitemap] Generation complete. Total URLs: ${urls.length}`);
  console.log(`[Sitemap] Size: ${(sitemap.length / 1024).toFixed(2)} KB`);
  
  // 获取当前时间作为Last-Modified
  const now = new Date();
  const lastModified = now.toUTCString();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800', // 缓存30分钟（降低缓存时间以便Google更快发现更新）
      'X-Robots-Tag': 'noindex', // sitemap本身不需要被索引
      'Last-Modified': lastModified, // 告诉Google sitemap的更新时间
    },
  });
};

