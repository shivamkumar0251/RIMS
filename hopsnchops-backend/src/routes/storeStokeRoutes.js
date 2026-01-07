const express = require("express");
const storeStock = require("../controllers/storeStockController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, authorizeRoles('admin'), storeStock.addStoreStock);
router.post("/bulk/create", authenticate, authorizeRoles('admin'), storeStock.addBulkStoreStock);
router.get("/", authenticate, storeStock.getStoreStock);
router.put("/:id", authenticate, authorizeRoles('admin'), storeStock.updateStoreStock);
router.delete("/:id", authenticate, authorizeRoles('admin'), storeStock.deleteStoreStock);

module.exports = router;
