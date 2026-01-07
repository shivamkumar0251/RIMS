const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_TOKEN_SECRET, CLIENT_URL } = require("../config/env");
const Token = require("../models/token");
const User = require("../models/userModel");
const PasswordReset = require("../models/passwordResetModel");
const crypto = require("crypto");
const mail = require("../utils/nodeMailer");

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: userExists._id, email: userExists.email, role: userExists.role },
      JWT_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const deviceInfo = req.headers['user-agent'] || "Unknown device";
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";

    await Token.create({
      userId: userExists._id,
      token,
      deviceInfo,
      ipAddress,
      expiresAt
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      expiresIn: 3 * 24 * 60 * 60,
      user: {
        id: userExists._id,
        email: userExists.email,
        role: userExists.role
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.userLogout = async (req, res) => {
  try {
    const token = req.token;

    if (token) {
      token.valid = false;
      await token.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent." });
    }

    await PasswordReset.updateMany({ userId: user._id, used: false }, { used: true });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = Date.now() + 3600000;

    await PasswordReset.create({
      userId: user._id,
      resetToken: hashedToken,
      expiresAt
    });

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
    const message = `We received a request to reset your password. Please click the button below to reset your password. If you did not request this, you can safely ignore this email.`;

    mail.passwordSetMail(email, resetUrl, message);

    return res.status(200).json({ success: true, message: "Reset link sent if the email exists." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const passwordReset = await PasswordReset.findOne({
      userId: user._id,
      resetToken: hashedToken,
      expiresAt: { $gt: Date.now() },
      used: false
    });

    if (!passwordReset) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    passwordReset.used = true;
    await passwordReset.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user, message: "Profile fetched successfully" });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.checkToken = async (req, res) => {
  try {
    const userData = req.user
    return res.status(200).json({
      success: true,
      message: "Token verified",
      userId: userData._id,
      role: userData.role,

    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};