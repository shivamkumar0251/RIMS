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

// Sales Report
router.get("/sales", authenticate, authorizeRoles("admin"), reportController.getSalesReport);

// Purchase Source Report
router.get("/purchase-origin", authenticate, authorizeRoles("admin"), reportController.getPurchaseSourceReport);

module.exports = router;
