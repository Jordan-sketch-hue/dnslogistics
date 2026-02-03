# D.N Express Logistics - Web Platform

[![GitHub](https://img.shields.io/badge/GitHub-dnexpress--logistics-blue?style=flat-square)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](https://github.com)

## 🌍 Project Overview

D.N Express Logistics is a comprehensive freight forwarding and logistics platform operating under the **Fast Forward Now** umbrella. The platform provides global shipping solutions connecting Jamaica to the world with air freight, sea freight, and local delivery services.

**Live Demo:** (GitHub Pages will be available after pushing to GitHub)

---

## 📋 Project Structure

```
dnexpressfastforward/
├── index.html                 # Main website (public)
├── src/
│   ├── styles.css            # Brand styling & responsive design
│   └── app.js                # Main JavaScript & API integration
├── api/
│   └── config.js             # Fast Forward Now API configuration
├── private/
│   ├── dashboard.html        # Build plan & project dashboard (PRIVATE)
│   ├── dashboard.css         # Dashboard styling
│   └── dashboard.js          # Dashboard interactivity
├── assets/                   # Images, logos, and media
├── README.md                 # This file
├── .gitignore               # Git ignore configuration
└── package.json             # Project metadata
```

---

## 🎨 Brand Identity

### Colors
- **Primary Navy:** `#0E244C` - Trust, professionalism
- **Accent Red:** `#D4262A` - Speed, energy, urgency
- **Royal Blue:** `#1A4F9B` - Global, reliable
- **White:** `#FFFFFF` - Clarity, openness

### Typography
- **Headlines:** Bebas Neue (Bold, Modern)
- **Body Text:** Montserrat (Clean, Professional)
- **Details:** Open Sans (Readable, Minimal)

### Taglines
- "Delivering the World Faster"
- "Global Logistics, Local Reach"
- "Your Cargo, Our Commitment"

---

## 📞 Contact Information

| Type | Details |
|------|---------|
| **Phone** | 1876-333-2649 / 1876-435-1438 |
| **Email** | dnexpresslogisticsja@gmail.com |
| **Location** | Jamaica & Worldwide |
| **Parent Company** | Fast Forward Now |

---

## ✨ Features

### Public Website (index.html)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Hero section with CTAs
- ✅ Service descriptions
- ✅ Shipment tracking interface
- ✅ Contact information display
- ✅ Brand-consistent styling

### API Integration
- 📡 **Shipment Tracking** - Real-time status updates
- 💰 **Rate Calculation** - Dynamic pricing
- 📦 **Create Shipments** - Integrated order creation
- 🔐 **Authentication** - Bearer token security
- 📊 **Dashboard Metrics** - Admin analytics

### Private Dashboard (private/dashboard.html)
- 🔒 **Private Build Plan** - Project overview & tracking
- 📈 **Milestones** - Phase tracking (4 phases)
- 🏗️ **Technical Architecture** - Stack overview
- 🎨 **Brand Guidelines** - Color palette & typography
- ✅ **API Checklist** - Integration workflow
- 📚 **Development Notes** - Resources and next steps
- 🚀 **GitHub Instructions** - Deployment guide

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/dnexpress-logistics.git
cd dnexpress-logistics
```

### 2. Open Locally
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Or just open index.html in your browser
```

### 3. View Website
- **Main Site:** `http://localhost:8000`
- **Build Plan:** `http://localhost:8000/private/dashboard.html`

---

## 🔌 API Integration

### Configuration
See `api/config.js` for API endpoint configuration.

### Environment Variables
Create a `.env` file:
```bash
REACT_APP_API_BASE_URL=https://api.fastforwardnow.co/v1
REACT_APP_API_KEY=your_api_key_here
AUTH_TOKEN=your_auth_token_here
```

### Example: Track Shipment
```javascript
const api = new APIClient(API_CONFIG);
const shipment = await api.getShipment('TRK123456789');
console.log(shipment.status);
```

### Example: Calculate Rates
```javascript
const api = new APIClient(API_CONFIG);
const rates = await api.calculateRates('USA', 'Jamaica', 25); // kg
console.log(rates.options);
```

---

## 📅 Development Roadmap

### Phase 1: Foundation Setup ✅ COMPLETED
- ✅ Project structure
- ✅ Brand identity
- ✅ Main website
- ✅ Contact information

### Phase 2: API Integration 🔄 IN PROGRESS
- ⏳ Shipment tracking endpoint
- ⏳ Rate calculation API
- ⏳ Real-time status updates
- ⏳ Error handling & fallbacks

### Phase 3: Advanced Features 📋 PENDING
- ☐ User authentication
- ☐ Customer accounts
- ☐ Order history
- ☐ Payment integration

### Phase 4: Deployment 🚀 PENDING
- ☐ QA testing
- ☐ GitHub Pages setup
- ☐ Production deployment
- ☐ Public launch

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **API** | Fast Forward Now REST API |
| **Fonts** | Google Fonts (Bebas Neue, Montserrat, Open Sans) |
| **Hosting** | GitHub Pages (planned) |
| **Version Control** | Git & GitHub |

---

## 📦 Deployment to GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New" to create a new repository
3. Name it: `dnexpress-logistics`
4. Make it **Public**
5. Initialize with README (optional)

### Step 2: Push Code
```bash
git init
git add .
git commit -m "Initial D.N Express Logistics website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dnexpress-logistics.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Set source branch to `main`
4. Select folder: `root`
5. Click Save

### Step 4: Access Your Site
Your site will be live at:
```
https://YOUR_USERNAME.github.io/dnexpress-logistics/
```

---

## 📝 Private Build Plan

Access the private build plan dashboard at:
```
/private/dashboard.html
```

This page contains:
- Project overview and status
- Development milestones (4 phases)
- Technical architecture overview
- Brand guidelines and colors
- API integration checklist
- GitHub deployment instructions
- Contact information
- Development notes and resources

**Note:** This is a private view for internal planning and should not be indexed by search engines in production.

---

## 🔐 Security Notes

- Never commit `.env` files with secrets
- API tokens should be stored securely
- Use HTTPS in production
- Validate all user inputs
- Implement CORS properly
- Rate limit API endpoints

---

## 🤝 Contributing

This is a private project for D.N Express Logistics / Fast Forward Now. For contributions or questions, contact:

📧 **Email:** dnexpresslogisticsja@gmail.com  
📞 **Phone:** 1876-333-2649 / 1876-435-1438

---

## 📄 License

This project is proprietary and confidential. All rights reserved to D.N Express Logistics and Fast Forward Now.

---

## 🙏 Credits

- **Brand Logo:** D.N Express Logistics
- **Reference Platform:** Fast Forward Now ([fastforwardnow.co](https://www.fastforwardnow.co))
- **Typography:** Google Fonts
- **Development:** GitHub Copilot Assistance

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Lines of Code** | ~1,500+ |
| **CSS Stylesheets** | 2 |
| **JavaScript Files** | 3 |
| **HTML Pages** | 2 |
| **API Endpoints** | 10+ |
| **Brand Colors** | 4 |
| **Responsive Breakpoints** | 3 |

---

## 🔗 Quick Links

- 📱 **Main Website:** `index.html`
- 📋 **Build Plan:** `private/dashboard.html`
- ⚙️ **API Config:** `api/config.js`
- 🎨 **Styles:** `src/styles.css`
- 📜 **JavaScript:** `src/app.js`

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  
**Status:** 🟢 Active Development

---

Made with ❤️ for D.N Express Logistics
