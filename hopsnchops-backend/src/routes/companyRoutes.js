const express = require("express");
const company = require("../controllers/companyController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("../middleware/multer");

const router = express.Router();

// Create single company
router.post("/", authenticate, authorizeRoles('admin'), company.createCompany);

// Bulk create from Excel
router.post("/bulk-excel", authenticate, authorizeRoles('admin'), multer.single('file'), company.bulkCreateFromExcel);

// Get companies with search, pagination, date filter
router.get("/", authenticate, company.getCompanies);

// Update company
router.put("/:id", authenticate, authorizeRoles('admin'), company.updateCompany);

// Delete single or bulk
router.delete("/:id", authenticate, authorizeRoles('admin'), company.deleteCompany);
router.post("/delete-bulk", authenticate, authorizeRoles('admin'), company.deleteCompany);

module.exports = router;
