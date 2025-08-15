# 📋 Deployment Checklist for Campus Marketplace Backend

## Pre-Deployment Checklist

### ✅ Files Ready for Upload
- [ ] `server.js` - Main server file (✅ Ready)
- [ ] `package.json` - Dependencies and scripts (✅ Ready)
- [ ] `firebaseAdmin.js` - Firebase configuration (✅ Ready)
- [ ] `.env.example` - Environment template (✅ Ready)
- [ ] `railway.json` - Railway configuration (✅ Ready)
- [ ] `README.md` - Repository documentation (✅ Ready)
- [ ] `QUICK_DEPLOY.md` - 5-minute deployment guide (✅ Ready)
- [ ] `DEPLOYMENT.md` - Comprehensive guide (✅ Ready)
- [ ] `GITHUB_SETUP.md` - Repository setup guide (✅ Ready)
- [ ] `test-api.js` - API testing script (✅ Ready)

### ✅ Folder Structure
- [ ] `middleware/firebaseAuth.js` - Authentication middleware (✅ Ready)
- [ ] `routes/listings.js` - Listings API (✅ Ready)
- [ ] `routes/auth.js` - Auth routes (✅ Ready)
- [ ] `routes/admin.js` - Admin routes (✅ Ready)
- [ ] `routes/forum.js` - Forum placeholder (✅ Ready)
- [ ] `routes/time-exchange.js` - Time exchange placeholder (✅ Ready)
- [ ] `models/Listing.js` - Data models (✅ Ready)

### ❌ Files to EXCLUDE from GitHub
- [ ] `node_modules/` - Dependencies (exclude - too large)
- [ ] `serviceAccountKey.json` - Firebase private key (exclude - security)
- [ ] `.env` - Local environment file (exclude - contains secrets)
- [ ] `package-lock.json` - Lock file (exclude - auto-generated)

## Deployment Steps

### 1. GitHub Repository Setup
- [ ] Go to github.com and create new repository
- [ ] Name: `campus-marketplace-backend`
- [ ] Upload all ✅ files listed above
- [ ] Copy repository URL

### 2. Railway Deployment
- [ ] Go to railway.app and login
- [ ] Create new project from GitHub
- [ ] Select your `campus-marketplace-backend` repository
- [ ] Wait for initial build

### 3. Environment Variables Setup
Set these in Railway dashboard → Variables:
- [ ] `NODE_ENV=production`
- [ ] `FIREBASE_PROJECT_ID=dcpmarketplace`
- [ ] `ALLOWED_DOMAINS=@email.iimcal.ac.in,@gmail.com`
- [ ] `FIREBASE_SERVICE_ACCOUNT=` (paste full JSON from Firebase Console)

### 4. Verify Deployment
- [ ] Check Railway deployment logs
- [ ] Test health endpoint: `https://your-url.up.railway.app/health`
- [ ] Verify API root: `https://your-url.up.railway.app/`

### 5. Update Frontend
- [ ] Copy Railway URL from dashboard
- [ ] Update `frontend/src/config/api.js`
- [ ] Run `firebase deploy --only hosting`

### 6. End-to-End Testing
- [ ] Visit https://dcpmarketplace.web.app
- [ ] Login with Firebase Auth
- [ ] Create a test listing
- [ ] Verify listing appears in grid
- [ ] Test interest functionality

## 🚨 Security Reminders

- [ ] Never commit `serviceAccountKey.json` to GitHub
- [ ] Keep `.env` files local only
- [ ] Use environment variables for all secrets
- [ ] Verify CORS origins include your frontend URL

## 🆘 Troubleshooting

### If Railway build fails:
1. Check build logs in Railway dashboard
2. Verify `package.json` has correct start script
3. Ensure no syntax errors in code

### If API calls fail:
1. Check Railway application logs
2. Verify environment variables are set correctly
3. Test health endpoint manually

### If authentication fails:
1. Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
2. Check `FIREBASE_PROJECT_ID` matches your project
3. Ensure frontend is sending proper Bearer tokens

---

## ✅ Success Criteria

Your deployment is successful when:
- [ ] Railway build completes without errors
- [ ] Health check returns 200 status
- [ ] Frontend can create and view listings
- [ ] Authentication works end-to-end
- [ ] No CORS errors in browser console

## 🎉 Completion

Once all checklist items are complete, your Campus Marketplace will be fully functional with:
- Frontend hosted on Firebase
- Backend deployed on Railway
- Full authentication and CRUD operations
- Modern UI with all Phase 1 enhancements

**Estimated Total Time: 15-20 minutes**
