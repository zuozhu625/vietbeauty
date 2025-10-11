# DQA医院自动问答系统

## 📋 系统概述

DQA（Dynamic Question & Answer）是一个针对医院信息的智能问答生成系统，能够自动从数据库中的120多家医院数据生成问答内容，并定时发布到问答板块。

## 🎯 核心功能

### 1. 医院数据提取
- 自动提取数据库中所有活跃医院信息
- 生成医院清单摘要
- 统计医院城市分布
- 识别连锁医院品牌

### 2. 连锁医院地址补充
- 自动识别连锁医院（如同品牌多家分店）
- 分析连锁医院在各城市的分布
- 为缺失城市生成分店建议
- 支持自动创建分店信息到数据库

### 3. DQA内容自动生成
根据医院信息自动生成以下类型的问答（**6种类型**）：
- **医院资质**: 认证、等级、许可证等
- **医院评级**: 等级、评分、口碑等
- **服务内容**: 提供的服务、专科领域等
- **地址信息**: 位置、地址、导航等
- **联系方式**: 电话、邮箱、预约方式等
- **医生团队**: 医生资质、专业水平等

**注意**: 已移除"费用咨询"类问题，因医院数据库中暂无价格相关字段。

### 4. 定时任务自动发布
- 每15分钟自动生成一条医院问答
- 自动发布到知识问答板块
- 统一标记为"Tư vấn bệnh viện"（医院问答）分类
- 自动添加相关标签（医院名、城市、问题类型等）

## 🏗️ 文件结构

```
backend/src/dqa/
├── README.md                      # 本文档（技术文档）
├── hospitalDataExtractor.js       # 医院数据提取器
├── chainHospitalEnhancer.js       # 连锁医院地址补充器
├── dqaGenerator.js                # DQA问答内容生成器
├── dqaScheduler.js                # 定时任务调度器
├── dqaService.js                  # DQA服务主控制器
├── dqaRoutes.js                   # API路由定义
└── 部署完成报告.md                # 部署报告

docs/DQA使用指南.md               # DQA使用指南（已移至docs目录）
```

## 🚀 快速开始

### 自动启动（推荐）
DQA服务会在后端服务启动时自动初始化，无需手动操作。

```bash
# 重启后端服务即可自动启动DQA
systemctl restart vietnam-medical-backend.service
```

### 手动控制
```bash
# 查看DQA服务状态
curl http://localhost:5002/api/dqa/status

# 手动生成1条DQA
curl -X POST http://localhost:5002/api/dqa/generate -H "Content-Type: application/json" -d '{"count": 1}'

# 批量生成10条DQA
curl -X POST http://localhost:5002/api/dqa/generate -H "Content-Type: application/json" -d '{"count": 10}'

# 停止定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/stop

# 启动定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/start

# 重启定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/restart
```

## 📡 API接口

### 1. 获取医院清单
```bash
GET /api/dqa/hospitals
```
返回所有医院的摘要信息和城市分布统计。

### 2. 分析连锁医院
```bash
GET /api/dqa/chain-hospitals/analyze
```
分析连锁医院品牌及其分店分布情况。

### 3. 获取连锁医院补充建议
```bash
GET /api/dqa/chain-hospitals/suggestions
```
获取连锁医院缺失城市的分店建议。

### 4. 自动补充连锁医院
```bash
POST /api/dqa/chain-hospitals/enhance
Content-Type: application/json

{
  "maxCount": 10  // 最多创建10家分店
}
```
自动创建连锁医院分店到数据库。

### 5. 生成DQA问答
```bash
POST /api/dqa/generate
Content-Type: application/json

{
  "count": 1  // 生成数量，1-100之间
}
```

### 6. 获取DQA统计信息
```bash
GET /api/dqa/stats
```
返回DQA服务的运行统计信息：
- 总生成数量
- 成功数量
- 失败数量
- 成功率
- 上次运行时间
- 下次运行时间

### 7. 控制定时任务
```bash
POST /api/dqa/scheduler/:action
# action可以是: start, stop, restart
```

### 8. 获取服务状态
```bash
GET /api/dqa/status
```

## 🎨 前端展示

### 知识问答页面筛选
在 `/knowledge` 页面中，用户可以通过以下方式查看医院问答：
1. 点击"🏥 Tư vấn bệnh viện"标签
2. 查看所有DQA自动生成的医院问答
3. 问答内容包含医院名称、分类、标签等信息

URL示例：
```
https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện
```

## 📊 问答内容示例

### 资质类问题
**问题**: JK Plastic Surgery Hospital có những chứng nhận y tế nào?
**答案**: JK Plastic Surgery Hospital đã được cấp các chứng nhận sau...

### 服务类问题
**问题**: Bangkok Hospital cung cấp những dịch vụ gì?
**答案**: Bangkok Hospital cung cấp các dịch vụ phẫu thuật thẩm mỹ...

### 地址类问题
**问题**: Địa chỉ cụ thể của Gangnam Beauty Clinic?
**答案**: Địa chỉ: số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM...

### 联系类问题
**问题**: Số điện thoại của Seoul Plastic Surgery là gì?
**答案**: Số điện thoại liên hệ Seoul Plastic Surgery: 028 1234567...

## ⚙️ 配置说明

### 定时任务配置
默认每15分钟执行一次，可在 `dqaScheduler.js` 中修改：
```javascript
// 当前配置: */15 * * * * (每15分钟)
// 修改为每小时: 0 * * * *
// 修改为每30分钟: */30 * * * *
```

### 问题模板配置
在 `dqaGenerator.js` 中的 `questionTemplates` 对象中可以：
- 添加新的问题类型
- 修改现有问题模板
- 调整问题生成逻辑

### 城市模板配置
在 `chainHospitalEnhancer.js` 中的 `cityTemplates` 对象中可以：
- 添加新的城市和地区
- 修改地址模板
- 调整电话号码生成规则

## 📈 运行监控

### 查看日志
```bash
# 查看后端服务日志（包含DQA日志）
journalctl -u vietnam-medical-backend.service -f

# 查看DQA生成记录
grep "DQA" /root/越南医疗整形项目/backend/logs/backend.log
```

### 统计信息
```bash
# 获取运行统计
curl http://localhost:5002/api/dqa/stats

# 响应示例
{
  "success": true,
  "data": {
    "is_running": true,
    "total_generated": 96,
    "total_success": 94,
    "total_failed": 2,
    "success_rate": "97.92%",
    "last_run": "2025-10-11T10:45:00.000Z",
    "next_run": "2025-10-11T11:00:00.000Z"
  }
}
```

## 🔧 故障排除

### 问题1: DQA服务未启动
```bash
# 检查服务状态
curl http://localhost:5002/api/dqa/status

# 手动启动定时任务
curl -X POST http://localhost:5002/api/dqa/scheduler/start

# 重启后端服务
systemctl restart vietnam-medical-backend.service
```

### 问题2: 生成的问答不显示
1. 检查数据库中是否有新记录
2. 确认category字段为"Tư vấn bệnh viện"
3. 确认status字段为"published"
4. 清除浏览器缓存后重新访问

### 问题3: 医院数据不足
```bash
# 查看医院数量
curl http://localhost:5002/api/dqa/hospitals

# 补充连锁医院分店
curl -X POST http://localhost:5002/api/dqa/chain-hospitals/enhance \
  -H "Content-Type: application/json" \
  -d '{"maxCount": 20}'
```

## 📝 开发说明

### 添加新的问题类型
在 `dqaGenerator.js` 中添加：
```javascript
questionTemplates: {
  // ... 现有类型
  newType: [
    {
      template: '新问题模板 {hospital_name}?',
      generator: (hospital) => this.generateNewAnswer(hospital)
    }
  ]
}

// 添加对应的答案生成方法
generateNewAnswer(hospital) {
  return `针对 ${hospital.name} 的回答...`;
}
```

### 修改定时频率
在 `dqaScheduler.js` 中修改cron表达式：
```javascript
// 当前: */15 * * * * (每15分钟)
this.scheduledTask = cron.schedule('*/30 * * * *', async () => {
  // 修改为每30分钟
});
```

## 🎯 最佳实践

1. **定期监控**: 每天查看一次DQA统计信息
2. **数据补充**: 定期运行连锁医院补充功能
3. **内容审核**: 定期抽查自动生成的问答质量
4. **日志检查**: 遇到问题时查看详细日志
5. **手动测试**: 部署前先手动生成几条测试

## 📞 技术支持

- API文档: http://localhost:5002/api/info
- DQA状态: http://localhost:5002/api/dqa/status
- 健康检查: http://localhost:5002/health

---

**版本**: v1.0.0  
**更新日期**: 2025-10-11  
**维护者**: Vietnam Medical Team

