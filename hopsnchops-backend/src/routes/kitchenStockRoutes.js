const express = require("express");
const kitchenController = require("../controllers/kitchenStockController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// POST → Transfer from Kitchen to Consumable
router.post("/", authenticate, authorizeRoles("admin"), kitchenController.addKitchenStock);

// POST → Bulk transfer from Kitchen to Consumable
router.post("/bulk/create", authenticate, authorizeRoles("admin"), kitchenController.addBulkKitchenStock);

// GET → All Kitchen Stocks with filters, search, pagination
router.get("/", authenticate, kitchenController.getKitchenStocks);

// PUT → Update Kitchen Stock
router.put("/:id", authenticate, authorizeRoles("admin"), kitchenController.updateKitchenStock);

// DELETE → Delete Kitchen Stock
router.delete("/:id", authenticate, authorizeRoles("admin"), kitchenController.deleteKitchenStock);

module.exports = router;
