# 🚀 Hướng dẫn Deploy Production

## ✅ Pre-deployment Checklist

### 1. Environment Variables

Chuẩn bị các biến môi trường sau cho production:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-strong-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
ADMIN_EMAIL=<your-admin-email>

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_S3_BUCKET_NAME=quydo-official-media

# Public vars
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=quydo-official-media
```

### 2. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Update Google OAuth

- Vào [Google Cloud Console](https://console.cloud.google.com)
- Thêm production URL vào Authorized redirect URIs:
  - `https://your-domain.com/api/auth/callback/google`
- Thêm vào Authorized JavaScript origins:
  - `https://your-domain.com`

### 4. AWS S3 CORS Configuration

Đảm bảo S3 bucket có CORS config cho production domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 🎯 Option 1: Deploy với Vercel (Recommended)

### Bước 1: Push code lên GitHub

```bash
cd quy-do-official
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Bước 2: Deploy trên Vercel

1. Vào [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `quy-do-official`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Bước 3: Add Environment Variables

Trong Vercel dashboard → Settings → Environment Variables, thêm tất cả biến từ checklist trên.

### Bước 4: Deploy

- Click "Deploy"
- Vercel sẽ tự động build và deploy
- Nhận được URL: `https://your-project.vercel.app`

### Bước 5: Custom Domain (Optional)

- Settings → Domains
- Add your custom domain
- Update DNS records theo hướng dẫn

---

## 🎯 Option 2: Deploy với AWS Amplify

### Bước 1: Push code lên GitHub

```bash
cd quy-do-official
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Bước 2: Setup AWS Amplify

1. Vào [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd quy-do-official
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: quy-do-official/.next
    files:
      - "**/*"
  cache:
    paths:
      - quy-do-official/node_modules/**/*
```

### Bước 3: Add Environment Variables

Trong Amplify Console → Environment variables, thêm tất cả biến.

### Bước 4: Deploy

- Save and deploy
- AWS sẽ tự động build và deploy

---

## 🎯 Option 3: Deploy với Docker + VPS

### Bước 1: Tạo Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY quy-do-official/package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY quy-do-official/ .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Bước 2: Update next.config.ts

```typescript
const nextConfig = {
  output: "standalone",
  // ... existing config
};
```

### Bước 3: Build và Run

```bash
docker build -t quydo-official .
docker run -p 3000:3000 --env-file .env.production quydo-official
```

---

## 🎯 Option 4: Deploy với Railway

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### Bước 2: Deploy trên Railway

1. Vào [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select repository
4. Railway tự động detect Next.js

### Bước 3: Configure

- Root Directory: `quy-do-official`
- Build Command: `npm run build`
- Start Command: `npm start`

### Bước 4: Add Environment Variables

Settings → Variables → Add all environment variables

---

## 📊 Post-Deployment Checklist

### 1. Test Core Features

- [ ] Login với Google OAuth
- [ ] Upload media files
- [ ] View gallery
- [ ] Download ZIP
- [ ] Delete files
- [ ] Add embeds

### 2. Performance Check

- [ ] Run Lighthouse audit
- [ ] Check loading times
- [ ] Test on mobile devices

### 3. Security Check

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] S3 bucket permissions correct
- [ ] Admin access restricted

### 4. Monitoring Setup

- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics (Google Analytics)
- [ ] Setup uptime monitoring

---

## 🐛 Common Issues

### Issue: Google OAuth không hoạt động

**Solution:** Kiểm tra lại Authorized redirect URIs trong Google Cloud Console

### Issue: S3 upload fails với CORS error

**Solution:** Update S3 CORS config với production domain

### Issue: Build fails

**Solution:**

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment variables không load

**Solution:** Restart deployment sau khi thêm env vars

---

## 📈 Scaling Considerations

### Khi traffic tăng:

1. **CDN**: Dùng CloudFront cho S3 assets
2. **Database**: Thêm database cho metadata (PostgreSQL/MongoDB)
3. **Caching**: Redis cho session và cache
4. **Image Optimization**: CloudFlare Images hoặc imgix

---

## 💰 Cost Estimation

### Vercel (Recommended for start)

- Free tier: Đủ cho small-medium traffic
- Pro: $20/month nếu cần nhiều hơn

### AWS S3 Storage

- ~$0.023/GB/month
- Transfer: ~$0.09/GB
- Estimate: $5-20/month tùy usage

### Total: $0-40/month để bắt đầu

---

**Bạn muốn deploy với platform nào? Tôi sẽ hướng dẫn chi tiết hơn!** 🚀
