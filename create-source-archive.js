const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('\n========================================');
console.log('Cleva Investment - Source Code Archive');
console.log('========================================\n');

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, 'Cleva-Investment-v1.0-SourceCode.zip');

// Remove existing archive
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
  console.log('✓ Removed existing archive');
}

// Create write stream
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Track progress
let filesAdded = 0;
archive.on('entry', (entry) => {
  filesAdded++;
  if (filesAdded % 10 === 0) {
    process.stdout.write(`\rFiles archived: ${filesAdded}`);
  }
});

// Handle completion
output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n\n========================================`);
  console.log('✓ Archive created successfully!');
  console.log('========================================');
  console.log(`File: Cleva-Investment-v1.0-SourceCode.zip`);
  console.log(`Size: ${sizeMB} MB`);
  console.log(`Files: ${filesAdded}`);
  console.log(`Location: ${outputPath}`);
  console.log('========================================\n');
});

// Handle errors
archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to file
archive.pipe(output);

// Exclusions
const excludePatterns = [
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '.git',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  'Cleva-Investment-v1.0-SourceCode.zip'
];

// Function to check if path should be excluded
function shouldExclude(filePath) {
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

console.log('Adding files to archive...\n');

// Add backend source
console.log('→ Adding backend source code');
archive.glob('**/*', {
  cwd: 'backend',
  ignore: excludePatterns
}, {
  prefix: 'cleva-investment/backend'
});

// Add frontend source
console.log('→ Adding frontend source code');
archive.glob('**/*', {
  cwd: 'frontend',
  ignore: excludePatterns
}, {
  prefix: 'cleva-investment/frontend'
});

// Add root files
console.log('→ Adding configuration files');
const rootFiles = [
  'docker-compose.yml',
  'README.md',
  'package.json',
  'generate-deployment-manual.js'
];

rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: `cleva-investment/${file}` });
  }
});

// Add manual if not open
try {
  if (fs.existsSync('Cleva-Investment-Deployment-Manual.docx')) {
    archive.file('Cleva-Investment-Deployment-Manual.docx', {
      name: 'cleva-investment/Cleva-Investment-Deployment-Manual.docx'
    });
    console.log('→ Adding deployment manual');
  }
} catch (err) {
  console.log('⚠ Deployment manual is open in another program, skipping');
}

// Add README for the archive
const archiveReadme = `# CLEVA INVESTMENT PLATFORM - SOURCE CODE ARCHIVE
Version 1.0
Generated: ${new Date().toISOString()}

## QUICK START

1. Extract this archive
2. Install Docker Desktop
3. Navigate to cleva-investment directory
4. Run: docker-compose up -d
5. Access: http://localhost:5173

## STRUCTURE

- backend/        - Node.js/Express API server
- frontend/       - React/Vite web application
- docker-compose.yml - Multi-container orchestration

## DOCUMENTATION

See Cleva-Investment-Deployment-Manual.docx for complete deployment guide.

## IMPORTANT

- Update backend/.env with your API keys
- COHERE_API_KEY: Get from https://cohere.ai
- FMP_API_KEY: Get from https://financialmodelingprep.com

## SUPPORT

For issues, check the deployment manual troubleshooting section.
`;

archive.append(archiveReadme, { name: 'cleva-investment/README.txt' });

// Finalize the archive
console.log('\n→ Compressing files...');
archive.finalize();
