const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdownPath = path.join(__dirname, '../SYSTEM_OVERVIEW.md');
const markdown = fs.readFileSync(markdownPath, 'utf-8');

// Create HTML with Mermaid support
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cleva Investment - System Architecture</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            .page-break { page-break-after: always; }
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #fff;
        }

        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 40px;
        }

        h2 {
            color: #1e40af;
            border-bottom: 2px solid #93c5fd;
            padding-bottom: 8px;
            margin-top: 30px;
        }

        h3 {
            color: #1e3a8a;
            margin-top: 20px;
        }

        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }

        pre code {
            background: transparent;
            color: #f9fafb;
            padding: 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #3b82f6;
            color: white;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background: #f9fafb;
        }

        .mermaid {
            text-align: center;
            margin: 30px 0;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
        }

        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        }

        .print-button:hover {
            background: #1d4ed8;
        }

        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 40px 0;
        }

        blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
            margin: 20px 0;
            color: #6b7280;
            font-style: italic;
        }

        a {
            color: #2563eb;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">📥 Save as PDF</button>

    <div id="content"></div>

    <script>
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });

        // Parse Markdown
        const markdownContent = \`${markdown.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

        // Convert markdown to HTML
        document.getElementById('content').innerHTML = marked.parse(markdownContent);

        // Render Mermaid diagrams
        mermaid.run();
    </script>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'Cleva-Investment-Architecture.html');
fs.writeFileSync(htmlPath, html);

console.log('✅ HTML file generated successfully!');
console.log('📄 Location:', htmlPath);
console.log('');
console.log('📥 To save as PDF:');
console.log('1. Open the HTML file in your browser');
console.log('2. Click the "Save as PDF" button (or press Ctrl+P)');
console.log('3. Select "Save as PDF" as your printer');
console.log('4. Click "Save"');
