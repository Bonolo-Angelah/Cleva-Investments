# USE CASE: View AI Investment Recommendations for Financial Goal

## Use Case Diagram

```
                    +------------------+
                    |                  |
                    |   Cleva System   |
                    |                  |
                    +------------------+
                            |
                            |
         +------------------+------------------+
         |                  |                  |
         |                  |                  |
    +----v----+      +------v------+    +------v------+
    | Login   |      |   View      |    | Request AI  |
    | System  |      |   Goals     |    | Recommend.  |
    +---------+      +-------------+    +-------------+
         |                  |                  |
         |                  |                  |
    [Investor]         [Investor]         [Investor]
         |                  |                  |
         |                  |                  |
         +------------------+------------------+
                            |
                            |
                     +------v------+
                     |   Display   |
                     | Recommend.  |
                     +-------------+
                            |
                       [Investor]
```

---

## Use Case Specification

| **Element** | **Description** |
|------------|-----------------|
| **Use Case ID** | UC-004 |
| **Use Case Name** | View AI Investment Recommendations for Financial Goal |
| **Primary Actor** | Investor (Individual User) |
| **Stakeholders** | Investor seeking personalized investment advice |
| **Goal in Context** | User wants to view AI-generated investment recommendations for their specific financial goal to make informed investment decisions |
| **Scope** | Cleva Investment Web Application |
| **Level** | User-goal level |
| **Preconditions** | 1. User is registered in the system<br/>2. User has successfully logged in<br/>3. User has created at least one financial goal<br/>4. AI service (Cohere API) is operational<br/>5. User has internet connectivity |
| **Success End Condition** | User successfully views personalized AI-generated investment recommendations tailored to their goal |
| **Failed End Condition** | User does not receive recommendations due to system error or unavailable AI service |
| **Trigger** | User clicks on "View Recommendations" button on a financial goal detail page |

---

## Main Success Scenario (Primary Flow)

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 1 | User opens the Cleva Investment web application in browser | System displays login page |
| 2 | User enters email and password, clicks "Login" button | System validates credentials<br/>System generates JWT token<br/>System redirects to Dashboard |
| 3 | User views Dashboard showing summary of financial goals | System displays list of all user's financial goals with progress indicators |
| 4 | User clicks on a specific goal (e.g., "Retirement Fund") | System retrieves goal details from PostgreSQL database<br/>System displays goal detail page showing:<br/>- Goal title and description<br/>- Target amount: R5,000,000<br/>- Target date: 2045-12-31<br/>- Current amount: R150,000<br/>- Progress: 3%<br/>- Risk tolerance: Conservative<br/>- Investment experience: Beginner |
| 5 | User clicks "View AI Recommendations" button | System shows loading indicator "Generating recommendations..." |
| 6 | | System retrieves user profile from PostgreSQL<br/>System queries Neo4j for similar users and their investment patterns<br/>System constructs prompt with:<br/>- User's goal details<br/>- Risk tolerance<br/>- Time horizon<br/>- Investment experience |
| 7 | | System sends request to Cohere AI API with context |
| 8 | | Cohere AI analyzes data and generates personalized recommendations |
| 9 | | System receives AI response with investment recommendations |
| 10 | | System saves recommendations to goal's JSONB field in PostgreSQL |
| 11 | | System creates/updates relationships in Neo4j graph database linking user to recommended investments |
| 12 | | System displays recommendations panel showing:<br/><br/>**Recommended Investments:**<br/>1. Satrix 40 ETF (Ticker: STX40)<br/>   - Allocation: 40%<br/>   - Risk: Low<br/>   - Expected Return: 8-10% p.a.<br/>   - Reason: Diversified SA equity exposure<br/><br/>2. Satrix Bond Index (Ticker: STXGOV)<br/>   - Allocation: 30%<br/>   - Risk: Very Low<br/>   - Expected Return: 6-8% p.a.<br/>   - Reason: Stable income for conservative profile<br/><br/>3. Satrix MSCI World ETF (Ticker: STXWDM)<br/>   - Allocation: 20%<br/>   - Risk: Medium<br/>   - Expected Return: 10-12% p.a.<br/>   - Reason: International diversification<br/><br/>4. Money Market Fund<br/>   - Allocation: 10%<br/>   - Risk: Minimal<br/>   - Expected Return: 5-6% p.a.<br/>   - Reason: Emergency fund and liquidity<br/><br/>**AI Analysis:**<br/>"Based on your conservative risk tolerance and 20-year timeline, I recommend a balanced portfolio weighted toward stable, low-risk investments. The 40/30/20/10 allocation provides growth potential while protecting your capital."<br/><br/>**Monthly Contribution Needed:** R18,500<br/>**Projected Final Amount:** R5,200,000 |
| 13 | User reads recommendations and analysis | System displays disclaimer at bottom:<br/>"⚠️ This is AI-generated educational information, not financial advice. Please consult a licensed financial advisor before making investment decisions." |
| 14 | User clicks "Save Recommendations" button (optional) | System displays success message: "Recommendations saved to your goal!"<br/>System updates lastRecommendationDate field |
| 15 | User clicks "Back to Dashboard" or navigates away | System returns to Dashboard showing updated goal card |

---

## Alternative Flows (Exception Scenarios)

### Alternative Flow 1: Invalid Login Credentials

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 2a | User enters incorrect email or password | System validates credentials<br/>System detects mismatch<br/>System displays error message: "Invalid email or password. Please try again."<br/>System keeps user on login page |
| 2b | User clicks "Forgot Password" link | System navigates to password reset page<br/>**Return to Step 2** |

---

### Alternative Flow 2: No Financial Goals Exist

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 3a | User views Dashboard | System checks for existing goals<br/>System finds no goals<br/>System displays empty state message: "You haven't created any financial goals yet. Let's get started!"<br/>System shows "Create Your First Goal" button |
| 3b | User clicks "Create Your First Goal" | System navigates to goal creation form<br/>**Flow ends - switches to Use Case UC-001: Create Financial Goal** |

---

### Alternative Flow 3: AI Service Unavailable

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 7a | | System sends request to Cohere AI API<br/>API returns timeout error or 503 Service Unavailable |
| 7b | | System catches error<br/>System displays error message: "AI service is temporarily unavailable. Please try again in a few minutes."<br/>System shows "Retry" button |
| 7c | User clicks "Retry" button | **Return to Step 6** (retry recommendation generation) |
| 7d | User clicks "Cancel" | System returns to goal detail page without recommendations |

---

### Alternative Flow 4: Network Connection Lost

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| Any step | User loses internet connection | System detects network error<br/>System displays toast notification: "Connection lost. Please check your internet connection."<br/>System disables all action buttons<br/>System shows reconnection indicator |
| | User's connection is restored | System detects connection restored<br/>System displays toast: "Connection restored!"<br/>System re-enables action buttons<br/>**User can retry action** |

---

### Alternative Flow 5: Session Timeout

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 5a | User's JWT token has expired (after 7 days) | System validates token<br/>System detects expiration<br/>System displays modal: "Your session has expired. Please log in again."<br/>System clears localStorage<br/>System redirects to login page |
| 5b | User logs in again | **Return to Step 2** |

---

### Alternative Flow 6: Recommendations Already Generated

| **Step** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 5a | User clicks "View AI Recommendations" button | System checks if recommendations already exist in database<br/>System finds existing recommendations (less than 7 days old) |
| 5b | | System displays dialog: "You already have recommendations generated on [date]. Would you like to:<br/>1. View existing recommendations<br/>2. Generate new recommendations (this will replace current ones)" |
| 5c | User selects "View existing recommendations" | System displays cached recommendations from PostgreSQL JSONB field<br/>**Skip to Step 12** |
| 5d | User selects "Generate new recommendations" | System proceeds with AI generation<br/>**Continue from Step 6** |

---

## Postconditions

### Success Postconditions:
1. User has viewed AI-generated investment recommendations
2. Recommendations are saved in PostgreSQL database (goals.recommendedInvestments JSONB field)
3. Neo4j graph database contains relationships between user and recommended investments
4. User is informed about next steps for implementing recommendations
5. Recommendation timestamp is recorded for cache validation

### Failure Postconditions:
1. User remains on goal detail page
2. Error message is displayed explaining the issue
3. No new data is saved to database
4. User has option to retry or contact support

---

## Special Requirements

### Performance Requirements:
- **SR-1:** System must generate recommendations within 10 seconds for 95% of requests
- **SR-2:** System must load goal details page within 2 seconds
- **SR-3:** System must handle concurrent requests from 100+ users simultaneously

### Security Requirements:
- **SR-4:** All API requests must include valid JWT token in Authorization header
- **SR-5:** User can only view recommendations for their own goals (enforce userId validation)
- **SR-6:** Sensitive data must be transmitted over HTTPS only

### Usability Requirements:
- **SR-7:** Recommendations must be displayed in clear, non-technical language suitable for beginners
- **SR-8:** System must provide visual indicators (progress bars, loading spinners) during wait times
- **SR-9:** Currency must be displayed in South African Rands (R) format

---

## Business Rules

| **Rule ID** | **Business Rule** |
|-------------|-------------------|
| BR-1 | Recommendations must align with user's stated risk tolerance |
| BR-2 | Conservative risk tolerance: Max 40% equity allocation |
| BR-3 | Moderate risk tolerance: Max 70% equity allocation |
| BR-4 | Aggressive risk tolerance: Max 90% equity allocation |
| BR-5 | Total allocation percentages must sum to 100% |
| BR-6 | Beginner users must receive simpler recommendations (ETFs, not individual stocks) |
| BR-7 | Recommendations must consider time horizon:<br/>- Short-term (<3 years): Focus on low-risk instruments<br/>- Medium-term (3-10 years): Balanced allocation<br/>- Long-term (>10 years): Higher growth potential allowed |
| BR-8 | All recommendations must include disclaimer about consulting licensed financial advisors |
| BR-9 | Recommendations expire after 30 days (user should regenerate) |
| BR-10 | System must recommend at least 3 and maximum 8 different investments per goal |

---

## Frequency of Use
- **Expected Usage:** 2-3 times per user per goal (initial creation, quarterly reviews, goal updates)
- **Peak Usage:** Month-end and beginning when users review financial progress

---

## Open Issues
1. Should system send email notification when new recommendations are generated?
2. Should system provide option to download recommendations as PDF?
3. How to handle recommendations for goals with very short timelines (<6 months)?
4. Should advanced users be able to adjust recommended allocations manually?

---

## User Interface Mockup Description

### Goal Detail Page Layout:

```
+----------------------------------------------------------------+
|  [<- Back to Dashboard]                    [User: Thabo ▼]    |
+----------------------------------------------------------------+
|                                                                |
|  Retirement Fund Goal                            [Edit Goal]  |
|  Status: In Progress  |  Priority: High                        |
|                                                                |
|  +----------------------------------------------------------+  |
|  |  Progress: 3% (R150,000 of R5,000,000)                   |  |
|  |  [▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]        |  |
|  +----------------------------------------------------------+  |
|                                                                |
|  Target Amount:       R5,000,000                               |
|  Target Date:         December 31, 2045 (20 years)             |
|  Monthly Contribution: R10,000                                 |
|  Risk Tolerance:      Conservative                             |
|  Investment Experience: Beginner                               |
|                                                                |
|  +----------------------------------------------------------+  |
|  |            [📊 View AI Recommendations]                   |  |
|  +----------------------------------------------------------+  |
|                                                                |
|  ┌──────────────────────────────────────────────────────────┐ |
|  │  💡 AI Investment Recommendations                        │ |
|  ├──────────────────────────────────────────────────────────┤ |
|  │                                                          │ |
|  │  Recommended Portfolio Allocation:                      │ |
|  │                                                          │ |
|  │  1. Satrix 40 ETF (STX40)              40%              │ |
|  │     Risk: Low | Expected Return: 8-10% p.a.             │ |
|  │     📈 Diversified SA equity exposure                   │ |
|  │     [View Details] [Add to Portfolio]                   │ |
|  │                                                          │ |
|  │  2. Satrix Bond Index (STXGOV)         30%              │ |
|  │     Risk: Very Low | Expected Return: 6-8% p.a.         │ |
|  │     📊 Stable income for conservative profile           │ |
|  │     [View Details] [Add to Portfolio]                   │ |
|  │                                                          │ |
|  │  3. Satrix MSCI World ETF (STXWDM)     20%              │ |
|  │     Risk: Medium | Expected Return: 10-12% p.a.         │ |
|  │     🌍 International diversification                    │ |
|  │     [View Details] [Add to Portfolio]                   │ |
|  │                                                          │ |
|  │  4. Money Market Fund                  10%              │ |
|  │     Risk: Minimal | Expected Return: 5-6% p.a.          │ |
|  │     💰 Emergency fund and liquidity                     │ |
|  │     [View Details] [Add to Portfolio]                   │ |
|  │                                                          │ |
|  │  ─────────────────────────────────────────────────────  │ |
|  │                                                          │ |
|  │  📝 AI Analysis:                                         │ |
|  │  "Based on your conservative risk tolerance and 20-year │ |
|  │  timeline, I recommend a balanced portfolio weighted    │ |
|  │  toward stable, low-risk investments. The 40/30/20/10  │ |
|  │  allocation provides growth potential while protecting  │ |
|  │  your capital."                                         │ |
|  │                                                          │ |
|  │  💵 Monthly Contribution Needed: R18,500                │ |
|  │  📊 Projected Final Amount: R5,200,000                  │ |
|  │                                                          │ |
|  │  ⚠️ This is AI-generated educational information, not   │ |
|  │  financial advice. Please consult a licensed financial  │ |
|  │  advisor before making investment decisions.            │ |
|  │                                                          │ |
|  │  [💾 Save Recommendations] [🔄 Regenerate] [❓ Chat]    │ |
|  └──────────────────────────────────────────────────────────┘ |
|                                                                |
+----------------------------------------------------------------+
```

---

## Sequence Diagram

```
Actor: Investor          System: Frontend        Backend API       PostgreSQL      Neo4j       Cohere AI
   |                          |                      |                 |             |              |
   |--[1. Click "View Recommendations"]-->           |                 |             |              |
   |                          |                      |                 |             |              |
   |                          |--[2. GET /api/goals/:id/recommendations]-->          |              |
   |                          |                      |                 |             |              |
   |                          |                      |--[3. Fetch goal details]-->   |              |
   |                          |                      |<-[Goal data]---------------   |              |
   |                          |                      |                 |             |              |
   |                          |                      |--[4. Query similar users]------------------->|
   |                          |                      |<-[User relationships]--------------------    |
   |                          |                      |                 |             |              |
   |                          |                      |--[5. Send AI prompt]------------------------------------->|
   |                          |                      |                 |             |              |
   |                          |                      |<-[6. AI recommendations]---------------------------        |
   |                          |                      |                 |             |              |
   |                          |                      |--[7. Save recommendations]->  |              |
   |                          |                      |<-[Success]------------------  |              |
   |                          |                      |                 |             |              |
   |                          |                      |--[8. Update graph relationships]------------>|
   |                          |                      |<-[Success]-------------------------------    |
   |                          |                      |                 |             |              |
   |                          |<-[9. Return recommendations + analysis]-              |              |
   |                          |                      |                 |             |              |
   |<-[10. Display recommendations panel]----------  |                 |             |              |
   |                          |                      |                 |             |              |
   |--[11. Read recommendations]                     |                 |             |              |
   |                          |                      |                 |             |              |
```

---

## Non-Functional Requirements

### NFR-1: Response Time
- Goal detail page must load within 2 seconds
- AI recommendations must be generated within 10 seconds
- UI must show loading indicators for operations >1 second

### NFR-2: Availability
- System must maintain 99.5% uptime
- AI service failures must not crash the application
- Graceful degradation when external APIs are unavailable

### NFR-3: Security
- JWT token must be validated on every API request
- User can only access their own goals and recommendations
- All communications must use HTTPS in production
- Rate limiting: Max 10 recommendation requests per hour per user

### NFR-4: Usability
- Recommendations must use language appropriate for user's experience level
- Visual hierarchy: Most important recommendations shown first
- Color coding: Green (low risk), Yellow (medium risk), Red (high risk)
- Mobile-responsive design for all screen sizes

### NFR-5: Scalability
- System must handle 100+ concurrent users viewing recommendations
- Database queries must execute in <50ms
- Caching: Store recommendations for 7 days to reduce AI API costs

---

## Acceptance Criteria

✅ **AC-1:** User can view AI recommendations for any goal they created
✅ **AC-2:** Recommendations include at least 3 investment options with allocation percentages
✅ **AC-3:** Total allocation percentages sum to 100%
✅ **AC-4:** Recommendations align with user's stated risk tolerance
✅ **AC-5:** System displays expected returns for each recommended investment
✅ **AC-6:** System shows disclaimer about consulting licensed financial advisors
✅ **AC-7:** User can save recommendations to goal
✅ **AC-8:** User can regenerate new recommendations
✅ **AC-9:** System displays appropriate error messages when AI service fails
✅ **AC-10:** Monthly contribution calculation is accurate and realistic

---

## Testing Scenarios

### Test Case 1: Happy Path
**Given:** User "Thabo" is logged in and has a goal "Retirement Fund" (Target: R5M, Risk: Conservative)
**When:** Thabo clicks "View AI Recommendations"
**Then:** System displays 4 investment options with 40/30/20/10 allocation and monthly contribution of R18,500

### Test Case 2: AI Service Failure
**Given:** User is logged in and Cohere AI API is down
**When:** User clicks "View AI Recommendations"
**Then:** System displays error message and "Retry" button; no recommendations are shown

### Test Case 3: Unauthorized Access
**Given:** User "Sarah" tries to access goal recommendations URL for "Thabo's" goal
**When:** Sarah navigates to /goals/thabo-goal-id/recommendations
**Then:** System returns 403 Forbidden error and redirects to Sarah's dashboard

### Test Case 4: Expired Session
**Given:** User's JWT token expired 8 days ago
**When:** User clicks "View AI Recommendations"
**Then:** System displays "Session expired" modal and redirects to login page

---

**Document Version:** 1.0
**Last Updated:** January 15, 2026
**Status:** Approved for Implementation
