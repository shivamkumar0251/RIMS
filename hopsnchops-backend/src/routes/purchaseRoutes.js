const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new purchase (admin)
router.post('/', authenticate, authorizeRoles('admin'), purchaseController.createPurchase);

// Create multiple purchases at once (admin)
router.post('/bulk/create', authenticate, authorizeRoles('admin'), purchaseController.createMultiplePurchases);

// Get purchases with optional filters
router.get('/', authenticate, purchaseController.getPurchases);

// Update a purchase (admin)
router.put('/:id', authenticate, authorizeRoles('admin'), purchaseController.updatePurchase);

// Delete a purchase (admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), purchaseController.deletePurchase);

module.exports = router;

