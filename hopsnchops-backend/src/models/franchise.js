const mongoose = require("mongoose");

const franchiseSchema = new mongoose.Schema({
  franchiseId: { type: String, required: true, unique: true, index: true },
  Franchise_Name: {
    type: String,
    required: true,
    trim: true
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
  Manager_Name: {
    type: String,
    required: true
  },
  Manager_Contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  Opening_Date: {
    type: Date,
    required: true
  },
  Status: {
    type: String,
    enum: ["Open", "Closed", "Under Construction", "Transferred"],
    default: "Open",
    required: true
  }
}, { timestamps: true });

franchiseSchema.pre("validate", function (next) {
  if (!this.franchiseId) {
    const timestamp = Date.now();
    this.franchiseId = `FRAN_${timestamp}`;
  }
  next();
});

module.exports = mongoose.model("Franchise", franchiseSchema);

