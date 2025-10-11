# 越南医疗整形项目

一个专业的越南医疗整形平台，提供医院信息、用户分享、知识问答等服务。

## 🌐 访问信息

- **生产环境**: `http://服务器IP:5001`
- **开发环境**: `http://localhost:4321`
- **技术栈**: Astro + Tailwind CSS + TypeScript
- **主题**: Cursor 黑色主题

## 🚀 快速开始

### 生产环境部署
```bash
cd /root/越南医疗整形项目
./deploy.sh
```

### 开发环境启动
```bash
npm install
npm run dev
```

### 服务管理
```bash
# 启动生产服务
systemctl start vietnam-medical.service

# 查看服务状态
systemctl status vietnam-medical.service

# 查看日志
journalctl -u vietnam-medical.service -f
```

## 📁 项目结构

```text
/
├── docs/                    # 📚 项目文档
│   ├── README.md           # 文档首页
│   ├── 生产环境部署指南.md   # 部署说明
│   └── 开发文档.md          # 开发指南
├── src/                     # 📝 源代码
│   ├── components/          # 可复用组件
│   ├── layouts/             # 页面布局
│   ├── pages/               # 页面文件
│   └── styles/              # 样式文件
├── dist/                    # 🏗️ 构建输出
├── public/                  # 🖼️ 静态资源
├── deploy.sh               # 🚀 部署脚本
└── package.json            # 📦 项目配置
```

## 📚 文档

详细文档请查看 `docs/` 目录：

- **[文档首页](./docs/README.md)** - 文档导航和快速开始
- **[生产环境部署指南](./docs/生产环境部署指南.md)** - 部署配置和维护
- **[开发文档](./docs/开发文档.md)** - 开发指南和技术说明

## 🧞 开发命令

| 命令                   | 说明                                           |
| :--------------------- | :--------------------------------------------- |
| `npm install`          | 安装依赖包                                     |
| `npm run dev`          | 启动开发服务器 (`localhost:4321`)              |
| `npm run build`        | 构建生产版本到 `./dist/`                       |
| `npm run preview`      | 预览构建结果                                   |
| `./deploy.sh`          | 一键部署到生产环境                             |

## 🎯 核心功能

- ✅ **用户分享** - 真实的整形经历分享
- ✅ **知识问答** - 专业医生在线答疑
- ✅ **医院评价** - 权威的医院评分系统（122家医院）
- ✅ **服务内容** - 全面的医疗服务介绍
- ✅ **DQA自动问答** - 每15分钟自动生成医院问答内容（新功能）
- ✅ **响应式设计** - 支持移动端和桌面端
- ✅ **现代化UI** - Cursor主题的优雅界面

## 🔧 技术特色

- **Astro框架** - 快速的静态站点生成
- **Tailwind CSS** - 原子化CSS框架
- **TypeScript** - 类型安全的开发体验
- **Cursor主题** - 专业的黑色主题设计
- **毛玻璃效果** - 现代化的视觉体验
- **动画效果** - 流畅的交互动画

## 📞 支持

如有问题，请查看：
1. [部署问题](./docs/生产环境部署指南.md#故障排除)
2. [开发问题](./docs/开发文档.md#调试技巧)
3. 服务日志: `journalctl -u vietnam-medical.service -f`

---

**版本**: v1.4.0  
**更新日期**: 2025-10-11

**新增功能**: 
- 🤖 DQA医院自动问答系统
- 📊 122家医院数据自动化内容生成
- ⏰ 每15分钟自动发布1条问答
- 📝 详细文档：`backend/src/dqa/README.md`
