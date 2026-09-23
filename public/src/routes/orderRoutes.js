const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const verifyToken = require('../middleware/authMiddleware');

// Get All Orders
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Order & Deduct Stock
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { customerName, customerPhone, productName, quantity, sellingPrice, courierCharge, status } = req.body;

        // Check Product Stock
        const product = await Product.findOne({ name: { $regex: new RegExp(`^${productName}$`, 'i') } });
        if (!product) return res.status(400).json({ error: 'Product not found in stock!' });
        if (product.quantity < quantity) return res.status(400).json({ error: `Insufficient stock! Available: ${product.quantity}` });

        // Calculate Profit: (Selling Price - Buying Price - Extra Cost) * Quantity - Courier Charge
        const totalCostPerUnit = product.buyingPrice + (product.extraCost || 0);
        const profit = (Number(sellingPrice) - totalCostPerUnit) * Number(quantity) - Number(courierCharge || 0);

        const newOrder = new Order({
            customerName,
            customerPhone,
            productName,
            quantity,
            sellingPrice,
            profit,
            courierCharge,
            status: status || 'Delivered'
        });

        await newOrder.save();

        // Deduct Stock
        product.quantity -= Number(quantity);
        await product.save();

        await AuditLog.create({
            userName: req.user.name,
            action: 'Create Order',
            details: `Order created for ${customerName}, Product: ${productName} (Qty: ${quantity})`
        });

        res.json({ message: 'Order placed successfully & stock updated!', newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;