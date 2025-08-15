# 📂 GitHub Repository Setup Guide

Since Git is not installed on your system, here's how to create and upload the backend to GitHub manually:

## Method 1: GitHub Web Interface (Easiest)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and login
2. Click the **"+"** button in top right → **"New repository"**
3. Repository name: `campus-marketplace-backend`
4. Description: `Backend API for Campus Marketplace - Node.js + Express + Firebase`
5. Set to **Public** (or Private if you prefer)
6. ✅ Check **"Add a README file"**
7. ✅ Check **"Add .gitignore"** → Choose **"Node"**
8. Click **"Create repository"**

### Step 2: Upload Backend Files
1. In your new repository, click **"uploading an existing file"**
2. Drag and drop these files from your backend folder:

**✅ Files to Upload:**
```
├── server.js
├── package.json
├── firebaseAdmin.js
├── .env.example
├── railway.json
├── QUICK_DEPLOY.md
├── DEPLOYMENT.md
├── README.md
├── test-api.js
├── middleware/firebaseAuth.js
├── routes/listings.js
├── routes/auth.js
├── routes/admin.js
├── routes/forum.js
├── routes/time-exchange.js
└── models/Listing.js
```

**❌ DO NOT Upload:**
```
├── node_modules/          # Too large, installed via npm
├── serviceAccountKey.json  # Security risk - keep private
├── .env                   # Contains secrets
└── package-lock.json      # Generated automatically
```

### Step 3: Commit Files
1. Scroll down to **"Commit changes"**
2. Title: `Initial backend deployment setup`
3. Description: `Added Node.js backend with Firebase Admin SDK for Railway deployment`
4. Click **"Commit changes"**

## Method 2: Install Git and Use Command Line

If you want to install Git for future use:

### Install Git
1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Install with default settings
3. Restart your terminal

### Then run these commands:
```bash
cd backend
git init
git add .
git commit -m "Initial backend deployment setup"
git remote add origin https://github.com/yourusername/campus-marketplace-backend.git
git branch -M main
git push -u origin main
```

## Method 3: GitHub Desktop (Visual Interface)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Login to your GitHub account
3. Create new repository: `campus-marketplace-backend`
4. Choose your backend folder as the local path
5. Publish to GitHub

---

## ✅ Next Steps After Repository Creation

1. **Copy Repository URL** (will look like: `https://github.com/yourusername/campus-marketplace-backend`)
2. **Go to Railway.app**
3. **Deploy from GitHub** using your new repository
4. **Set environment variables** in Railway dashboard
5. **Update frontend** with your Railway URL

## 🎯 Repository URL Format
Your repository will be available at:
```
https://github.com/YOUR_USERNAME/campus-marketplace-backend
```

Use this URL in Railway for deployment!

---

**📝 Note:** Method 1 (Web Interface) is the quickest and doesn't require installing anything new.
