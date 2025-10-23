const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Try to load MongoDB (optional)
let mongoose = null;
let User = null;
let ParkingLot = null;
let Booking = null;

try {
  require('dotenv').config();
  mongoose = require('mongoose');
  User = require('./api/models/User');
  ParkingLot = require('./api/models/ParkingLot');
  Booking = require('./api/models/Booking');
  
  // Connect to MongoDB
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ MongoDB Connected!'))
      .catch((err) => console.log('⚠️  MongoDB not connected:', err.message));
  }
} catch (error) {
  console.log('⚠️  Running without database integration');
}

const port = 7777;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;

    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`🚗 ParkEase is running at http://localhost:${port}`);
    console.log('📱 Open this URL in your browser to see the app');
    console.log('🎯 Try the demo by clicking "Try Demo" on the login screen');
});