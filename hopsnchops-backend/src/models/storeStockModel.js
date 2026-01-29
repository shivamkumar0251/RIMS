const mongoose = require('mongoose');

const storeStockSchema = new mongoose.Schema({
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
  rcvdStoreQty: { type: Number, required: true, default: 0 },   // purchases / transfers in
  // transfers sent to kitchen/store (outgoing from this store)
  transfersToKitchenStore: { type: Number, required: true, default: 0 },

  // computed / stored
  closingStock: { type: Number, required: true, default: 0 },

  expiryDate: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

const StoreStocks = mongoose.model('StoreStocks', storeStockSchema);
module.exports = StoreStocks;
