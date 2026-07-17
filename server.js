const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 4200;
const hostname = '0.0.0.0';

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist/ada-solar-frontend')));

// Fallback to index.html for all routes (Angular routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ada-solar-frontend/index.html'));
});

app.listen(port, hostname, () => {
  console.log(`✓ Frontend running on http://${hostname}:${port}`);
});
