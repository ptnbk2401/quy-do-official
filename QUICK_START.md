# 🚀 Quick Start Guide - Quỷ Đỏ Official

## 📋 Prerequisites

- Node.js 18+ installed
- Google Cloud account (for OAuth)
- AWS account (for S3)

## 🔧 Setup Steps

### 1. Install Dependencies (Already Done)

```bash
cd quy-do-official
npm install
```

### 2. Configure Google OAuth

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**

#### B. Update .env.local

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
ADMIN_EMAIL=your-email@gmail.com
```

### 3. Configure AWS S3

#### A. Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Bucket name: `quy-do-media-bucket` (or your choice)
4. Region: `ap-southeast-1` (or your choice)
5. **Block all public access**: ❌ UNCHECK (we need public read)
6. Create bucket

#### B. Configure Bucket Policy

1. Go to bucket → **Permissions** → **Bucket Policy**
2. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

#### C. Configure CORS

1. Go to bucket → **Permissions** → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

#### D. Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. **Users** → **Add user**
3. User name: `quy-do-uploader`
4. Access type: **Programmatic access**
5. Attach policy: **AmazonS3FullAccess** (or create custom policy)
6. Copy **Access Key ID** and **Secret Access Key**

#### E. Update .env.local

```env
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=quy-do-media-bucket

NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=quy-do-media-bucket
```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output to `.env.local`:

```env
NEXTAUTH_SECRET=your-generated-secret-here
```

### 5. Final .env.local Check

Your `.env.local` should look like:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz...

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
ADMIN_EMAIL=your-email@gmail.com

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_S3_BUCKET_NAME=quy-do-media-bucket

# Public
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=quy-do-media-bucket
```

## 🎯 Run the Project

### Development Mode

```bash
npm run dev
```

Open: http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## 🧪 Test the Features

### 1. Test Landing Page

- Go to http://localhost:3000
- Should see hero animation
- Click "Khám Phá Ngay" → Gallery

### 2. Test Gallery

- Go to http://localhost:3000/gallery
- Should see empty state (no media yet)
- Filters should work

### 3. Test Login

- Go to http://localhost:3000/(auth)/login
- Click "Đăng nhập bằng Google"
- Login with your admin email
- Should redirect to dashboard

### 4. Test Upload

- After login, go to http://localhost:3000/admin/upload
- Select an image or video
- Should upload to S3
- Check S3 bucket to verify

### 5. Test Gallery with Media

- Go back to gallery
- Should see uploaded media
- Click to preview
- Test download and share

## 🐛 Troubleshooting

### Issue: "Unauthorized" when uploading

**Solution**:

- Check if logged in with correct admin email
- Verify `ADMIN_EMAIL` in `.env.local`
- Check NextAuth configuration

### Issue: Images not loading in gallery

**Solution**:

- Verify S3 bucket policy allows public read
- Check CORS configuration
- Verify `NEXT_PUBLIC_*` env vars are set
- Restart dev server after changing env vars

### Issue: Upload fails

**Solution**:

- Check AWS credentials in `.env.local`
- Verify IAM user has S3 permissions
- Check S3 CORS configuration
- Check browser console for errors

### Issue: "Invalid redirect URI" on Google login

**Solution**:

- Add `http://localhost:3000/api/auth/callback/google` to Google OAuth settings
- Make sure `NEXTAUTH_URL` is correct

### Issue: Build errors

**Solution**:

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📚 Next Steps

After successful setup:

1. **Upload some test media**

   - Images: JPG, PNG, GIF
   - Videos: MP4, MOV

2. **Test all features**

   - Upload
   - Gallery
   - Preview
   - Download
   - Share

3. **Customize**

   - Update colors in `globals.css`
   - Add your logo
   - Customize text

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Configure production env vars

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [Framer Motion Docs](https://www.framer.com/motion/)

## 💡 Tips

1. **Development**: Use `npm run dev` for hot reload
2. **Environment**: Restart server after changing `.env.local`
3. **S3 Costs**: Monitor S3 usage to avoid unexpected charges
4. **Security**: Never commit `.env.local` to git
5. **Testing**: Test with small files first

---

**Need help?** Check `IMPLEMENTATION_LOG.md` for technical details or `NEXT_STEPS.md` for roadmap.

**Glory Glory Man United! 🔴⚫**
