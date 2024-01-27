const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'build' folder
app.use(express.static(path.join(__dirname, '..', 'build')));

// Add middleware to set X-Frame-Options header to DENY
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Serve the 'index.html' file for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});