# N8N 知识问答集成指南

## 📋 概述

本文档说明如何通过 N8N 工作流向越南医疗整形项目后端服务提交知识问答数据。

## 🔗 API 端点

### Webhook 端点
```
POST http://47.237.79.9:5002/api/webhooks/n8n
```

### 批量处理端点
```
POST http://47.237.79.9:5002/api/webhooks/batch
```

## 📝 数据格式

### 单个知识问答提交

**请求格式：**
```json
{
  "type": "knowledge",
  "data": {
    "question": "Phẫu thuật mũi cần bao lâu để phục hồi?",
    "answer": "Nhìn chung, phẫu thuật mũi cần 1-2 tuần để phục hồi ban đầu, hoàn toàn phục hồi cần 3-6 tháng..."
  },
  "source": "n8n"
}
```

**最简单的提交（只需要 question 和 answer）：**
```json
{
  "type": "knowledge",
  "data": {
    "question": "问题内容",
    "answer": "答案内容"
  }
}
```

**完整字段提交（可选）：**
```json
{
  "type": "knowledge",
  "data": {
    "question": "Phẫu thuật mũi cần bao lâu để phục hồi?",
    "answer": "Nhìn chung, phẫu thuật mũi cần 1-2 tuần để phục hồi ban đầu...",
    "category": "Phẫu thuật mũi",
    "subcategory": "Phục hồi",
    "doctor_name": "Bác sĩ Trần",
    "doctor_title": "Trưởng khoa phẫu thuật thẩm mỹ",
    "doctor_avatar": "https://example.com/avatar.jpg",
    "hospital_name": "Bệnh viện thẩm mỹ TP.HCM",
    "tags": ["phẫu thuật mũi", "phục hồi"],
    "difficulty_level": "beginner",
    "external_id": "unique_id_123"
  },
  "source": "n8n"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `question` | String | ✅ | - | 问题内容（最多500字符） |
| `answer` | String | ✅ | - | 答案内容（无限制） |
| `category` | String | ❌ | "Tư vấn chung" | 分类 |
| `subcategory` | String | ❌ | null | 子分类 |
| `doctor_name` | String | ❌ | "Bác sĩ chuyên khoa" | 医生姓名 |
| `doctor_title` | String | ❌ | null | 医生职称 |
| `doctor_avatar` | String | ❌ | null | 医生头像URL |
| `hospital_name` | String | ❌ | null | 医院名称 |
| `tags` | Array | ❌ | [] | 标签数组 |
| `difficulty_level` | String | ❌ | "beginner" | 难度级别（beginner/intermediate/advanced） |
| `external_id` | String | ❌ | 自动生成 | 外部系统ID（用于防重复） |

### 批量提交

**请求格式：**
```json
{
  "items": [
    {
      "type": "knowledge",
      "data": {
        "question": "问题1",
        "answer": "答案1"
      },
      "source": "n8n"
    },
    {
      "type": "knowledge",
      "data": {
        "question": "问题2",
        "answer": "答案2",
        "category": "Phẫu thuật mắt"
      },
      "source": "n8n"
    }
  ]
}
```

## 🔄 N8N 工作流配置

### 方案1：HTTP Request 节点（推荐）

1. **添加 HTTP Request 节点**
2. **配置节点：**
   - Method: `POST`
   - URL: `http://47.237.79.9:5002/api/webhooks/n8n`
   - Authentication: None
   - Body Content Type: `JSON`
   - Specify Body: `Using JSON`

3. **Body 示例：**
```json
{
  "type": "knowledge",
  "data": {
    "question": "{{ $json.question }}",
    "answer": "{{ $json.answer }}",
    "category": "{{ $json.category }}",
    "doctor_name": "{{ $json.doctor_name }}"
  },
  "source": "n8n"
}
```

### 方案2：Webhook 节点

1. **在 N8N 中创建 Webhook 节点作为触发器**
2. **添加 HTTP Request 节点连接到后端**
3. **配置数据映射**

## ✅ 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "knowledge数据处理成功",
  "data": {
    "id": 1,
    "question": "Phẫu thuật mũi cần bao lâu để phục hồi?",
    "answer": "...",
    "category": "Tư vấn chung",
    "doctor_name": "Bác sĩ chuyên khoa",
    "like_count": 0,
    "view_count": 0,
    "status": "published",
    "source": "n8n",
    "createdAt": "2024-03-20T10:00:00.000Z",
    "updatedAt": "2024-03-20T10:00:00.000Z"
  }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "Webhook数据验证失败",
  "errors": [
    {
      "message": "\"question\" is required",
      "path": ["question"],
      "type": "any.required"
    }
  ]
}
```

## 🧪 测试

### 使用 curl 测试

**最简单的测试：**
```bash
curl -X POST http://47.237.79.9:5002/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "type": "knowledge",
    "data": {
      "question": "测试问题",
      "answer": "测试答案"
    }
  }'
```

**完整字段测试：**
```bash
curl -X POST http://47.237.79.9:5002/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "type": "knowledge",
    "data": {
      "question": "Phẫu thuật mũi có an toàn không?",
      "answer": "Phẫu thuật mũi hiện đại có mức độ an toàn cao...",
      "category": "Phẫu thuật mũi",
      "doctor_name": "Bác sĩ Nguyễn",
      "hospital_name": "Bệnh viện thẩm mỹ Hà Nội"
    },
    "source": "n8n"
  }'
```

### 验证数据已创建

**查看所有问答：**
```bash
curl http://47.237.79.9:5002/api/knowledge
```

**查看特定问答：**
```bash
curl http://47.237.79.9:5002/api/knowledge/1
```

## 📊 数据流程

```
N8N 工作流
    ↓
发送 POST 请求到 /api/webhooks/n8n
    ↓
后端服务接收数据
    ↓
验证数据格式
    ↓
保存到数据库（SQLite）
    ↓
前端 SSR 自动读取新数据
    ↓
用户访问页面时看到新问答
```

## 🔍 前端展示

数据提交成功后，前端会自动通过 SSR 渲染显示：

- **列表页面**：`http://47.237.79.9:5001/knowledge`
- **详情页面**：`http://47.237.79.9:5001/knowledge/{id}`

前端会显示：
- 问题标题
- 答案预览（4行）
- 分类标签
- 医生信息
- 点赞和浏览数

## 🔒 防重复机制

使用 `external_id` 字段防止重复提交：

1. 如果提供了 `external_id`，系统会先查找是否存在相同的记录
2. 如果存在，则更新该记录
3. 如果不存在，则创建新记录
4. 如果不提供 `external_id`，系统会自动生成唯一ID

**示例：**
```json
{
  "type": "knowledge",
  "data": {
    "question": "问题",
    "answer": "答案",
    "external_id": "my_unique_id_001"
  }
}
```

## 📝 常见问题

### Q: 只需要提交 question 和 answer 吗？
A: 是的！这两个字段是必填的，其他字段都是可选的，系统会自动填充默认值。

### Q: 如何指定分类？
A: 在 data 中添加 `category` 字段，例如："Phẫu thuật mũi"、"Phẫu thuật mắt" 等。

### Q: 数据什么时候会在前端显示？
A: 立即！前端使用 SSR 服务器端渲染，每次页面加载都会从数据库读取最新数据。

### Q: 如何批量导入问答？
A: 使用批量处理端点 `/api/webhooks/batch`，一次可以提交多个问答。

### Q: 数据存储在哪里？
A: 存储在 SQLite 数据库中：`/root/越南医疗整形项目/backend/data/database.sqlite`

## 🚀 快速开始

1. **确保后端服务运行：**
```bash
systemctl status vietnam-medical-backend.service
```

2. **测试提交一个简单的问答：**
```bash
curl -X POST http://47.237.79.9:5002/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "type": "knowledge",
    "data": {
      "question": "Phẫu thuật thẩm mỹ có đau không?",
      "answer": "Phẫu thuật thẩm mỹ hiện đại sử dụng gây tê hoặc gây mê, nên trong quá trình phẫu thuật không cảm thấy đau."
    }
  }'
```

3. **访问前端查看结果：**
```
http://47.237.79.9:5001/knowledge
```

## 📞 支持

如有问题，请检查：
1. 后端服务状态：`systemctl status vietnam-medical-backend.service`
2. 后端日志：`journalctl -u vietnam-medical-backend.service -f`
3. API 健康检查：`curl http://47.237.79.9:5002/health`

---

**最后更新**：2024-10-08

