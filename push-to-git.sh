#!/bin/bash

# Script để push code lên Git một cách an toàn

echo "🔍 Kiểm tra Git status..."
git status

echo ""
echo "⚠️  QUAN TRỌNG: Kiểm tra không có file nhạy cảm..."
if git ls-files | grep -E "\.env\.local|\.env$" > /dev/null; then
    echo "❌ CẢNH BÁO: Phát hiện file .env trong Git!"
    echo "Chạy: git rm --cached .env.local"
    exit 1
fi

echo "✅ Không có file .env - An toàn!"

echo ""
echo "📦 Bạn muốn commit và push? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "💬 Nhập commit message:"
    read -r commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="chore: update code"
    fi
    
    echo ""
    echo "🚀 Đang commit và push..."
    git add .
    git commit -m "$commit_msg"
    
    # Kiểm tra xem đã có remote chưa
    if git remote | grep origin > /dev/null; then
        git push
    else
        echo ""
        echo "⚠️  Chưa có remote repository!"
        echo "Nhập GitHub repository URL (vd: https://github.com/username/quy-do-official.git):"
        read -r repo_url
        
        if [ ! -z "$repo_url" ]; then
            git remote add origin "$repo_url"
            git branch -M main
            git push -u origin main
        fi
    fi
    
    echo ""
    echo "✅ Hoàn thành!"
else
    echo "❌ Đã hủy"
fi
