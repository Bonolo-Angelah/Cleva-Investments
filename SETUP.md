# Cleva Investment - Setup Guide

This guide will help you get Cleva Investment up and running on your local machine.

## Step-by-Step Setup

### Step 1: Get API Keys

Before starting, sign up for these free-tier services:

1. **Cohere AI** (Recommended for free tier)
   - Visit: https://cohere.com/
   - Sign up for free account
   - Get your API key from the dashboard

2. **Financial Modeling Prep**
   - Visit: https://financialmodelingprep.com/developer/docs/
   - Sign up for free plan (250 requests/day)
   - Get your API key

3. **Optional APIs** (for enhanced features):
   - Alpha Vantage: https://www.alphavantage.co/support/#api-key
   - Finnhub: https://finnhub.io/register
   - News API: https://newsapi.org/register

### Step 2: Install Prerequisites

#### Option A: Using Docker (Recommended)

1. Install Docker Desktop:
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: https://docs.docker.com/engine/install/

2. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Option B: Manual Installation

1. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL 15+**
   - Download from: https://www.postgresql.org/download/
   - Create database: `cleva_investment`

3. **MongoDB 7+**
   - Download from: https://www.mongodb.com/try/download/community
   - Start service

4. **Neo4j 5+**
   - Download from: https://neo4j.com/download/
   - Set password and start service

### Step 3: Clone and Configure

1. **Navigate to the project**:
   ```bash
   cd cleva-investment
   ```

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit backend/.env** with your API keys:
   ```env
   # Required
   COHERE_API_KEY=your_cohere_api_key_here
   FMP_API_KEY=your_fmp_api_key_here

   # Database passwords (change these!)
   POSTGRES_PASSWORD=my_secure_password
   NEO4J_PASSWORD=my_neo4j_password
   JWT_SECRET=my_very_long_random_secret_key_min_32_chars

   # Optional
   ALPHA_VANTAGE_API_KEY=your_key
   FINNHUB_API_KEY=your_key
   NEWS_API_KEY=your_key
   ```

### Step 4: Start the Application

#### Option A: Using Docker (Easiest)

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Wait for services to be ready** (about 30-60 seconds):
   ```bash
   docker-compose logs -f backend
   # Wait for "Database models synchronized" message
   # Press Ctrl+C to exit logs
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Neo4j Browser: http://localhost:7474 (user: neo4j, pass: from .env)

#### Option B: Manual Start

1. **Start databases** (if not using Docker):
   ```bash
   # Start PostgreSQL service
   # Start MongoDB service
   # Start Neo4j service
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Start backend**:
   ```bash
   npm run dev
   ```

4. **In a new terminal, start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Step 5: Create Your First Account

1. Open http://localhost:5173 in your browser
2. Click "Sign up"
3. Fill in your details:
   - Name and email
   - Choose your risk tolerance
   - Select your investment experience
4. Click "Create Account"

### Step 6: Test the System

1. **Create a Goal**:
   - Go to "Goals" page
   - Click "New Goal"
   - Fill in your financial goal details
   - Submit

2. **Chat with AI**:
   - Go to "Chat" page
   - Try asking: "What are some good investments for retirement?"
   - Try voice input by clicking the microphone icon

3. **Explore Market**:
   - Go to "Market" page
   - Search for stocks (e.g., "AAPL", "TSLA")
   - View trending stocks and gainers

## Common Issues and Solutions

### Issue: "Database connection failed"

**Solution:**
```bash
# Check if databases are running
docker ps

# Restart databases
docker-compose restart postgres mongodb neo4j

# Check logs
docker-compose logs postgres
docker-compose logs mongodb
docker-compose logs neo4j
```

### Issue: "API rate limit exceeded"

**Solution:**
- Wait a few minutes before trying again
- Consider upgrading to paid API tier
- The system caches data to minimize API calls

### Issue: "Port already in use"

**Solution:**
```bash
# Find and kill process using the port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Issue: Voice input not working

**Solution:**
- Ensure you're using Chrome, Edge, or Safari
- Allow microphone permissions when prompted
- Voice input only works on localhost or HTTPS

### Issue: Neo4j authentication failed

**Solution:**
```bash
# Reset Neo4j password
docker exec -it cleva-neo4j cypher-shell -u neo4j -p neo4j
# Change password when prompted
# Update password in backend/.env
```

## Verifying Setup

Run these checks to ensure everything is working:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"ok"}
   ```

2. **Database Connections**:
   ```bash
   docker-compose logs backend | grep "connected successfully"
   # Should show 3 successful connections
   ```

3. **Frontend Build**:
   ```bash
   curl http://localhost:5173
   # Should return HTML content
   ```

## Next Steps

1. **Explore the Features**:
   - Create multiple financial goals
   - Chat with the AI about different investment types
   - Explore market data and trending stocks
   - Update your profile settings

2. **Add Test Data**:
   - The system learns from your interactions
   - The more you chat and explore, the better recommendations you'll get

3. **Customize**:
   - Modify your risk tolerance in Profile
   - Set different goal priorities
   - Track your progress

## Stopping the Application

### Docker:
```bash
docker-compose down
```

### Manual:
Press `Ctrl+C` in each terminal window running the backend and frontend

## Production Deployment

For production deployment:
1. Use secure passwords and API keys
2. Enable HTTPS
3. Configure proper CORS origins
4. Set NODE_ENV=production
5. Use environment-specific .env files
6. Set up monitoring and logging
7. Configure database backups

## Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify API keys are correct
3. Ensure all services are running
4. Check the GitHub issues page
5. Review the main README.md for detailed documentation

## System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 10GB
- Internet: Stable connection for API calls

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 20GB+
- Internet: High-speed for better AI responses

---

**Happy Investing! 🚀📈**

Remember: This is an educational tool. Always consult with licensed financial advisors before making real investment decisions.
