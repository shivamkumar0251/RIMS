const express = require("express");
const order = require("../controllers/orderController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products with currentPurchaseQty for order creation
router.get("/products", authenticate, order.getProducts);

// Create bulk orders
router.post("/", authenticate, authorizeRoles('admin'), order.createBulkOrders);
// Get all orders
router.get("/", authenticate, order.getOrders);

// Update multiple products sendToPurchaseQty and remarks in order
router.put("/:id/send-to-purchase", authenticate, authorizeRoles('admin'), order.vendorUpdatesendToPurchaseQty);

// Update products array in order
router.put("/:id", authenticate, authorizeRoles('admin'), order.updateOrderProducts);

// Delete order items (products) from order
router.delete("/:id/items", authenticate, authorizeRoles('admin'), order.deleteOrderItems);

// Delete whole order
router.delete("/:id", authenticate, authorizeRoles('admin'), order.deleteOrder);

module.exports = router;
