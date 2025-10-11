import type { APIRoute } from 'astro';
import { userShareAPI, knowledgeAPI } from '../utils/api.js';

/**
 * 动态Sitemap生成器
 * 
 * 关键防御性编程实践（避免坑1）：
 * 1. 不假设API返回格式
 * 2. 检查数据是数组还是对象
 * 3. 提供降级方案
 * 4. 记录详细日志便于调试
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
  if (!date) return new Date().toISOString().split('T')[0];
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export const GET: APIRoute = async () => {
  console.log('[Sitemap] Starting generation...');
  
  const urls: string[] = [];
  
  // 1. 静态页面（最高优先级）
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/services', changefreq: 'weekly', priority: '0.9' },
    { loc: '/reviews', changefreq: 'weekly', priority: '0.9' },
    { loc: '/knowledge', changefreq: 'daily', priority: '0.9' },
    { loc: '/sharing', changefreq: 'daily', priority: '0.9' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
  ];
  
  staticPages.forEach(page => {
    urls.push(generateUrl(page.loc, formatDate(new Date()), page.changefreq, page.priority));
  });
  
  console.log(`[Sitemap] Added ${staticPages.length} static pages`);
  
  // 2. 知识问答页面（防御性编程）
  try {
    const knowledgeResponse = await knowledgeAPI.getList({ 
      limit: 1000, 
      status: 'published' 
    });
    
    // 使用防御性编程提取数组
    const knowledgeItems = safeExtractArray(knowledgeResponse, ['data', 'items', 'knowledgeItems']);
    
    console.log(`[Sitemap] Fetched knowledge items. Type: ${typeof knowledgeResponse}, Array: ${Array.isArray(knowledgeResponse)}, Count: ${knowledgeItems.length}`);
    
    knowledgeItems.forEach((item: any) => {
      if (item && item.id) {
        const lastmod = formatDate(item.updated_at || item.updatedAt || item.created_at || item.createdAt);
        urls.push(generateUrl(`/knowledge/${item.id}`, lastmod, 'weekly', '0.8'));
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
      limit: 1000, 
      status: 'published' 
    });
    
    // 使用防御性编程提取数组
    const sharingItems = safeExtractArray(sharingResponse, ['data', 'items', 'shares', 'userShares']);
    
    console.log(`[Sitemap] Fetched sharing items. Type: ${typeof sharingResponse}, Array: ${Array.isArray(sharingResponse)}, Count: ${sharingItems.length}`);
    
    sharingItems.forEach((item: any) => {
      if (item && item.id) {
        const lastmod = formatDate(item.updated_at || item.updatedAt || item.created_at || item.createdAt);
        urls.push(generateUrl(`/sharing/${item.id}`, lastmod, 'weekly', '0.8'));
      }
    });
    
    console.log(`[Sitemap] Added ${sharingItems.length} sharing pages`);
  } catch (error) {
    console.error('[Sitemap] Error fetching sharing:', error);
    // 继续执行
  }
  
  // 生成完整的sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  
  console.log(`[Sitemap] Generation complete. Total URLs: ${urls.length}`);
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    },
  });
};

