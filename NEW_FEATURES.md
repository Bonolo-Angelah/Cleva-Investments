# New Features Documentation - Version 1.1.0

**Date:** November 5, 2025
**Status:** Ready for Testing

---

## 🎉 What's New

This update adds **5 major professional-grade features** to Cleva Investment:

1. ✉️ **Email Verification**
2. 🔑 **Password Reset**
3. 🔐 **Two-Factor Authentication (2FA)**
4. 💼 **Portfolio Performance Tracking**
5. 📊 **Investment Transactions History**

---

## 📧 1. Email Verification System

### What It Does
- Sends verification emails to new users
- Confirms email ownership before full account access
- Sends welcome email after verification

### User Flow
1. User registers → Receives verification email
2. User clicks link in email → Email verified
3. System sends welcome email with platform features

### API Endpoints
```
POST /api/auth/register - Creates account and sends verification email
GET /api/auth/verify-email?token=xxx - Verifies email with token
POST /api/auth/resend-verification - Resends verification email (requires auth)
```

### Email Templates
- **Verification Email**: Purple gradient header, 24-hour expiry
- **Welcome Email**: Feature showcase after verification

---

## 🔑 2. Password Reset

### What It Does
- Allows users to reset forgotten passwords
- Secure token-based reset process
- Time-limited reset links (1 hour)

### User Flow
1. User clicks "Forgot Password"
2. Enters email → Receives reset link
3. Clicks link → Sets new password

### API Endpoints
```
POST /api/auth/request-password-reset - Sends reset email
POST /api/auth/reset-password - Resets password with token
```

### Security Features
- Token expires in 1 hour
- One-time use tokens
- Doesn't reveal if email exists (security best practice)

---

## 🔐 3. Two-Factor Authentication (2FA)

### What It Does
- Adds extra security layer with TOTP codes
- Works with Google Authenticator, Authy, Microsoft Authenticator
- QR code for easy setup

### User Flow

**Setup:**
1. User goes to Settings/Security
2. Clicks "Enable 2FA"
3. Scans QR code with authenticator app
4. Enters code to verify → 2FA enabled

**Login with 2FA:**
1. User enters email/password
2. System prompts for 2FA code
3. User enters 6-digit code from app
4. Login successful

### API Endpoints
```
POST /api/auth/setup-2fa - Generate secret and QR code (requires auth)
POST /api/auth/enable-2fa - Verify and enable 2FA (requires auth)
POST /api/auth/disable-2fa - Disable 2FA (requires auth + 2FA code)
POST /api/auth/verify-2fa - Verify 2FA code during login
```

### Security Features
- Secret stored encrypted
- Backup codes (implement separately if needed)
- Email notification when 2FA enabled

---

## 💼 4. Portfolio Performance Tracking

### What It Does
- Track multiple investment portfolios
- Real-time performance metrics
- Gain/loss calculations
- Sector allocation breakdown

### Features

**Portfolio Management:**
- Create multiple portfolios (e.g., "Retirement", "Growth", "Conservative")
- Track individual holdings
- Real-time price updates
- Performance history

**Metrics Tracked:**
- Total invested amount (cost basis)
- Current market value
- Total gain/loss (amount and percentage)
- Per-holding performance
- Sector allocation

### Data Structure

**Portfolio:**
```json
{
  "id": "uuid",
  "name": "Retirement Portfolio",
  "description": "Long-term retirement savings",
  "totalValue": 125000.00,
  "totalCost": 100000.00,
  "totalGainLoss": 25000.00,
  "totalGainLossPercent": 25.00
}
```

**Portfolio Holding:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "quantity": 100,
  "averageCost": 150.00,
  "totalCost": 15000.00,
  "currentPrice": 180.00,
  "currentValue": 18000.00,
  "gainLoss": 3000.00,
  "gainLossPercent": 20.00,
  "sector": "Technology"
}
```

### API Endpoints

**Portfolio CRUD:**
```
POST   /api/portfolios - Create portfolio
GET    /api/portfolios - Get all user portfolios
GET    /api/portfolios/:id - Get single portfolio
PUT    /api/portfolios/:id - Update portfolio
DELETE /api/portfolios/:id - Delete portfolio
```

**Portfolio Actions:**
```
POST /api/portfolios/:id/refresh-prices - Update all holdings prices
GET  /api/portfolios/:id/performance - Get detailed performance metrics
```

---

## 📊 5. Investment Transactions History

### What It Does
- Record all buy/sell transactions
- Track dividend payments
- Calculate cost basis automatically
- Filter and search transaction history

### Transaction Types
1. **Buy**: Purchase shares (increases holdings)
2. **Sell**: Sell shares (decreases holdings)
3. **Dividend**: Record dividend income

### Features

**Transaction Recording:**
- Automatic holding updates
- Cost basis calculation
- Transaction fees tracking
- Notes/memo field

**History & Filtering:**
- Search by symbol
- Filter by date range
- Filter by transaction type
- Sort by date

### Data Structure

**Transaction:**
```json
{
  "id": "uuid",
  "portfolioId": "uuid",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "type": "buy",
  "quantity": 10,
  "price": 150.00,
  "totalAmount": 1500.00,
  "fees": 9.99,
  "notes": "First purchase",
  "transactionDate": "2025-11-05T10:30:00Z"
}
```

### API Endpoints

**Transactions:**
```
POST /api/portfolios/:portfolioId/transactions - Add transaction
GET  /api/portfolios/:portfolioId/transactions - Get all transactions

Query Parameters:
  ?startDate=2025-01-01
  ?endDate=2025-12-31
  ?type=buy|sell|dividend
  ?symbol=AAPL
```

### How It Works

**Adding a Buy Transaction:**
1. User enters transaction details
2. System creates transaction record
3. System updates or creates holding:
   - New holding: Creates with quantity and cost
   - Existing holding: Updates quantity, recalculates average cost
4. System fetches current price from market API
5. System updates portfolio totals

**Adding a Sell Transaction:**
1. User enters sell details
2. System creates transaction record
3. System reduces holding quantity
4. If quantity reaches zero, removes holding
5. System updates portfolio totals

---

## 🗄️ Database Changes

### New Tables

#### users (Updated)
```sql
Added columns:
- emailVerified (BOOLEAN)
- emailVerificationToken (STRING)
- emailVerificationExpires (DATE)
- resetPasswordToken (STRING)
- resetPasswordExpires (DATE)
- twoFactorSecret (STRING)
- twoFactorEnabled (BOOLEAN)
```

#### portfolios (New)
```sql
Columns:
- id (UUID, Primary Key)
- userId (UUID, Foreign Key → users)
- name (STRING)
- description (TEXT)
- totalValue (DECIMAL 15,2)
- totalCost (DECIMAL 15,2)
- totalGainLoss (DECIMAL 15,2)
- totalGainLossPercent (DECIMAL 10,2)
- isActive (BOOLEAN)
- createdAt, updatedAt (TIMESTAMPS)
```

#### portfolio_holdings (New)
```sql
Columns:
- id (UUID, Primary Key)
- portfolioId (UUID, Foreign Key → portfolios)
- symbol (STRING)
- name (STRING)
- quantity (DECIMAL 15,6)
- averageCost (DECIMAL 15,2)
- totalCost (DECIMAL 15,2)
- currentPrice (DECIMAL 15,2)
- currentValue (DECIMAL 15,2)
- gainLoss (DECIMAL 15,2)
- gainLossPercent (DECIMAL 10,2)
- sector (STRING)
- lastUpdated (DATE)
- createdAt, updatedAt (TIMESTAMPS)
```

#### transactions (New)
```sql
Columns:
- id (UUID, Primary Key)
- userId (UUID, Foreign Key → users)
- portfolioId (UUID, Foreign Key → portfolios)
- symbol (STRING)
- name (STRING)
- type (ENUM: buy, sell, dividend)
- quantity (DECIMAL 15,6)
- price (DECIMAL 15,2)
- totalAmount (DECIMAL 15,2)
- fees (DECIMAL 15,2)
- notes (TEXT)
- transactionDate (DATE)
- createdAt, updatedAt (TIMESTAMPS)
```

---

## 🔧 Configuration Required

### 1. Environment Variables

Add to `backend/.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@clevainvestment.com

# App URL (for email links)
APP_URL=http://localhost:5173
```

### 2. Gmail Setup (if using Gmail)

**Option A: App Password (Recommended)**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use App Password in EMAIL_PASSWORD

**Option B: Less Secure Apps**
1. Go to Google Account → Security
2. Enable "Allow less secure apps"
3. Use regular password

**Alternative: Use SendGrid, Mailgun, AWS SES**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### 3. Install Dependencies

```bash
cd backend
npm install nodemailer speakeasy qrcode
```

### 4. Database Migration

The new tables will be created automatically when you restart the backend:

```bash
docker-compose down
docker-compose up -d
```

Or manually reset (⚠️ deletes all data):

```bash
docker-compose down -v
docker-compose up -d
```

---

## 📱 Frontend Implementation Needed

### Pages to Create

#### 1. Email Verification Page
**Path:** `/verify-email`
```jsx
- Reads token from URL query
- Calls /api/auth/verify-email
- Shows success/error message
- Redirects to dashboard on success
```

#### 2. Forgot Password Page
**Path:** `/forgot-password`
```jsx
- Email input form
- Calls /api/auth/request-password-reset
- Shows confirmation message
```

#### 3. Reset Password Page
**Path:** `/reset-password`
```jsx
- Reads token from URL query
- New password input (with confirmation)
- Calls /api/auth/reset-password
- Redirects to login on success
```

#### 4. 2FA Setup Page
**Path:** `/settings/security`
```jsx
- Shows current 2FA status
- "Enable 2FA" button
- Displays QR code when setting up
- Input field for verification code
- Calls /api/auth/setup-2fa and /api/auth/enable-2fa
```

#### 5. 2FA Verification Modal
**Component:** `TwoFactorModal.jsx`
```jsx
- Shown during login if 2FA required
- 6-digit code input
- Calls /api/auth/verify-2fa
- Auto-focuses on input
```

#### 6. Portfolio Management Page
**Path:** `/portfolios`
```jsx
Features:
- List all portfolios
- Create new portfolio button/modal
- Portfolio cards with summary:
  - Total value
  - Gain/loss
  - Holdings count
- Click to view details
```

#### 7. Portfolio Details Page
**Path:** `/portfolios/:id`
```jsx
Features:
- Portfolio header (name, description, edit button)
- Performance metrics cards:
  - Total Invested
  - Current Value
  - Total Gain/Loss
  - Gain/Loss %
- Holdings table:
  - Symbol, Name, Quantity
  - Avg Cost, Current Price
  - Total Value, Gain/Loss
  - Actions (sell button)
- "Add Transaction" button
- "Refresh Prices" button
- Sector allocation pie chart
```

#### 8. Add Transaction Modal
**Component:** `AddTransactionModal.jsx`
```jsx
Form fields:
- Transaction type (Buy/Sell/Dividend)
- Symbol (with search/autocomplete)
- Quantity
- Price per share
- Transaction date
- Fees (optional)
- Notes (optional)

Validation:
- Required fields check
- Positive numbers only
- For sells: check sufficient quantity

On submit:
- Calls /api/portfolios/:id/transactions
- Updates holdings
- Refreshes portfolio view
```

#### 9. Transaction History Page
**Path:** `/portfolios/:id/transactions`
```jsx
Features:
- Transaction history table:
  - Date, Symbol, Type
  - Quantity, Price
  - Total Amount, Fees
  - Notes
- Filters:
  - Date range picker
  - Transaction type dropdown
  - Symbol search
- Sort by date (newest first)
- Export to CSV button (future)
```

---

## 🧪 Testing Checklist

### Email Verification
- [ ] Register new user
- [ ] Receive verification email
- [ ] Click link → Email verified
- [ ] Receive welcome email
- [ ] Try expired token → Error shown
- [ ] Resend verification works

### Password Reset
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Click link → Can set new password
- [ ] Login with new password
- [ ] Try expired token → Error shown

### 2FA
- [ ] Setup 2FA → QR code shown
- [ ] Scan with Google Authenticator
- [ ] Enter code → 2FA enabled
- [ ] Logout and login → 2FA code required
- [ ] Enter correct code → Login successful
- [ ] Enter wrong code → Error shown
- [ ] Disable 2FA → Works correctly

### Portfolio Tracking
- [ ] Create portfolio
- [ ] Add buy transaction
- [ ] Holdings updated correctly
- [ ] Average cost calculated correctly
- [ ] Add another buy → Average cost recalculated
- [ ] Sell transaction reduces quantity
- [ ] Sell all shares → Holding removed
- [ ] Refresh prices → Current values updated
- [ ] Performance metrics accurate
- [ ] Multiple portfolios work independently

### Transactions
- [ ] View transaction history
- [ ] Filter by date range
- [ ] Filter by type (buy/sell)
- [ ] Filter by symbol
- [ ] All transactions show correct details
- [ ] Fees included in totals

---

## 🔒 Security Considerations

### Email Security
- Tokens are 32-byte random hex strings
- Tokens expire after set time (24h verification, 1h reset)
- Tokens are one-time use only
- Sensitive fields excluded from JSON responses

### 2FA Security
- Secrets stored in database (consider encryption)
- TOTP uses standard RFC 6238
- 2-minute time window for clock drift
- Backup codes not yet implemented (add if needed)

### Password Reset Security
- Doesn't reveal if email exists
- Token expires quickly (1 hour)
- Old password not required (user forgot it)
- Email notification sent

### Portfolio Security
- All endpoints require authentication
- Users can only access their own portfolios
- Cascading deletes for data integrity
- Input validation on all endpoints

---

## 📈 Performance Optimizations

### Price Updates
- Market data cached (5 minutes)
- Bulk price updates for multiple holdings
- Async price refresh (doesn't block UI)

### Database
- Indexes on foreign keys
- Composite unique index on portfolio+symbol
- Efficient queries with includes

### API
- Rate limiting applied
- Pagination ready (implement if needed)
- Transaction batching possible

---

## 🚀 Deployment Steps

### 1. Update Backend Code
All backend changes are complete and ready.

### 2. Update Environment Variables
Add email configuration to `backend/.env`

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Rebuild Backend Container
```bash
docker-compose stop backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### 5. Check Database Migration
```bash
docker-compose logs backend | grep "synchronized"
```

### 6. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Register with new fields
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### 7. Implement Frontend Pages
Create the frontend components listed above.

### 8. Test End-to-End
Follow the testing checklist.

---

## 📝 API Examples

### Register User (with Email Verification)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Verify Email
```bash
curl http://localhost:5000/api/auth/verify-email?token=abc123xyz...
```

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Setup 2FA
```bash
curl -X POST http://localhost:5000/api/auth/setup-2fa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Portfolio
```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Growth Portfolio",
    "description": "High-growth stocks"
  }'
```

### Add Buy Transaction
```bash
curl -X POST http://localhost:5000/api/portfolios/PORTFOLIO_ID/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "buy",
    "quantity": 10,
    "price": 180.50,
    "fees": 9.99,
    "notes": "First purchase"
  }'
```

### Get Portfolio Performance
```bash
curl http://localhost:5000/api/portfolios/PORTFOLIO_ID/performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎓 Next Steps

### Immediate
1. ✅ Configure email settings in .env
2. ✅ Install dependencies
3. ✅ Restart backend
4. ⏳ Test API endpoints
5. ⏳ Implement frontend pages

### Future Enhancements
- [ ] Email templates with branding
- [ ] SMS-based 2FA option
- [ ] Backup codes for 2FA
- [ ] Portfolio performance charts
- [ ] Transaction export (CSV/PDF)
- [ ] Recurring transaction templates
- [ ] Portfolio sharing
- [ ] Real-time price WebSocket
- [ ] Portfolio rebalancing suggestions
- [ ] Tax reporting (cost basis, gains)

---

## 🆘 Troubleshooting

### Email Not Sending
```bash
# Check logs
docker-compose logs backend | grep -i email

# Common issues:
# 1. Wrong SMTP settings
# 2. Gmail blocking less secure apps
# 3. Missing app password
# 4. Port 587 blocked by firewall
```

### 2FA QR Code Not Working
```bash
# Verify speakeasy installed
docker-compose exec backend npm list speakeasy

# Check secret format
# Should be base32 string
```

### Database Migration Issues
```bash
# Reset database completely
docker-compose down -v
docker-compose up -d

# Check table creation
docker-compose exec postgres psql -U postgres -d cleva_investment -c "\dt"
```

### Portfolio Calculations Wrong
```bash
# Check holding updates
# Verify market data service working
# Look for NaN or null values
docker-compose logs backend | grep -i portfolio
```

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f backend`
2. Review API responses in browser DevTools
3. Verify environment variables set correctly
4. Ensure all dependencies installed
5. Check database tables created

---

**Version:** 1.1.0
**Last Updated:** November 5, 2025
**Status:** ✅ Backend Complete | ⏳ Frontend Pending
