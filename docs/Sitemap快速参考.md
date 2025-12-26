# Sitemap 快速参考指南

## 🚀 快速开始

### 查看Sitemap
```bash
# 在线访问
https://vietbeauty.top/sitemap.xml

# 命令行查看
curl https://vietbeauty.top/sitemap.xml | head -50

# 统计URL数量
curl -s https://vietbeauty.top/sitemap.xml | grep -c "<loc>"
```

### 重新生成Sitemap
```bash
# 重启前端服务即可（sitemap是动态生成的）
systemctl restart vietnam-medical.service

# 或重新部署
cd /root/越南医疗整形项目
./deploy.sh
```

---

## 📊 当前状态

| 指标 | 数值 | 状态 |
|------|------|------|
| URL总数 | 4,479 | ✅ |
| 文件大小 | 732 KB | ✅ |
| 高优先级比例 | 0.1% | ✅ 优秀 |
| 今天更新比例 | 3.6% | ✅ 合理 |
| 最近30天更新 | 97.1% | ✅ 活跃 |

---

## 🎯 Google Search Console 操作

### 1. 提交Sitemap
```
1. 访问: https://search.google.com/search-console
2. 选择属性: vietbeauty.top
3. 左侧菜单 > 站点地图
4. 输入: sitemap.xml
5. 点击"提交"
```

### 2. 检查Sitemap状态
```
GSC > 站点地图 > 查看已提交的站点地图
- 状态应为"成功"
- 已发现的URL数量应接近4,479
- 如有错误，查看详细信息
```

### 3. 请求编入索引
```
1. GSC > URL检查工具
2. 输入要索引的URL
3. 点击"请求编入索引"
4. 每天限制约10个URL
```

---

## 🔍 常见问题排查

### Sitemap无法访问
```bash
# 检查服务状态
systemctl status vietnam-medical.service

# 查看日志
journalctl -u vietnam-medical.service -f

# 测试访问
curl -I https://vietbeauty.top/sitemap.xml
```

### URL数量不对
```bash
# 检查数据库
cd /root/越南医疗整形项目/backend
sqlite3 database.sqlite "SELECT COUNT(*) FROM knowledge WHERE status='published';"
sqlite3 database.sqlite "SELECT COUNT(*) FROM user_shares WHERE status='published';"
sqlite3 database.sqlite "SELECT COUNT(*) FROM hospitals WHERE status='active';"
```

### Google未抓取
1. 检查robots.txt: `https://vietbeauty.top/robots.txt`
2. 确认GSC中已提交sitemap
3. 查看GSC覆盖率报告
4. 检查是否有抓取错误
5. 等待1-3天（Google需要时间）

---

## 📈 监控指标

### 每周检查
- [ ] GSC中的已索引URL数量
- [ ] 抓取频率变化
- [ ] 抓取错误数量
- [ ] 搜索展示次数

### 每月检查
- [ ] 搜索排名变化
- [ ] 自然流量增长
- [ ] 新内容索引速度
- [ ] 页面质量评分

---

## 🛠️ 维护命令

```bash
# 查看sitemap统计
curl -s https://vietbeauty.top/sitemap.xml | grep -c "<loc>"

# 测试sitemap有效性
python3 << 'EOF'
import urllib.request
import xml.etree.ElementTree as ET
response = urllib.request.urlopen("https://vietbeauty.top/sitemap.xml")
root = ET.fromstring(response.read())
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = root.findall('sm:url', ns)
print(f"✅ Sitemap有效，包含 {len(urls)} 个URL")
EOF

# 检查优先级分布
curl -s https://vietbeauty.top/sitemap.xml | grep -o '<priority>[^<]*</priority>' | sort | uniq -c

# 检查更新频率分布
curl -s https://vietbeauty.top/sitemap.xml | grep -o '<changefreq>[^<]*</changefreq>' | sort | uniq -c
```

---

## 📝 优化历史

### 2025-11-16 - 重大优化
- ✅ 修复优先级分布（97.3% → 0.1%高优先级）
- ✅ 实现动态changefreq
- ✅ 使用真实lastmod日期
- ✅ 优化缓存时间（60分钟 → 30分钟）
- ✅ 创建sitemap索引文件

---

## 🔗 相关文档

- [完整优化报告](./SITEMAP优化报告.md)
- [部署指南](./生产环境部署指南.md)
- [开发文档](./开发文档.md)

---

**最后更新**: 2025-11-16  
**维护人**: AI Assistant  
**下次检查**: 2025-11-23

