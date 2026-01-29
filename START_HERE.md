# 🚀 START HERE - Your API Keys Are Configured!

## ✅ Configuration Complete!

Your Cleva Investment system is now configured with:
- ✅ **Cohere AI API** - For intelligent chatbot responses
- ✅ **Financial Modeling Prep API** - For real-time market data

## 🎯 Quick Start (Choose One Method)

### Method 1: Docker (Recommended - Easiest) 🐳

**Prerequisites:**
- Install Docker Desktop from: https://www.docker.com/products/docker-desktop
- Make sure Docker is running (check system tray for whale icon)

**Steps:**
```bash
# Option A: Windows users - just double-click:
start.bat

# Option B: Or use command line:
docker-compose up -d
```

**Wait 1-2 minutes**, then open: **http://localhost:5173**

---

### Method 2: Manual Installation (Without Docker) 💻

**Prerequisites:**
- Node.js 18+ (download from https://nodejs.org/)
- PostgreSQL 15+ (running on port 5432)
- MongoDB 7+ (running on port 27017)
- Neo4j 5+ (running on port 7687)

**Steps:**

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 📋 What to Do After Starting

### 1. Create Your Account
- Click "Sign up"
- Enter your details
- Choose your risk tolerance (conservative/moderate/aggressive)
- Select investment experience (beginner/intermediate/advanced)

### 2. Set Your First Goal
- Go to "Goals" page
- Click "New Goal"
- Example: "Retirement Fund - $100,000 by 2030"
- Submit and see AI recommendations!

### 3. Chat with Cleva AI
- Go to "Chat" page
- Try these questions:
  - "What are good investments for a beginner?"
  - "I want to save for retirement, what should I invest in?"
  - "Tell me about AAPL stock"
- **Try voice input:** Click the microphone icon and speak!

### 4. Explore the Market
- Go to "Market" page
- Search for stocks: AAPL, MSFT, TSLA, GOOGL
- View trending stocks and top gainers

---

## 🎯 System URLs

Once running:
- **Frontend (Main App):** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Neo4j Browser:** http://localhost:7474 (user: neo4j, pass: cleva_neo4j_2024)
- **API Health Check:** http://localhost:5000/health

---

## 🔍 Verify Everything is Working

### Check Services (Docker):
```bash
docker-compose ps
```
All services should show "Up"

### Check Backend:
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Check Logs (Docker):
```bash
docker-compose logs -f backend
```
Should see: "✓ PostgreSQL connected successfully", "✓ MongoDB connected successfully", "✓ Neo4j connected successfully"

---

## 🛑 Stop the System

### Docker:
```bash
docker-compose down
```

### Manual:
Press `Ctrl+C` in both terminal windows

---

## 🐛 Troubleshooting

### Port Already in Use?
```bash
# Windows - Kill process on port 5000:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart
```

### Docker Issues?
```bash
# Restart everything:
docker-compose down
docker-compose up -d

# View logs:
docker-compose logs -f
```

### Database Connection Failed?
- Make sure all databases are running
- Check Docker: `docker ps`
- Restart: `docker-compose restart`

### API Not Responding?
- Verify API keys are correct in `backend/.env`
- Check API quotas haven't been exceeded
- Wait a few minutes and try again

---

## 📚 Learn More

- **Full Documentation:** [README.md](README.md)
- **Setup Guide:** [SETUP.md](SETUP.md)
- **Technical Details:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎊 You're All Set!

Your Cleva Investment system is ready to:
- ✅ Provide AI-powered investment advice
- ✅ Track your financial goals
- ✅ Show real-time market data
- ✅ Give personalized recommendations
- ✅ Accept voice commands

**Just start the system and begin your investment journey!** 🚀📈

---

## 💡 Pro Tips

1. **Be Specific in Chat:** "I'm 25, want to retire at 60, what should I invest in?"
2. **Set Multiple Goals:** Retirement, house, emergency fund, etc.
3. **Explore Different Stocks:** AAPL, MSFT, TSLA, GOOGL, AMZN
4. **Use Voice:** Great for quick questions while multitasking
5. **Track Progress:** Update your goal amounts as you invest

---

**Need Help?** Check the documentation files or review error messages in the terminal/Docker logs.

**Happy Investing! 💰📊**
