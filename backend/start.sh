#!/bin/bash

# 越南医疗整形项目后端服务启动脚本

echo "🚀 启动越南医疗整形项目后端服务..."

# 进入后端目录
cd /root/越南医疗整形项目/backend

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败！"
    exit 1
fi

# 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data logs

# 初始化数据库
echo "🗄️ 初始化数据库..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败！"
    exit 1
fi

# 启动服务
echo "🌐 启动后端服务..."
npm start
