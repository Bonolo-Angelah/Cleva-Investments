const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle } = require('docx');
const fs = require('fs');

// Create the document
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Title Page
      new Paragraph({
        text: "CLEVA INVESTMENT PLATFORM",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: "Application Deployment & User Manual",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: "Version 1.0",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: new Date().toLocaleDateString(),
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      }),

      // Table of Contents
      new Paragraph({
        text: "TABLE OF CONTENTS",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),
      new Paragraph({ text: "1. System Overview", spacing: { after: 100 } }),
      new Paragraph({ text: "2. System Requirements", spacing: { after: 100 } }),
      new Paragraph({ text: "3. Installation & Deployment", spacing: { after: 100 } }),
      new Paragraph({ text: "4. Configuration", spacing: { after: 100 } }),
      new Paragraph({ text: "5. Running the Application", spacing: { after: 100 } }),
      new Paragraph({ text: "6. User Manual", spacing: { after: 100 } }),
      new Paragraph({ text: "7. Admin Dashboard Guide", spacing: { after: 100 } }),
      new Paragraph({ text: "8. Troubleshooting", spacing: { after: 100 } }),
      new Paragraph({ text: "9. API Documentation", spacing: { after: 100 } }),

      // 1. SYSTEM OVERVIEW
      new Paragraph({
        text: "1. SYSTEM OVERVIEW",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),
      new Paragraph({
        text: "Cleva Investment is an AI-powered investment advisory platform designed for South African investors. The platform provides personalized investment recommendations, portfolio management, goal tracking, and real-time market insights.",
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "Key Features:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "• AI-Powered Investment Advisor with Cohere AI", spacing: { after: 50 } }),
      new Paragraph({ text: "• Personalized Financial Goals Tracking", spacing: { after: 50 } }),
      new Paragraph({ text: "• Portfolio Management & Analytics", spacing: { after: 50 } }),
      new Paragraph({ text: "• Real-time Market Data Integration", spacing: { after: 50 } }),
      new Paragraph({ text: "• Graph-based Recommendation Engine (Neo4j)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Admin Dashboard with Analytics & Reporting", spacing: { after: 50 } }),
      new Paragraph({ text: "• Role-Based Access Control (User/Admin)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Real-time Notifications via WebSocket", spacing: { after: 200 } }),

      new Paragraph({
        text: "Technology Stack:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Frontend: React.js, Vite, TailwindCSS, Zustand", spacing: { after: 50 } }),
      new Paragraph({ text: "Backend: Node.js, Express.js", spacing: { after: 50 } }),
      new Paragraph({ text: "Databases: PostgreSQL, MongoDB, Neo4j", spacing: { after: 50 } }),
      new Paragraph({ text: "AI Services: Cohere AI (Primary), OpenAI (Optional)", spacing: { after: 50 } }),
      new Paragraph({ text: "Market Data: Financial Modeling Prep API, Yahoo Finance", spacing: { after: 50 } }),
      new Paragraph({ text: "Containerization: Docker, Docker Compose", spacing: { after: 50 } }),

      // 2. SYSTEM REQUIREMENTS
      new Paragraph({
        text: "2. SYSTEM REQUIREMENTS",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Minimum Hardware Requirements:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "• CPU: Dual-core processor (2.0 GHz or higher)", spacing: { after: 50 } }),
      new Paragraph({ text: "• RAM: 8 GB minimum (16 GB recommended)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Storage: 20 GB available disk space", spacing: { after: 50 } }),
      new Paragraph({ text: "• Network: Stable internet connection", spacing: { after: 200 } }),

      new Paragraph({
        text: "Software Requirements:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "• Operating System: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Docker Desktop: Version 20.10 or higher", spacing: { after: 50 } }),
      new Paragraph({ text: "• Docker Compose: Version 2.0 or higher", spacing: { after: 50 } }),
      new Paragraph({ text: "• Git: Version 2.30 or higher", spacing: { after: 50 } }),
      new Paragraph({ text: "• Node.js: Version 18.x or higher (for development)", spacing: { after: 50 } }),
      new Paragraph({ text: "• npm: Version 9.x or higher", spacing: { after: 200 } }),

      // 3. INSTALLATION & DEPLOYMENT
      new Paragraph({
        text: "3. INSTALLATION & DEPLOYMENT",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Step 1: Install Prerequisites",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: "1. Install Docker Desktop:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "   • Download from: https://www.docker.com/products/docker-desktop", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Run the installer and follow installation wizard", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Start Docker Desktop after installation", spacing: { after: 100 } }),
      new Paragraph({
        text: "2. Verify Docker Installation:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "   Open terminal/command prompt and run:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker --version", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose --version", spacing: { after: 200 } }),

      new Paragraph({
        text: "Step 2: Clone the Repository",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "1. Open terminal/command prompt", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Navigate to your desired directory", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Clone the repository:", spacing: { after: 50 } }),
      new Paragraph({ text: "   git clone <repository-url>", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Navigate to project directory:", spacing: { after: 50 } }),
      new Paragraph({ text: "   cd cleva-investment", spacing: { after: 200 } }),

      new Paragraph({
        text: "Step 3: Configure Environment Variables",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "1. Navigate to backend directory:", spacing: { after: 50 } }),
      new Paragraph({ text: "   cd backend", spacing: { after: 50 } }),
      new Paragraph({ text: "2. The .env file is already configured with default values", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Update the following API keys (optional):", spacing: { after: 50 } }),
      new Paragraph({ text: "   • COHERE_API_KEY - Get from https://cohere.ai", spacing: { after: 50 } }),
      new Paragraph({ text: "   • FMP_API_KEY - Get from https://financialmodelingprep.com", spacing: { after: 50 } }),
      new Paragraph({ text: "   • OPENAI_API_KEY - Get from https://openai.com (optional)", spacing: { after: 200 } }),

      new Paragraph({
        text: "Step 4: Build and Deploy with Docker",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "1. Return to project root directory:", spacing: { after: 50 } }),
      new Paragraph({ text: "   cd ..", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Build all containers:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose build", spacing: { after: 50 } }),
      new Paragraph({ text: "   This will build: Frontend, Backend, PostgreSQL, MongoDB, Neo4j", spacing: { after: 100 } }),
      new Paragraph({ text: "3. Start all services:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose up -d", spacing: { after: 50 } }),
      new Paragraph({ text: "   The -d flag runs containers in detached mode (background)", spacing: { after: 100 } }),
      new Paragraph({ text: "4. Verify all containers are running:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose ps", spacing: { after: 200 } }),

      // 4. CONFIGURATION
      new Paragraph({
        text: "4. CONFIGURATION",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Database Configuration:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "PostgreSQL (User Data):", spacing: { after: 50 } }),
      new Paragraph({ text: "• Host: localhost", spacing: { after: 50 } }),
      new Paragraph({ text: "• Port: 5432", spacing: { after: 50 } }),
      new Paragraph({ text: "• Database: cleva_investment", spacing: { after: 50 } }),
      new Paragraph({ text: "• Username: postgres", spacing: { after: 50 } }),
      new Paragraph({ text: "• Password: cleva_postgres_password", spacing: { after: 100 } }),

      new Paragraph({ text: "MongoDB (Chat History & Articles):", spacing: { after: 50 } }),
      new Paragraph({ text: "• URI: mongodb://localhost:27017/cleva_investment", spacing: { after: 100 } }),

      new Paragraph({ text: "Neo4j (Graph Recommendations):", spacing: { after: 50 } }),
      new Paragraph({ text: "• URI: bolt://localhost:7687", spacing: { after: 50 } }),
      new Paragraph({ text: "• Username: neo4j", spacing: { after: 50 } }),
      new Paragraph({ text: "• Password: cleva_neo4j_password", spacing: { after: 200 } }),

      new Paragraph({
        text: "API Configuration:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Cohere AI API:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Endpoint: https://api.cohere.ai/v1/chat", spacing: { after: 50 } }),
      new Paragraph({ text: "• Free Tier: Available", spacing: { after: 50 } }),
      new Paragraph({ text: "• Rate Limits: Check Cohere documentation", spacing: { after: 100 } }),

      new Paragraph({ text: "Financial Modeling Prep:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Endpoint: https://financialmodelingprep.com/api/v3", spacing: { after: 50 } }),
      new Paragraph({ text: "• Free Tier: 250 requests/day", spacing: { after: 200 } }),

      // 5. RUNNING THE APPLICATION
      new Paragraph({
        text: "5. RUNNING THE APPLICATION",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Starting the Application:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "1. Ensure Docker Desktop is running", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Open terminal in project root directory", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Start all services:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose up -d", spacing: { after: 100 } }),
      new Paragraph({ text: "4. Wait 30-60 seconds for all services to initialize", spacing: { after: 50 } }),
      new Paragraph({ text: "5. Access the application:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Frontend: http://localhost:5173", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Backend API: http://localhost:5000", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Neo4j Browser: http://localhost:7474", spacing: { after: 200 } }),

      new Paragraph({
        text: "Stopping the Application:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "docker-compose down", spacing: { after: 50 } }),
      new Paragraph({ text: "This stops and removes all containers while preserving data", spacing: { after: 200 } }),

      new Paragraph({
        text: "Viewing Logs:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "View all logs:", spacing: { after: 50 } }),
      new Paragraph({ text: "docker-compose logs -f", spacing: { after: 100 } }),
      new Paragraph({ text: "View specific service logs:", spacing: { after: 50 } }),
      new Paragraph({ text: "docker-compose logs -f backend", spacing: { after: 50 } }),
      new Paragraph({ text: "docker-compose logs -f frontend", spacing: { after: 200 } }),

      new Paragraph({
        text: "Restarting Services:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Restart all services:", spacing: { after: 50 } }),
      new Paragraph({ text: "docker-compose restart", spacing: { after: 100 } }),
      new Paragraph({ text: "Restart specific service:", spacing: { after: 50 } }),
      new Paragraph({ text: "docker-compose restart backend", spacing: { after: 200 } }),

      // 6. USER MANUAL
      new Paragraph({
        text: "6. USER MANUAL",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "6.1 Getting Started",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: "Creating an Account:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Navigate to http://localhost:5173", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Click 'Register' or 'Sign Up'", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Fill in required information:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • First Name and Last Name", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Email Address", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Password (minimum 8 characters)", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Phone Number (optional)", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Country", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Risk Tolerance: Conservative, Moderate, or Aggressive", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Investment Experience: Beginner, Intermediate, or Advanced", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Click 'Create Account'", spacing: { after: 50 } }),
      new Paragraph({ text: "5. You will be automatically logged in", spacing: { after: 200 } }),

      new Paragraph({
        text: "Logging In:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Navigate to http://localhost:5173", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Enter your email and password", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Click 'Login'", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.2 Dashboard",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        pageBreakBefore: true
      }),
      new Paragraph({ text: "The Dashboard is your home page showing:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Welcome message with your name", spacing: { after: 50 } }),
      new Paragraph({ text: "• Quick stats: Total Portfolio Value, Active Goals, Total Investments", spacing: { after: 50 } }),
      new Paragraph({ text: "• Recent activities", spacing: { after: 50 } }),
      new Paragraph({ text: "• Investment recommendations", spacing: { after: 50 } }),
      new Paragraph({ text: "• Market trends and top movers", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.3 Financial Goals",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: "Creating a Goal:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Click 'Goals' in navigation menu", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Click '+ New Goal' button", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Enter goal details:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Goal Title (e.g., 'Buy a Car', 'Retirement Fund')", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Description", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Target Amount (in ZAR)", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Current Amount", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Target Date", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Goal Type: Retirement, Education, House, Emergency Fund, etc.", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Priority: High, Medium, Low", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Click 'Create Goal'", spacing: { after: 100 } }),
      new Paragraph({ text: "The system will calculate:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Required monthly contribution", spacing: { after: 50 } }),
      new Paragraph({ text: "• Time horizon category", spacing: { after: 50 } }),
      new Paragraph({ text: "• Recommended investment strategy", spacing: { after: 200 } }),

      new Paragraph({
        text: "Managing Goals:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• View all goals in list or card view", spacing: { after: 50 } }),
      new Paragraph({ text: "• Track progress with visual progress bars", spacing: { after: 50 } }),
      new Paragraph({ text: "• Edit goal by clicking the edit icon", spacing: { after: 50 } }),
      new Paragraph({ text: "• Update current amount as you save", spacing: { after: 50 } }),
      new Paragraph({ text: "• Mark goal as completed when achieved", spacing: { after: 50 } }),
      new Paragraph({ text: "• Delete goal if no longer relevant", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.4 Portfolio Management",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        pageBreakBefore: true
      }),
      new Paragraph({
        text: "Creating a Portfolio:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Click 'Portfolios' in navigation menu", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Click '+ New Portfolio'", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Enter portfolio name and description", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Select risk tolerance and investment strategy", spacing: { after: 50 } }),
      new Paragraph({ text: "5. Click 'Create Portfolio'", spacing: { after: 200 } }),

      new Paragraph({
        text: "Adding Investments:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Open a portfolio", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Click '+ Add Investment'", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Enter investment details:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Symbol (e.g., AAPL, SBK for Standard Bank)", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Number of shares/units", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Purchase price", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Purchase date", spacing: { after: 50 } }),
      new Paragraph({ text: "4. System automatically fetches current market data", spacing: { after: 50 } }),
      new Paragraph({ text: "5. View performance metrics and analytics", spacing: { after: 200 } }),

      new Paragraph({
        text: "Portfolio Analytics:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• Total portfolio value", spacing: { after: 50 } }),
      new Paragraph({ text: "• Total gain/loss (amount and percentage)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Asset allocation pie chart", spacing: { after: 50 } }),
      new Paragraph({ text: "• Performance over time graph", spacing: { after: 50 } }),
      new Paragraph({ text: "• Top performers and worst performers", spacing: { after: 50 } }),
      new Paragraph({ text: "• Risk metrics and diversification score", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.5 AI Investment Chat",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        pageBreakBefore: true
      }),
      new Paragraph({ text: "The AI Chat feature provides personalized investment advice:", spacing: { after: 100 } }),

      new Paragraph({
        text: "Using the Chat:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Click 'Chat' in navigation menu", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Type your question in the message box", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Click Send or press Enter", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Wait for AI-generated response", spacing: { after: 100 } }),

      new Paragraph({
        text: "Example Questions:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• 'How is the JSE market trading today?'", spacing: { after: 50 } }),
      new Paragraph({ text: "• 'What stocks should I invest in?'", spacing: { after: 50 } }),
      new Paragraph({ text: "• 'Tell me about ETFs'", spacing: { after: 50 } }),
      new Paragraph({ text: "• 'How should I diversify my portfolio?'", spacing: { after: 50 } }),
      new Paragraph({ text: "• 'What's a good strategy for retirement?'", spacing: { after: 50 } }),
      new Paragraph({ text: "• 'Should I invest in TFSA or RA?'", spacing: { after: 100 } }),

      new Paragraph({
        text: "AI Features:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• Personalized advice based on your risk tolerance and experience", spacing: { after: 50 } }),
      new Paragraph({ text: "• Context-aware responses using your goals and portfolio", spacing: { after: 50 } }),
      new Paragraph({ text: "• Real-time market data integration when available", spacing: { after: 50 } }),
      new Paragraph({ text: "• Investment recommendations tailored to South African market", spacing: { after: 50 } }),
      new Paragraph({ text: "• Educational insights about investment concepts", spacing: { after: 50 } }),
      new Paragraph({ text: "• Fallback responses when API is unavailable", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.6 Market Data",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "View real-time market information:", spacing: { after: 50 } }),
      new Paragraph({ text: "• JSE Top 40 Index performance", spacing: { after: 50 } }),
      new Paragraph({ text: "• Top gainers and losers", spacing: { after: 50 } }),
      new Paragraph({ text: "• Sector performance", spacing: { after: 50 } }),
      new Paragraph({ text: "• Popular stocks (banking, mining, retail)", spacing: { after: 50 } }),
      new Paragraph({ text: "• ETF listings and performance", spacing: { after: 50 } }),
      new Paragraph({ text: "• Search for specific stocks by symbol", spacing: { after: 50 } }),
      new Paragraph({ text: "• View detailed stock information and charts", spacing: { after: 200 } }),

      new Paragraph({
        text: "6.7 Profile & Settings",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: "Profile Management:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• Update personal information", spacing: { after: 50 } }),
      new Paragraph({ text: "• Change risk tolerance", spacing: { after: 50 } }),
      new Paragraph({ text: "• Update investment experience level", spacing: { after: 50 } }),
      new Paragraph({ text: "• Change password", spacing: { after: 50 } }),
      new Paragraph({ text: "• Enable two-factor authentication", spacing: { after: 100 } }),

      new Paragraph({
        text: "Settings:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• Notification preferences", spacing: { after: 50 } }),
      new Paragraph({ text: "• Currency preference", spacing: { after: 50 } }),
      new Paragraph({ text: "• Display preferences", spacing: { after: 50 } }),
      new Paragraph({ text: "• Privacy settings", spacing: { after: 200 } }),

      // 7. ADMIN DASHBOARD
      new Paragraph({
        text: "7. ADMIN DASHBOARD GUIDE",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "7.1 Accessing Admin Dashboard",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "1. Login with admin credentials", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Click 'Admin' in navigation menu (only visible to admins)", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Access comprehensive system analytics and controls", spacing: { after: 200 } }),

      new Paragraph({
        text: "7.2 System Statistics",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "View key metrics:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Total Users (with growth percentage)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Active Users today/this week/this month", spacing: { after: 50 } }),
      new Paragraph({ text: "• Total Goals created", spacing: { after: 50 } }),
      new Paragraph({ text: "• Total Portfolios", spacing: { after: 50 } }),
      new Paragraph({ text: "• Total Investments tracked", spacing: { after: 50 } }),
      new Paragraph({ text: "• API Usage statistics", spacing: { after: 50 } }),
      new Paragraph({ text: "• System health indicators", spacing: { after: 200 } }),

      new Paragraph({
        text: "7.3 User Management",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Manage user accounts:", spacing: { after: 50 } }),
      new Paragraph({ text: "• View all registered users", spacing: { after: 50 } }),
      new Paragraph({ text: "• Search and filter users", spacing: { after: 50 } }),
      new Paragraph({ text: "• View user details and activity", spacing: { after: 50 } }),
      new Paragraph({ text: "• Edit user roles (User/Admin)", spacing: { after: 50 } }),
      new Paragraph({ text: "• Activate/deactivate accounts", spacing: { after: 50 } }),
      new Paragraph({ text: "• Reset user passwords", spacing: { after: 50 } }),
      new Paragraph({ text: "• View user investment history", spacing: { after: 200 } }),

      new Paragraph({
        text: "7.4 Activity Logs",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Monitor system activity:", spacing: { after: 50 } }),
      new Paragraph({ text: "• User registrations and logins", spacing: { after: 50 } }),
      new Paragraph({ text: "• Goal creations and updates", spacing: { after: 50 } }),
      new Paragraph({ text: "• Portfolio transactions", spacing: { after: 50 } }),
      new Paragraph({ text: "• AI chat interactions", spacing: { after: 50 } }),
      new Paragraph({ text: "• API calls and responses", spacing: { after: 50 } }),
      new Paragraph({ text: "• System errors and warnings", spacing: { after: 50 } }),
      new Paragraph({ text: "• Filter logs by date, user, action type", spacing: { after: 50 } }),
      new Paragraph({ text: "• Export logs for analysis", spacing: { after: 200 } }),

      new Paragraph({
        text: "7.5 Reports & Analytics",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: "Generate Reports:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "1. Click 'Generate Report' button", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Select report type:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • User Analytics Report", spacing: { after: 50 } }),
      new Paragraph({ text: "   • System Activity Report", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Financial Goals Summary", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Portfolio Performance Report", spacing: { after: 50 } }),
      new Paragraph({ text: "   • API Usage Report", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Select date range", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Choose export format:", spacing: { after: 50 } }),
      new Paragraph({ text: "   • PDF - Professional formatted document", spacing: { after: 50 } }),
      new Paragraph({ text: "   • CSV - For Excel/spreadsheet analysis", spacing: { after: 50 } }),
      new Paragraph({ text: "   • Excel (.xlsx) - With charts and formatting", spacing: { after: 50 } }),
      new Paragraph({ text: "5. Click 'Generate' and download", spacing: { after: 200 } }),

      new Paragraph({
        text: "Available Analytics:",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "• User growth trends", spacing: { after: 50 } }),
      new Paragraph({ text: "• User engagement metrics", spacing: { after: 50 } }),
      new Paragraph({ text: "• Goal achievement rates", spacing: { after: 50 } }),
      new Paragraph({ text: "• Investment distribution by type", spacing: { after: 50 } }),
      new Paragraph({ text: "• Popular investment choices", spacing: { after: 50 } }),
      new Paragraph({ text: "• AI chat usage statistics", spacing: { after: 50 } }),
      new Paragraph({ text: "• System performance metrics", spacing: { after: 200 } }),

      // 8. TROUBLESHOOTING
      new Paragraph({
        text: "8. TROUBLESHOOTING",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Common Issues and Solutions:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),

      new Paragraph({
        text: "Issue: Docker containers won't start",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Ensure Docker Desktop is running", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check if ports are already in use: 5000, 5173, 5432, 27017, 7687, 7474", spacing: { after: 50 } }),
      new Paragraph({ text: "• Run: docker-compose down && docker-compose up -d", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check logs: docker-compose logs", spacing: { after: 100 } }),

      new Paragraph({
        text: "Issue: Frontend shows connection error",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Verify backend is running: docker-compose ps", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check backend logs: docker-compose logs backend", spacing: { after: 50 } }),
      new Paragraph({ text: "• Restart backend: docker-compose restart backend", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check CORS_ORIGIN in .env matches frontend URL", spacing: { after: 100 } }),

      new Paragraph({
        text: "Issue: Database connection failed",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check database containers are running", spacing: { after: 50 } }),
      new Paragraph({ text: "• Verify credentials in .env file", spacing: { after: 50 } }),
      new Paragraph({ text: "• Restart database containers:", spacing: { after: 50 } }),
      new Paragraph({ text: "  docker-compose restart postgres mongodb neo4j", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check database logs for errors", spacing: { after: 100 } }),

      new Paragraph({
        text: "Issue: AI chatbot not responding",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Verify COHERE_API_KEY is set in .env", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check backend logs for API errors", spacing: { after: 50 } }),
      new Paragraph({ text: "• Test internet connectivity from container", spacing: { after: 50 } }),
      new Paragraph({ text: "• System will use fallback responses if API fails", spacing: { after: 50 } }),
      new Paragraph({ text: "• Restart backend: docker-compose restart backend", spacing: { after: 100 } }),

      new Paragraph({
        text: "Issue: Admin dashboard not visible",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Verify your account has admin role", spacing: { after: 50 } }),
      new Paragraph({ text: "• Logout and login again", spacing: { after: 50 } }),
      new Paragraph({ text: "• Clear browser cache and localStorage", spacing: { after: 50 } }),
      new Paragraph({ text: "• Check user role in database:", spacing: { after: 50 } }),
      new Paragraph({ text: "  docker exec -it cleva-postgres psql -U postgres -d cleva_investment", spacing: { after: 50 } }),
      new Paragraph({ text: "  SELECT email, role FROM users;", spacing: { after: 100 } }),

      new Paragraph({
        text: "Issue: Port already in use",
        spacing: { after: 50 }
      }),
      new Paragraph({ text: "Solutions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Stop conflicting services", spacing: { after: 50 } }),
      new Paragraph({ text: "• Change port in docker-compose.yml", spacing: { after: 50 } }),
      new Paragraph({ text: "• Find process using port:", spacing: { after: 50 } }),
      new Paragraph({ text: "  Windows: netstat -ano | findstr :5000", spacing: { after: 50 } }),
      new Paragraph({ text: "  Linux/Mac: lsof -i :5000", spacing: { after: 100 } }),

      new Paragraph({
        text: "Getting Help:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "If issues persist:", spacing: { after: 50 } }),
      new Paragraph({ text: "1. Check Docker logs for detailed error messages", spacing: { after: 50 } }),
      new Paragraph({ text: "2. Verify all environment variables are set correctly", spacing: { after: 50 } }),
      new Paragraph({ text: "3. Ensure all prerequisites are installed and updated", spacing: { after: 50 } }),
      new Paragraph({ text: "4. Try a clean rebuild:", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose down", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose build --no-cache", spacing: { after: 50 } }),
      new Paragraph({ text: "   docker-compose up -d", spacing: { after: 50 } }),
      new Paragraph({ text: "5. Contact system administrator with error logs", spacing: { after: 200 } }),

      // 9. API DOCUMENTATION
      new Paragraph({
        text: "9. API DOCUMENTATION",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Base URL:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "http://localhost:5000/api", spacing: { after: 200 } }),

      new Paragraph({
        text: "Authentication Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "POST /api/auth/register - Register new user", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/auth/login - User login", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/auth/logout - User logout", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/auth/profile - Get user profile", spacing: { after: 50 } }),
      new Paragraph({ text: "PUT /api/auth/profile - Update user profile", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/auth/change-password - Change password", spacing: { after: 200 } }),

      new Paragraph({
        text: "Goals Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "GET /api/goals - Get all user goals", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/goals - Create new goal", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/goals/:id - Get goal by ID", spacing: { after: 50 } }),
      new Paragraph({ text: "PUT /api/goals/:id - Update goal", spacing: { after: 50 } }),
      new Paragraph({ text: "DELETE /api/goals/:id - Delete goal", spacing: { after: 200 } }),

      new Paragraph({
        text: "Portfolio Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "GET /api/portfolios - Get all user portfolios", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/portfolios - Create new portfolio", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/portfolios/:id - Get portfolio by ID", spacing: { after: 50 } }),
      new Paragraph({ text: "PUT /api/portfolios/:id - Update portfolio", spacing: { after: 50 } }),
      new Paragraph({ text: "DELETE /api/portfolios/:id - Delete portfolio", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/portfolios/:id/holdings - Add holding to portfolio", spacing: { after: 200 } }),

      new Paragraph({
        text: "Chat Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "POST /api/chat - Send message to AI advisor", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/chat/history - Get chat history", spacing: { after: 50 } }),
      new Paragraph({ text: "DELETE /api/chat/history - Clear chat history", spacing: { after: 200 } }),

      new Paragraph({
        text: "Market Data Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "GET /api/market/quote/:symbol - Get stock quote", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/market/search/:query - Search stocks", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/market/trending - Get trending stocks", spacing: { after: 200 } }),

      new Paragraph({
        text: "Admin Endpoints:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "GET /api/admin/stats - Get system statistics", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/admin/users - Get all users (admin only)", spacing: { after: 50 } }),
      new Paragraph({ text: "PUT /api/admin/users/:id/role - Update user role", spacing: { after: 50 } }),
      new Paragraph({ text: "GET /api/admin/activity-logs - Get activity logs", spacing: { after: 50 } }),
      new Paragraph({ text: "POST /api/admin/reports/:type - Generate report (PDF/CSV/Excel)", spacing: { after: 200 } }),

      // APPENDIX
      new Paragraph({
        text: "APPENDIX",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      }),

      new Paragraph({
        text: "Docker Commands Reference:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Start services: docker-compose up -d", spacing: { after: 50 } }),
      new Paragraph({ text: "Stop services: docker-compose down", spacing: { after: 50 } }),
      new Paragraph({ text: "Restart services: docker-compose restart", spacing: { after: 50 } }),
      new Paragraph({ text: "View logs: docker-compose logs -f", spacing: { after: 50 } }),
      new Paragraph({ text: "View specific service logs: docker-compose logs -f backend", spacing: { after: 50 } }),
      new Paragraph({ text: "Check status: docker-compose ps", spacing: { after: 50 } }),
      new Paragraph({ text: "Rebuild containers: docker-compose build", spacing: { after: 50 } }),
      new Paragraph({ text: "Clean rebuild: docker-compose build --no-cache", spacing: { after: 50 } }),
      new Paragraph({ text: "Execute command in container: docker exec -it <container-name> <command>", spacing: { after: 50 } }),
      new Paragraph({ text: "Remove all containers and volumes: docker-compose down -v", spacing: { after: 200 } }),

      new Paragraph({
        text: "Default Credentials:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "PostgreSQL:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Username: postgres", spacing: { after: 50 } }),
      new Paragraph({ text: "• Password: cleva_postgres_password", spacing: { after: 100 } }),
      new Paragraph({ text: "Neo4j:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Username: neo4j", spacing: { after: 50 } }),
      new Paragraph({ text: "• Password: cleva_neo4j_password", spacing: { after: 200 } }),

      new Paragraph({
        text: "Support & Contact:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "For technical support or questions:", spacing: { after: 50 } }),
      new Paragraph({ text: "• Email: support@clevainvestment.com", spacing: { after: 50 } }),
      new Paragraph({ text: "• Documentation: Check project README.md", spacing: { after: 50 } }),
      new Paragraph({ text: "• GitHub Issues: Report bugs and feature requests", spacing: { after: 200 } }),

      new Paragraph({
        text: "Version History:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({ text: "Version 1.0 - Initial Release", spacing: { after: 50 } }),
      new Paragraph({ text: "• Core investment advisory features", spacing: { after: 50 } }),
      new Paragraph({ text: "• AI chatbot with Cohere integration", spacing: { after: 50 } }),
      new Paragraph({ text: "• Portfolio and goal management", spacing: { after: 50 } }),
      new Paragraph({ text: "• Admin dashboard with reporting", spacing: { after: 50 } }),
      new Paragraph({ text: "• Docker containerization", spacing: { after: 200 } }),

      new Paragraph({
        text: "END OF DOCUMENT",
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    ]
  }]
});

// Generate the document
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('Cleva-Investment-Deployment-Manual.docx', buffer);
  console.log('✓ Deployment manual generated successfully!');
  console.log('File: Cleva-Investment-Deployment-Manual.docx');
});
