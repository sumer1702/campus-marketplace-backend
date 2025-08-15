# 🚀 Campus Marketplace Backend Deployment Guide

## Step 1: Prepare Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `dcpmarketplace` project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and rename it to `serviceAccountKey.json`
6. Place it in the `/backend` folder (for local testing)

## Step 2: Deploy to Railway

### Option A: Direct GitHub Deployment (Recommended)

1. **Push backend to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend deployment"
   git remote add origin https://github.com/yourusername/campus-marketplace-backend.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Visit [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your backend repository
   - Railway will auto-detect Node.js and deploy

### Option B: Railway CLI (Alternative)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd backend
   railway login
   railway init
   railway deploy
   ```

## Step 3: Configure Environment Variables

In Railway Dashboard, add these environment variables:

```env
NODE_ENV=production
FIREBASE_PROJECT_ID=dcpmarketplace
ALLOWED_DOMAINS=@email.iimcal.ac.in,@gmail.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"dcpmarketplace",...}
```

**Important:** Copy the entire contents of your `serviceAccountKey.json` file into the `FIREBASE_SERVICE_ACCOUNT` variable.

## Step 4: Update Frontend API Configuration

After Railway deployment, you'll get a URL like: `https://campus-marketplace-backend-production.up.railway.app`

Update `frontend/src/config/api.js`:

```javascript
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://your-railway-url.up.railway.app';
```

## Step 5: Test Deployment

1. **Health Check:** Visit `https://your-railway-url.up.railway.app/health`
2. **API Root:** Visit `https://your-railway-url.up.railway.app/`
3. **Test with Frontend:** Login and try creating a listing

## Troubleshooting

### Common Issues:

1. **Firebase Admin Error:**
   - Ensure `FIREBASE_SERVICE_ACCOUNT` is valid JSON
   - Check `FIREBASE_PROJECT_ID` matches your project

2. **CORS Error:**
   - Verify frontend URL is in CORS origins
   - Check `dcpmarketplace.web.app` is whitelisted

3. **Authentication Error:**
   - Ensure Firebase tokens are valid
   - Check email domain restrictions

### Railway Logs:
```bash
railway logs
```

## Cost Estimate

Railway offers:
- **Free Tier:** $0/month with some limitations
- **Pro Tier:** $5/month for production apps

Your backend should easily fit within free tier limits for a campus project.

## Security Notes

- Never commit `serviceAccountKey.json` to Git
- Use environment variables for all secrets
- Enable domain restrictions in production
- Monitor Railway usage and logs

🎉 **Your backend will be live and ready to serve your Firebase frontend!**
