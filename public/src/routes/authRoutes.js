const router = require('express').Router();
const User = require('../protected/models/user');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');

// Master Admin Setup & Normal Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if Master Admin credentials match
        if (email === 'iftekhar.riyan07@gmail.com' && password === 'R1y@n101') {
            // Check if master admin exists in DB, if not create one
            let adminUser = await User.findOne({ email });
            if (!adminUser) {
                const hashedPassword = await bcrypt.hash(password, 10);
                adminUser = new User({
                    name: 'Iftekhar U. Bhuiyan',
                    email: 'iftekhar.riyan07@gmail.com',
                    password: hashedPassword,
                    role: 'admin'
                });
                await adminUser.save();
            }

            const token = jwt.sign({ id: adminUser._id, name: adminUser.name, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { name: adminUser.name, email: adminUser.email, role: adminUser.role } });
        }

        // Check other users in DB
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found or invalid credentials!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password!' });

        const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Member Route (Only accessible by logged-in users/admin)
router.post('/add-member', verifyToken, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User with this email already exists!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role: 'member' });
        await newUser.save();

        // Audit Log
        await AuditLog.create({
            userName: req.user.name,
            action: 'Add Member',
            details: `Added new member: ${name} (${email})`
        });

        res.json({ message: 'New member added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;