# Obsidian Daily Reports Fetcher

A lightweight, automated tool to fetch and aggregate daily updates from the Obsidian ecosystem. This project is designed to run automatically via GitHub Actions to generate a daily snapshot of community activities in JSON format.

## 🚀 Features

- **Multi-Source Aggregation**: Fetches data from multiple key Obsidian community platforms:
  - **Official Chinese Forum**: "Experience Sharing" category.
  - **Official English Forum**: "Share & Showcase" category.
  - **GitHub**: New plugins and themes submissions (from `obsidianmd/obsidian-releases` PRs).
  - **Reddit**: Latest discussions from `r/ObsidianMD`.
- **Zero Dependencies**: Written in pure Python using standard libraries (`urllib`, `json`, `datetime`) to ensure fast execution and minimal setup.
- **Automated Workflow**: Integrated with GitHub Actions to run daily at **00:00 UTC**.
- **Structured Output**: Saves data as clean, structured JSON files in the `data/` directory.

## 📂 Project Structure

```text
obsidian-daily-reports/
├── .github/
│   └── workflows/
│       └── daily_fetch.yml      # GitHub Action configuration
├── data/                        # Stores the generated JSON reports
│   └── obsidian_daily_YYYY-MM-DD.json
├── scripts/
│   └── obsidian_fetcher.py      # Main fetching script
├── LICENSE
├── README.md
└── README.ZH.md
```

## 🛠️ Usage

### Running Locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/YourUsername/obsidian-daily-reports.git
   cd obsidian-daily-reports
   ```

2. **Set up Environment (Optional)**:
   It's recommended to set a `GITHUB_TOKEN` environment variable to increase GitHub API rate limits.

   - On Windows (PowerShell):
     ```powershell
     $env:GITHUB_TOKEN="your_token_here"
     ```
   - On Linux/macOS:
     ```bash
     export GITHUB_TOKEN="your_token_here"
     ```

3. **Run the Script**:
   ```bash
   python scripts/obsidian_fetcher.py
   ```
   The script will generate a JSON file in the `data/` folder named `obsidian_daily_YYYY-MM-DD.json`.

### GitHub Actions

The workflow is automatically scheduled to run every day. It will:

1. Fetch the data for the **previous day** (UTC).
2. Save the JSON report.
3. Automatically commit and push the new file to the repository.

## 📄 Output Format

The output JSON contains the following fields:

```json
{
  "date": "2026-01-08",
  "generated_at": "2026-01-09T00:00:00+00:00",
  "chinese_forum": [ ... ],
  "english_forum": [ ... ],
  "github_opened": [ ... ],
  "github_merged": [ ... ],
  "reddit": [ ... ]
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
