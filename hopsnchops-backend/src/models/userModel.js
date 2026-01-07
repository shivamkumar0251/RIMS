const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [50, "Full name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/, // Indian 10-digit phone numbers starting with 6-9
        "Please enter a valid phone number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          // At least one uppercase, one lowercase, one number, one special char
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
        },
        message:
          "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      // minlength: [10, "Address must be at least 10 characters long"],
      // maxlength: [200, "Address must be less than 200 characters"],
    },
    gst_no: {
      type: String,
      required: [true, "GST number is required"],
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter a valid GST number",
      ],
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
      required: true,
    },
    access: {
      type: String,
      enum: ["all", "orders", "vendorsOrder", "purchase", "storeStock", "kitchenStock", "consumables"],
      default: "consumables",
      required: true,
    },
    franchiseId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
