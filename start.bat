@echo off
echo ========================================
echo   Cleva Investment - Quick Start
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo.

echo Checking configuration...
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found
    echo.
    echo Creating from example...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo [IMPORTANT] Please edit backend\.env with your API keys:
    echo   1. Open backend\.env in a text editor
    echo   2. Add your COHERE_API_KEY
    echo   3. Add your FMP_API_KEY
    echo   4. Save the file
    echo.
    echo Press any key when done...
    pause >nul
)

echo.
echo Starting Cleva Investment...
echo.
echo This will start all services:
echo   - PostgreSQL (port 5432)
echo   - MongoDB (port 27017)
echo   - Neo4j (port 7474, 7687)
echo   - Backend API (port 5000)
echo   - Frontend (port 5173)
echo.

docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Cleva Investment is starting!
echo ========================================
echo.
echo Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Neo4j:    http://localhost:7474
echo.
echo Checking service status...
docker-compose ps
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
echo Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173
echo.
echo Have a great investment journey!
pause
