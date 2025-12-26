#!/bin/bash

# 越南医疗整形项目 - SEO检查脚本
# 快速验证SEO配置是否正确

# 清除代理环境变量
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY

SITE_URL="https://vietbeauty.top"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 越南医疗整形项目 - SEO检查"
echo "================================"
echo ""

# 测试函数
test_url() {
    local url=$1
    local description=$2
    local expected_code=${3:-200}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅${NC} $description (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌${NC} $description (HTTP $response, 预期 $expected_code)"
        return 1
    fi
}

# 测试响应时间
test_response_time() {
    local url=$1
    local description=$2
    local max_time=${3:-1.0}
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null)
    response_ms=$(echo "$response_time * 1000" | bc)
    max_ms=$(echo "$max_time * 1000" | bc)
    
    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        echo -e "${GREEN}✅${NC} $description (${response_ms}ms)"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $description (${response_ms}ms, 目标 <${max_ms}ms)"
        return 1
    fi
}

# 1. 检查关键页面
echo "📄 关键页面检查"
echo "----------------"
test_url "$SITE_URL/" "首页可访问"
test_url "$SITE_URL/services" "服务页面可访问"
test_url "$SITE_URL/reviews" "评价页面可访问"
test_url "$SITE_URL/knowledge" "知识页面可访问"
test_url "$SITE_URL/sharing" "分享页面可访问"
echo ""

# 2. 检查SEO文件
echo "🤖 SEO文件检查"
echo "----------------"
test_url "$SITE_URL/robots.txt" "robots.txt (HTTPS)"
test_url "http://vietbeauty.top/robots.txt" "robots.txt (HTTP重定向)" 301
test_url "$SITE_URL/sitemap.xml" "sitemap.xml"
echo ""

# 3. 检查robots.txt内容
echo "📋 robots.txt内容检查"
echo "--------------------"
robots_content=$(curl -s "$SITE_URL/robots.txt")
if echo "$robots_content" | grep -q "User-agent: \*"; then
    echo -e "${GREEN}✅${NC} 包含 User-agent"
else
    echo -e "${RED}❌${NC} 缺少 User-agent"
fi

if echo "$robots_content" | grep -q "Sitemap:"; then
    echo -e "${GREEN}✅${NC} 包含 Sitemap"
else
    echo -e "${RED}❌${NC} 缺少 Sitemap"
fi

if echo "$robots_content" | grep -q "Allow:"; then
    echo -e "${GREEN}✅${NC} 包含 Allow 规则"
else
    echo -e "${RED}❌${NC} 缺少 Allow 规则"
fi
echo ""

# 4. 检查sitemap.xml内容
echo "🗺️  sitemap.xml内容检查"
echo "----------------------"
sitemap_content=$(curl -s "$SITE_URL/sitemap.xml")
url_count=$(echo "$sitemap_content" | grep -c "<loc>")

if [ "$url_count" -gt 0 ]; then
    echo -e "${GREEN}✅${NC} Sitemap包含 $url_count 个URL"
else
    echo -e "${RED}❌${NC} Sitemap为空或格式错误"
fi

if echo "$sitemap_content" | grep -q "<?xml"; then
    echo -e "${GREEN}✅${NC} XML格式正确"
else
    echo -e "${RED}❌${NC} XML格式错误"
fi
echo ""

# 5. 检查响应时间
echo "⚡ 性能检查"
echo "----------"
test_response_time "$SITE_URL/" "首页响应时间" 0.5
test_response_time "$SITE_URL/robots.txt" "robots.txt响应时间" 0.3
test_response_time "$SITE_URL/sitemap.xml" "sitemap.xml响应时间" 0.5
echo ""

# 6. 检查HTTP头
echo "📡 HTTP响应头检查"
echo "----------------"
headers=$(curl -s -I "$SITE_URL/")

if echo "$headers" | grep -i "Server:" | grep -q "nginx"; then
    echo -e "${GREEN}✅${NC} 服务器：Nginx"
fi

if ! echo "$headers" | grep -qi "x-robots-tag.*noindex"; then
    echo -e "${GREEN}✅${NC} 无noindex标记（允许索引）"
else
    echo -e "${RED}❌${NC} 发现noindex标记（禁止索引）"
fi

if echo "$headers" | grep -qi "content-type.*text/html"; then
    echo -e "${GREEN}✅${NC} Content-Type正确"
fi
echo ""

# 7. 检查服务状态
echo "🔧 服务状态检查"
echo "--------------"
if systemctl is-active --quiet vietnam-medical.service; then
    echo -e "${GREEN}✅${NC} 前端服务运行中"
else
    echo -e "${RED}❌${NC} 前端服务未运行"
fi

if systemctl is-active --quiet vietnam-medical-backend.service; then
    echo -e "${GREEN}✅${NC} 后端服务运行中"
else
    echo -e "${RED}❌${NC} 后端服务未运行"
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅${NC} Nginx服务运行中"
else
    echo -e "${RED}❌${NC} Nginx服务未运行"
fi
echo ""

# 8. 总结
echo "================================"
echo "✨ SEO检查完成！"
echo ""
echo "📌 下一步操作："
echo "1. 在Google Search Console提交sitemap"
echo "2. 使用Google Rich Results Test测试结构化数据"
echo "3. 监控GSC中的索引状态（1-7天后生效）"
echo ""
echo "🔗 有用的链接："
echo "  - Sitemap: $SITE_URL/sitemap.xml"
echo "  - Robots: $SITE_URL/robots.txt"
echo "  - GSC: https://search.google.com/search-console"
echo "  - Rich Results: https://search.google.com/test/rich-results"
echo ""
