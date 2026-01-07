const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// Get products with filters, pagination, sorting
router.get('/', authenticate, productsController.getProducts);

// Create single product (JSON or form-data with optional image)
router.post('/', authenticate, authorizeRoles('admin'), upload.single('image'), productsController.createSingleProduct);

// Create bulk from Excel file
router.post('/bulk-excel', authenticate, authorizeRoles('admin'), upload.single('file'), productsController.createBulkFromExcel);

// Update single product by id (PUT /:id) or bulk update (PUT / with body.products)
router.put('/:id', authenticate, authorizeRoles('admin'), upload.single('image'), productsController.updateProducts);
router.put('/', authenticate, authorizeRoles('admin'), upload.any(), productsController.updateProducts);

// Delete single or bulk
router.delete('/:id', authenticate, authorizeRoles('admin'), productsController.deleteProducts);
router.delete('/', authenticate, authorizeRoles('admin'), productsController.deleteProducts);

module.exports = router;
