#!/bin/bash

# 知识问答 Webhook 测试脚本

echo "🧪 测试知识问答 Webhook 接口"
echo "================================"
echo ""

# 测试1：最简单的提交（只有 question 和 answer）
echo "📝 测试1: 最简单的提交..."
curl --noproxy "*" -X POST http://localhost:5002/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "type": "knowledge",
    "data": {
      "question": "Độ tuổi nào phù hợp để làm phẫu thuật thẩm mỹ?",
      "answer": "Nhìn chung phù hợp nhất là từ 18-50 tuổi, cơ thể đã phát triển hoàn toàn và khả năng phục hồi tốt."
    }
  }'
echo -e "\n"

# 测试2：完整字段提交
echo "📝 测试2: 完整字段提交..."
curl --noproxy "*" -X POST http://localhost:5002/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "type": "knowledge",
    "data": {
      "question": "Phẫu thuật nâng ngực có an toàn không?",
      "answer": "Phẫu thuật nâng ngực hiện đại rất an toàn khi được thực hiện bởi bác sĩ có kinh nghiệm. Sử dụng túi độn silicon chất lượng cao từ Mỹ hoặc châu Âu, tỷ lệ biến chứng rất thấp.",
      "category": "Phẫu thuật ngực",
      "doctor_name": "Bác sĩ Trần Văn B",
      "doctor_title": "Chuyên gia phẫu thuật thẩm mỹ",
      "hospital_name": "Bệnh viện thẩm mỹ TP.HCM"
    },
    "source": "n8n"
  }'
echo -e "\n"

# 测试3：批量提交
echo "📝 测试3: 批量提交..."
curl --noproxy "*" -X POST http://localhost:5002/api/webhooks/batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "type": "knowledge",
        "data": {
          "question": "Phẫu thuật hút mỡ bụng có đau không?",
          "answer": "Phẫu thuật hút mỡ được thực hiện dưới gây mê, nên không đau trong quá trình phẫu thuật."
        },
        "source": "n8n"
      },
      {
        "type": "knowledge",
        "data": {
          "question": "Chi phí phẫu thuật mắt hai mí là bao nhiêu?",
          "answer": "Chi phí phẫu thuật mắt hai mí dao động từ 10-30 triệu VND tùy theo phương pháp và bệnh viện.",
          "category": "Phẫu thuật mắt"
        },
        "source": "n8n"
      }
    ]
  }'
echo -e "\n"

# 验证数据
echo "✅ 验证数据已创建..."
curl --noproxy "*" http://localhost:5002/api/knowledge?limit=10 | python3 -m json.tool
echo ""

echo "================================"
echo "✨ 测试完成！"
echo ""
echo "📱 前端查看: http://47.237.79.9:5001/knowledge"
echo "📡 API查看: http://47.237.79.9:5002/api/knowledge"

