# Changelog

All notable changes to the Cleva Investment Platform are documented in this file.

---

## [1.0.0] - 2025-11-04

### Added - Currency & UI Enhancements

#### Currency System
- **Changed currency from USD ($) to ZAR (R)** across entire platform
  - Goals page: All goal amounts now display in Rands
  - Dashboard: Goal progress amounts in Rands
  - Market Explorer: All stock prices in Rands
  - Chat page: Market data recommendations in Rands

#### UI Enhancements - Goals Page
- Added **monthly contribution display badge** with blue gradient background
- Enhanced visual hierarchy with better spacing
- Improved readability with bolder fonts for amounts
- Currency formatting with thousand separators (e.g., R50,000)

#### UI Enhancements - Dashboard
- Added **percentage completion display** below progress bars
- Shows exact progress percentage (e.g., "45.2% Complete")
- Enhanced color coding for better visual feedback

#### UI Enhancements - Market Explorer
- **Colorful gradient backgrounds:**
  - Primary blue gradient for current price cards
  - Green/red dynamic gradients for price change (based on performance)
  - Light blue gradient for market capitalization cards
  - Purple gradient for P/E Ratio cards

- **Interactive hover effects:**
  - Smooth transitions (200ms duration)
  - Shadow lift effect on hover
  - Border color changes
  - Background color changes for gainers list

- **Visual indicators:**
  - Trending up arrow icons (green) for positive changes
  - Trending down arrow icons (red) for negative changes
  - Larger, bolder fonts for percentage changes
  - Color-coded performance metrics

#### UI Enhancements - Chat Page
- Updated market data price displays to show Rands
- Maintained existing chat interface functionality

### Changed - Registration Flow

#### Registration Form (`frontend/src/pages/Register.jsx`)
- **Removed fields:**
  - Risk Tolerance dropdown
  - Investment Experience dropdown

- **Simplified to only:**
  - Email (required, validated)
  - Password (required, minimum 6 characters)
  - First Name (required)
  - Last Name (required)

#### Goal Creation Form (`frontend/src/pages/Goals.jsx`)
- **Added fields:**
  - Risk Tolerance dropdown (required)
    - Options: Conservative, Moderate, Aggressive
    - Default: Moderate
  - Investment Experience dropdown (required)
    - Options: Beginner, Intermediate, Advanced
    - Default: Beginner

- **Updated form state:**
  - Added `riskTolerance` and `investmentExperience` to formData
  - Updated resetForm function to include new fields
  - Added form validation for required fields

### Database Schema Updates

#### Backend Goal Model (`backend/src/models/postgres/Goal.js`)
- **Added columns:**
  - `riskTolerance` - ENUM type
    - Values: 'conservative', 'moderate', 'aggressive'
    - Default: 'moderate'
    - Comment: 'Risk tolerance for this specific goal'

  - `investmentExperience` - ENUM type
    - Values: 'beginner', 'intermediate', 'advanced'
    - Default: 'beginner'
    - Comment: 'Investment experience level for this goal'

- **Database migration required:**
  - Performed: `docker-compose down -v && docker-compose up -d`
  - Created new enum types in PostgreSQL
  - Applied schema changes successfully

### Technical Changes

#### Frontend Rebuild
- Stopped frontend container
- Removed frontend container
- Rebuilt with `--no-cache` flag
- Redeployed to ensure all changes active

#### Files Modified
1. `frontend/src/pages/Goals.jsx` - Added risk fields, currency change, UI enhancements
2. `frontend/src/pages/Dashboard.jsx` - Currency change, percentage display
3. `frontend/src/pages/Market.jsx` - Currency change, gradient backgrounds, hover effects
4. `frontend/src/pages/Chat.jsx` - Currency change
5. `frontend/src/pages/Register.jsx` - Removed risk fields
6. `backend/src/models/postgres/Goal.js` - Added database columns

### Verified

#### Search Functionality
- ✅ Backend API endpoint `/api/market/search` working
- ✅ Financial Modeling Prep API integration confirmed
- ✅ Search returns results for stocks, ETFs, companies
- ✅ Click-to-view stock details functional
- ✅ All data properly formatted in Rands

#### Backend Services
- ✅ `marketDataService.js` - Search implementation verified
- ✅ `routes/market.js` - Search endpoint operational
- ✅ Authentication middleware protecting endpoints
- ✅ Rate limiting active

### User Experience Improvements

#### Visual Feedback
- Hover states now more engaging
- Clear visual distinction between different data types
- Color coding helps users quickly identify gains vs. losses
- Gradient backgrounds make important metrics stand out

#### Information Architecture
- Monthly contributions now prominently displayed
- Progress percentages provide precise feedback
- Risk settings contextually placed with goals
- Simplified registration reduces friction

#### Interaction Design
- Smooth animations improve perceived performance
- Hover effects provide clear affordance
- Trending arrows offer instant insight
- Color gradients create visual hierarchy

---

## [0.5.0] - 2025-11-04 (Earlier Session)

### Changed - Goal Risk Settings

#### Form Restructuring
- Moved risk tolerance from user profile to goal-specific
- Moved investment experience from user profile to goal-specific
- Reasoning: Different goals may have different risk profiles

#### User Model Updates
- Kept `riskTolerance` and `investmentExperience` in User model
- Added default values for backward compatibility
- Fields now optional at registration

---

## [0.1.0] - 2025-11 (Initial Build)

### Added - Complete Platform

#### Backend Infrastructure
- Express.js server with Socket.io
- JWT authentication system
- Bcrypt password hashing
- Multi-database connection manager
- API rate limiting
- CORS configuration
- Helmet.js security headers

#### Frontend Application
- React 18 with Vite build tool
- TailwindCSS styling system
- React Router navigation
- Zustand state management
- Socket.io client integration
- Web Speech API for voice input
- React Toastify notifications

#### Database Systems
- **PostgreSQL setup:**
  - Users table with authentication
  - Goals table with tracking
  - Sequelize ORM integration
  - Connection pooling

- **MongoDB setup:**
  - MarketData collection
  - ChatHistory collection
  - Articles collection
  - Mongoose ODM integration

- **Neo4j setup:**
  - Graph relationships
  - Collaborative filtering
  - Investment recommendations
  - neo4j-driver integration

#### AI Integration
- Cohere API integration
- Chat completion endpoint
- Context-aware responses
- Fallback mechanisms

#### Market Data Integration
- Financial Modeling Prep API
- Stock quote retrieval
- Search functionality
- Trending stocks
- Top gainers
- 5-minute caching system

#### Pages & Components
- Dashboard page
- Goals management page
- AI chat interface
- Market explorer page
- Login page
- Registration page
- Navigation bar
- Protected routes

#### Docker Configuration
- Docker Compose orchestration
- PostgreSQL container
- MongoDB container
- Neo4j container
- Backend container
- Frontend container (Nginx)
- Volume management
- Network configuration
- Health checks

### Issues Resolved (Initial Build)

1. **Docker Email Verification**
   - Issue: MongoDB image required verified Docker Hub account
   - Resolution: User verified email, restarted Docker Desktop

2. **NPM Package Lock**
   - Issue: `npm ci` failing without package-lock.json
   - Resolution: Changed to `npm install` in Dockerfiles

3. **ES Module Syntax**
   - Issue: Node.js expecting CommonJS in config files
   - Resolution: Changed from `export default` to `module.exports`
   - Files: `postcss.config.js`, `tailwind.config.js`

4. **PostgreSQL Authentication**
   - Issue: Password mismatch between .env and docker-compose.yml
   - Resolution: Synchronized passwords, reset volumes

5. **API Key Loading**
   - Issue: docker-compose not reading .env file properly
   - Resolution: Added `env_file` directive to docker-compose.yml

---

## Future Releases

### Planned for 1.1.0
- Email verification system
- Password reset functionality
- User profile editing
- Goal update history
- Performance analytics

### Planned for 1.2.0
- Portfolio tracking
- Transaction history
- Investment alerts
- News feed integration
- Advanced charts

### Planned for 2.0.0
- Mobile application (React Native)
- Social features
- Advanced analytics
- Multi-language support
- Dark mode
- Export functionality (PDF/CSV)

---

## Version History

- **1.0.0** (2025-11-04) - Currency change, UI enhancements, risk settings restructure
- **0.5.0** (2025-11-04) - Goal risk settings modification
- **0.1.0** (2025-11) - Initial complete system build

---

## Breaking Changes

### In 1.0.0
- **Currency:** All monetary values now in ZAR instead of USD
- **Registration:** Risk tolerance and experience removed from signup
- **Database:** Goals table schema changed (added columns)
- **Requires:** Database reset with `docker-compose down -v`

### Migration Path (0.x → 1.0.0)
1. Stop all services: `docker-compose down`
2. Backup data if needed (export from PostgreSQL)
3. Remove volumes: `docker-compose down -v`
4. Pull latest code
5. Rebuild: `docker-compose build --no-cache`
6. Start: `docker-compose up -d`
7. Create new user account
8. Recreate goals with new risk settings

---

## Known Issues

### Current Version (1.0.0)
- None reported

### Fixed in 1.0.0
- ✅ Search button now fully functional
- ✅ Currency display consistent across all pages
- ✅ Risk settings properly saved per goal
- ✅ UI animations smooth on all browsers

---

## Contributors

- AI Assistant (Claude Code) - System design and implementation
- User (Dikonketso) - Requirements, testing, and feedback

---

## Documentation

- `README.md` - Project overview and setup
- `PROJECT_DOCUMENTATION.md` - Complete technical documentation
- `QUICK_START_GUIDE.md` - Quick reference guide
- `CHANGELOG.md` - This file

---

**Maintained by:** Cleva Investment Development Team
**Last Updated:** November 4, 2025
