const mongoose = require('mongoose');

const kitchenStockSchema = new mongoose.Schema({
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
  transfersToConsumable: { type: Number, required: true, default: 0 },

  // computed / stored
  closingStock: { type: Number, required: true, default: 0 },

  expiryDate: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

const KitchenStocks = mongoose.model('KitchenStocks', kitchenStockSchema);
module.exports = KitchenStocks;
