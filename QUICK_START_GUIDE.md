# Cleva Investment - Quick Start Guide

## 🚀 Start the Application

```powershell
cd cleva-investment
docker-compose up -d
```

**Access:** http://localhost:5173

---

## 📋 What Was Built

### 1. Complete Investment Platform
- AI chatbot advisor (text + voice)
- Financial goal tracker
- Real-time stock market data
- User authentication system
- Beautiful, colorful UI

### 2. Technology Used
- **Frontend:** React, TailwindCSS, Vite
- **Backend:** Node.js, Express.js, Socket.io
- **Databases:** PostgreSQL, MongoDB, Neo4j
- **AI:** Cohere API
- **Market Data:** Financial Modeling Prep API

---

## 🎯 Main Features

### Dashboard
- Overview of all your goals
- Quick stats and progress

### Goals Page
- Create financial goals (retirement, house, education, etc.)
- Track progress with visual bars
- Set monthly contributions
- Specify risk tolerance per goal
- **Currency:** South African Rands (R)

### Chat Page
- Ask investment questions
- Type or speak (voice input)
- Get AI-powered advice
- Market data integration

### Market Explorer
- **Search stocks** by name or symbol
- View **trending stocks**
- See **top gainers**
- Click any stock for details:
  - Current price (in Rands)
  - Price change %
  - Market capitalization
  - P/E Ratio
  - Company description

---

## 💡 How to Use

### 1. First Time Setup
```powershell
# Start the system
docker-compose up -d

# Open browser
http://localhost:5173
```

### 2. Create Account
- Click "Sign up"
- Enter: Email, Password, First Name, Last Name
- Click "Create Account"

### 3. Create a Goal
- Go to "Goals" page
- Click "New Goal"
- Fill in the form:
  - Title: e.g., "Buy a House"
  - Target Amount: e.g., 500000 (Rands)
  - Target Date
  - Risk Tolerance: Conservative/Moderate/Aggressive
  - Investment Experience: Beginner/Intermediate/Advanced
- Click "Create Goal"

### 4. Use the Chatbot
- Go to "Chat" page
- Type: "What should I invest in for retirement?"
- Press Enter
- Get AI response

### 5. Search Stocks
- Go to "Market Explorer"
- Type: "Tesla" or "TSLA"
- Click "Search"
- Click result to see details

---

## 🎨 Recent UI Updates

### What's New (November 4, 2025)

**Currency Changed:**
- All prices now in **Rands (R)** instead of Dollars ($)

**Colorful Design:**
- 🔵 Blue gradients for current prices
- 💜 Purple gradients for P/E ratios
- 💙 Light blue for market cap
- 🟢 Green for gains
- 🔴 Red for losses

**Smooth Animations:**
- Hover effects on cards
- Smooth transitions
- Shadow lifts on hover
- Color changes on interaction

**Better Information:**
- Monthly contribution badges
- Progress percentages
- Trending arrows (↑↓)
- Enhanced visual hierarchy

**Simplified Registration:**
- No more risk tolerance at signup
- No more investment experience at signup
- Those fields moved to goal creation
- Faster, simpler registration

---

## 🛠️ Common Commands

### Start Everything
```powershell
docker-compose up -d
```

### Stop Everything
```powershell
docker-compose down
```

### View Logs
```powershell
# All logs
docker-compose logs -f

# Just backend
docker-compose logs backend -f

# Just frontend
docker-compose logs frontend -f
```

### Restart
```powershell
docker-compose restart
```

### Reset Everything (Deletes Data!)
```powershell
docker-compose down -v
docker-compose up -d
```

### Check Status
```powershell
docker-compose ps
```

---

## 🆘 Troubleshooting

### Problem: Can't access website
```powershell
# Check if running
docker-compose ps

# Restart
docker-compose restart
```

### Problem: Chat not working
```powershell
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Problem: Search not working
- Make sure you're logged in
- Check backend logs: `docker-compose logs backend`
- Verify API key is set in `backend/.env`

### Problem: Can't login
- If you reset databases, create a new account
- Check PostgreSQL logs: `docker-compose logs postgres`

---

## 📊 Database Schema

### Users (PostgreSQL)
- Email, Password (hashed)
- First Name, Last Name
- Created/Updated dates

### Goals (PostgreSQL)
- Title, Description
- Target Amount, Current Amount
- Target Date
- Risk Tolerance (Conservative/Moderate/Aggressive)
- Investment Experience (Beginner/Intermediate/Advanced)
- Monthly Contribution
- Priority (Low/Medium/High)
- Progress tracking

### Market Data (MongoDB)
- Stock symbol, name
- Current price, changes
- Market cap, P/E ratio
- Company info
- Cached for 5 minutes

### Chat History (MongoDB)
- User messages
- AI responses
- Timestamps
- Session tracking

### Graph Relationships (Neo4j)
- User connections
- Investment relationships
- Collaborative filtering data

---

## 📂 Important Files

**Configuration:**
- `docker-compose.yml` - All service definitions
- `backend/.env` - API keys and secrets
- `backend/src/config/database.js` - Database connections

**Backend:**
- `backend/src/server.js` - Main server
- `backend/src/routes/` - API endpoints
- `backend/src/models/` - Database models
- `backend/src/services/` - Business logic

**Frontend:**
- `frontend/src/pages/Dashboard.jsx` - Dashboard page
- `frontend/src/pages/Goals.jsx` - Goals management
- `frontend/src/pages/Chat.jsx` - AI chatbot
- `frontend/src/pages/Market.jsx` - Stock market explorer
- `frontend/src/pages/Register.jsx` - User registration
- `frontend/src/pages/Login.jsx` - User login

---

## 🔐 Security Features

- ✅ Password hashing with Bcrypt
- ✅ JWT authentication
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet.js)
- ✅ Input validation

---

## 📱 Pages Overview

### 1. Dashboard (`/dashboard`)
- Welcome message
- Goal summary cards
- Quick navigation

### 2. Goals (`/goals`)
- List all goals
- Create new goals
- Edit/Delete goals
- Progress visualization

### 3. Chat (`/chat`)
- AI chatbot interface
- Text input
- Voice input (microphone button)
- Message history

### 4. Market Explorer (`/market`)
- Search bar
- Trending stocks list
- Top gainers list
- Stock detail cards

### 5. Register (`/register`)
- Sign up form
- Email, Password, Name only
- Auto-redirect to dashboard

### 6. Login (`/login`)
- Sign in form
- Email and Password
- JWT token generation

---

## 🌐 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/profile` - Get user info

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Market
- `GET /api/market/search?q=<query>` - Search stocks
- `GET /api/market/quote/:symbol` - Get stock details
- `GET /api/market/trending` - Trending stocks
- `GET /api/market/gainers` - Top gainers

### Chat (WebSocket)
- Socket event: `user_message` - Send message
- Socket event: `ai_response` - Receive response

---

## 📝 What Changed in Latest Update

### Before → After

**Currency:**
- ❌ Dollars ($)
- ✅ Rands (R)

**Registration Form:**
- ❌ Had: Risk Tolerance field
- ❌ Had: Investment Experience field
- ✅ Now: Just Email, Password, Name

**Goal Creation Form:**
- ✅ Added: Risk Tolerance dropdown
- ✅ Added: Investment Experience dropdown
- ✅ Each goal has its own risk settings

**UI Appearance:**
- ❌ Plain white cards
- ✅ Colorful gradient cards
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Trending icons

---

## 💾 Backup & Data

### Where Data is Stored
- **PostgreSQL:** `/var/lib/postgresql/data` (in container)
- **MongoDB:** `/data/db` (in container)
- **Neo4j:** `/data` (in container)

### Docker Volumes
- `postgres_data`
- `mongodb_data`
- `neo4j_data`
- `neo4j_logs`

### Reset All Data
```powershell
docker-compose down -v
docker-compose up -d
```
⚠️ **Warning:** This deletes everything!

---

## 🎓 Learning Resources

### Technologies Used
- **React:** https://react.dev/
- **TailwindCSS:** https://tailwindcss.com/
- **Express.js:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/
- **MongoDB:** https://www.mongodb.com/
- **Neo4j:** https://neo4j.com/
- **Socket.io:** https://socket.io/
- **Docker:** https://www.docker.com/

### API Documentation
- **Cohere AI:** https://docs.cohere.com/
- **Financial Modeling Prep:** https://site.financialmodelingprep.com/developer/docs

---

## ✅ System Requirements

**Minimum:**
- Windows 10/11 or macOS or Linux
- 4GB RAM
- 10GB free disk space
- Docker Desktop installed

**Recommended:**
- 8GB RAM
- SSD storage
- Stable internet connection

---

## 📞 Support

**For Help:**
1. Check this guide first
2. Look at logs: `docker-compose logs -f`
3. Read full documentation: `PROJECT_DOCUMENTATION.md`
4. Verify Docker Desktop is running
5. Ensure ports are available (5000, 5173, 5432, 27017, 7687)

---

## 🎉 Success Checklist

- ✅ Docker Desktop running
- ✅ All containers started (`docker-compose ps`)
- ✅ Can access http://localhost:5173
- ✅ Created an account
- ✅ Created a goal
- ✅ Chatbot responds to messages
- ✅ Search finds stocks
- ✅ All prices show in Rands (R)
- ✅ UI has colorful gradients
- ✅ Hover effects work

**🎊 If all checked, you're all set!**

---

**Last Updated:** November 4, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
