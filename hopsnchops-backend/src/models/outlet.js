const mongoose = require('mongoose');

const contractOutletSchema = new mongoose.Schema({
  ContractOutlet_ID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  Owner_Name: {
    type: String,
    required: true,
    trim: true
  },
  Owner_Phone: {
    type: String,
    required: true
  },
  Owner_Email: {
    type: String,
    required: true
  },
  Location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  Address: {
    type: String,
    required: true
  },
  Zip_Postal_Code: {
    type: String,
    required: true
  },
  Agreement_Date: {
    type: Date,
    required: true
  },
  Status: {
    type: String,
    enum: ["Applied", "Under Review", "Approved", "Active", "Closed", "Terminated"],
    default: "Applied",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("ContractOutlet", contractOutletSchema);

