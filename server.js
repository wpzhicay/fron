const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('[Server] Starting...');
console.log('[Server] PORT env var:', process.env.PORT);

const app = express();
const port = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist/ada-solar-frontend');
console.log('[Server] Dist path:', distPath);
console.log('[Server] Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('[Server] Files in dist:', fs.readdirSync(distPath));
}

// Serve static files
app.use(express.static(distPath));

// Fallback for Angular routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] ✓ Frontend running on port ${port}`);
  console.log(`[Server] Ready to accept connections`);
});

server.on('error', (err) => {
  console.error('[Server] Error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});



