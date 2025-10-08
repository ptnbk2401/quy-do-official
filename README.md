# 🔴⚫ Quỷ Đỏ Official - Media Manager

> Professional media management system for Manchester United fans with category organization, bulk operations, and embed support.

## ✨ Key Features

- ✅ **Category System** - Organize media by players, matches, events
- ✅ **Multiple Upload** - Upload nhiều files cùng lúc
- ✅ **Bulk Operations** - Download as ZIP, bulk delete
- ✅ **Embed Support** - YouTube & TikTok videos
- ✅ **Advanced Filters** - Filter by type & category
- ✅ **Admin Dashboard** - Full media management
- ✅ **Google OAuth** - Secure authentication
- ✅ **News System** - Markdown-based news articles with SEO optimization

## 🚀 Quick Start

```bash
cd quy-do-official
npm install
npm run dev
```

Open: http://localhost:3000

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list & roadmap
- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup guide

## 🎯 Main Pages

| Route              | Description                 |
| ------------------ | --------------------------- |
| `/`                | Landing page                |
| `/gallery`         | Public gallery with filters |
| `/login`           | Google OAuth login          |
| `/admin/dashboard` | Admin dashboard             |
| `/admin/upload`    | Upload with categories      |
| `/admin/media`     | Media manager (bulk ops)    |
| `/news`            | News articles list          |
| `/news/[slug]`     | Individual news article     |

## 🔧 Configuration

Create `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
ADMIN_EMAIL=your-email@gmail.com

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=quydo-official-media
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=quydo-official-media
```

See [QUICK_START.md](./QUICK_START.md) for detailed setup.

## 📰 News System

The news system uses markdown files for content management, providing a simple yet powerful way to publish articles.

### Content Structure

```
content/news/
├── 2025-10-08-clb-chien-thang-dam.md
├── 2025-10-10-lich-thi-dau-moi.md
└── 2025-10-12-tuyen-thu-moi.md
```

### Markdown Format

```markdown
---
title: "Article Title"
date: "2025-10-08"
author: "Author Name"
description: "Brief description for SEO"
thumbnail: "/images/news/thumbnail.jpg"
tags: ["tag1", "tag2", "tag3"]
---

Article content in Markdown format...

## Headings

- Lists
- **Bold text**
- _Italic text_

![Image](path/to/image.jpg)
```

### Publishing Workflow

1. **Create** markdown file in `content/news/`
2. **Add** front-matter metadata (title, date, author, etc.)
3. **Write** content in Markdown format
4. **Commit & Push** to Git repository
5. **Auto-deploy** via CI/CD (Vercel/Netlify)

### Features

- ✅ **SEO Optimized** - Meta tags, Open Graph, Twitter Cards
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Related Articles** - Automatic related content suggestions
- ✅ **Fast Loading** - Static generation at build time
- ✅ **No Database** - File-based content management

## 📁 S3 Structure

```
quydo-official-media/
├── bruno/
│   ├── 1234567890-goal.jpg
│   └── 1234567891-celebration.mp4
├── ronaldo/
│   └── 1234567892-freekick.jpg
└── matches/
    └── 1234567893-highlight.mp4
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Auth:** NextAuth.js
- **Storage:** AWS S3
- **Utilities:** JSZip, React Image Crop

## 📊 Feature Status

### ✅ Completed (53%)

- Authentication & Authorization
- Category System
- Multiple File Upload
- Embed Management (YouTube/TikTok)
- Gallery with Filters
- Admin Media Manager
- Bulk Operations (Download ZIP, Delete)
- News System (Markdown-based)
- UI/UX with ManUtd Theme

### ⏳ Pending (47%)

- Video Processing (preview, thumbnail)
- Image Processing (crop, resize)
- Advanced Organization (drag & drop, move files)
- Metadata & Tags
- AI Features
- Analytics
- Collaboration Features

See [FEATURES.md](./FEATURES.md) for complete list.

## 🎨 Design System

**Colors (ManUtd Theme):**

- Primary Red: `#DA291C`
- Accent Yellow: `#FBE122`
- Background: `#000000`
- Card: `#1C1C1C`

## 🧪 Testing

### Test Upload

```
1. Login → /admin/upload
2. Select category "bruno"
3. Choose 5 files (Ctrl+Click)
4. Upload → See progress
5. Success notification
```

### Test Bulk Download

```
1. Login → /admin/media
2. Check 10 files
3. Click "Tải ZIP (10 files)"
4. Download media-xxx.zip
5. Extract → See all files
```

### Test Gallery Filter

```
1. Go to /gallery
2. Filter by "Bruno" category
3. Filter by "Images" type
4. Search "goal"
5. Click to view modal
```

## 🐛 Troubleshooting

### Clear cache

```bash
rm -rf .next
npm run dev
```

### Check environment

Make sure `.env.local` exists and has correct values.

### Restart server

After changing `.env.local`, restart the dev server.

## 📄 License

MIT License

---

**Glory Glory Man United! 🔴⚫**

For detailed features and roadmap, see [FEATURES.md](./FEATURES.md)
