# ToolBox - 在线工具集合

简洁实用的在线工具集合，采用 Geist/Vercel 风格的扁平化设计。

## ✨ 特性

- 🚀 **高性能** - 基于 Astro 构建，默认零 JavaScript
- 🎨 **现代设计** - Geist/Vercel 风格的极简 UI
- 📦 **模块化** - 每个工具独立页面，易于扩展
- 🎮 **Steam 卡片** - 集成 Steam 资料卡片生成器
- 📱 **响应式** - 完美适配桌面和移动设备

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build)
- **UI**: [React](https://react.dev) (交互组件)
- **样式**: [Tailwind CSS](https://tailwindcss.com)
- **部署**: Cloudflare Pages

## 📦 项目结构

```
tool-box/
├── src/
│   ├── components/       # React/Astro 组件
│   │   └── ToolCard.astro
│   ├── layouts/          # 页面布局
│   │   └── BaseLayout.astro
│   ├── pages/            # 页面路由
│   │   ├── index.astro   # 首页
│   │   └── tools/        # 工具页面
│   │       └── steam-card.astro
│   └── styles/           # 全局样式
│       └── global.css
└── public/               # 静态资源
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:4321 查看效果

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 📝 添加新工具

1. 在 `src/pages/tools/` 创建新页面，例如 `my-tool.astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout title="工具名称 - ToolBox">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <h1>我的工具</h1>
    <!-- 工具内容 -->
  </div>
</BaseLayout>
```

2. 在 `src/pages/index.astro` 的 `tools` 数组中添加卡片信息：

```javascript
const tools = [
  {
    title: '工具名称',
    description: '工具描述',
    href: '/tools/my-tool',
    icon: '🔧',
  },
];
```

## 🌐 部署到 Cloudflare Pages

### 方法一：通过 GitHub 自动部署

1. 将代码推送到 GitHub（已完成）
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Workers & Pages** > **Create application** > **Pages**
4. 选择 **Connect to Git**
5. 选择 `seraluce/tool-box` 仓库
6. 配置构建设置：
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Node.js version**: `24`
7. 点击 **Save and Deploy**

### 方法二：通过 Wrangler CLI

1. 安装 Wrangler：

```bash
pnpm add -g wrangler
```

2. 登录 Cloudflare：

```bash
wrangler login
```

3. 部署：

```bash
pnpm build
wrangler pages deploy dist --project-name tool-box
```

### 环境变量（如需要）

在 Cloudflare Pages 项目设置中添加环境变量。

## 🔧 可用工具

| 工具 | 路径 | 描述 |
|------|------|------|
| Steam 卡片生成器 | `/tools/steam-card` | 快速生成 Steam 资料卡片 |

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系

- GitHub: [@seraluce](https://github.com/seraluce)
