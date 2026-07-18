const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 4200;
const hostname = '0.0.0.0';

// Serve static files from the dist folder
const distPath = path.join(__dirname, 'dist/ada-solar-frontend');
console.log('Serving from:', distPath);

app.use(express.static(distPath));

// Fallback to index.html for all routes (Angular routing)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('Redirecting to:', indexPath);
  res.sendFile(indexPath);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(port, hostname, () => {
  console.log(`✓ Frontend running on http://${hostname}:${port}`);
});

