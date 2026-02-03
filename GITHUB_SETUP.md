# GitHub Setup & Deployment Instructions

## 🚀 Quick Start - Push to GitHub in 5 Minutes

### Step 1: Initialize Git Repository (Windows PowerShell)

```powershell
cd c:\Users\jader\dnexpressfastforward

# Initialize git
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial D.N Express Logistics website with brand identity and API integration"

# Check status
git status
```

### Step 2: Create Repository on GitHub

1. Go to **[GitHub.com](https://github.com)**
2. Click **+ New** (top right) or use [github.com/new](https://github.com/new)
3. Fill in details:
   - **Repository name:** `dnexpress-logistics`
   - **Description:** `D.N Express Logistics - Global shipping platform under Fast Forward Now`
   - **Visibility:** `Public` (so you can share and view the link)
   - **Initialize repository:** Leave unchecked (we already have files)

4. Click **Create Repository**

### Step 3: Connect Local to GitHub

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/dnexpress-logistics.git

# Verify connection
git remote -v

# Rename branch to main (GitHub's default)
git branch -M main

# Push to GitHub
git push -u origin main
```

**You should now see a message like:**
```
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
Delta compression using up to 8 threads.
Compressing objects: 100% (16/16), done.
Writing objects: 100% (20/20), 2.50 MiB, done.
Total 20 (delta 0), reused 0 (delta 0), received 0 (delta 0)
To https://github.com/YOUR_USERNAME/dnexpress-logistics.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### Step 4: Enable GitHub Pages (Live Website)

1. Go to your GitHub repository
2. Click **Settings** (top menu bar)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Select branch: **main**
   - Select folder: **/ (root)**
   - Click Save

5. Wait 1-2 minutes for deployment
6. Your site will be available at:
   ```
   https://YOUR_USERNAME.github.io/dnexpress-logistics/
   ```

---

## 📋 Project Files Pushed to GitHub

```
dnexpress-logistics/
├── index.html                 # Main website (accessible via GitHub Pages)
├── src/
│   ├── styles.css            # Brand styling (D.N Express colors)
│   └── app.js                # JavaScript & API integration
├── api/
│   └── config.js             # Fast Forward Now API configuration
├── private/
│   ├── dashboard.html        # Build plan (private view)
│   ├── dashboard.css         # Dashboard styling
│   └── dashboard.js          # Dashboard interactivity
├── package.json              # Project metadata
├── README.md                 # Complete documentation
├── .gitignore               # Git ignore rules
└── GITHUB_SETUP.md          # This file
```

---

## 🔗 Shared Links (After GitHub Pages is Live)

### Your Shareable Links:

**Main Website:**
```
https://YOUR_USERNAME.github.io/dnexpress-logistics/
```

**Private Build Plan:**
```
https://YOUR_USERNAME.github.io/dnexpress-logistics/private/dashboard.html
```

**GitHub Repository:**
```
https://github.com/YOUR_USERNAME/dnexpress-logistics
```

---

## 🛠️ Update Website (After First Push)

To update the website after making changes:

```powershell
# Navigate to project
cd c:\Users\jader\dnexpressfastforward

# Check what changed
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Update: [describe your changes]"

# Push to GitHub
git push origin main
```

The website updates automatically within 1-2 minutes!

---

## 🎨 Brand Information Included

### Colors
- Primary Navy: `#0E244C`
- Accent Red: `#D4262A`
- Royal Blue: `#1A4F9B`
- White: `#FFFFFF`

### Typography
- Bebas Neue (headlines)
- Montserrat (body)
- Open Sans (details)

### Contact
- **Phone:** 1876-333-2649 / 1876-435-1438
- **Email:** dnexpresslogisticsja@gmail.com
- **Parent:** Fast Forward Now

---

## 🔐 Important Security Notes

### Never Commit These:
- `.env` files with API keys
- Passwords or tokens
- Sensitive credentials
- Private documentation

### Use `.gitignore` to Protect Secrets:
The `.gitignore` file already excludes:
```
.env
*.key
*.pem
credentials.json
api-keys.txt
```

---

## 📊 What You're Getting

### Public Website Features
✅ Responsive design (mobile-friendly)  
✅ Hero section with CTAs  
✅ Service descriptions  
✅ Real-time tracking interface  
✅ Contact information  
✅ Brand-consistent colors and fonts  

### API Integration
📡 Fast Forward Now shipment tracking  
💰 Rate calculation endpoints  
📦 Shipment creation capability  
🔐 Bearer token authentication  

### Private Dashboard
🔒 Build plan and milestones  
📈 Project progress tracking  
🏗️ Technical architecture  
🎨 Brand guidelines  
✅ API integration checklist  

---

## 💡 Next Steps

1. ✅ **Create GitHub account** (if you don't have one)
2. ✅ **Create repository** on GitHub
3. ✅ **Push code** using the commands above
4. ✅ **Enable GitHub Pages** for live website
5. ✅ **Share links** with stakeholders
6. 📋 **Configure API** - Add Fast Forward Now credentials to `api/config.js`
7. 🚀 **Develop further** - Add more features as needed

---

## 🆘 Troubleshooting

### "fatal: not a git repository"
```powershell
# Make sure you're in the correct directory
cd c:\Users\jader\dnexpressfastforward
git status
```

### "Permission denied (publickey)"
You need to set up SSH keys or use HTTPS. For HTTPS, use your GitHub username and personal access token.

### "GitHub Pages not updating"
- Confirm Settings → Pages shows "Your site is published"
- Check that the branch is set to `main` and folder to `root`
- Wait 1-2 minutes for rebuild
- Clear browser cache and reload

### "Changed files after push"
```powershell
git add .
git commit -m "Fix: describe the issue"
git push origin main
```

---

## 📝 Example Commit Messages

```
# Initial setup
git commit -m "Initial D.N Express Logistics website setup"

# Feature additions
git commit -m "Add: shipment tracking interface"
git commit -m "Add: brand color scheme and typography"
git commit -m "Add: private build plan dashboard"

# Bug fixes
git commit -m "Fix: responsive design on mobile devices"
git commit -m "Fix: API integration error handling"

# Updates
git commit -m "Update: contact information and phone numbers"
git commit -m "Update: FAQ and service descriptions"
```

---

## 📚 Useful Commands

```powershell
# View commit history
git log --oneline

# View what's different from GitHub
git diff origin/main

# Pull latest from GitHub
git pull origin main

# Create a new branch (for testing)
git checkout -b feature/new-feature

# Switch back to main
git checkout main

# Delete a branch
git branch -d feature/new-feature

# See all branches
git branch -a
```

---

## 🎯 Your GitHub URLs (After Setup)

| Page | URL |
|------|-----|
| **Main Website** | `https://YOUR_USERNAME.github.io/dnexpress-logistics/` |
| **Build Plan** | `https://YOUR_USERNAME.github.io/dnexpress-logistics/private/dashboard.html` |
| **GitHub Repo** | `https://github.com/YOUR_USERNAME/dnexpress-logistics` |

---

## ✨ Final Checklist

- [ ] GitHub account created
- [ ] Repository created (dnexpress-logistics)
- [ ] Code pushed to GitHub (`git push`)
- [ ] GitHub Pages enabled
- [ ] Website is live and accessible
- [ ] Links saved and shared
- [ ] API configuration added
- [ ] Tested website on mobile
- [ ] Shared link with team

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  

For questions: dnexpresslogisticsja@gmail.com
