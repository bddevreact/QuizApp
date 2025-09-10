# 🚀 Netlify Deployment Guide

## 📋 **Deployment Steps**

### **1. Prepare for Deployment**
```bash
# Build the project
npm run build

# Check if dist folder is created
ls dist/
```

### **2. Deploy to Netlify**

#### **Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Login to your account
3. Drag the `dist` folder to the deploy area
4. Your app will be live instantly!

#### **Option B: Git Integration (Recommended)**
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### **3. Configure Domain**
1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Update DNS settings
4. Enable HTTPS (automatic)

### **4. Environment Variables**
Set these in Netlify Dashboard → Site Settings → Environment Variables:

```env
NODE_ENV=production
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_ADMIN_USERNAME=your_admin_username
VITE_ADMIN_PASSWORD=your_admin_password
```

### **5. Telegram Bot Setup**
1. Create a Telegram Bot via [@BotFather](https://t.me/botfather)
2. Set your Netlify domain as the webhook URL
3. Configure Mini App settings
4. Test the integration

## 🔧 **Files Created for Netlify**

### **`netlify.toml`**
- Build configuration
- Redirect rules for SPA routing
- Security headers
- Cache settings

### **`public/_redirects`**
- Fallback redirects for all routes
- Ensures React Router works properly

### **`public/manifest.json`**
- PWA configuration
- App metadata
- Icon settings

### **`public/robots.txt`**
- SEO configuration
- Search engine directives

### **`public/sitemap.xml`**
- SEO sitemap
- Page indexing

## ✅ **Post-Deployment Checklist**

- [ ] App loads correctly
- [ ] All routes work (/, /quiz, /tournaments, /earn, /profile)
- [ ] Admin panel accessible at /admin
- [ ] Firebase connection working
- [ ] Telegram WebApp integration working
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured

## 🐛 **Troubleshooting**

### **404 Errors on Refresh**
- Ensure `_redirects` file is in `public/` folder
- Check `netlify.toml` redirect rules

### **Build Failures**
- Check Node.js version (use 18)
- Verify all dependencies in package.json
- Check build logs in Netlify dashboard

### **Firebase Issues**
- Verify environment variables
- Check Firebase project settings
- Ensure Firestore rules are configured

### **Telegram Integration Issues**
- Verify domain is HTTPS
- Check Telegram WebApp script loading
- Test in Telegram app

## 📱 **Testing**

### **Local Testing**
```bash
# Test production build locally
npm run build
npm run preview
```

### **Production Testing**
1. Test all user flows
2. Verify admin panel functionality
3. Check mobile responsiveness
4. Test Telegram integration
5. Verify Firebase operations

## 🚀 **Performance Optimization**

### **Bundle Size**
- Current bundle: ~1MB
- Consider code splitting for larger apps
- Enable gzip compression (automatic on Netlify)

### **Caching**
- Static assets cached for 1 year
- HTML files cached for 1 hour
- API responses cached as needed

## 🔒 **Security**

### **Headers Applied**
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### **Admin Protection**
- Admin routes protected
- Environment variables for credentials
- Firebase security rules

## 📊 **Analytics & Monitoring**

### **Netlify Analytics**
- Enable in Site Settings
- Track page views and performance
- Monitor build times

### **Firebase Analytics**
- Already integrated
- Track user behavior
- Monitor app performance

## 🎯 **Final Steps**

1. **Deploy to Netlify** ✅
2. **Configure domain** ✅
3. **Set environment variables** ✅
4. **Test all features** ✅
5. **Configure Telegram Bot** ✅
6. **Go Live!** 🚀

Your Crypto Quiz app is now ready for production! 🎉
