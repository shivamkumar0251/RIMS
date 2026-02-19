const mongoose = require('mongoose');

const setupStockLogSchema = new mongoose.Schema({
    franchiseId: { type: String, required: true },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    qty: { type: Number, required: true },
    type: {
        type: String,
        enum: ['receipt', 'issue', 'damaged', 'lost'],
        required: true
    },
    remarks: { type: String },
    prevClosing: { type: Number },
    newClosing: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('SetupStockLogs', setupStockLogSchema);
