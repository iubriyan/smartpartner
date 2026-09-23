const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Cached Database Connection for Serverless
let cachedDb = null;
async function connectDB() {
    if (cachedDb) return cachedDb;
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in environment variables');
    
    const db = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    cachedDb = db;
    return db;
}

// Middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes Setup
app.use('/api/auth', require('../src/routes/authRoutes'));
app.use('/api/investors', require('../src/routes/investorRoutes'));
app.use('/api/products', require('../src/routes/productRoutes'));
app.use('/api/orders', require('../src/routes/orderRoutes'));
app.use('/api/reports', require('../src/routes/reportRoutes'));

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;