# 🪝 Git Hooks Setup

Tự động kiểm tra code quality trước khi commit và push.

## 🚀 **Quick Setup**

```bash
# Setup hooks (chỉ chạy 1 lần)
npm run setup-hooks

# Test hooks
npm run check-code
```

## 📋 **Các Hook Đã Cài Đặt**

### 1. **Pre-commit Hook**

Tự động chạy khi `git commit`:

✅ **Kiểm tra:**

- TypeScript compilation
- ESLint rules
- Production build
- Sensitive files (.env, keys)
- Large files (>10MB)
- TODO/FIXME comments
- package.json consistency

❌ **Chặn commit nếu:**

- TypeScript errors
- ESLint errors
- Build fails
- Sensitive files trong staging
- Large files không phù hợp

### 2. **Pre-push Hook**

Tự động chạy khi `git push`:

✅ **Kiểm tra:**

- Comprehensive build test
- Merge conflict markers
- Tests (nếu có)
- Bundle size analysis
- Secret scanning
- Remote connectivity

❌ **Chặn push nếu:**

- Build fails
- Merge conflicts
- Tests fail
- Cannot connect to remote

## 🛠️ **Manual Commands**

```bash
# Kiểm tra toàn diện
npm run check-code

# Chỉ kiểm tra TypeScript
npx tsc --noEmit

# Chỉ kiểm tra ESLint
npm run lint

# Chỉ kiểm tra build
npm run build

# Test các API endpoints
npm run test-urls
npm run test-s3-access
npm run test-homepage-refresh
```

## 🔧 **Customization**

### Tắt hooks tạm thời:

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

### Sửa đổi hooks:

```bash
# Edit pre-commit
nano .git/hooks/pre-commit

# Edit pre-push
nano .git/hooks/pre-push

# Make executable after editing
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

### Thêm kiểm tra mới:

Sửa file `scripts/check-code.sh` để thêm các kiểm tra tùy chỉnh.

## 📊 **Output Examples**

### ✅ **Successful Check:**

```
🔍 Running pre-commit checks...
[SUCCESS] TypeScript compilation passed
[SUCCESS] ESLint passed
[SUCCESS] Production build successful
[SUCCESS] No sensitive files detected
[SUCCESS] No large files detected
All pre-commit checks passed! ✨
Ready to commit! 🚀
```

### ❌ **Failed Check:**

```
🔍 Running pre-commit checks...
[ERROR] TypeScript compilation failed
src/components/Button.tsx:15:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

## 🎯 **Best Practices**

1. **Luôn chạy `npm run check-code` trước khi commit**
2. **Fix tất cả TypeScript errors**
3. **Resolve ESLint warnings**
4. **Không commit sensitive files**
5. **Keep bundle size reasonable**
6. **Write meaningful commit messages**

## 🆘 **Troubleshooting**

### Hook không chạy?

```bash
# Check permissions
ls -la .git/hooks/

# Fix permissions
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

### Build fails trong hook?

```bash
# Test build manually
npm run build

# Check for missing dependencies
npm install

# Clear cache
rm -rf .next node_modules package-lock.json
npm install
```

### ESLint errors?

```bash
# Auto-fix what's possible
npm run lint -- --fix

# Check specific files
npx eslint src/components/Button.tsx
```

---

**🎉 Với setup này, code quality sẽ được đảm bảo tự động!**
