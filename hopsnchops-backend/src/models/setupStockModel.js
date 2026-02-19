const mongoose = require('mongoose');

const setupStockSchema = new mongoose.Schema({
    franchiseId: { type: String, required: true },

    // product reference
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
        validate: {
            validator: async function (value) {
                const Products = mongoose.model('Products');
                const productExists = await Products.findById(value);
                return !!productExists;
            },
            message: "Invalid product ID — product not found in Products collection!",
        },
        alias: 'product'
    },

    // daily quantities
    openingStock: { type: Number, required: true, default: 0 },
    rcvdStockQty: { type: Number, required: true, default: 0 },   // purchases / transfers in

    // transfers/issues (outgoing)
    issuedQty: { type: Number, required: true, default: 0 },
    damagedQty: { type: Number, required: true, default: 0 },

    // computed / stored
    closingStock: { type: Number, required: true, default: 0 },

    expiryDate: { type: Date },
    warrantyDate: { type: Date },

    condition: {
        type: String,
        enum: ['Good', 'Fair', 'Poor', 'Broken', 'Lost'],
        default: 'Good'
    },
    assetStatus: {
        type: String,
        enum: ['Working', 'Under Repair', 'Out of Order', 'Discarded'],
        default: 'Working'
    },

    remarks: { type: String }
}, { timestamps: true });

const SetupStocks = mongoose.model('SetupStocks', setupStockSchema);
module.exports = SetupStocks;
