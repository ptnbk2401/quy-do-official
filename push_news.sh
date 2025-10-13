#!/bin/bash

# Lấy thời gian hiện tại (định dạng: YYYY-MM-DD HH:MM)
current_time=$(date "+%Y-%m-%d %H:%M")

# Thêm các thư mục cần push
git add content/news
git add public/images/news

# Commit với message có timestamp
git commit -m "Add: news ${current_time}"

# Push lên branch hiện tại
git push

