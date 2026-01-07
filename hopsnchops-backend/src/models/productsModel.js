const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  franchiseId: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorys',
    required: true,
    validate: {
      validator: async function (value) {
        const Categorys = mongoose.model('Categorys');
        const categoryExists = await Categorys.findById(value);
        return !!categoryExists;
      },
      message: "Invalid category ID — category not found in Categorys collection!",
    },
    alias: 'category'
  },
  vendorsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorsList',
    required: false,
    validate: {
      validator: async function (value) {
        if (!value) return true;
        const VendorsList = mongoose.model('VendorsList');
        const vendorExists = await VendorsList.findById(value);
        return !!vendorExists;
      },
      message: "Invalid vendor ID — vendor not found in VendorsList collection!",
    },
    alias: 'vendor'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyBrands',
    required: false,
    validate: {
      validator: async function (value) {
        if (!value) return true;
        const CompanyBrands = mongoose.model('CompanyBrands');
        const companyExists = await CompanyBrands.findById(value);
        return !!companyExists;
      },
      message: "Invalid company ID — company not found in CompanyBrands collection!",
    },
    alias: 'company'
  },
  productName: { type: String, required: true, trim: true },
  packSize: { type: String, },
  unit: { type: String, required: true, },
  shape: { type: String, },
  colour: { type: String, },
  printStatus: { type: String },
  productImage: { type: String, alias: 'image' },
  gstPct: { type: Number, default: 0, },
  taxableValue: { type: Number, required: true, },
  perUnitRate: { type: Number, required: true, },
  stockAlert: { type: Number, required: true, },
  productType: {
    type: String,
    enum: ["Inventory Item", "Packaging Item"],
    default: "Inventory Item",
  },
  expiryDate: { type: Date },
  // quantity: { type: Number, default: 0, },
  // productMRP: { type: Number, required: true, },
  // totalMRP: { type: Number, required: true, }, 
}, {
  timestamps: true
});


const Products = mongoose.model('Products', productsSchema);
module.exports = Products

