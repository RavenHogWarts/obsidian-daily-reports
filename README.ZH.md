# Obsidian 每日日报抓取工具 (Obsidian Daily Reports Fetcher)

[English](README.md) | [中文](README.ZH.md)

这是一个轻量级的自动化工具，用于抓取和聚合 Obsidian 社区的每日动态。该项目设计用于通过 GitHub Actions 自动运行，生成 JSON 格式的社区活动快照。

## 🚀 功能特点

- **多源数据聚合**：从多个 Obsidian 核心社区平台抓取数据：
  - **官方中文论坛**：“经验分享”板块。
  - **官方英文论坛**："Share & Showcase" 板块。
  - **GitHub**：新提交的插件和主题（来自 `obsidianmd/obsidian-releases` 的 Pull Requests）。
  - **Reddit**：`r/ObsidianMD` 的最新讨论。
- **零依赖**：使用 Python 标准库（`urllib`, `json`, `datetime`）编写，无需安装第三方包，运行速度快，配置简单。
- **自动化工作流**：集成 GitHub Actions，并在每天 **UTC 00:00**（北京时间 08:00）自动运行。
- **结构化输出**：将抓取的数据以 JSON 格式自动保存到 `data/` 目录中。

## 📂 项目结构

```text
obsidian-daily-reports/
├── .github/
│   └── workflows/
│       └── daily_fetch.yml      # GitHub Action 配置文件
├── data/                        # 存放生成的 JSON 日报数据
│   └── obsidian_daily_YYYY-MM-DD.json
├── scripts/
│   └── obsidian_fetcher.py      # 核心抓取脚本
├── LICENSE
├── README.md
└── README.ZH.md
```

## 🛠️ 使用指南

### 本地运行

1. **克隆仓库**：

   ```bash
   git clone https://github.com/YourUsername/obsidian-daily-reports.git
   cd obsidian-daily-reports
   ```

2. **配置环境变量（可选）**：
   建议设置 `GITHUB_TOKEN` 环境变量以提高 GitHub API 的调用速率限制。

   - Windows (PowerShell):
     ```powershell
     $env:GITHUB_TOKEN="your_token_here"
     ```
   - Linux/macOS:
     ```bash
     export GITHUB_TOKEN="your_token_here"
     ```

3. **运行脚本**：
   ```bash
   python scripts/obsidian_fetcher.py
   ```
   脚本运行完成后，将在 `data/` 目录下生成名为 `obsidian_daily_YYYY-MM-DD.json` 的文件。

### GitHub Actions 自动运行

工作流已配置为每天自动执行。它将执行以下操作：

1. 获取 **前一天** (UTC) 的所有社区数据。
2. 生成并保存 JSON 报告。
3. 自动提交新生成的 JSON 文件并推送到仓库。

## 📄 输出格式示例

生成的 JSON 文件包含以下主要字段：

```json
{
  "date": "2026-01-08",
  "generated_at": "2026-01-09T00:00:00+00:00",
  "chinese_forum": [ ... ],
  "english_forum": [ ... ],
  "github_opened": [ ... ],   // 新提交的 PR（通常是新插件/主题申请）
  "github_merged": [ ... ],   // 已合并的 PR（正式发布的插件/主题）
  "reddit": [ ... ]
}
```

## 🤝 参与贡献

欢迎提交 Issue 或 Pull Request 来改进这个工具！

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。
