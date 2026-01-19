const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Purchase Report
router.get("/purchase", authenticate, authorizeRoles("admin"), reportController.getPurchaseReport);

// Stock Status Report
router.get("/stock", authenticate, authorizeRoles("admin"), reportController.getStockReport);

// Consumption Report
router.get("/consumption", authenticate, authorizeRoles("admin"), reportController.getConsumptionReport);

module.exports = router;
