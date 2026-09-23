const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const Order = require('../models/Order');
const Investor = require('../models/Investor');
const verifyToken = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');

// Get Audit Logs
router.get('/audit-logs', verifyToken, async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download PDF Report
router.get('/download-pdf', verifyToken, async (req, res) => {
    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=SmartPartner_Report.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('SmartPartner - Business Management Report', { align: 'center' });
        doc.moveDown();

        const orders = await Order.find();
        let totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);

        doc.fontSize(14).text(`Total Orders: ${orders.length}`);
        doc.text(`Total Net Profit: BDT ${totalProfit}`);
        doc.moveDown();

        doc.fontSize(16).text('Recent Transactions:', { underline: true });
        orders.slice(0, 10).forEach((o, index) => {
            doc.fontSize(10).text(`${index + 1}. Customer: ${o.customerName} | Product: ${o.productName} | Profit: BDT ${o.profit}`);
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;