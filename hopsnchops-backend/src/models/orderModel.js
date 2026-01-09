
const mongoose = require("mongoose");
const Counter = require("./counter");

/* -------------------------------------------------------
   Product Order Sub Schema
-------------------------------------------------------- */
const productsOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
      validate: {
        validator: async function (value) {
          const Products = mongoose.model("Products");
          const productExists = await Products.findById(value);
          return !!productExists;
        },
        message: "Invalid product ID — product not found in Products collection!",
      },
      alias: "product",
    },
    orderQty: { type: Number, required: true, default: 0 },
    sendToPurchaseQty: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { _id: true, timestamps: true }
);

/* -------------------------------------------------------
   Order Required Schema
-------------------------------------------------------- */
const OrderRequiredSchema = new mongoose.Schema(
  {
    franchiseId: { type: String, required: true },
    products: [productsOrderSchema],
    orderNumber: { type: String, unique: true },
    totalAmount: { type: Number, default: 0 },
    totalClosingAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    vendorsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorsList",
      required: false,
      validate: {
        validator: async function (value) {
          if (!value) return true;
          const VendorsList = mongoose.model("VendorsList");
          const vendorExists = await VendorsList.findById(value);
          return !!vendorExists;
        },
        message: "Invalid vendor ID — vendor not found in VendorsList collection!",
      },
      alias: "vendor",
    },
    totelOrderQty: { type: Number, default: 0 },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* -------------------------------------------------------
   🔥 Auto-generate orderNumber (ORD-2025-0001)
-------------------------------------------------------- */
OrderRequiredSchema.pre("save", async function (next) {
  if (!this.isNew || this.orderNumber) return next();

  try {
    const year = new Date().getFullYear();
    const counterName = `order-${year}`;

    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, "0")}`;

    next();
  } catch (error) {
    next(error);
  }
});

/* -------------------------------------------------------
   Model Export
-------------------------------------------------------- */
const OrderRequired = mongoose.model("OrderRequired", OrderRequiredSchema);
module.exports = OrderRequired;

