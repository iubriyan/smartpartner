const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Database Connection
if (process.env.MONGO_URI && mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => console.log('DB Connection Error:', err));
}

// API Routes Setup
app.use('/api/auth', require('../src/routes/authRoutes'));
app.use('/api/investors', require('../src/routes/investorRoutes'));
app.use('/api/products', require('../src/routes/productRoutes'));
app.use('/api/orders', require('../src/routes/orderRoutes'));
app.use('/api/reports', require('../src/routes/reportRoutes'));

// Fallback to index.html for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;