# Obsidian Daily Reports

一个现代化的 Web 应用,用于展示 Obsidian 社区的每日和每周报告。

## ✨ 特性

- 📊 **每日报告**: 展示 Obsidian 社区的每日活动
- 📅 **每周总结**: 汇总一周内的重要更新
- 🌓 **深色模式**: 完整的深色主题支持,自动检测系统偏好
- 📱 **响应式设计**: 完美适配桌面端和移动端
- ⚡ **快速加载**: 基于 Vite 的现代化构建系统
- 🎨 **精美 UI**: 使用 Tailwind CSS v4 打造的现代化界面

## 🚀 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS v4
- **路由**: React Router v7
- **部署**: Vercel

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/RavenHogWarts/obsidian-daily-reports.git

# 进入项目目录
cd obsidian-daily-reports

# 安装依赖
npm install
```

## 🛠️ 开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 📁 项目结构

```
obsidian-daily-reports/
├── public/
│   └── data/              # 数据文件
│       ├── daily/         # 每日报告 JSON
│       └── weekly/        # 每周报告 JSON
├── src/
│   ├── components/        # React 组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useData.ts
│   │   └── useTheme.ts
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx
│   │   ├── DailyReport.tsx
│   │   └── WeeklyReport.tsx
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # Tailwind 配置
├── scripts/              # 构建脚本
└── docs/                 # 文档
```

## 🎨 样式系统

本项目使用 **Tailwind CSS v4** 作为样式解决方案,提供:

- 🎯 **工具类优先**: 快速构建 UI,无需编写自定义 CSS
- 🌈 **一致的设计系统**: 统一的颜色、间距、字体等
- 🔄 **深色模式**: 通过 `dark:` 前缀轻松实现
- 📐 **响应式**: 内置断点系统 (sm, md, lg, xl)

详细的样式重构文档请查看: [TAILWIND_REFACTOR.md](./docs/TAILWIND_REFACTOR.md)

### 主题色

- **Primary**: Violet (紫罗兰)
- **Secondary**: Indigo (靛蓝)
- **Accent**: Violet 600/400

### 深色模式

应用会自动检测系统主题偏好,用户也可以通过右上角的主题切换按钮手动切换。

## 📊 数据格式

### 每日报告 (`daily/YYYY-MM-DD.json`)

```json
{
  "date": "2026-01-13",
  "chinese_forum": [...],
  "english_forum": [...],
  "github_opened": [...],
  "github_merged": [...],
  "reddit": [...]
}
```

### 每周报告 (`weekly/YYYY-Www.json`)

```json
{
  "iso_week": "2026-W02",
  "date_range": {
    "start": "2026-01-05",
    "end": "2026-01-11"
  },
  "chinese_forum": [...],
  "english_forum": [...],
  "github_opened": [...],
  "github_merged": [...],
  "reddit": [...]
}
```

## 🚢 部署

项目配置为自动部署到 Vercel:

1. 推送到 `master` 分支会触发生产环境部署
2. 推送到其他分支会创建预览部署

### 手动部署

```bash
# 构建项目
npm run build

# dist 目录包含生产就绪的文件
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可

MIT License

## 🔗 相关链接

- [Obsidian 官网](https://obsidian.md/)
- [Obsidian 中文论坛](https://forum-zh.obsidian.md/)
- [Obsidian 英文论坛](https://forum.obsidian.md/)
- [Obsidian GitHub](https://github.com/obsidianmd)

---
