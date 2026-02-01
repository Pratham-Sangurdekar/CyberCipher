# Merchant Portal - Vercel Deployment Guide

## Deployment Instructions

### Option 1: Deploy from Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository: `Pratham-Sangurdekar/CyberCipher`
3. **Important**: Set the **Root Directory** to `merchant`
4. Framework Preset will auto-detect as **Vite**
5. Build settings (auto-configured):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click **Deploy**

### Option 2: Deploy using Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to merchant directory
cd merchant

# Deploy
vercel

# For production deployment
vercel --prod
```

## Monorepo Configuration

Since this is part of a monorepo, make sure to:
- Set **Root Directory** to `merchant` in Vercel project settings
- The `vercel.json` file is already configured for you

## Build Verification

Test the build locally before deploying:
```bash
cd merchant
npm install
npm run build
npm run preview
```

## Common Issues

### Issue: Vercel can't find package.json
**Solution**: Make sure Root Directory is set to `merchant`

### Issue: Build fails
**Solution**: 
1. Check that `node_modules` is installed: `npm install`
2. Verify build works locally: `npm run build`

### Issue: Environment variables not working
**Solution**: Add environment variables in Vercel Dashboard → Settings → Environment Variables

## Environment Variables (if needed)

If your merchant portal needs to connect to the backend:

```env
VITE_BACKEND_URL=https://your-backend-url.com
```

Add these in Vercel Dashboard → Project Settings → Environment Variables
