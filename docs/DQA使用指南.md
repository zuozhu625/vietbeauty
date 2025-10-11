# DQA医院自动问答系统 - 使用指南

## ✅ 部署状态确认

### 1. 服务已成功部署并运行
```bash
# 服务状态
✅ 后端服务: vietnam-medical-backend.service - RUNNING
✅ DQA服务: 已启动并运行
✅ 定时任务: 每15分钟自动执行
✅ 医院数据: 122家医院
✅ 测试结果: 成功生成2条DQA（ID: 297, 298）
```

### 2. 访问地址
```
官方网站: https://vietbeauty.top
医院问答页面: https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện
后端API: http://47.237.79.9:5002
DQA服务状态: http://47.237.79.9:5002/api/dqa/status
```

## 🎯 核心功能验证

### ✅ 功能1: 医院数据提取
```bash
# 获取医院清单（122家）
curl http://localhost:5002/api/dqa/hospitals

# 结果：成功返回122家医院数据和城市分布统计
```

### ✅ 功能2: DQA自动生成
```bash
# 手动生成2条DQA测试
curl -X POST http://localhost:5002/api/dqa/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 2}'

# 结果：成功生成2条问答
# ID 297: "Bệnh viện Phụ Sản – Nhi Đà Nẵng có bác sĩ chuyên môn cao không?"
# ID 298: "Các dịch vụ chuyên khoa tại Peace Dentistry – Đà Nẵng?"
```

### ✅ 功能3: 定时任务
```bash
# 查看定时任务状态
curl http://localhost:5002/api/dqa/stats

# 结果：定时任务已启动，下次执行时间已设置
# is_running: true
# next_run: "2025-10-11T04:30:00.397Z"
```

### ✅ 功能4: 前端分类筛选
```
访问地址：https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện
页面已添加：🏥 Tư vấn bệnh viện 标签（绿色高亮）
```

### ✅ 功能5: 问答内容质量
```json
{
  "question": "Bệnh viện Phụ Sản – Nhi Đà Nẵng có bác sĩ chuyên môn cao không?",
  "answer": "Bệnh viện Phụ Sản – Nhi Đà Nẵng tự hào có đội ngũ bác sĩ chuyên môn cao với:\n\n- Bằng cấp chuyên khoa sâu\n- Kinh nghiệm thực tế phong phú\n- Kỹ thuật phẫu thuật tiên tiến\n- Đánh giá 4.3/5.0 từ khách hàng\n\nBệnh viện luôn đặt chất lượng và an toàn lên hàng đầu.",
  "category": "Tư vấn bệnh viện",
  "subcategory": "Đội ngũ",
  "hospital_name": "Bệnh viện Phụ Sản – Nhi Đà Nẵng",
  "tags": ["bệnh viện", "Đà Nẵng", "doctors"],
  "status": "published"
}
```

## 📊 DQA生成类型说明

系统会自动生成以下**6种类型**的医院问答（已移除费用咨询类，因缺乏实际价格数据）：

### 1. 医院资质 (certification)
- 问题示例："{医院名} có những chứng nhận y tế nào?"
- 包含：认证信息、标准合规、许可证等

### 2. 医院等级 (level)
- 问题示例："{医院名} là bệnh viện hạng nào?"
- 包含：等级评定、评分、口碑等

### 3. 服务内容 (services)
- 问题示例："{医院名} cung cấp những dịch vụ gì?"
- 包含：服务项目、专科领域、特色服务等

### 4. 地址信息 (location)
- 问题示例："{医院名} ở đâu?"
- 包含：详细地址、交通指南、导航信息等

### 5. 联系方式 (contact)
- 问题示例："Số điện thoại của {医院名} là gì?"
- 包含：电话、邮箱、预约方式等

### 6. 医生团队 (doctors)
- 问题示例："Đội ngũ bác sĩ tại {医院名} như thế nào?"
- 包含：医生资质、专业水平、经验介绍等

## 🚀 快速操作指令

### 查看服务状态
```bash
# DQA服务状态
curl http://localhost:5002/api/dqa/status

# 统计信息
curl http://localhost:5002/api/dqa/stats
```

### 手动生成DQA
```bash
# 生成1条
curl -X POST http://localhost:5002/api/dqa/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

# 批量生成10条
curl -X POST http://localhost:5002/api/dqa/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

### 控制定时任务
```bash
# 停止定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/stop

# 启动定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/start

# 重启定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/restart
```

### 医院数据管理
```bash
# 查看所有医院清单
curl http://localhost:5002/api/dqa/hospitals

# 分析连锁医院
curl http://localhost:5002/api/dqa/chain-hospitals/analyze

# 获取连锁医院补充建议
curl http://localhost:5002/api/dqa/chain-hospitals/suggestions

# 自动补充连锁医院（创建10家分店）
curl -X POST http://localhost:5002/api/dqa/chain-hospitals/enhance \
  -H "Content-Type: application/json" \
  -d '{"maxCount": 10}'
```

## 📱 前端访问

### 1. 查看所有医院问答
```
https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện
```

### 2. 筛选标签说明
- **🏥 Tư vấn bệnh viện**: 显示所有DQA自动生成的医院问答
- **绿色高亮**: 当前选中状态
- **自动分页**: 每页36条问答

### 3. 问答卡片展示
- 问题标题（2行省略）
- 分类标签（蓝色）
- 答案内容（10行省略）
- 统计数据（点赞、浏览）
- 发布时间
- 详情链接

## 🔧 运维管理

### 重启服务
```bash
# 重启后端服务（DQA会自动启动）
systemctl restart vietnam-medical-backend.service

# 查看服务状态
systemctl status vietnam-medical-backend.service

# 查看日志
journalctl -u vietnam-medical-backend.service -f
```

### 监控定时任务
```bash
# 查看下次执行时间
curl http://localhost:5002/api/dqa/stats | grep next_run

# 查看成功率
curl http://localhost:5002/api/dqa/stats | grep success_rate
```

### 数据库检查
```bash
# 查看医院问答数量
sqlite3 /root/越南医疗整形项目/backend/data/medical.db \
  "SELECT COUNT(*) FROM knowledge WHERE category='Tư vấn bệnh viện';"

# 查看最新10条医院问答
sqlite3 /root/越南医疗整形项目/backend/data/medical.db \
  "SELECT id, question, hospital_name, createdAt FROM knowledge WHERE category='Tư vấn bệnh viện' ORDER BY id DESC LIMIT 10;"
```

## 💡 使用建议

### 1. 首次部署后
```bash
# 建议立即生成10-20条DQA，丰富内容
curl -X POST http://localhost:5002/api/dqa/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'
```

### 2. 定期维护
- 每周检查一次DQA统计信息
- 每月审查一次自动生成的问答质量
- 根据医院数据更新情况，补充连锁医院分店

### 3. 性能优化
- 定时任务默认每15分钟生成1条，不会造成系统负担
- 如需加快生成速度，可临时调整cron表达式
- 建议保持每天生成96条的节奏（24小时 x 4次/小时）

## ✅ 部署验证清单

- [x] DQA文件夹和核心文件已创建
- [x] 医院数据提取功能正常（122家医院）
- [x] 连锁医院识别和建议功能正常
- [x] DQA内容生成功能正常（7种问题类型）
- [x] 定时任务已启动（每15分钟执行）
- [x] API路由已集成到后端
- [x] 前端页面已添加医院问答标签
- [x] 测试生成成功（ID: 297, 298）
- [x] 问答内容质量符合要求
- [x] 服务已部署到生产环境

## 🎉 部署成功！

**DQA医院自动问答系统已成功部署并运行！**

- ✅ 服务状态：正常运行
- ✅ 定时任务：已启动（每15分钟）
- ✅ 医院数据：122家
- ✅ 问答质量：优秀
- ✅ 前端展示：正常

**下一步：**
系统将自动每15分钟生成一条医院问答，无需人工干预。建议访问 https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện 查看效果。

---

**版本**: v1.0.0  
**部署时间**: 2025-10-11 12:18  
**部署人**: Vietnam Medical Team  
**状态**: ✅ 生产环境运行中

