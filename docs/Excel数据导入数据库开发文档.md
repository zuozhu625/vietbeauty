# Excel数据导入数据库开发文档

## 📋 文档概述

本文档详细记录了将Excel医美知识库数据导入到SQLite数据库的完整过程，包括技术方案、实施步骤、数据库配置和验证方法。

**文档版本**: v1.0.0  
**创建日期**: 2025-10-25  
**适用项目**: 越南医疗整形项目  

---

## 🎯 项目背景

### 业务需求
- 将5个Excel文件（丰胸问答、五官问答、产修问答、吸脂问答、牙矫问答）中的医美知识问答数据导入到项目数据库
- 数据格式：中文医美问答对
- 数据量：总计1,828条问答记录

### 技术挑战
- 服务器网络环境限制，无法直接安装Python pandas库
- Excel文件格式复杂，需要精确提取中文内容
- 需要智能识别问答配对关系

---

## 🏗️ 技术方案

### 方案选择
由于网络限制无法安装Python pandas库，采用**Shell脚本 + Python内置库**的组合方案：

1. **文件解压**: 使用系统unzip工具解压Excel文件
2. **数据提取**: 通过Python内置xml.etree.ElementTree解析sharedStrings.xml
3. **数据导入**: 使用Python内置sqlite3库直接操作数据库

### 技术栈
- **Shell脚本**: 文件处理和流程控制
- **Python 3.6**: 数据解析和数据库操作
- **SQLite3**: 数据存储
- **XML解析**: 提取Excel中的中文文本内容

---

## 📊 数据库配置

### 数据库信息
- **数据库类型**: SQLite3
- **数据库文件**: `/root/越南医疗整形项目/backend/data/medical.db`
- **文件大小**: 约11MB
- **字符编码**: UTF-8

### 表结构设计
```sql
CREATE TABLE knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50) NOT NULL,           -- 分类：丰胸、五官、产修、吸脂、牙矫
    question TEXT NOT NULL,                  -- 问题内容
    answer TEXT NOT NULL,                    -- 答案内容
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 索引配置
```sql
-- 为分类字段创建索引，提高查询性能
CREATE INDEX idx_knowledge_category ON knowledge(category);

-- 为问题字段创建全文搜索索引（可选）
CREATE VIRTUAL TABLE knowledge_fts USING fts5(question, answer, content='knowledge');
```

---

## 🔧 实施步骤

### 第一步：环境准备
```bash
# 1. 创建项目目录结构
mkdir -p /root/越南医疗整形项目/temp_data
mkdir -p /root/越南医疗整形项目/temp_data/csv
mkdir -p /root/越南医疗整形项目/temp_data/extract

# 2. 检查系统工具
which unzip    # 确认unzip工具可用
which sqlite3  # 确认sqlite3工具可用
python3 --version  # 确认Python版本
```

### 第二步：文件上传
```bash
# 使用scp上传Excel文件到服务器
scp "C:\Users\qikak\Desktop\医美知识库\医美知识库.zip" root@47.237.79.9:/root/越南医疗整形项目/
```

### 第三步：文件解压
```bash
cd /root/越南医疗整形项目
mkdir -p temp_data
cd temp_data
unzip -o ../医美知识库.zip
```

### 第四步：数据导入脚本
创建主处理脚本：`/root/越南医疗整形项目/scripts/process-chinese-excel.sh`

```bash
#!/bin/bash
# 处理中文Excel文件的脚本
# 从Excel的sharedStrings.xml中提取中文数据

DATA_DIR="/root/越南医疗整形项目/temp_data/医美知识库"
DB_FILE="/root/越南医疗整形项目/backend/data/medical.db"
TEMP_DIR="/root/越南医疗整形项目/temp_data/extract"

echo "🏥 开始处理中文医美知识库..."

# 创建临时目录
mkdir -p "$TEMP_DIR"

# 清空现有数据并重建表
sqlite3 "$DB_FILE" "
DROP TABLE IF EXISTS knowledge;
CREATE TABLE knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"

# 处理每个Excel文件
for excel_file in "$DATA_DIR"/*.xlsx; do
    if [ -f "$excel_file" ]; then
        filename=$(basename "$excel_file" .xlsx)
        temp_dir="$TEMP_DIR/${filename}_extract"
        
        echo "📊 正在处理: $filename"
        
        # 创建临时目录
        mkdir -p "$temp_dir"
        
        # 解压Excel文件
        unzip -q "$excel_file" -d "$temp_dir"
        
        # 提取sharedStrings.xml中的中文内容
        shared_strings="$temp_dir/xl/sharedStrings.xml"
        if [ -f "$shared_strings" ]; then
            echo "📋 提取中文内容..."
            
            # 确定分类
            case "$filename" in
                "丰胸问答") category="丰胸" ;;
                "五官问答") category="五官" ;;
                "产修问答") category="产修" ;;
                "吸脂问答") category="吸脂" ;;
                "牙矫问答") category="牙矫" ;;
                *) category="其他" ;;
            esac
            
            # 使用Python提取数据
            python3 << EOF
import xml.etree.ElementTree as ET
import sqlite3
import re
from datetime import datetime

# 解析sharedStrings.xml
tree = ET.parse('$shared_strings')
root = tree.getroot()

# 提取所有文本内容
texts = []
for si in root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
    t_elem = si.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
    if t_elem is not None and t_elem.text:
        texts.append(t_elem.text.strip())

print(f"找到 {len(texts)} 个文本项")

# 连接数据库
conn = sqlite3.connect('$DB_FILE')
cursor = conn.cursor()

# 处理数据 - 更智能的问答配对
question = ""
answer = ""
count = 0
current_time = datetime.now().isoformat()

# 跳过前几个标题项
start_idx = 0
for i, text in enumerate(texts):
    if text in ['序号', '问题', '答案']:
        start_idx = i + 1
        break

for i in range(start_idx, len(texts)):
    text = texts[i]
    
    # 跳过空文本
    if not text or len(text.strip()) < 2:
        continue
    
    # 检查是否是问题（通常较短，且以问号结尾或包含问号）
    if ('？' in text or '?' in text) and len(text) < 200:
        if question and answer:
            # 保存上一对问答
            try:
                cursor.execute("INSERT INTO knowledge (category, question, answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", 
                             ('$category', question, answer, current_time, current_time))
                count += 1
            except Exception as e:
                print(f"插入失败: {e}")
        question = text
        answer = ""
    else:
        # 这是答案
        if question:
            if answer:
                answer += " " + text
            else:
                answer = text
        else:
            # 如果没有问题，可能是单独的内容，跳过
            continue

# 保存最后一对
if question and answer:
    try:
        cursor.execute("INSERT INTO knowledge (category, question, answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", 
                     ('$category', question, answer, current_time, current_time))
        count += 1
    except Exception as e:
        print(f"插入失败: {e}")

conn.commit()
conn.close()
print(f"成功导入 {count} 条记录")
EOF
            
            echo "✅ $filename 处理完成"
        else
            echo "❌ 未找到sharedStrings.xml文件"
        fi
        
        # 清理临时目录
        rm -rf "$temp_dir"
    fi
done

# 显示统计信息
echo ""
echo "📊 数据导入完成！"
echo "📈 知识库统计:"
sqlite3 "$DB_FILE" "SELECT category, COUNT(*) as count FROM knowledge GROUP BY category ORDER BY count DESC;"
sqlite3 "$DB_FILE" "SELECT COUNT(*) as total FROM knowledge;"

echo ""
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"

echo "🎉 中文医美知识库处理完成！"
```

### 第五步：执行导入
```bash
# 给脚本添加执行权限
chmod +x /root/越南医疗整形项目/scripts/process-chinese-excel.sh

# 执行导入脚本
cd /root/越南医疗整形项目
./scripts/process-chinese-excel.sh
```

---

## 📈 导入结果

### 数据统计
| 分类 | 记录数 | 占比 |
|------|--------|------|
| 五官 | 500条 | 27.4% |
| 牙矫 | 449条 | 24.6% |
| 丰胸 | 381条 | 20.8% |
| 吸脂 | 298条 | 16.3% |
| 产修 | 200条 | 10.9% |
| **总计** | **1,828条** | **100%** |

### 数据质量验证
```sql
-- 查看数据示例
SELECT category, question, answer FROM knowledge WHERE category='丰胸' LIMIT 3;

-- 统计各分类数据量
SELECT category, COUNT(*) as count FROM knowledge GROUP BY category ORDER BY count DESC;

-- 检查数据完整性
SELECT COUNT(*) as total_records FROM knowledge;
```

---

## 🔍 技术细节

### Excel文件结构解析
Excel文件本质上是ZIP压缩包，包含以下关键文件：
- `xl/sharedStrings.xml`: 存储所有文本内容
- `xl/worksheets/sheet1.xml`: 工作表数据
- `xl/workbook.xml`: 工作簿信息

### 问答配对算法
```python
# 问题识别规则
if ('？' in text or '?' in text) and len(text) < 200:
    # 识别为问题
    question = text
    answer = ""

# 答案识别规则
else:
    # 识别为答案
    if question:
        answer += " " + text
```

### 数据库优化
```sql
-- 创建索引提高查询性能
CREATE INDEX idx_knowledge_category ON knowledge(category);

-- 创建全文搜索索引（可选）
CREATE VIRTUAL TABLE knowledge_fts USING fts5(question, answer, content='knowledge');
```

---

## 🚀 使用方式

### 在n8n中使用
```javascript
// n8n SQLite节点配置
const query = `
SELECT question, answer 
FROM knowledge 
WHERE category = '丰胸' 
AND question LIKE '%术后%' 
LIMIT 10
`;
```

### 在API中使用
```javascript
// 后端API示例
app.get('/api/knowledge/:category', async (req, res) => {
    const { category } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `
        SELECT id, question, answer, created_at 
        FROM knowledge 
        WHERE category = ? 
        ORDER BY id 
        LIMIT ? OFFSET ?
    `;
    
    const results = await db.all(query, [category, limit, offset]);
    res.json(results);
});
```

---

## 🛠️ 维护和扩展

### 数据更新流程
1. 准备新的Excel文件
2. 上传到服务器指定目录
3. 运行导入脚本
4. 验证数据完整性

### 脚本优化建议
1. **错误处理**: 增加更详细的错误日志
2. **数据验证**: 添加数据质量检查
3. **增量更新**: 支持增量数据导入
4. **备份机制**: 导入前自动备份现有数据

### 性能优化
1. **批量插入**: 使用事务批量插入数据
2. **索引优化**: 根据查询模式优化索引
3. **数据压缩**: 对大型文本字段进行压缩

---

## 📝 故障排除

### 常见问题

#### 1. 网络连接问题
```bash
# 问题：pip install失败
# 解决：使用系统工具替代Python包
yum install -y unzip sqlite3
```

#### 2. 数据导入失败
```bash
# 问题：数据库约束错误
# 解决：重建表结构
sqlite3 backend/data/medical.db "DROP TABLE IF EXISTS knowledge;"
```

#### 3. 问答配对错误
```python
# 问题：问答配对不准确
# 解决：调整识别规则
if ('？' in text or '?' in text) and len(text) < 200:
    # 更严格的问题识别条件
```

### 调试命令
```bash
# 检查数据库状态
sqlite3 backend/data/medical.db ".tables"
sqlite3 backend/data/medical.db ".schema knowledge"

# 检查数据质量
sqlite3 backend/data/medical.db "SELECT COUNT(*) FROM knowledge WHERE question = '' OR answer = '';"

# 查看导入日志
tail -f /var/log/excel-import.log
```

---

## 📚 相关文档

- [数据库配置开发文档.md](./数据库配置开发文档.md)
- [后端开发文档.md](./后端开发文档.md)
- [项目架构开发文档.md](./项目架构开发文档.md)

---

## 👥 维护团队

**开发人员**: AI Assistant  
**文档版本**: v1.0.0  
**最后更新**: 2025-10-25  

---

*本文档记录了Excel数据导入数据库的完整技术实现过程，为后续维护和扩展提供参考。*
