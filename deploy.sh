#!/bin/bash

# 越南医疗整形项目完整部署脚本 (前端 + 后端)

echo "🚀 开始部署越南医疗整形项目 (前端 + 后端)..."

# ================================
# 第一部分：后端服务部署
# ================================
echo ""
echo "🔧 ========== 后端服务部署 =========="

# 1. 停止后端服务
echo "📦 停止后端服务..."
systemctl stop vietnam-medical-backend.service 2>/dev/null || true

# 2. 安装后端依赖
echo "📦 安装后端依赖包..."
cd /root/越南医疗整形项目/backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败！"
    exit 1
fi

# 3. 创建后端必要目录
echo "📁 创建后端必要目录..."
mkdir -p data logs

# 4. 初始化数据库
echo "🗄️ 初始化数据库..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败！"
    exit 1
fi

# 5. 配置后端systemd服务
echo "⚙️ 配置后端systemd服务..."
cp vietnam-medical-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable vietnam-medical-backend.service

# 6. 启动后端服务
echo "🔄 启动后端服务..."
systemctl start vietnam-medical-backend.service

# 7. 检查后端服务状态
echo "✅ 检查后端服务状态..."
sleep 3
systemctl status vietnam-medical-backend.service --no-pager

# ================================
# 第二部分：前端服务部署
# ================================
echo ""
echo "🎨 ========== 前端服务部署 =========="

# 8. 停止前端服务
echo "📦 停止前端服务..."
systemctl stop vietnam-medical.service

# 9. 构建前端项目
echo "🔨 构建前端项目..."
cd /root/越南医疗整形项目
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败！"
    exit 1
fi

# 10. 配置前端开机自启动
echo "⚙️ 配置前端开机自启动..."
systemctl daemon-reload
systemctl enable vietnam-medical.service

# 11. 启动前端服务
echo "🔄 启动前端服务..."
systemctl start vietnam-medical.service

# 12. 检查前端服务状态
echo "✅ 检查前端服务状态..."
systemctl status vietnam-medical.service --no-pager

# ================================
# 第三部分：服务健康检查
# ================================
echo ""
echo "🏥 ========== 服务健康检查 =========="

# 13. 等待服务启动
echo "⏳ 等待服务完全启动..."
sleep 5

# 14. 检查后端API
echo "🔍 检查后端API..."
if curl -s http://localhost:5002/health > /dev/null; then
    echo "✅ 后端API服务正常"
else
    echo "⚠️  后端API服务可能未完全启动"
fi

# 14.5. 检查DQA服务
echo "🔍 检查DQA自动问答服务..."
if curl -s http://localhost:5002/api/dqa/status > /dev/null; then
    echo "✅ DQA服务正常运行（每15分钟自动生成医院问答）"
else
    echo "⚠️  DQA服务可能未完全启动"
fi

# 15. 检查前端服务
echo "🔍 检查前端服务..."
if curl -s http://localhost:5001 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "⚠️  前端服务可能未完全启动"
fi

# ================================
# 第四部分：部署完成信息
# ================================
echo ""
echo "🎉 ========== 部署完成 =========="
echo ""
echo "🌐 官方网站: https://vietbeauty.top (推荐访问) ⭐"
echo "🌐 备用域名: https://www.vietbeauty.top"
echo "📱 IP访问地址: http://47.237.79.9:5001"
echo "📡 后端API地址: http://47.237.79.9:5002"
echo "📊 后端健康检查: http://47.237.79.9:5002/health"
echo "📚 后端API文档: http://47.237.79.9:5002/api/info"
echo "🤖 DQA服务状态: http://47.237.79.9:5002/api/dqa/status"
echo "🏥 医院问答页面: https://vietbeauty.top/knowledge?category=Tư%20vấn%20bệnh%20viện"
echo ""
echo "🔒 SSL证书: Let's Encrypt (自动续期)"
echo "🚀 开机自启动: 已配置"
echo "⚡ Nginx反向代理: 已启用"
echo "🤖 DQA自动问答: 已启动（每15分钟生成1条医院问答）"
echo ""
echo "🔧 服务管理命令:"
echo ""
echo "前端服务:"
echo "   启动: systemctl start vietnam-medical.service"
echo "   停止: systemctl stop vietnam-medical.service"
echo "   重启: systemctl restart vietnam-medical.service"
echo "   状态: systemctl status vietnam-medical.service"
echo "   日志: journalctl -u vietnam-medical.service -f"
echo ""
echo "后端服务:"
echo "   启动: systemctl start vietnam-medical-backend.service"
echo "   停止: systemctl stop vietnam-medical-backend.service"
echo "   重启: systemctl restart vietnam-medical-backend.service"
echo "   状态: systemctl status vietnam-medical-backend.service"
echo "   日志: journalctl -u vietnam-medical-backend.service -f"
echo ""
echo "📋 检查所有服务状态:"
echo "   systemctl status vietnam-medical.service vietnam-medical-backend.service"
echo ""
