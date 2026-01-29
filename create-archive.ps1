# Cleva Investment - Source Code Archive Creation Script
Write-Host "Creating Cleva Investment Source Code Archive..." -ForegroundColor Green

$projectRoot = "c:\Users\dikonketso.ndumndum\cleva-investment"
$archiveName = "Cleva-Investment-v1.0-SourceCode.zip"
$archivePath = Join-Path $projectRoot $archiveName

# Remove old archive if exists
if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
    Write-Host "Removed existing archive" -ForegroundColor Yellow
}

# Create temporary directory for clean source
$tempDir = Join-Path $env:TEMP "cleva-archive-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

$destDir = Join-Path $tempDir "cleva-investment"
New-Item -ItemType Directory -Path $destDir | Out-Null

Write-Host "Copying source files..." -ForegroundColor Cyan

# Files and directories to include
$itemsToCopy = @(
    "backend",
    "frontend",
    "docker-compose.yml",
    "README.md",
    ".dockerignore",
    "Cleva-Investment-Deployment-Manual.docx",
    "generate-deployment-manual.js",
    "package.json"
)

# Exclusion patterns
$excludePatterns = @(
    "node_modules",
    "dist",
    "build",
    ".git",
    ".next",
    "coverage",
    "*.log",
    ".DS_Store",
    "Thumbs.db"
)

foreach ($item in $itemsToCopy) {
    $sourcePath = Join-Path $projectRoot $item
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $destDir $item

        if (Test-Path $sourcePath -PathType Container) {
            # Copy directory
            Write-Host "  Copying directory: $item" -ForegroundColor Gray
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force

            # Remove excluded items from copied directory
            foreach ($pattern in $excludePatterns) {
                Get-ChildItem -Path $destPath -Recurse -Force -Filter $pattern -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            }
        } else {
            # Copy file
            Write-Host "  Copying file: $item" -ForegroundColor Gray
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
    }
}

# Create README for the archive
$readmeContent = @"
# CLEVA INVESTMENT PLATFORM - SOURCE CODE ARCHIVE
Version 1.0
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## CONTENTS

This archive contains the complete source code for the Cleva Investment Platform, including:

### 1. Backend (Node.js/Express)
- RESTful API server
- Database models (PostgreSQL, MongoDB, Neo4j)
- AI integration (Cohere, OpenAI)
- Market data services
- Authentication & authorization
- Admin dashboard controllers
- Report generation (PDF, CSV, Excel)

### 2. Frontend (React.js/Vite)
- User interface components
- State management (Zustand)
- Routing and navigation
- Admin dashboard
- Chat interface
- Portfolio management UI

### 3. Docker Configuration
- docker-compose.yml for multi-container orchestration
- Dockerfile for backend
- Dockerfile for frontend
- Database containers configuration

### 4. Documentation
- Cleva-Investment-Deployment-Manual.docx (Complete deployment guide)
- README.md (Quick start guide)
- API documentation in manual

## QUICK START

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- 20GB disk space

### Installation Steps

1. Extract this archive to your desired location

2. Navigate to the project directory:
   ``````
   cd cleva-investment
   ``````

3. Start the application with Docker:
   ``````
   docker-compose up -d
   ``````

4. Wait 30-60 seconds for services to initialize

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Neo4j Browser: http://localhost:7474

### Default Credentials

PostgreSQL:
- Username: postgres
- Password: cleva_postgres_password

Neo4j:
- Username: neo4j
- Password: cleva_neo4j_password

## ENVIRONMENT VARIABLES

The backend/.env file contains all configuration. Update the following:

Required API Keys:
- COHERE_API_KEY - Get from https://cohere.ai (Free tier available)
- FMP_API_KEY - Get from https://financialmodelingprep.com (250 requests/day free)

Optional:
- OPENAI_API_KEY - For OpenAI integration (Premium)

## ARCHITECTURE

### Backend Services
- **Express API Server** (Port 5000)
- **PostgreSQL** - User data, goals, portfolios (Port 5432)
- **MongoDB** - Chat history, articles, activity logs (Port 27017)
- **Neo4j** - Graph-based recommendations (Ports 7474, 7687)

### Frontend
- **React/Vite Dev Server** (Port 5173)
- Built with TailwindCSS for styling
- Real-time updates via WebSocket

## PROJECT STRUCTURE

``````
cleva-investment/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & service configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Database models (PostgreSQL, MongoDB, Neo4j)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & external APIs
│   │   └── server.js       # Application entry point
│   ├── .env                # Environment variables
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utilities & state management
│   │   └── App.jsx         # Main application component
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
└── Cleva-Investment-Deployment-Manual.docx

``````

## FEATURES

### User Features
- User registration and authentication
- Risk profile assessment
- Financial goal setting and tracking
- Portfolio management
- AI-powered investment advisor chat
- Real-time market data
- Investment recommendations
- Performance analytics

### Admin Features
- System statistics dashboard
- User management
- Activity monitoring and logs
- Report generation (PDF, CSV, Excel)
- Role-based access control

### Technical Features
- Multi-database architecture
- Graph-based recommendation engine
- AI integration with fallback system
- Real-time WebSocket notifications
- RESTful API
- Docker containerization
- Responsive UI design

## SUPPORT

For deployment assistance, refer to:
- Cleva-Investment-Deployment-Manual.docx (Complete guide)
- README.md (Quick reference)

For technical issues:
- Check Docker logs: docker-compose logs
- View specific service: docker-compose logs backend
- Restart services: docker-compose restart

## LICENSE & COPYRIGHT

Copyright © 2026 Cleva Investment Platform
All rights reserved.

This software is proprietary and confidential.
Unauthorized copying, distribution, or use is strictly prohibited.

---
Archive created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$readmePath = Join-Path $destDir "ARCHIVE_README.txt"
$readmeContent | Out-File -FilePath $readmePath -Encoding UTF8

Write-Host "Creating compressed archive..." -ForegroundColor Cyan

# Create the zip archive
Compress-Archive -Path "$destDir\*" -DestinationPath $archivePath -CompressionLevel Optimal -Force

# Cleanup temp directory
Remove-Item $tempDir -Recurse -Force

# Get archive size
$archiveSize = (Get-Item $archivePath).Length / 1MB

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Archive created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "File: $archiveName" -ForegroundColor Yellow
Write-Host "Location: $archivePath" -ForegroundColor Yellow
Write-Host "Size: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green
