#!/usr/bin/env python3
"""
压缩现有的 JSON 文件脚本
Compress existing JSON files to single-line format
"""
import os
import json
import argparse
from pathlib import Path


def compress_json_file(file_path: str, dry_run: bool = False) -> tuple[bool, int, int]:
    """
    压缩单个 JSON 文件
    
    Args:
        file_path: JSON 文件路径
        dry_run: 是否为演习模式（不实际修改文件）
        
    Returns:
        (成功标志, 原始大小, 新大小)
    """
    try:
        # 读取原始文件
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        old_size = os.path.getsize(file_path)
        
        if not dry_run:
            # 写入压缩格式
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
            
            new_size = os.path.getsize(file_path)
        else:
            # 演习模式：计算压缩后的大小但不写入
            import io
            buffer = io.StringIO()
            json.dump(data, buffer, ensure_ascii=False, separators=(',', ':'))
            new_size = len(buffer.getvalue().encode('utf-8'))
        
        return True, old_size, new_size
        
    except Exception as e:
        print(f"  ✗ 处理失败: {e}")
        return False, 0, 0


def compress_directory(directory: str, pattern: str = "*.json", dry_run: bool = False):
    """
    压缩目录下的所有 JSON 文件
    
    Args:
        directory: 目标目录
        pattern: 文件匹配模式
        dry_run: 是否为演习模式
    """
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"✗ 目录不存在: {directory}")
        return
    
    # 查找所有 JSON 文件
    json_files = sorted(dir_path.glob(pattern))
    
    if not json_files:
        print(f"✗ 未找到匹配的文件: {pattern}")
        return
    
    print(f"{'=' * 70}")
    print(f"{'【演习模式】' if dry_run else ''}压缩 JSON 文件")
    print(f"目录: {directory}")
    print(f"文件数: {len(json_files)}")
    print(f"{'=' * 70}\n")
    
    total_old_size = 0
    total_new_size = 0
    success_count = 0
    failed_count = 0
    
    for json_file in json_files:
        file_name = json_file.name
        print(f"处理: {file_name}")
        
        success, old_size, new_size = compress_json_file(str(json_file), dry_run)
        
        if success:
            success_count += 1
            total_old_size += old_size
            total_new_size += new_size
            reduction = ((old_size - new_size) / old_size * 100) if old_size > 0 else 0
            print(f"  ✓ {old_size:,} → {new_size:,} 字节 (减少 {reduction:.1f}%)")
        else:
            failed_count += 1
    
    # 统计摘要
    print(f"\n{'=' * 70}")
    print("压缩统计")
    print(f"{'=' * 70}")
    print(f"成功: {success_count} 文件")
    print(f"失败: {failed_count} 文件")
    print(f"总大小: {total_old_size:,} → {total_new_size:,} 字节")
    
    if total_old_size > 0:
        total_reduction = ((total_old_size - total_new_size) / total_old_size * 100)
        saved_kb = (total_old_size - total_new_size) / 1024
        print(f"总减少: {total_reduction:.2f}% ({saved_kb:.2f} KB)")
    
    print(f"{'=' * 70}")
    
    if dry_run:
        print("\n💡 这是演习模式，未实际修改文件")
        print("   移除 --dry-run 参数以执行实际压缩")


def main():
    parser = argparse.ArgumentParser(
        description="压缩现有的 JSON 文件为单行格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 演习模式（不修改文件）
  python compress_existing_json.py --dry-run
  
  # 压缩 daily 目录下的所有文件
  python compress_existing_json.py
  
  # 压缩 weekly 目录
  python compress_existing_json.py --dir ../data/weekly
  
  # 压缩特定文件
  python compress_existing_json.py --dir ../data/daily --pattern "2026-01-*.json"
        """
    )
    
    parser.add_argument(
        "--dir",
        default="../data/daily",
        help="目标目录 (默认: ../data/daily)"
    )
    
    parser.add_argument(
        "--pattern",
        default="*.json",
        help="文件匹配模式 (默认: *.json)"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="演习模式：显示将要做的更改但不实际修改文件"
    )
    
    args = parser.parse_args()
    
    # 执行压缩
    compress_directory(args.dir, args.pattern, args.dry_run)


if __name__ == "__main__":
    main()
