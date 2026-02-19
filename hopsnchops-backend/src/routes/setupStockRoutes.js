const express = require("express");
const setupStock = require("../controllers/setupStockController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, authorizeRoles('admin'), setupStock.addSetupStock);
router.post("/bulk/create", authenticate, authorizeRoles('admin'), setupStock.addBulkSetupStock);
router.get("/", authenticate, setupStock.getSetupStock);
router.put("/:id", authenticate, authorizeRoles('admin'), setupStock.updateSetupStock);
router.delete("/:id", authenticate, authorizeRoles('admin'), setupStock.deleteSetupStock);
router.get("/logs", authenticate, setupStock.getSetupStockLogs);

module.exports = router;
