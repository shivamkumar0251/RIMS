const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    franchiseId: { type: String, required: true },
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
    rcvdPurchaseQty: {
        type: Number,
        required: true,
        default: 0
    },
    sendToStoreQty: {
        type: Number,
        required: true,
        default: 0
    },
    // computed current qty remaining with purchase (rcvd - sent)
    currentPurchaseQty: { type: Number, default: 0 }

}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase
