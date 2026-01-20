import json
import os
import argparse
from pathlib import Path

def deduplicate_github_opened(data):
    """
    对 github_opened 数据去重，基于 (author, title) 组合
    """
    opened_prs = data.get('github_opened', [])
    if not opened_prs:
        return data, 0
    
    seen_submissions = set()
    deduplicated = []
    removed_count = 0
    
    for pr in opened_prs:
        author = pr.get('author')
        title = pr.get('title')
        submission_key = (author, title)
        
        if submission_key in seen_submissions:
            print(f"  ⚠️  Removing duplicate: {author} - {title}")
            removed_count += 1
            continue
        
        seen_submissions.add(submission_key)
        deduplicated.append(pr)
    
    data['github_opened'] = deduplicated
    return data, removed_count

def process_file(file_path, dry_run=False):
    """
    处理单个JSON文件
    """
    print(f"\n📄 Processing: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return False
    
    original_count = len(data.get('github_opened', []))
    print(f"  📊 Original opened PRs: {original_count}")
    
    data, removed_count = deduplicate_github_opened(data)
    new_count = len(data.get('github_opened', []))
    
    if removed_count > 0:
        print(f"  🔄 Removed {removed_count} duplicate(s)")
        print(f"  ✅ Final count: {new_count}")
        
        if not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
            print(f"  💾 File updated")
        else:
            print(f"  🔍 Dry run - no changes saved")
    else:
        print(f"  ✓ No duplicates found")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="Deduplicate GitHub PRs in existing JSON files")
    parser.add_argument("--date", help="Specific date YYYY-MM-DD to process", default=None)
    parser.add_argument("--all", action="store_true", help="Process all JSON files in data/daily/")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be removed without saving")
    args = parser.parse_args()
    
    # 获取数据目录
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / "data" / "daily"
    
    if not data_dir.exists():
        print(f"❌ Data directory not found: {data_dir}")
        return
    
    files_to_process = []
    
    if args.date:
        # 处理指定日期
        file_path = data_dir / f"{args.date}.json"
        if file_path.exists():
            files_to_process.append(file_path)
        else:
            print(f"❌ File not found: {file_path}")
            return
    elif args.all:
        # 处理所有JSON文件
        files_to_process = sorted(data_dir.glob("*.json"))
    else:
        print("❌ Please specify --date YYYY-MM-DD or --all")
        return
    
    if not files_to_process:
        print("❌ No files to process")
        return
    
    print(f"{'=' * 60}")
    print(f"🔧 Deduplication Tool for GitHub Opened PRs")
    print(f"{'=' * 60}")
    if args.dry_run:
        print(f"🔍 DRY RUN MODE - No files will be modified")
    print(f"📁 Data directory: {data_dir}")
    print(f"📋 Files to process: {len(files_to_process)}")
    
    total_removed = 0
    success_count = 0
    
    for file_path in files_to_process:
        if process_file(file_path, args.dry_run):
            success_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✅ Processed {success_count}/{len(files_to_process)} files successfully")
    if args.dry_run:
        print(f"🔍 This was a dry run - rerun without --dry-run to apply changes")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
