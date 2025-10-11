#!/bin/bash

##############################################################################
# SEO 验证脚本
# 目的：部署后立即验证SEO配置，避免常见陷阱
# 
# 避免的坑：
# - 坑4：检查HTTP响应头是否有X-Robots-Tag: noindex
# - 坑6：不依赖GSC，直接验证源代码
# - 坑7：绕过缓存验证实际响应
##############################################################################

SITE_URL="https://vietbeauty.top"
TIMESTAMP=$(date +%s)

echo "🔍 开始SEO验证检查..."
echo "网站: $SITE_URL"
echo "时间: $(date)"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查1：HTTP响应头是否有noindex（坑4）
echo ""
echo "1️⃣ 检查HTTP响应头 (避免坑4: noindex问题)..."
echo "   添加时间戳绕过缓存: ?v=$TIMESTAMP"

HEADERS=$(curl -I -s "$SITE_URL/?v=$TIMESTAMP")
if echo "$HEADERS" | grep -i "x-robots-tag.*noindex" > /dev/null; then
    echo -e "   ${RED}❌ 发现X-Robots-Tag: noindex！页面不会被索引！${NC}"
    echo "   请检查环境变量: NODE_ENV=production"
    exit 1
else
    echo -e "   ${GREEN}✅ 没有发现noindex，页面可以被索引${NC}"
fi

# 检查2：robots.txt是否可访问
echo ""
echo "2️⃣ 检查robots.txt..."
ROBOTS_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" "$SITE_URL/robots.txt?v=$TIMESTAMP")
if [ "$ROBOTS_STATUS" == "200" ]; then
    echo -e "   ${GREEN}✅ robots.txt可访问 (HTTP $ROBOTS_STATUS)${NC}"
    echo "   内容预览:"
    curl -s "$SITE_URL/robots.txt?v=$TIMESTAMP" | head -10 | sed 's/^/   /'
else
    echo -e "   ${RED}❌ robots.txt无法访问 (HTTP $ROBOTS_STATUS)${NC}"
fi

# 检查3：sitemap.xml是否可访问
echo ""
echo "3️⃣ 检查sitemap.xml..."
SITEMAP_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" "$SITE_URL/sitemap.xml?v=$TIMESTAMP")
if [ "$SITEMAP_STATUS" == "200" ]; then
    echo -e "   ${GREEN}✅ sitemap.xml可访问 (HTTP $SITEMAP_STATUS)${NC}"
    
    # 统计URL数量
    URL_COUNT=$(curl -s "$SITE_URL/sitemap.xml?v=$TIMESTAMP" | grep -c "<loc>")
    echo "   📊 URL数量: $URL_COUNT"
    
    # 显示前5个URL
    echo "   前5个URL:"
    curl -s "$SITE_URL/sitemap.xml?v=$TIMESTAMP" | grep "<loc>" | head -5 | sed 's/^/   /'
else
    echo -e "   ${RED}❌ sitemap.xml无法访问 (HTTP $SITEMAP_STATUS)${NC}"
fi

# 检查4：首页是否有结构化数据
echo ""
echo "4️⃣ 检查结构化数据 (避免坑2)..."
STRUCTURED_DATA=$(curl -s "$SITE_URL/?v=$TIMESTAMP" | grep -c "application/ld+json")
if [ "$STRUCTURED_DATA" -gt 0 ]; then
    echo -e "   ${GREEN}✅ 找到 $STRUCTURED_DATA 个结构化数据块${NC}"
    echo "   ${YELLOW}⚠️  请手动在Google Rich Results Test验证:${NC}"
    echo "   https://search.google.com/test/rich-results"
else
    echo -e "   ${RED}❌ 没有找到结构化数据${NC}"
fi

# 检查5：首页是否有canonical标签
echo ""
echo "5️⃣ 检查canonical标签..."
CANONICAL=$(curl -s "$SITE_URL/?v=$TIMESTAMP" | grep -o '<link rel="canonical"[^>]*>' | head -1)
if [ ! -z "$CANONICAL" ]; then
    echo -e "   ${GREEN}✅ 找到canonical标签${NC}"
    echo "   $CANONICAL"
else
    echo -e "   ${RED}❌ 没有找到canonical标签${NC}"
fi

# 检查6：首页是否有Open Graph标签
echo ""
echo "6️⃣ 检查Open Graph标签..."
OG_COUNT=$(curl -s "$SITE_URL/?v=$TIMESTAMP" | grep -c 'property="og:')
if [ "$OG_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ 找到 $OG_COUNT 个OG标签${NC}"
else
    echo -e "   ${RED}❌ 没有找到OG标签${NC}"
fi

# 检查7：图片优化
echo ""
echo "7️⃣ 检查Hero图片优化..."
HERO_SIZE=$(curl -I -s "$SITE_URL/images/hero.webp" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
if [ ! -z "$HERO_SIZE" ]; then
    HERO_SIZE_KB=$((HERO_SIZE / 1024))
    echo -e "   ${GREEN}✅ hero.webp存在，大小: ${HERO_SIZE_KB}KB${NC}"
    if [ "$HERO_SIZE_KB" -lt 500 ]; then
        echo -e "   ${GREEN}✅ 图片大小优秀 (<500KB)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  图片较大，建议进一步优化${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  无法检测hero.webp大小${NC}"
fi

echo ""
echo "================================================"
echo "📋 验证完成摘要"
echo "================================================"
echo ""
echo "✅ 下一步操作:"
echo "1. 在Google Search Console提交sitemap: $SITE_URL/sitemap.xml"
echo "2. 用Google Rich Results Test测试结构化数据"
echo "3. 等待1-3天让GSC更新数据（避免坑6）"
echo "4. 使用无痕模式验证页面更新（避免坑7）"
echo ""
echo "⏰ 记住：GSC数据更新需要1-7天，不要焦虑！"

