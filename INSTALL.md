# Quick Installation Guide

## For Windows Users (Easiest Method)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Wait for Docker to fully start (whale icon in system tray)

2. **Get API Keys** (Free)
   - **Cohere AI**: https://cohere.com/ (Sign up → Get API key)
   - **Financial Modeling Prep**: https://financialmodelingprep.com/ (Sign up → Get API key)

3. **Configure the System**
   - Open `backend\.env.example` in Notepad
   - Replace `your_cohere_api_key` with your actual Cohere API key
   - Replace `your_fmp_api_key` with your Financial Modeling Prep API key
   - Save as `backend\.env` (remove `.example`)

4. **Run the Application**
   - Double-click `start.bat`
   - Wait 1-2 minutes for services to start
   - Browser will open automatically at http://localhost:5173

5. **Create Your Account**
   - Click "Sign up"
   - Fill in your details
   - Start using Cleva Investment!

## For Mac/Linux Users

1. **Install Docker**
   ```bash
   # Mac: Install Docker Desktop from docker.com
   # Linux: Follow instructions at docs.docker.com/engine/install/
   ```

2. **Get API Keys** (Same as above)

3. **Configure**
   ```bash
   cd cleva-investment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys
   nano backend/.env  # or use any text editor
   ```

4. **Start**
   ```bash
   docker-compose up -d
   # Wait 1-2 minutes
   # Open http://localhost:5173
   ```

## Without Docker (Manual Installation)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MongoDB 7+
- Neo4j 5+

### Steps

1. **Install Databases**
   ```bash
   # Install PostgreSQL, MongoDB, and Neo4j
   # Create database 'cleva_investment' in PostgreSQL
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your settings
   npm run dev
   ```

3. **Frontend Setup** (New terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access**
   - Open http://localhost:5173

## Verifying Installation

Test that everything works:

```bash
# Check backend
curl http://localhost:5000/health
# Should return: {"status":"ok"}

# Check services (if using Docker)
docker-compose ps
# All services should show "Up" status
```

## Troubleshooting

**Docker not starting?**
- Ensure Docker Desktop is running
- Restart Docker Desktop
- Check system requirements

**API errors?**
- Verify API keys are correct
- Check you have remaining API quota
- Wait a few minutes and try again

**Port conflicts?**
- Make sure ports 5000, 5173, 5432, 27017, 7474, 7687 are available
- Stop other services using these ports

## Next Steps

After installation:
1. Create your account
2. Set up your first financial goal
3. Chat with the AI about investments
4. Explore the market data

## Need Help?

- Read the full [SETUP.md](SETUP.md) guide
- Check [README.md](README.md) for detailed documentation
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical details

---

**Estimated Installation Time**: 10-15 minutes

**System Requirements**:
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space
- Internet connection
