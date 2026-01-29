# Admin Dashboard Implementation Guide

## Overview
A comprehensive Admin-Only Dashboard has been successfully implemented for the Cleva Investment platform. This dashboard provides administrators with powerful tools to monitor system health, manage users, view activity logs, and generate detailed reports.

## Features Implemented

### 1. Backend Infrastructure

#### User Role Management
- **File**: `backend/src/models/postgres/User.js`
- Added `role` field with ENUM values: `'user'` and `'admin'`
- Default value: `'user'`
- Enables role-based access control throughout the system

#### Admin Authentication Middleware
- **File**: `backend/src/middleware/auth.js`
- `requireAdmin` middleware function
- Validates JWT token and checks user role
- Returns 403 error for non-admin users

#### Activity Logging System
- **File**: `backend/src/models/mongodb/ActivityLog.js`
- Comprehensive MongoDB schema for tracking all system activities
- **21 Action Types**: login, logout, register, create_goal, update_goal, delete_goal, create_portfolio, update_portfolio, delete_portfolio, add_transaction, delete_transaction, chat_message, view_recommendations, export_report, update_profile, change_password, enable_2fa, disable_2fa, view_market_data, search_stock, admin_access, generate_report
- Static methods for querying and statistics
- Captures: userId, userEmail, action, description, metadata, ipAddress, userAgent, status, timestamp

#### Admin Controller
- **File**: `backend/src/controllers/adminController.js`
- **10 Controller Functions**:
  1. `getDashboardStats` - Comprehensive system statistics
  2. `getRecentActivity` - Activity logs with filters
  3. `getAllUsers` - Paginated user list with search
  4. `getUserDetails` - Detailed user information
  5. `updateUserStatus` - Activate/deactivate users
  6. `updateUserRole` - Change user role
  7. `getSystemHealth` - Database and system health metrics
  8. `generateUserActivityReport` - Generate activity reports (PDF/CSV/Excel)
  9. `generateUsageReport` - Generate usage reports (PDF/CSV/Excel)
  10. `generatePerformanceReport` - Generate performance/audit reports (PDF/CSV/Excel)

#### Report Generation Service
- **File**: `backend/src/services/reportService.js`
- **Libraries**: pdfkit, csv-writer, exceljs
- **3 Report Types**:
  1. **User Activity Report**: Detailed activity logs with filters
  2. **Usage Report**: System usage statistics and metrics
  3. **Performance Report**: System health and audit logs
- **3 Formats**: PDF, CSV, Excel
- Professional formatting with headers, tables, and charts
- Automatic file cleanup for old reports

#### Admin Routes
- **File**: `backend/src/routes/admin.js`
- **Base Path**: `/api/admin`
- **Security**: All routes require authentication + admin role
- **Endpoints**:
  - `GET /stats` - Dashboard statistics
  - `GET /activity` - Activity logs
  - `GET /users` - List all users
  - `GET /users/:userId` - User details
  - `PATCH /users/:userId/status` - Update user status
  - `PATCH /users/:userId/role` - Update user role
  - `GET /health` - System health
  - `GET /reports/activity` - Download activity report
  - `GET /reports/usage` - Download usage report
  - `GET /reports/performance` - Download performance report

### 2. Frontend Implementation

#### Admin Dashboard Page
- **File**: `frontend/src/pages/AdminDashboard.jsx`
- **5 Tabs**:
  1. **Overview**: System statistics, charts, recent activity
  2. **Users**: User management table
  3. **Activity Logs**: Detailed activity feed
  4. **Reports**: Report generation interface
  5. **System Health**: Database status, memory usage, uptime

#### Data Visualizations
- **Library**: Recharts
- **Charts Implemented**:
  - Bar Chart: Activity breakdown
  - Pie Chart: Active vs inactive users
  - Statistics cards with icons
  - Progress indicators

#### Admin Route Protection
- **File**: `frontend/src/components/AdminRoute.jsx`
- Checks authentication status
- Validates admin role
- Redirects non-admin users to dashboard

#### Admin API Integration
- **File**: `frontend/src/services/api.js`
- Complete admin API client
- Report download with blob handling
- Proper error handling

#### Navigation Updates
- **File**: `frontend/src/components/Navbar.jsx`
- Admin link visible only to admin users
- Shield icon for admin section
- Conditional rendering based on user role

## Testing Instructions

### 1. Create an Admin User

You need to manually set a user's role to 'admin' in the database:

**Using PostgreSQL**:
```sql
-- Find your user
SELECT id, email, "firstName", "lastName", role FROM users WHERE email = 'your-email@example.com';

-- Update user role to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, "firstName", "lastName", role FROM users WHERE email = 'your-email@example.com';
```

### 2. Access the Admin Dashboard

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Log in with your admin user credentials

4. You should see an "Admin" link in the navbar

5. Click the "Admin" link or navigate to `http://localhost:5173/admin`

### 3. Test Dashboard Features

#### Overview Tab
- Verify all statistics are displayed correctly
- Check that charts render properly
- Confirm recent activity table shows data

#### Users Tab
- View list of all users
- Check pagination (if you have >10 users)
- Verify user status badges (Active/Inactive)
- Verify role badges (user/admin)

#### Activity Logs Tab
- View detailed activity feed
- Check timestamp formatting
- Verify status icons (success/failed)

#### Reports Tab
- Select different formats (PDF, CSV, Excel)
- Click download buttons for each report type:
  - Activity Report
  - Usage Report
  - Performance Report
- Verify files download successfully
- Open downloaded files to check formatting

#### System Health Tab
- Check database connection status (PostgreSQL, MongoDB)
- Verify memory usage statistics
- Confirm system uptime is displayed
- Click "Refresh Data" button to reload

### 4. Test Role-Based Access

1. Create a regular user (non-admin)
2. Log in as that user
3. Try to access `/admin` directly
4. Verify you're redirected to `/dashboard`
5. Confirm no "Admin" link appears in navbar

## API Endpoints Reference

### Dashboard Statistics
```
GET /api/admin/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "users": {
    "total": 150,
    "active": 120,
    "newThisMonth": 25,
    "activePercentage": "80.00"
  },
  "portfolios": {
    "total": 85,
    "totalValue": 1250000,
    "totalGainLoss": 75000
  },
  "goals": {
    "total": 200,
    "active": 150,
    "completed": 40,
    "completionRate": "20.00"
  },
  "chat": {
    "totalSessions": 500,
    "recentSessions": 45
  },
  "activityStats": { ... }
}
```

### Generate Report
```
GET /api/admin/reports/activity?format=pdf&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Query Parameters**:
- `format`: pdf | csv | excel (required)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `userId`: UUID (optional, activity report only)
- `action`: action type (optional, activity report only)
- `status`: success | failed (optional, activity report only)

**Response**: Binary file download

## Security Considerations

1. **Authentication Required**: All admin endpoints require valid JWT token
2. **Role Verification**: Double-layer security with `requireAdmin` middleware
3. **Activity Logging**: All admin actions are logged for audit trail
4. **Input Validation**: Proper validation on all endpoints
5. **Error Handling**: Secure error messages without exposing sensitive data

## Database Schema Changes

### PostgreSQL (User Model)
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user';
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
```

### MongoDB (ActivityLog Collection)
```javascript
{
  userId: String,
  userEmail: String,
  action: String, // One of 21 action types
  description: String,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  status: String, // 'success' or 'failed'
  timestamp: Date
}
```

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── adminController.js (10 functions)
│   ├── middleware/
│   │   └── auth.js (requireAdmin)
│   ├── models/
│   │   ├── mongodb/
│   │   │   ├── ActivityLog.js (new)
│   │   │   └── index.js (updated)
│   │   └── postgres/
│   │       └── User.js (role field added)
│   ├── routes/
│   │   └── admin.js (11 endpoints)
│   ├── services/
│   │   └── reportService.js (new)
│   └── server.js (integrated admin routes)

frontend/
├── src/
│   ├── components/
│   │   ├── AdminRoute.jsx (new)
│   │   └── Navbar.jsx (updated)
│   ├── pages/
│   │   └── AdminDashboard.jsx (new, 700+ lines)
│   ├── services/
│   │   └── api.js (admin API added)
│   └── App.jsx (admin route added)
```

## Dependencies Added

### Backend
```json
{
  "pdfkit": "^0.15.0",
  "csv-writer": "^1.6.0",
  "exceljs": "^4.4.0"
}
```

### Frontend
```json
{
  "recharts": "^2.12.0"
}
```

## Future Enhancements (Optional)

1. **Real-time Updates**: WebSocket integration for live activity feed
2. **Advanced Filtering**: More filter options for users and activities
3. **Bulk Operations**: Bulk user management actions
4. **Custom Reports**: Allow admins to create custom report queries
5. **Email Notifications**: Alert admins of critical system events
6. **Scheduled Reports**: Automatic report generation and email delivery
7. **User Analytics**: Deeper insights into user behavior patterns
8. **System Alerts**: Configure thresholds for automated alerts
9. **Audit Trail Export**: Compliance-focused audit trail reports
10. **Dashboard Customization**: Allow admins to customize dashboard layout

## Troubleshooting

### Admin link not showing in navbar
- Verify user's role is set to 'admin' in database
- Check that user object is properly loaded in frontend state
- Clear browser cache and localStorage

### Reports not downloading
- Check backend server logs for errors
- Verify temp/reports directory exists and is writable
- Ensure report generation libraries are installed

### Permission errors
- Confirm JWT token is valid
- Check that requireAdmin middleware is properly applied
- Verify user session is active

### Charts not rendering
- Ensure recharts is installed in frontend
- Check browser console for errors
- Verify data format matches chart requirements

## Support

For issues or questions regarding the admin dashboard:
1. Check server logs: `backend/logs/` (if logging is configured)
2. Check browser console for frontend errors
3. Review activity logs in the database
4. Test API endpoints directly using Postman or curl

## Conclusion

The Admin Dashboard is now fully functional with comprehensive features for system monitoring, user management, activity tracking, and report generation. All security measures are in place, and the interface is intuitive and responsive.
