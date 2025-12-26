import { defineMiddleware } from 'astro:middleware';

/**
 * URL规范化中间件 - 优化版
 * 目的：智能处理URL格式，减少不必要的重定向
 * 
 * 策略：
 * 1. 只对明显错误的URL进行重定向
 * 2. 减少Google爬虫遇到的重定向数量
 * 3. 保持SEO友好
 */
export const onRequest = defineMiddleware((context, next) => {
  const { url, redirect } = context;
  const { pathname, search, hash } = url;
  
  // 跳过静态资源和API
  if (pathname.startsWith('/api/') || 
      pathname.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|json|xml|txt)$/)) {
    return next();
  }
  
  let normalizedPath = pathname;
  let needsRedirect = false;
  
  // 规则1：只对明显的大写路径进行重定向（避免过度重定向）
  // 只处理完全大写或首字母大写的情况
  if (pathname.match(/^\/[A-Z][A-Z]+/) || pathname.match(/^\/[A-Z][a-z]+/)) {
    normalizedPath = normalizedPath.toLowerCase();
    needsRedirect = true;
  }
  
  // 规则2：只对明显多余的尾部斜杠进行重定向
  // 排除根路径，只处理明显的多余斜杠
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/') && 
      !normalizedPath.match(/\/(knowledge|sharing)\/\d+\/$/)) { // 保护动态路由
    normalizedPath = normalizedPath.slice(0, -1);
    needsRedirect = true;
  }
  
  // 如果需要重定向，使用301永久重定向
  if (needsRedirect) {
    const normalizedUrl = `${normalizedPath}${search}${hash}`;
    console.log(`[URL Normalize] 301 Redirect: ${pathname} -> ${normalizedPath}`);
    return redirect(normalizedUrl, 301);
  }
  
  return next();
});

