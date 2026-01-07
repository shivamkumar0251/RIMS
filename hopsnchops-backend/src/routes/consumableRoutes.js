const express = require("express");
const consumableCtrl = require("../controllers/consumableController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");


const router = express.Router();


// ➤ Transfer from Kitchen → Consumable
router.post("/", authenticate, authorizeRoles("admin"), consumableCtrl.addConsumableStock);

// ➤ Bulk transfer (array of items)
router.post("/bulk/create", authenticate, authorizeRoles("admin"), consumableCtrl.addBulkConsumableStock);


// ➤ Get Consumable Stocks with search, filter, sort, pagination
router.get("/", authenticate, consumableCtrl.getConsumableStocks);


// ➤ Update Consumable Stock
router.put("/:id", authenticate, authorizeRoles("admin"), consumableCtrl.updateConsumableStock);


// ➤ Delete Consumable Stock
router.delete("/:id", authenticate, authorizeRoles("admin"), consumableCtrl.deleteConsumableStock);


module.exports = router;