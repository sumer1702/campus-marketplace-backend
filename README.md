# Campus Marketplace Backend

A Node.js + Express backend for the Campus Marketplace application, using Firebase Admin SDK for authentication and Firestore for data storage.

## 🚀 Live Deployment

**Frontend:** https://dcpmarketplace.web.app  
**Backend:** Deploy to Railway using this repository

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - Server framework
- **Firebase Admin SDK** - Authentication and Firestore database
- **CORS** - Cross-origin resource sharing
- **Railway** - Cloud deployment platform

## 📁 Project Structure

```
├── server.js              # Main server entry point
├── package.json           # Dependencies and scripts
├── firebaseAdmin.js       # Firebase Admin SDK configuration
├── middleware/
│   └── firebaseAuth.js    # Authentication middleware
├── routes/
│   ├── listings.js        # Marketplace listings API
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin functionality
│   ├── forum.js          # Forum routes (Phase 2)
│   └── time-exchange.js  # Time exchange routes (Phase 2)
├── models/
│   └── Listing.js        # Data models
└── docs/
    ├── QUICK_DEPLOY.md   # 5-minute deployment guide
    └── DEPLOYMENT.md     # Comprehensive deployment guide
```

## 🚀 Quick Deploy to Railway

Follow the [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) guide for step-by-step deployment instructions.

### Environment Variables Required

```env
NODE_ENV=production
FIREBASE_PROJECT_ID=dcpmarketplace
ALLOWED_DOMAINS=@email.iimcal.ac.in,@gmail.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase service account

# Start development server
npm run dev
```

## 📋 API Endpoints

### Public Routes
- `GET /` - API information
- `GET /health` - Health check

### Protected Routes (Require Firebase Auth)
- `GET /listings` - Get all listings
- `POST /listings` - Create new listing
- `PATCH /listings/:id/request` - Express interest in listing

### Admin Routes
- `GET /admin/stats` - Admin statistics

## 🧪 Testing

```bash
# Test API endpoints
node test-api.js
```

## 🔐 Security Features

- Firebase Admin SDK token verification
- CORS configuration for production
- Email domain restrictions
- Environment-based configuration

## 📦 Deployment

This backend is optimized for Railway deployment:

1. **One-click deploy** from this GitHub repository
2. **Automatic builds** with `npm install`
3. **Environment variable** configuration via Railway dashboard
4. **HTTPS endpoints** provided automatically

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions
- View Railway logs for debugging
- Ensure all environment variables are correctly set

---

**🎓 Built for Campus Marketplace - Connecting Students Through Trade**
