# Cleva Investment - Documentation

This folder contains the complete system architecture documentation for the Cleva Investment platform.

## 📁 Files

### 1. **SYSTEM_OVERVIEW.md**
- Complete markdown documentation with Mermaid diagrams
- Best viewed in VS Code with Markdown Preview
- Contains all architecture diagrams, API documentation, and technical details

### 2. **Cleva-Investment-Architecture.html**
- Standalone HTML version with all diagrams rendered
- Can be opened directly in any web browser
- Includes a "Save as PDF" button for easy PDF export

### 3. **generate-pdf.js**
- Node.js script used to generate the HTML file
- Run with: `node docs/generate-pdf.js`

## 📥 How to Save as PDF

### Method 1: Using the HTML File (Easiest)

1. **Open the HTML file:**
   ```
   C:\Users\dikonketso.ndumndum\cleva-investment\docs\Cleva-Investment-Architecture.html
   ```
   Double-click the file or drag it into your browser

2. **Click the blue "📥 Save as PDF" button** in the top-right corner
   (Or press `Ctrl+P`)

3. **In the print dialog:**
   - Destination: Select **"Save as PDF"**
   - Layout: Choose **"Portrait"**
   - Margins: Select **"Default"**
   - Options: Check **"Background graphics"** for diagrams

4. **Click "Save"** and choose your location

### Method 2: Using VS Code

1. Open `SYSTEM_OVERVIEW.md` in VS Code
2. Press `Ctrl+Shift+V` to open preview
3. Right-click → "Print"
4. Select "Save as PDF"

### Method 3: Using Online Converters

1. Upload `SYSTEM_OVERVIEW.md` to:
   - https://markdown-pdf.com
   - https://www.markdowntopdf.com

## 📊 What's Included

The documentation contains:

- ✅ High-Level System Architecture Diagram
- ✅ Component Architecture (Frontend/Backend/Services)
- ✅ Data Flow Diagrams (4 sequence diagrams)
  - User Authentication Flow
  - AI Chatbot Flow
  - Goal Creation Flow
  - Portfolio Management Flow
- ✅ Database Schema (ER Diagram + Graph Schema)
- ✅ Complete Technology Stack
- ✅ All 48 REST API Endpoints
- ✅ WebSocket Events Documentation
- ✅ Security Architecture
- ✅ Deployment Architecture (Docker)
- ✅ Database Connection Details
- ✅ API Keys and Access Information
- ✅ Development Commands
- ✅ Performance Metrics
- ✅ Troubleshooting Guide
- ✅ Future Enhancements Roadmap

## 🎨 Diagram Types

The documentation includes **11 interactive diagrams**:
1. High-Level Architecture
2. System Components
3. Authentication Flow (Sequence)
4. Chatbot Flow (Sequence)
5. Goal Creation Flow (Sequence)
6. Portfolio Management Flow (Sequence)
7. PostgreSQL ER Diagram
8. Neo4j Graph Schema
9. API Integration Architecture
10. Security Architecture
11. Deployment Architecture

## 📍 File Locations

```
cleva-investment/
├── SYSTEM_OVERVIEW.md              (Root - original)
└── docs/
    ├── README.md                   (This file)
    ├── SYSTEM_OVERVIEW.md          (Copy for documentation)
    ├── Cleva-Investment-Architecture.html  (HTML version)
    └── generate-pdf.js             (Generator script)
```

## 🔗 Quick Links

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Neo4j Browser:** http://localhost:7474
- **Health Check:** http://localhost:5000/health

## 💡 Tips

- For best PDF quality, use **Method 1 (HTML file)** - it preserves all diagrams perfectly
- When printing, make sure to enable **"Background graphics"** to see all diagram colors
- The HTML file works offline - all dependencies are loaded from CDN
- You can share the HTML file with team members - it's completely self-contained

## 📧 Support

For questions or issues, refer to the Troubleshooting Guide in the main documentation.

---

**Version:** 1.1.0
**Last Updated:** November 2025
