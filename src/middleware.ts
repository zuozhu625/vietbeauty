import { defineMiddleware } from 'astro:middleware';

/**
 * URL规范化中间件
 * 目的：强制统一URL格式，避免重复内容问题
 * 规则：
 * 1. 所有路径转为小写
 * 2. 除根路径外，移除尾部斜杠
 * 3. 301重定向到规范URL
 */
export const onRequest = defineMiddleware((context, next) => {
  const { url, redirect } = context;
  const { pathname, search, hash } = url;
  
  // 跳过静态资源
  if (pathname.startsWith('/api/') || 
      pathname.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|json|xml)$/)) {
    return next();
  }
  
  let normalizedPath = pathname;
  let needsRedirect = false;
  
  // 规则1：转小写（除了已经是小写的）
  if (normalizedPath !== normalizedPath.toLowerCase()) {
    normalizedPath = normalizedPath.toLowerCase();
    needsRedirect = true;
  }
  
  // 规则2：移除尾部斜杠（除了根路径）
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
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

