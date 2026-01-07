const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { userCredential } = require("../utils/nodeMailer");

exports.usersRegistration = async (req, res) => {
  try {
    const { email, password, full_name, phone, address, gst_no, role, access } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    let franchiseId;
    if (req.user.role === "super_admin") {
      if (role === "user") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Super Admin can only create regular Admin",
        });
      }
      franchiseId = `${email}_${Date.now()}`;
    } else if (req.user.role === "admin") {
      if (role === "admin" || role === "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admins can only create regular users under their franchise",
        });
      }
      franchiseId = req.user.franchiseId;
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied: only admin or super_admin can create users",
      });
    }

    // Create new user
    await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      address,
      gst_no,
      role,
      franchiseId,
    });
    await userCredential(email, password)
    return res.status(201).json({
      success: true,
      message: "User registration successful. Credentials have been emailed to the user."
    });

  } catch (error) {
    console.error("Users Registration Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllUsersByFranchise = async (req, res) => {
  try {
    const role = req.user?.role;
    const franchiseId = req.user?.franchiseId;
    const { userId } = req.query;

    // --- Case 1: Fetch single user if userId is provided ---
    if (userId) {
      const user = await User.findById(userId, { password: 0 });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    }

    // --- Case 2: Otherwise fetch users based on role ---
    let query = {};
    let message = "";

    if (role === "super_admin") {
      query = { role: "admin" };
      message = "All admins fetched successfully";
    }
    else if (role === "admin") {
      if (!franchiseId) {
        return res.status(400).json({
          success: false,
          message: "Franchise ID missing in user data",
        });
      }
      query = { franchiseId };
      message = "Users fetched successfully for this franchise";
    }
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only admin or super_admin can view users",
      });
    }

    const users = await User.find(query, { password: 0 }).sort({ createdAt: -1 });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message,
      data: users,
    });

  } catch (error) {
    console.error("Error fetching franchise users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

