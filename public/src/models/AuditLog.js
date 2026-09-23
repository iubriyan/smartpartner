const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);