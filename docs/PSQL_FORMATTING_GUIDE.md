# PostgreSQL - Nice Table Formatting Guide

## Problem: Messy Table Display
When you run `SELECT * FROM users;`, tables with many columns appear messy and hard to read.

## Solutions

---

## ✅ Solution 1: Expanded Display (Best for Wide Tables)

### Quick Command:
```bash
docker exec -it cleva-postgres psql -U postgres -d cleva_investment
```

Then inside psql:
```sql
-- Turn ON expanded display
\x

-- Query your table
SELECT * FROM users;
```

**Before (Normal):**
```
id | email | firstName | lastName | ... (all squeezed in one line)
```

**After (Expanded):**
```
-[ RECORD 1 ]--------+---------------------------
id                   | c705d41e-183f...
email                | dikonketso@gmail.com
firstName            | Dikonketso
lastName             | Ndumndum
currency             | USD
riskTolerance        | moderate
```

---

## ✅ Solution 2: Select Specific Columns Only

Instead of `SELECT *`, choose what you need:

### Users Table (Clean View):
```sql
SELECT
    id,
    email,
    "firstName",
    "lastName",
    currency,
    "riskTolerance"
FROM users;
```

### Portfolios (Summary View):
```sql
SELECT
    name,
    "totalValue",
    "totalGainLoss",
    "createdAt"
FROM portfolios
ORDER BY "createdAt" DESC;
```

### Goals (Overview):
```sql
SELECT
    title,
    "targetAmount",
    "currentAmount",
    "targetDate",
    status
FROM goals
WHERE status = 'active';
```

### Transactions (Recent):
```sql
SELECT
    symbol,
    type,
    quantity,
    price,
    "transactionDate"
FROM transactions
ORDER BY "transactionDate" DESC
LIMIT 10;
```

---

## ✅ Solution 3: Use Aliases for Pretty Column Names

```sql
SELECT
    "firstName" || ' ' || "lastName" AS "Full Name",
    email AS "Email Address",
    currency AS "Currency",
    "riskTolerance" AS "Risk Level"
FROM users;
```

**Output:**
```
    Full Name    |      Email Address        | Currency | Risk Level
-----------------+---------------------------+----------+------------
 Dikonketso Ndumndum | dikonketso@gmail.com   | USD      | moderate
```

---

## ✅ Solution 4: Format Settings Inside psql

```bash
docker exec -it cleva-postgres psql -U postgres -d cleva_investment
```

Then customize display:

```sql
-- Expanded display (vertical)
\x

-- Auto-detect when to use expanded
\x auto

-- Turn off pager (show all results at once)
\pset pager off

-- Turn on pager (use less/more for scrolling)
\pset pager on

-- Better borders
\pset border 2

-- Unicode borders (pretty lines)
\pset linestyle unicode

-- Show null values clearly
\pset null '(null)'
```

---

## ✅ Solution 5: One-Line Commands (No Interactive Mode)

### Clean User List:
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "
SELECT
    email,
    \"firstName\" || ' ' || \"lastName\" as name,
    currency
FROM users;"
```

### Count Records:
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "
SELECT
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Portfolios', COUNT(*) FROM portfolios
UNION ALL
SELECT 'Goals', COUNT(*) FROM goals
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;"
```

### Pretty Date Format:
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "
SELECT
    title,
    \"targetAmount\",
    TO_CHAR(\"targetDate\", 'Mon DD, YYYY') as \"Target Date\",
    status
FROM goals
LIMIT 5;"
```

---

## ✅ Solution 6: Export to CSV (Open in Excel)

### Export Users:
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "\COPY users TO STDOUT WITH CSV HEADER" > users.csv
```

### Export Goals:
```bash
docker exec cleva-postgres psql -U postgres -d cleva_investment -c "\COPY goals TO STDOUT WITH CSV HEADER" > goals.csv
```

Then open the CSV file in Excel for easy viewing!

---

## ✅ Solution 7: Use pgAdmin (Best Overall)

**Download:** https://www.pgadmin.org/download/

**Benefits:**
- ✅ Beautiful grid view
- ✅ Sort and filter columns
- ✅ Export to Excel/CSV
- ✅ Visual query builder
- ✅ No command line needed

**Connection:**
```
Host: localhost
Port: 5432
Database: cleva_investment
Username: postgres
Password: (leave blank)
```

---

## 📋 Quick Reference Card

### Essential Commands:

| Command | Description |
|---------|-------------|
| `\x` | Toggle expanded display (vertical) |
| `\x auto` | Auto-detect when to use expanded |
| `\d tablename` | Show table structure |
| `\dt` | List all tables |
| `\l` | List all databases |
| `\q` | Quit psql |
| `\pset pager off` | Disable paging |
| `\?` | Show all commands |

### Useful Queries:

```sql
-- Table size
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT
    'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'portfolios', COUNT(*) FROM portfolios
UNION ALL
SELECT 'goals', COUNT(*) FROM goals;

-- Recent records
SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 5;
```

---

## 🎯 Recommended Approach

### For Quick Checks:
Use **specific column selection** with one-line commands

### For Exploration:
Use **expanded display mode** (`\x`) in interactive psql

### For Analysis:
Use **pgAdmin** GUI tool

### For Sharing:
Export to **CSV** and open in Excel

---

## 💡 Pro Tips

1. **Always use double quotes for case-sensitive columns:**
   ```sql
   SELECT "firstName" FROM users;  -- ✅ Correct
   SELECT firstname FROM users;    -- ❌ Wrong (error)
   ```

2. **Use LIMIT to test queries:**
   ```sql
   SELECT * FROM users LIMIT 5;  -- Only show 5 rows
   ```

3. **Combine columns for readability:**
   ```sql
   SELECT
       "firstName" || ' ' || "lastName" AS name,
       email
   FROM users;
   ```

4. **Format numbers:**
   ```sql
   SELECT
       title,
       TO_CHAR("targetAmount", 'R999,999.99') AS amount
   FROM goals;
   ```

5. **Use keyboard shortcuts in psql:**
   - `Ctrl + L` - Clear screen
   - `Ctrl + C` - Cancel current command
   - `Up/Down arrows` - Browse command history

---

## 🔧 Troubleshooting

**Problem:** Text is truncated with `...`
- **Solution:** Use `\x` for expanded display

**Problem:** Too many rows, can't scroll
- **Solution:** Add `LIMIT 10` to your query

**Problem:** Can't see all columns
- **Solution:** Select specific columns instead of `SELECT *`

**Problem:** Numbers look ugly
- **Solution:** Use `TO_CHAR()` for formatting

---

**Last Updated:** December 2025
**Version:** 1.0
