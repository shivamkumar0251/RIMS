const express = require('express');
const router = express.Router();
const vendorList = require('../controllers/vendorListController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('../middleware/multer');

// Get vendor id + name list
router.get('/list-names', authenticate, vendorList.getVendorNames);

// Get vendors with search/pagination/filters
router.get('/', authenticate, vendorList.getVendors);

// Get single vendor by id
router.get('/:id', authenticate, vendorList.getVendorById);

// Create single vendor (admin)
router.post('/', authenticate, authorizeRoles('admin'), vendorList.createVendor);

// Bulk create from Excel (admin)
router.post('/bulk-excel', authenticate, authorizeRoles('admin'), multer.single('file'), vendorList.bulkCreateFromExcel);

// Update vendor (admin)
router.put('/:id', authenticate, authorizeRoles('admin'), vendorList.updateVendor);

// Delete vendor (admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), vendorList.deleteVendor);

module.exports = router;
