
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true // optional, ensures no duplicates
  },
  deviceInfo: {
    type: String,
    required: false, // user-agent or device description
  },
  ipAddress: {
    type: String,
    required: false, // user's IP address
  },
  expiresAt: {
    type: Date,
    required: true, // token expiry date
  },
  valid: {
    type: Boolean,
    default: true, // token is valid unless explicitly revoked
  },
  createdAt: {
    type: Date,
    default: Date.now, // when token was created
  }
});

// Index to automatically delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
