const Franchise = require("../models/franchise");

// Get all franchises
exports.getFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.find();

    return res.status(200).json({
      success: true,
      count: franchises.length,
      data: franchises
    });
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message
    });
  }
};
