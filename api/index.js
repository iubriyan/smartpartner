const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Database Connection
if (process.env.MONGO_URI && mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => console.log('DB Connection Error:', err));
}

// Routes Setup (এখানে পাথ ঠিক রাখা হয়েছে)
app.use('/api/auth', require('../src/routes/authRoutes'));
app.use('/api/investors', require('../src/routes/investorRoutes'));
app.use('/api/products', require('../src/routes/productRoutes'));
app.use('/api/orders', require('../src/routes/orderRoutes'));
app.use('/api/reports', require('../src/routes/reportRoutes'));

app.get('/', (req, res) => {
    res.send('SmartPartner API is running on Vercel...');
});

module.exports = app;