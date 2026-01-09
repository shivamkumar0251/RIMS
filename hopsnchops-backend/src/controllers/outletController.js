const Outlet = require("../models/outlet");

// Get all outlets
exports.getOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.find();

    return res.status(200).json({
      success: true,
      count: outlets.length,
      data: outlets
    });
  } catch (error) {
    console.error("Error fetching outlets:", error);
    return res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message
    });
  }
};
