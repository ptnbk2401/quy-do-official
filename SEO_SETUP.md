# 📊 SEO & Analytics Setup Guide

## ✅ Đã có sẵn

### 1. SEO Cơ bản

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph (Facebook sharing)
- ✅ Twitter Cards
- ✅ Canonical URLs
- ✅ Robots.txt
- ✅ Sitemap.xml (auto-generated)
- ✅ Structured Data (JSON-LD)
- ✅ PWA Manifest

---

## 🚀 Setup Analytics (Optional)

### 1. Google Analytics

#### Bước 1: Tạo GA4 Property

1. Vào https://analytics.google.com
2. Admin → Create Property
3. Chọn "Web" platform
4. Copy **Measurement ID** (dạng: `G-XXXXXXXXXX`)

#### Bước 2: Add vào Vercel

```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_GA_ID=G-GN4FGL7HXK
```

#### Bước 3: Redeploy

Vercel sẽ tự động redeploy và GA sẽ hoạt động.

---

### 2. Facebook Pixel

#### Bước 1: Tạo Pixel

1. Vào https://business.facebook.com
2. Events Manager → Create Pixel
3. Copy **Pixel ID** (dạng: `123456789012345`)

#### Bước 2: Add vào Vercel

```bash
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345
```

#### Bước 3: Redeploy

---

### 3. Google Search Console

#### Bước 1: Verify Domain

1. Vào https://search.google.com/search-console
2. Add property: `https://quydo.vn`
3. Chọn "HTML tag" method
4. Copy verification code (dạng: `abc123xyz...`)

#### Bước 2: Add vào Vercel

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123xyz...
```

#### Bước 3: Redeploy và verify

#### Bước 4: Submit Sitemap

Trong Search Console, submit sitemap:

```
https://quydo.vn/sitemap.xml
```

---

## 📈 Monitoring & Reports

### Google Analytics

- **Real-time**: Xem visitors hiện tại
- **Acquisition**: Nguồn traffic (Google, Facebook, Direct)
- **Engagement**: Pages viewed, time on site
- **Events**: Track button clicks, video plays

### Facebook Pixel

- **Events**: PageView, ViewContent
- **Audiences**: Retargeting campaigns
- **Conversions**: Track goals

### Google Search Console

- **Performance**: Clicks, impressions, CTR
- **Coverage**: Indexed pages, errors
- **Enhancements**: Mobile usability, Core Web Vitals

---

## 🎯 SEO Best Practices

### 1. Content

- ✅ Unique titles cho mỗi page
- ✅ Descriptions 150-160 characters
- ✅ Alt text cho images
- ✅ Structured data

### 2. Performance

- ✅ Image optimization (Next.js Image)
- ✅ Lazy loading
- ✅ Code splitting
- ⚠️ Consider CDN for S3 assets

### 3. Mobile

- ✅ Responsive design
- ✅ Touch-friendly buttons
- ✅ Fast loading

### 4. Links

- ✅ Internal linking
- ✅ Canonical URLs
- ✅ Sitemap

---

## 🔍 Testing Tools

### 1. Google PageSpeed Insights

```
https://pagespeed.web.dev/
```

Test: https://quydo.vn

### 2. Google Rich Results Test

```
https://search.google.com/test/rich-results
```

Test structured data

### 3. Facebook Sharing Debugger

```
https://developers.facebook.com/tools/debug/
```

Test Open Graph tags

### 4. Twitter Card Validator

```
https://cards-dev.twitter.com/validator
```

Test Twitter Cards

---

## 📊 Expected Results

### Week 1-2

- Google starts indexing pages
- Analytics tracking works
- Search Console shows data

### Month 1

- Appear in search results
- Track user behavior
- Identify top pages

### Month 3+

- Improve rankings
- Optimize based on data
- Grow organic traffic

---

## 💡 Tips

### Improve Rankings

1. **Content**: Add more media regularly
2. **Keywords**: Use "Manchester United", "MU", "Quỷ Đỏ"
3. **Social**: Share on Facebook, TikTok
4. **Backlinks**: Get links from fan sites

### Track Success

- Monitor Search Console weekly
- Check GA daily for first month
- Set up goals/events
- A/B test CTAs

---

## 🚨 Troubleshooting

### Analytics not working?

- Check env vars in Vercel
- Clear browser cache
- Use incognito mode
- Check browser console for errors

### Not indexed by Google?

- Submit sitemap in Search Console
- Check robots.txt allows crawling
- Wait 1-2 weeks
- Request indexing manually

### Low traffic?

- Share on social media
- Post regularly
- Engage with community
- Optimize titles/descriptions

---

**Setup hoàn tất! 🎉**

Chỉ cần add 3 env vars vào Vercel là xong:

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_FB_PIXEL_ID`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
