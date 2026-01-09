const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resetToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// ✅ Automatically delete documents after 'expiresAt'
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
module.exports = PasswordReset
