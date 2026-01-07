const jwt = require('jsonwebtoken');
const { JWT_TOKEN_SECRET } = require('../config/env');
const Token = require('../models/token');
const User = require('../models/userModel');

// ✅ Core authentication middleware (any logged-in user)
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }

    // Check DB token record
    const tokenRecord = await Token.findOne({ token, valid: true });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token invalid or expired" });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    req.user = user;
    req.token = tokenRecord;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Role-based middleware factory
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient privileges" });
    }
    next();
  };
};

