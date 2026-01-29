# Cleva Investment - Database Access Guide

## Overview

Cleva Investment uses three databases for different purposes:

1. **PostgreSQL** - User data, portfolios, goals, transactions
2. **MongoDB** - Chat history, articles, AI conversations
3. **Neo4j** - Investment recommendations graph database

---

## 1. PostgreSQL Database 🐘

### Connection Details:
- **Host:** localhost
- **Port:** 5432
- **Database:** cleva_investment
- **Username:** postgres
- **Password:** (leave blank - trust authentication temporarily enabled)

### What's Stored:
- Users (authentication, profiles)
- Portfolios (investment portfolios)
- Portfolio Holdings (stocks, assets)
- Transactions (buy/sell/dividend)
- Goals (financial goals, targets)

### Access Methods:

#### A. Using pgAdmin (GUI - Recommended)

1. **Download pgAdmin:**
   - Visit: https://www.pgadmin.org/download/
   - Download and install for Windows

2. **Connect to Database:**
   - Open pgAdmin
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab:**
     - Name: Cleva Investment
   - **Connection Tab:**
     - Host: localhost
     - Port: 5432
     - Database: cleva_investment
     - Username: postgres
     - Password: (leave blank)
   - Click "Save"

3. **Browse Data:**
   - Expand: Servers → Cleva Investment → Databases → cleva_investment
   - Go to: Schemas → public → Tables
   - Right-click any table → "View/Edit Data" → "All Rows"

#### B. Using DBeaver (Universal GUI)

1. **Download DBeaver:**
   - Visit: https://dbeaver.io/download/
   - Download Community Edition

2. **Connect:**
   - Click "New Database Connection"
   - Select "PostgreSQL"
   - Enter connection details (same as above)
   - Test connection
   - Click "Finish"

#### C. Using Command Line (psql)

```bash
# Access PostgreSQL container
docker exec -it cleva-postgres psql -U postgres -d cleva_investment

# View all tables
\dt

# View specific table data
SELECT * FROM users;
SELECT * FROM portfolios;
SELECT * FROM portfolio_holdings;
SELECT * FROM transactions;
SELECT * FROM goals;

# Exit
\q
```

#### D. Using Docker Command (Quick View)

```bash
# View users table
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "SELECT * FROM users;"

# View portfolios
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "SELECT * FROM portfolios;"

# View transactions
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "SELECT * FROM transactions;"
```

---

## 2. MongoDB Database 🍃

### Connection Details:
- **Host:** localhost
- **Port:** 27017
- **Database:** cleva_investment
- **Authentication:** Not required (no username/password)

### What's Stored:
- Chat History (user conversations)
- Chat Sessions (conversation sessions)
- Articles (market news and articles)
- AI Responses (cached AI responses)

### Access Methods:

#### A. Using MongoDB Compass (GUI - Recommended)

1. **Download MongoDB Compass:**
   - Visit: https://www.mongodb.com/try/download/compass
   - Download and install for Windows

2. **Connect:**
   - Open MongoDB Compass
   - Connection String:
     ```
     mongodb://localhost:27017/cleva_investment
     ```
   - Click "Connect"

3. **Browse Data:**
   - Select database: cleva_investment
   - Click on collections (chat_history, chat_sessions, articles)
   - Browse documents

#### B. Using MongoDB CLI (mongosh)

```bash
# Access MongoDB container
docker exec -it cleva-mongodb mongosh cleva_investment

# View collections
show collections

# View chat history
db.chathistories.find().pretty()

# View recent conversations (limit 5)
db.chathistories.find().sort({createdAt: -1}).limit(5)

# View articles
db.articles.find().pretty()

# Exit
exit
```

#### C. Using Docker Command (Quick View)

```bash
# View all chat history
docker exec cleva-mongodb mongosh cleva_investment --quiet --eval "db.chathistories.find().limit(10)"

# Count chat messages
docker exec cleva-mongodb mongosh cleva_investment --quiet --eval "db.chathistories.countDocuments()"

# View latest chat messages
docker exec cleva-mongodb mongosh cleva_investment --quiet --eval "db.chathistories.find().sort({createdAt: -1}).limit(5)"
```

---

## 3. Neo4j Database 🔗

### Connection Details:
- **HTTP:** http://localhost:7474
- **Bolt:** bolt://localhost:7687
- **Username:** neo4j
- **Password:** cleva_neo4j_password

### What's Stored:
- Investment Recommendations (graph relationships)
- User Investment Profiles (nodes)
- Asset Relationships (connections)
- Portfolio Correlations

### Access Methods:

#### A. Using Neo4j Browser (GUI - Built-in)

1. **Open Browser:**
   - Navigate to: http://localhost:7474
   - Or click: http://localhost:7474/browser/

2. **Login:**
   - Connect URL: bolt://localhost:7687
   - Username: neo4j
   - Password: cleva_neo4j_password
   - Click "Connect"

3. **Run Queries (Cypher):**

   ```cypher
   // View all nodes
   MATCH (n) RETURN n LIMIT 25

   // View all relationships
   MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 25

   // Count all nodes
   MATCH (n) RETURN count(n)

   // View users
   MATCH (u:User) RETURN u

   // View investments
   MATCH (i:Investment) RETURN i

   // View user investment interests
   MATCH (u:User)-[r:INTERESTED_IN]->(i:Investment)
   RETURN u, r, i
   ```

#### B. Using Neo4j Desktop (Advanced GUI)

1. **Download Neo4j Desktop:**
   - Visit: https://neo4j.com/download/
   - Download and install

2. **Connect to Remote Database:**
   - Open Neo4j Desktop
   - Add "Remote Connection"
   - URL: bolt://localhost:7687
   - Username: neo4j
   - Password: cleva_neo4j_password

#### C. Using Docker Command (Quick View)

```bash
# Access Neo4j shell
docker exec -it cleva-neo4j cypher-shell -u neo4j -p cleva_neo4j_password

# Run queries
MATCH (n) RETURN count(n);
MATCH (u:User) RETURN u;
:exit
```

---

## Quick Access Commands Summary

### PostgreSQL (Quick View All Tables)
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "\dt"
```

### MongoDB (Quick View Collections)
```bash
docker exec cleva-mongodb mongosh cleva_investment --quiet --eval "show collections"
```

### Neo4j (Quick View Nodes)
```bash
docker exec -it cleva-neo4j cypher-shell -u neo4j -p cleva_neo4j_password -d neo4j "MATCH (n) RETURN count(n);"
```

---

## Database Schema Overview

### PostgreSQL Tables:

1. **users**
   - id, email, password, firstName, lastName
   - country, currency, dateOfBirth
   - riskTolerance, investmentExperience

2. **portfolios**
   - id, userId, name, description
   - totalValue, totalCost, totalGainLoss

3. **portfolio_holdings**
   - id, portfolioId, symbol, name
   - quantity, averageCost, currentPrice
   - currentValue, gainLoss, sector

4. **transactions**
   - id, userId, portfolioId
   - symbol, type, quantity, price
   - totalAmount, transactionDate

5. **goals**
   - id, userId, title, description
   - targetAmount, currentAmount, targetDate
   - goalType, priority, status

### MongoDB Collections:

1. **chat_history**
   - userId, sessionId, message
   - role, timestamp, context

2. **chat_sessions**
   - userId, startTime, endTime
   - messageCount, status

3. **articles**
   - symbol, title, url
   - source, publishedDate, summary

### Neo4j Graph:

1. **Nodes:**
   - User (userId, preferences)
   - Investment (symbol, name, sector)
   - Goal (goalId, type, amount)

2. **Relationships:**
   - (User)-[:INTERESTED_IN]->(Investment)
   - (User)-[:INVESTED_IN]->(Investment)
   - (User)-[:RESEARCHED]->(Investment)

---

## Useful Database Queries

### PostgreSQL - Portfolio Summary
```sql
SELECT
    p.name,
    COUNT(h.id) as num_holdings,
    p.totalValue,
    p.totalGainLoss,
    (p.totalGainLoss / p.totalCost * 100) as roi_percent
FROM portfolios p
LEFT JOIN portfolio_holdings h ON p.id = h."portfolioId"
GROUP BY p.id;
```

### PostgreSQL - User Investment Summary
```sql
SELECT
    u."firstName",
    u."lastName",
    COUNT(DISTINCT p.id) as num_portfolios,
    SUM(p."totalValue") as total_investment_value
FROM users u
LEFT JOIN portfolios p ON u.id = p."userId"
GROUP BY u.id;
```

### MongoDB - Recent Conversations
```javascript
db.chat_history.aggregate([
    {
        $sort: { timestamp: -1 }
    },
    {
        $limit: 10
    },
    {
        $project: {
            userId: 1,
            message: 1,
            role: 1,
            timestamp: 1
        }
    }
])
```

### Neo4j - User Investment Interests
```cypher
MATCH (u:User {id: 'user-id-here'})-[r:INTERESTED_IN]->(i:Investment)
RETURN u.id, i.symbol, i.name, r.strength, r.type
ORDER BY r.strength DESC
```

---

## Troubleshooting

### Can't Connect to Database?

1. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Restart containers:**
   ```bash
   docker-compose restart postgres mongodb neo4j
   ```

3. **Check logs:**
   ```bash
   docker-compose logs postgres
   docker-compose logs mongodb
   docker-compose logs neo4j
   ```

### Connection Refused?

- Make sure Docker containers are running
- Check if ports are not blocked by firewall
- Verify credentials are correct

### No Data Showing?

- Database might be empty if freshly installed
- Create some test data through the application
- Check if application is connected to correct database

---

## Security Notes

⚠️ **Important:**
- These credentials are for **development only**
- Change passwords in production
- Never commit credentials to Git
- Use environment variables for production

---

## Need Help?

- Check container logs: `docker-compose logs [service-name]`
- Restart services: `docker-compose restart`
- Full reset: `docker-compose down -v && docker-compose up -d`

---

**Last Updated:** December 2025
**Version:** 1.0
