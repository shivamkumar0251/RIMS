const express = require("express");
const vendor = require("../controllers/vendorOrdersController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, authorizeRoles('admin'), vendor.createVendor);
router.get("/", authenticate, vendor.getVendors);
router.put("/order-product", authenticate, authorizeRoles('admin'), vendor.updateOrderProduct);
router.put("/:id", authenticate, authorizeRoles('admin'), vendor.updateVendor);
router.delete("/:id", authenticate, authorizeRoles('admin'), vendor.deleteVendor);

module.exports = router;
