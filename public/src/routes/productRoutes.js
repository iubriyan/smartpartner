const router = require('express').Router();
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const verifyToken = require('../middleware/authMiddleware');

// Get All Products
router.get('/', verifyToken, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Product or Update Quantity
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { name, quantity, buyingPrice, extraCost } = req.body;
        let product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (product) {
            product.quantity += Number(quantity);
            product.buyingPrice = buyingPrice;
            product.extraCost = extraCost;
            await product.save();
        } else {
            product = new Product({ name, quantity, buyingPrice, extraCost });
            await product.save();
        }

        await AuditLog.create({
            userName: req.user.name,
            action: 'Manage Product Stock',
            details: `Added/Updated product: ${name}, Qty: ${quantity}`
        });

        res.json({ message: 'Product saved successfully!', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;