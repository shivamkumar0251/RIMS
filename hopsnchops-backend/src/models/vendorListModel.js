const mongoose = require('mongoose');

const VendorListSchema = new mongoose.Schema({
  franchiseId: { type: String, required: true },
  vendor_name: { type: String, required: true, trim: true, unique: true, },
  vendor_mobileNo: { type: String },
  vendor_address: { type: String },
  vendor_state: { type: String },
  vendor_country: { type: String, default: 'India' },
  vendor_email: {
    type: String, trim: true, lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },
  vendor_pinCode: { type: String },
  vendor_bankName: { type: String },
  vendor_accountNumber: { type: String },
  vendor_ifscCode: { type: String },
  vendor_paymentTerms: { type: String },
  vendor_preferredPaymentMode: { type: String, enum: ["Cash", "Bank Transfer", "UPI", "Cheque"], default: "Bank Transfer", },
  vendor_creditLimit: { type: Number, default: 0 },
  vendor_outstandingBalance: { type: Number, default: 0 },
  vendor_gstType: { type: String, enum: ["Cgst Sgst", "Igst", "Non Gst", "Exempt"], default: "Non Gst", },
  vendor_registrationType: { type: String, enum: ["Composition", "Registered", "UnRegistered"], default: "Registered", },
  vendor_gstNumber: { type: String },
  vendor_openingBalance: { type: Number, default: 0 },

}, { timestamps: true });

const VendorsList = mongoose.model('VendorsList', VendorListSchema);
module.exports = VendorsList
