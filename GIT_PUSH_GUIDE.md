# 📦 Hướng dẫn Push lên Git

## ✅ Đã dọn dẹp xong

### Files đã xóa:

- ❌ `public/vercel.svg` - Default Next.js file
- ❌ `public/globe.svg` - Default Next.js file
- ❌ `public/file.svg` - Default Next.js file
- ❌ `public/window.svg` - Default Next.js file
- ❌ `public/next.svg` - Default Next.js file

### Files được bảo vệ (không push):

- ✅ `.env.local` - Chứa secrets
- ✅ `node_modules/` - Dependencies
- ✅ `.next/` - Build output
- ✅ `.DS_Store` - macOS files

---

## 🚀 Các bước Push lên Git

### 1. Kiểm tra status

```bash
cd quy-do-official
git status
```

### 2. Xem những file sẽ được commit

```bash
git add --dry-run .
```

### 3. Add tất cả files

```bash
git add .
```

### 4. Commit với message

```bash
git commit -m "feat: initial commit - media manager with S3 integration"
```

### 5. Tạo repository trên GitHub (nếu chưa có)

- Vào https://github.com/new
- Tạo repo mới: `quy-do-official`
- **KHÔNG** chọn "Initialize with README" (vì đã có rồi)

### 6. Link với remote repository

```bash
# Thay YOUR_USERNAME bằng GitHub username của bạn
git remote add origin https://github.com/YOUR_USERNAME/quy-do-official.git
```

### 7. Push lên GitHub

```bash
git branch -M main
git push -u origin main
```

---

## 🔍 Kiểm tra trước khi push

### Đảm bảo KHÔNG có file nhạy cảm:

```bash
# Kiểm tra xem .env.local có trong danh sách không
git ls-files | grep .env.local
# Kết quả phải RỖNG (không có output)

# Kiểm tra xem có secrets nào bị lộ không
git diff --cached | grep -i "secret\|password\|key"
# Nếu thấy gì đó, DỪNG LẠI và xóa nó
```

---

## ⚠️ Nếu đã push nhầm .env.local

### Xóa file khỏi Git (nhưng giữ local):

```bash
git rm --cached .env.local
git commit -m "chore: remove .env.local from git"
git push
```

### Xóa khỏi history (nếu đã push secrets):

```bash
# Cách 1: Dùng BFG Repo Cleaner (recommended)
brew install bfg
bfg --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Cách 2: Thay đổi tất cả secrets trong AWS/Google Console
# Rồi push lại code mới
```

---

## 📊 Sau khi push thành công

### Kiểm tra trên GitHub:

1. Vào repository: `https://github.com/YOUR_USERNAME/quy-do-official`
2. Xem files có đầy đủ không
3. Kiểm tra `.env.local` KHÔNG có trong repo
4. Xem README.md hiển thị đẹp không

### Tiếp theo: Deploy

Sau khi push xong, làm theo `DEPLOYMENT.md` để deploy lên Vercel.

---

## 🎯 Quick Commands

```bash
# Full workflow
cd quy-do-official
git status
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/YOUR_USERNAME/quy-do-official.git
git branch -M main
git push -u origin main
```

---

## 💡 Tips

### Commit messages tốt:

- `feat: add bulk download feature`
- `fix: resolve S3 CORS issue`
- `docs: update README with deployment guide`
- `chore: remove unused files`
- `refactor: improve media manager UI`

### Nếu cần update sau này:

```bash
git add .
git commit -m "feat: your message here"
git push
```

### Xem history:

```bash
git log --oneline
```

### Undo commit cuối (nếu chưa push):

```bash
git reset --soft HEAD~1
```

---

**Sẵn sàng push rồi! 🚀**
