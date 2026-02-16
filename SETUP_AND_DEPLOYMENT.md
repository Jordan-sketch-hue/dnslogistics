# Deployment & Setup Guide

## 🚀 Quick Start

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your values
# 4. Start development server
npm run dev

# Server runs at http://localhost:5000
```

---

## 🌐 Deploy to Vercel

### Step 1: Connect GitHub Repository
1. Go to **https://vercel.com**
2. Click "Import Project"
3. Select GitHub repository: `https://github.com/Jordan-sketch-hue/dnslogistics.git`
4. Click "Import"

### Step 2: Configure Environment Variables
In Vercel Project Settings → Environment Variables, add:
```
NODE_ENV=production
JWT_SECRET=your-secure-random-string
SETHWAN_API_URL=https://api.sethwan.com
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Step 3: Deploy
- Click "Deploy"
- Wait 2-3 minutes for deployment to complete
- Your app is live at: `https://your-project-name.vercel.app`

---

## 📋 Available Endpoints

### Frontend Pages
- **Homepage**: `GET /`
- **Login**: `GET /auth`
- **Dashboard**: `GET /dashboard`

### API Endpoints
- **Auth**: `/api/auth` (register, login, refresh)
- **Customers**: `/api/customers`
- **Shipments**: `/api/shipments`
- **Inventory**: `/api/inventory`
- **Manifests**: `/api/manifests`
- **Reports**: `/api/reports`
- **Sethwan**: `/api/sethwan`
- **Status**: `/api/status`
- **Admin**: `/api/admin`

---

## 🔧 Sethwan Integration

### Setup
1. Go to **https://on.sethwan.com/onboarding**
2. Complete Sethwan registration
3. Get your API Key & Account ID
4. Update Vercel environment variables:
   ```
   SETHWAN_API_KEY=your-key-from-sethwan
   SETHWAN_ACCOUNT_ID=your-account-id
   ```

### Test Connection
```bash
POST /api/sethwan/test-connection
{
  "apiKey": "your-key",
  "accountId": "your-id"
}
```

---

## 📊 Project Structure
```
├── api/
│   ├── middleware/       # Auth, Sethwan integration
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   └── utils/            # Helpers, validators, logger
├── src/
│   ├── app.js           # Frontend main
│   ├── auth.js          # Authentication
│   ├── errorHandler.js  # Error system
│   └── *.css            # Styling
├── assets/              # Images, logos
├── index.html           # Homepage
├── auth.html            # Login page
├── dashboard.html       # Dashboard
└── server.js            # Express server
```

---

## 🔐 Security Notes

- **Never commit .env files** to version control
- **Rotate JWT_SECRET in production**
- **Use HTTPS only** on production
- **Validate all user input** via `/api/utils/validators.js`
- **Log all operations** via `/api/utils/logger.js`

---

## 🐛 Troubleshooting

### Styles not loading on Vercel?
- Ensure CSS files are in `/src/` folder
- Check browser DevTools Network tab for 404 errors
- Verify `vercel.json` routes are correct

### API calls not working?
- Check `FRONTEND_URL` environment variable
- Verify CORS settings in `server.js`
- Check browser Console for errors

### Sethwan integration failing?
- Verify API key format (should be long string)
- Test with `/api/sethwan/test-connection` endpoint
- Check Sethwan account dashboard for API limits

---

## 📚 Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Master Implementation Plan](./MASTER_IMPLEMENTATION_PLAN.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

## 📝 Next Steps

1. ✅ Deploy to Vercel
2. ⏳ Complete Sethwan onboarding
3. ⏳ Add email notifications (SMTP config)
4. ⏳ Configure SMS alerts (Twilio integration)
5. ⏳ Migrate from in-memory to real database (PostgreSQL/MongoDB)
6. ⏳ Add automated testing (Jest)

---

**Questions?** Check the documentation files or review the inline code comments.
