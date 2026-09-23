const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Database Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.log('Database Connection Error: ', err));
}



// Basic Route
app.get('/', (req, res) => {
    res.send('SmartPartner API is running...');
});

// Local development listen
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Routes Setup (সঠিক পাথ সহ)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/investors', require('./src/routes/investorRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Export for Vercel
module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});