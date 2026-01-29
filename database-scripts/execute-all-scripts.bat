@echo off
REM =====================================================
REM CLEVA INVESTMENT PLATFORM
REM Database Scripts Execution Batch File
REM =====================================================

echo ================================================
echo Cleva Investment - Database Initialization
echo ================================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running...
echo.

REM Check if containers are running
echo Checking if database containers are running...
docker-compose ps | findstr "postgres" >nul
if errorlevel 1 (
    echo ERROR: PostgreSQL container is not running!
    echo Please run: docker-compose up -d
    pause
    exit /b 1
)

echo.
echo ================================================
echo Step 1: PostgreSQL Database
echo ================================================
echo Executing PostgreSQL schema...
docker exec -i cleva-postgres psql -U postgres -d cleva_investment < 01-postgresql-schema.sql
if errorlevel 1 (
    echo WARNING: PostgreSQL script had errors
) else (
    echo SUCCESS: PostgreSQL schema created
)
echo.

echo ================================================
echo Step 2: MongoDB Database
echo ================================================
echo Executing MongoDB schema...
docker exec -i cleva-mongodb mongosh mongodb://localhost:27017/cleva_investment < 02-mongodb-schema.js
if errorlevel 1 (
    echo WARNING: MongoDB script had errors
) else (
    echo SUCCESS: MongoDB collections created
)
echo.

echo ================================================
echo Step 3: Neo4j Database
echo ================================================
echo Executing Neo4j schema...
echo NOTE: Neo4j script should be run manually in Neo4j Browser
echo Open: http://localhost:7474
echo Login with: neo4j / cleva_neo4j_password
echo Then copy-paste contents of: 03-neo4j-schema.cypher
echo.

echo ================================================
echo Database Initialization Summary
echo ================================================
echo PostgreSQL: Schema applied
echo MongoDB: Collections created
echo Neo4j: Manual execution required
echo.
echo For verification, see README.md
echo ================================================
echo.

pause
