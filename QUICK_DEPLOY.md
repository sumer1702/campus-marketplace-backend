# 🚀 IMMEDIATE DEPLOYMENT STEPS FOR RAILWAY

## Quick Deploy to Railway (5 minutes)

### Step 1: Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/dcpmarketplace/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. **IMPORTANT:** Copy the entire JSON content (you'll paste it in Railway)

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Choose "Deploy from GitHub" or "Empty Project"

#### Option A: GitHub Deploy (Recommended)
- Connect your GitHub account
- Create a new repo with just the `/backend` folder contents
- Select that repo in Railway

#### Option B: Direct Deploy
- Choose "Empty Project"
- In Railway dashboard, go to "Settings" → "Source"
- Connect to GitHub or upload files directly

### Step 3: Set Environment Variables in Railway
In Railway dashboard → Your Project → Variables, add:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=dcpmarketplace
ALLOWED_DOMAINS=@email.iimcal.ac.in,@gmail.com
FIREBASE_SERVICE_ACCOUNT=paste_entire_json_here
```

**For FIREBASE_SERVICE_ACCOUNT:** Paste the entire JSON from step 1, including all quotes and braces.

### Step 4: Deploy
Railway will automatically deploy. Wait for the build to complete.

### Step 5: Get Your Backend URL
Railway will provide a URL like: `https://something-production.up.railway.app`

### Step 6: Update Frontend
Update this file: `frontend/src/config/api.js`

```javascript
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://YOUR_RAILWAY_URL_HERE.up.railway.app';
```

### Step 7: Redeploy Frontend
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### Step 8: Test Everything
1. Visit your Firebase frontend: `https://dcpmarketplace.web.app`
2. Login with Firebase Auth
3. Try creating a listing
4. Check if it appears in the grid

## Troubleshooting

### If Railway build fails:
- Check the build logs in Railway dashboard
- Ensure `package.json` has correct start script
- Verify all environment variables are set

### If API calls fail:
- Check Railway logs for errors
- Verify FIREBASE_SERVICE_ACCOUNT is valid JSON
- Test health check: `https://your-url.up.railway.app/health`

### If authentication fails:
- Verify Firebase project ID is correct
- Check that frontend is sending proper Bearer tokens
- Ensure email domain restrictions are correct

## 🎯 Success Checklist
- [ ] Railway deployment successful
- [ ] Health check responds: `/health`
- [ ] Environment variables set correctly
- [ ] Frontend updated with Railway URL
- [ ] Frontend redeployed
- [ ] End-to-end testing complete

🎉 **Your Campus Marketplace will be fully functional!**
