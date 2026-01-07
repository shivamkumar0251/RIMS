const mongoose = require('mongoose');

const consumableStockSchema = new mongoose.Schema({
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
  rcvdKitchenQty: { type: Number, required: true, default: 0 },   // purchases / transfers in
  // transfers sent to consumable (outgoing from this kitchen)
  transfersToUsage: { type: Number, required: true, default: 0 },
  transfersToWastage: { type: Number, required: true, default: 0 },

  // computed / stored
  closingStock: { type: Number, required: true, default: 0 },

  remarks: { type: String }
}, { timestamps: true });


const ConsumableStocks = mongoose.model('ConsumableStocks', consumableStockSchema);
module.exports = ConsumableStocks;
