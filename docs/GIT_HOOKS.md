# 🪝 Git Hooks - Tự Động Kiểm Tra Code

Chỉ check những phần **QUAN TRỌNG** có thể làm build failed.

## 🚀 **Quick Setup**

```bash
# Setup hooks (chỉ chạy 1 lần)
npm run setup-hooks

# Test thủ công
npm run check-code
```

## ⚡ **Những Gì Được Kiểm Tra**

### ✅ **Pre-commit Hook** (khi `git commit`)

- **TypeScript compilation** - Có lỗi type không?
- **ESLint errors** - Có lỗi syntax không?
- **Production build** - Build được không?
- **Sensitive files** - Có commit .env, .key không?

### ✅ **Pre-push Hook** (khi `git push`)

- **Final build test** - Build lần cuối OK không?
- **Merge conflicts** - Có conflict markers không?
- **Remote connection** - Connect được remote không?

## 🛠️ **Commands**

```bash
# Kiểm tra thủ công (nhanh)
npm run check-code

# Skip hooks khi cần thiết
git commit --no-verify -m "message"
git push --no-verify
```

## 📊 **Output Example**

### ✅ **Success:**

```
🔍 Checking critical build requirements...
[✅ SUCCESS] TypeScript compilation ✅
[✅ SUCCESS] ESLint (errors only) ✅
[✅ SUCCESS] Production build ✅
🎉 ALL CRITICAL CHECKS PASSED!
🚀 Ready to commit and push!
```

### ❌ **Failed:**

```
[❌ ERROR] TypeScript compilation ❌
Error details:
src/page.tsx:45:12 - error TS2322: Type 'string' is not assignable to type 'number'
```

## 🎯 **Benefits**

- ⚡ **Nhanh** - Chỉ check những gì cần thiết
- 🛡️ **An toàn** - Không push code broken
- 🤖 **Tự động** - Không cần nhớ chạy manual
- 🚫 **Chặn lỗi** - Catch errors trước khi push

---

**💡 Tip: Luôn chạy `npm run check-code` trước khi commit để tránh bị hook chặn!**
