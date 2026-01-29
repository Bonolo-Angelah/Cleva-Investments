# CLEVA INVESTMENT PLATFORM
## Database Scripts Documentation

This directory contains all database initialization and schema scripts for the Cleva Investment Platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Script Execution Order](#script-execution-order)
4. [PostgreSQL Setup](#postgresql-setup)
5. [MongoDB Setup](#mongodb-setup)
6. [Neo4j Setup](#neo4j-setup)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Cleva Investment Platform uses a **multi-database architecture**:

- **PostgreSQL**: Relational data (users, goals, portfolios, transactions)
- **MongoDB**: Document data (chat histories, articles, activity logs)
- **Neo4j**: Graph data (investment recommendations, relationships)

---

## ⚙️ Prerequisites

### Option 1: Using Docker (Recommended)
- Docker Desktop installed and running
- No manual database setup required - databases are automatically initialized

### Option 2: Manual Setup
- PostgreSQL 14+ installed
- MongoDB 5+ installed
- Neo4j 5+ installed
- Database admin credentials

---

## 📝 Script Execution Order

Execute scripts in this order:

1. **01-postgresql-schema.sql** - PostgreSQL tables and indexes
2. **02-mongodb-schema.js** - MongoDB collections and indexes
3. **03-neo4j-schema.cypher** - Neo4j nodes and relationships

---

## 🐘 PostgreSQL Setup

### Using Docker (Automatic)

The PostgreSQL database is automatically created when you run:
```bash
docker-compose up -d
```

The schema is applied automatically by Sequelize when the backend starts.

### Manual Setup

#### Step 1: Connect to PostgreSQL
```bash
# Using psql command line
psql -h localhost -U postgres

# Or using pgAdmin GUI
# Connect to: localhost:5432
# Username: postgres
# Password: your_password
```

#### Step 2: Create Database
```sql
CREATE DATABASE cleva_investment;
\c cleva_investment
```

#### Step 3: Execute Schema Script
```bash
# From command line
psql -h localhost -U postgres -d cleva_investment -f 01-postgresql-schema.sql

# Or copy-paste the SQL content in pgAdmin
```

#### Step 4: Verify Installation
```sql
-- List all tables
\dt

-- View table structure
\d users

-- Check seeded admin user
SELECT email, role FROM users WHERE role = 'admin';
```

### Database Credentials

**Default (from .env):**
- Host: `localhost`
- Port: `5432`
- Database: `cleva_investment`
- Username: `postgres`
- Password: `cleva_postgres_password`

### Tables Created

1. **users** - User accounts and profiles
2. **goals** - Financial goals
3. **portfolios** - Investment portfolios
4. **portfolio_holdings** - Individual investments
5. **transactions** - Portfolio transactions

### Views Created

- `user_statistics` - User metrics
- `goal_statistics` - Goal metrics
- `portfolio_statistics` - Portfolio metrics

---

## 🍃 MongoDB Setup

### Using Docker (Automatic)

The MongoDB database is automatically created when you run:
```bash
docker-compose up -d
```

### Manual Setup

#### Step 1: Connect to MongoDB
```bash
# Using mongo shell
mongosh "mongodb://localhost:27017"

# Or using MongoDB Compass GUI
# Connect to: mongodb://localhost:27017
```

#### Step 2: Execute Schema Script
```bash
# From command line
mongosh "mongodb://localhost:27017" < 02-mongodb-schema.js

# Or use MongoDB Compass:
# 1. Connect to database
# 2. Open mongosh terminal
# 3. Copy-paste the script content
```

#### Step 3: Verify Installation
```javascript
// Switch to database
use cleva_investment

// List collections
show collections

// Count documents
db.chat_histories.countDocuments()
db.articles.countDocuments()

// View sample article
db.articles.findOne()
```

### Database Credentials

**Default (from .env):**
- URI: `mongodb://localhost:27017/cleva_investment`

### Collections Created

1. **chat_histories** - AI chat conversations
2. **articles** - Financial news articles
3. **activity_logs** - User activity audit trail (90-day TTL)
4. **market_data_cache** - Cached market data (1-hour TTL)

### Indexes Created

- Text indexes for full-text search on articles
- Compound indexes for efficient queries
- TTL indexes for automatic data expiration

---

## 🔵 Neo4j Setup

### Using Docker (Automatic)

The Neo4j database is automatically created when you run:
```bash
docker-compose up -d
```

Access Neo4j Browser at: http://localhost:7474

### Manual Setup

#### Step 1: Connect to Neo4j
```bash
# Using cypher-shell command line
cypher-shell -u neo4j -p your_password

# Or using Neo4j Browser GUI
# Navigate to: http://localhost:7474
# Username: neo4j
# Password: your_password
```

#### Step 2: Execute Schema Script

**Option A: Using Neo4j Browser**
1. Open http://localhost:7474
2. Login with credentials
3. Copy-paste the contents of `03-neo4j-schema.cypher`
4. Execute each section separately (separated by blank lines)

**Option B: Using cypher-shell**
```bash
cypher-shell -u neo4j -p cleva_neo4j_password < 03-neo4j-schema.cypher
```

#### Step 3: Verify Installation
```cypher
// Count all nodes
MATCH (n) RETURN labels(n)[0] as Label, COUNT(n) as Count;

// Count all relationships
MATCH ()-[r]->() RETURN type(r) as Type, COUNT(r) as Count;

// View sample investment
MATCH (i:Investment {symbol: 'STX40'}) RETURN i;

// View sample user
MATCH (u:User) RETURN u LIMIT 1;
```

### Database Credentials

**Default (from .env):**
- URI: `bolt://localhost:7687`
- Username: `neo4j`
- Password: `cleva_neo4j_password`
- Browser: http://localhost:7474

### Nodes Created

1. **User** - User profiles for recommendations
2. **Investment** - Stocks, ETFs, bonds
3. **Sector** - Industry sectors
4. **Goal** - Financial goals (optional)

### Relationships Created

- **VIEWED** - User viewed investment
- **OWNS** - User owns investment
- **SIMILAR_TO** - Similar investments
- **BELONGS_TO** - Investment belongs to sector
- **SIMILAR_PROFILE** - Similar users

### Sample Data

The script creates:
- 7 Sector nodes (Technology, Finance, Healthcare, etc.)
- 8 Investment nodes (JSE stocks and ETFs)
- 1 Test user with sample interactions

---

## ✅ Verification

### Verify All Databases

#### 1. PostgreSQL
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check admin user
SELECT email, role, is_active FROM users WHERE role = 'admin';
```

#### 2. MongoDB
```javascript
use cleva_investment

// Verify collections
show collections

// Verify indexes
db.chat_histories.getIndexes()
db.articles.getIndexes()
```

#### 3. Neo4j
```cypher
// Verify nodes
MATCH (n) RETURN labels(n), COUNT(n);

// Verify relationships
MATCH ()-[r]->() RETURN type(r), COUNT(r);

// Test recommendation query
MATCH (i:Investment)-[:BELONGS_TO]->(s:Sector {name: 'Financial Services'})
RETURN i.symbol, i.name, i.riskLevel;
```

---

## 🔧 Troubleshooting

### PostgreSQL Issues

**Problem: Cannot connect to PostgreSQL**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Problem: Permission denied**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE cleva_investment TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### MongoDB Issues

**Problem: Cannot connect to MongoDB**
```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

**Problem: Collection not found**
```javascript
// Verify you're in correct database
db.getName()

// Switch to correct database
use cleva_investment
```

### Neo4j Issues

**Problem: Cannot connect to Neo4j**
```bash
# Check if Neo4j is running
docker-compose ps

# View Neo4j logs
docker-compose logs neo4j

# Restart Neo4j
docker-compose restart neo4j
```

**Problem: Authentication failed**
```cypher
// Reset password (in cypher-shell)
ALTER USER neo4j SET PASSWORD 'new_password';
```

**Problem: Constraint already exists**
```cypher
// Drop existing constraints
DROP CONSTRAINT user_id_unique IF EXISTS;
DROP CONSTRAINT investment_symbol_unique IF EXISTS;

// Then re-run the script
```

---

## 🔄 Reset Databases

### Reset All Databases (Clean Install)

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: Deletes all data!)
docker-compose down -v

# Restart with clean databases
docker-compose up -d

# Re-run initialization scripts (automatic with Docker)
```

### Reset Individual Databases

**PostgreSQL:**
```sql
DROP DATABASE cleva_investment;
CREATE DATABASE cleva_investment;
-- Then re-run 01-postgresql-schema.sql
```

**MongoDB:**
```javascript
use cleva_investment
db.dropDatabase()
// Then re-run 02-mongodb-schema.js
```

**Neo4j:**
```cypher
MATCH (n) DETACH DELETE n;
// Then re-run 03-neo4j-schema.cypher
```

---

## 📊 Database Maintenance

### Regular Maintenance Tasks

#### PostgreSQL
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim storage
VACUUM;

-- Check database size
SELECT pg_size_pretty(pg_database_size('cleva_investment'));
```

#### MongoDB
```javascript
// Compact collections
db.runCommand({ compact: 'chat_histories' });

// Check database size
db.stats()

// Clear expired cache manually
db.market_data_cache.deleteMany({
  expiresAt: { $lt: new Date() }
});
```

#### Neo4j
```cypher
// Remove orphaned nodes
MATCH (n) WHERE NOT (n)--() DELETE n;

// Update statistics
CALL db.stats.retrieve('GRAPH COUNTS');

// Clear all data (use with caution!)
MATCH (n) DETACH DELETE n;
```

---

## 📞 Support

For issues or questions:
1. Check Docker logs: `docker-compose logs [service-name]`
2. Verify environment variables in `backend/.env`
3. Ensure all containers are running: `docker-compose ps`
4. Refer to the main deployment manual

---

## 📝 Notes

- All scripts are idempotent where possible (can be run multiple times)
- Sample/seed data is included for testing purposes
- Change default passwords in production!
- Regular backups are recommended
- TTL indexes automatically clean old data in MongoDB

---

**Version:** 1.0
**Last Updated:** 2026-01-21
