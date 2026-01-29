# Cleva Investment

> AI-Powered Investment Advisory Platform | Now with South African Rands (R)

An AI-powered investment advisory platform that provides personalized investment recommendations based on user goals, market data, and collaborative filtering through graph database relationships.

**Latest Update (Nov 4, 2025):**
- ✅ Currency changed to South African Rands (R)
- ✅ Enhanced UI with colorful gradients and animations
- ✅ Risk tolerance moved to goal-specific settings
- ✅ Improved visual hierarchy and user experience

## Features

- **AI-Powered Chatbot**: Interactive chatbot with text and voice input capabilities
- **Smart Recommendations**: Personalized investment suggestions using graph database and AI
- **Goal Management**: Create and track financial goals with progress monitoring
- **Market Data Integration**: Real-time market data from multiple financial APIs
- **Multi-Database Architecture**:
  - PostgreSQL for user data and goals
  - MongoDB for articles and market data caching
  - Neo4j for user-investment relationship graphs
- **Voice Input**: Speech-to-text functionality for hands-free interaction
- **Real-time Updates**: WebSocket-based chat for instant responses

## Architecture

```
Frontend (React + Vite + TailwindCSS)
         ↓
Backend API (Express.js + Socket.io)
         ↓
    ┌────┴─────┬──────────────┬───────────┐
    ↓          ↓              ↓           ↓
PostgreSQL  MongoDB      Neo4j       External APIs
(Users,     (Market     (Graph      (OpenAI/Cohere,
 Goals)     Data,       Relations)   Financial APIs)
            Articles)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- MongoDB 7+
- Neo4j 5+
- Docker & Docker Compose (optional, recommended)

## API Keys Required

1. **AI Service** (choose one):
   - OpenAI API Key (paid): https://platform.openai.com/
   - Cohere API Key (free tier): https://cohere.com/

2. **Financial Data APIs**:
   - Financial Modeling Prep (free tier - 250 req/day): https://financialmodelingprep.com/
   - Alpha Vantage (free tier - 25 req/day): https://www.alphavantage.co/
   - Finnhub (free tier - 60 req/min): https://finnhub.io/
   - News API (free tier - 100 req/day): https://newsapi.org/

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cleva-investment
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy example env file
   cp backend/.env.example backend/.env

   # Edit backend/.env and add your API keys
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Neo4j Browser: http://localhost:7474

## Manual Installation

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL, MongoDB, and Neo4j**
   ```bash
   # Using Docker for databases only
   docker run -d --name postgres -p 5432:5432 \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=cleva_investment \
     postgres:15-alpine

   docker run -d --name mongodb -p 27017:27017 \
     mongo:7-jammy

   docker run -d --name neo4j -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/your_password \
     neo4j:5-community
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment (optional)**
   ```bash
   # Create .env file if needed
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cleva_investment
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cleva_investment

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# JWT
JWT_SECRET=your_very_long_secret_key
JWT_EXPIRES_IN=7d

# AI API (choose one)
OPENAI_API_KEY=sk-...
COHERE_API_KEY=...

# Financial APIs
FMP_API_KEY=your_fmp_key
ALPHA_VANTAGE_API_KEY=your_av_key
FINNHUB_API_KEY=your_finnhub_key
NEWS_API_KEY=your_news_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Goals
- `POST /api/goals` - Create financial goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get single goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/recommendations` - Get AI recommendations for goal

### Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/session` - Get active session
- `POST /api/chat/session` - Create new session
- `GET /api/chat/recommendations` - Get personalized recommendations
- `POST /api/chat/action` - Record user investment action

### Market
- `GET /api/market/quote/:symbol` - Get stock quote
- `GET /api/market/search?q=query` - Search investments
- `GET /api/market/trending` - Get trending stocks
- `GET /api/market/gainers` - Get top gainers
- `GET /api/market/articles/:symbol` - Get news articles
- `GET /api/market/overview` - Get market overview

## Database Schemas

### PostgreSQL (Users & Goals)

**Users Table:**
- id (UUID)
- email, password, firstName, lastName
- phoneNumber, dateOfBirth
- riskTolerance (conservative/moderate/aggressive)
- investmentExperience (beginner/intermediate/advanced)
- isActive, lastLogin
- createdAt, updatedAt

**Goals Table:**
- id (UUID)
- userId (FK)
- title, description
- targetAmount, currentAmount
- targetDate, timeHorizon, goalType, priority
- status, monthlyContribution
- recommendedInvestments (JSONB)
- createdAt, updatedAt

### MongoDB (Market Data & Chat)

**MarketData Collection:**
- symbol, name, type, exchange
- currentPrice, priceChange, volume, marketCap
- performance metrics, risk metrics, fundamentals
- sector, industry, description
- lastUpdated, dataSource

**ChatHistory Collection:**
- userId, sessionId
- messages array (role, content, type, timestamp, metadata)
- startedAt, lastMessageAt, isActive, summary

**Articles Collection:**
- title, url, source, author, publishedAt
- description, content, imageUrl
- relatedSymbols, category, sentiment, tags
- verified, verificationScore, relevanceScore

### Neo4j (Graph Relationships)

**Nodes:**
- User: {id, riskTolerance, investmentExperience}
- Investment: {symbol, name, type, sector, riskLevel}

**Relationships:**
- (User)-[INTERESTED_IN {strength, count, type}]->(Investment)
- (User)-[INVESTED_IN {amount, count}]->(Investment)
- (User)-[RESEARCHED {count}]->(Investment)

## Features in Detail

### AI Chatbot
- Uses OpenAI GPT-3.5-turbo or Cohere AI
- Context-aware responses based on user profile and goals
- Real-time market data integration
- Fallback to financial advisor recommendation when uncertain

### Voice Input
- Browser-based Web Speech API
- Converts speech to text for chat input
- Works in Chrome, Edge, and Safari

### Recommendation Engine
- Collaborative filtering using Neo4j graph database
- Finds similar users based on investment patterns
- Recommends investments popular among similar users
- Considers risk tolerance and experience level

### Market Data Verification
- Cross-references multiple data sources
- Caches data in MongoDB for performance
- Real-time updates with configurable cache expiry
- News sentiment analysis for validation

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Security Considerations

1. **Authentication**: JWT-based with configurable expiry
2. **Rate Limiting**: Protects API endpoints from abuse
3. **Input Validation**: Express-validator for request validation
4. **Password Hashing**: Bcrypt with salt rounds
5. **CORS**: Configurable origin restrictions
6. **Helmet.js**: Security headers
7. **Environment Variables**: Sensitive data in .env files

## Troubleshooting

### Database Connection Issues
- Ensure all databases are running
- Check connection strings in .env
- Verify firewall/network settings

### API Rate Limits
- Financial APIs have daily/monthly limits
- Implement caching to reduce API calls
- Consider upgrading to paid tiers for production

### Neo4j Connection
- Default credentials: neo4j/neo4j (change on first login)
- Check bolt://localhost:7687 is accessible
- Verify Neo4j is running: `docker ps`

### Voice Input Not Working
- Requires HTTPS in production (works on localhost)
- Browser compatibility: Chrome, Edge, Safari only
- Check microphone permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues, questions, or feature requests, please create an issue in the GitHub repository.

## Recent Changes

### Version 1.0 - November 4, 2025

**UI Enhancements:**
- Changed currency from USD ($) to ZAR (R - South African Rands)
- Added colorful gradient backgrounds (blue, purple, green, red)
- Implemented smooth hover animations and transitions
- Added trending up/down arrow icons
- Enhanced visual hierarchy with better spacing and typography
- Added monthly contribution display badge on goals

**Form Updates:**
- Moved risk tolerance from registration to goal creation
- Moved investment experience from registration to goal creation
- Simplified registration process (only email, password, name)

**Database Changes:**
- Added `riskTolerance` column to goals table
- Added `investmentExperience` column to goals table

**Search Functionality:**
- Verified market search API endpoint
- Confirmed Financial Modeling Prep integration
- Search working for stocks, ETFs, and companies

## Roadmap

- [x] Multi-database architecture (PostgreSQL, MongoDB, Neo4j)
- [x] AI-powered chatbot with Cohere integration
- [x] Real-time market data from Financial Modeling Prep
- [x] Currency support for South African Rands
- [x] Colorful and animated UI
- [ ] Mobile app (React Native)
- [ ] Email notifications for goal milestones
- [ ] Portfolio tracking and analysis
- [ ] Automated investment strategies
- [ ] Social features (share goals, follow users)
- [ ] Advanced charting and technical analysis
- [ ] Multi-language support
- [ ] Dark mode

## Credits

Built with:
- React, Express.js, Node.js
- PostgreSQL, MongoDB, Neo4j
- OpenAI/Cohere, Financial Modeling Prep
- TailwindCSS, Socket.io, Axios

---

**Disclaimer**: This is an educational project. Always consult with licensed financial advisors before making investment decisions. Past performance does not guarantee future results.
