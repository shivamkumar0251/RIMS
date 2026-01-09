const express = require("express");
const category = require("../controllers/categoryController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("../middleware/multer");

const router = express.Router();

router.get("/getCategories", authenticate, category.getCategoriesByFranchise);
router.post("/addCategory", authenticate, authorizeRoles('admin'), category.addCategory);
router.put("/updateCategories/:categoryId", authenticate, authorizeRoles('admin'), category.updateCategory);
router.delete("/deleteCategories/:categoryId", authenticate, authorizeRoles('admin'), category.deleteCategory);

// Bulk create from Excel
router.post("/bulk-excel", authenticate, authorizeRoles('admin'), multer.single('file'), category.bulkCreateFromExcel);

// Sub-Category Routes
router.post("/:categoryId/subcategories", authenticate, authorizeRoles('admin'), category.addSubCategory);
router.put("/:categoryId/subcategories/:subCategoryId", authenticate, authorizeRoles('admin'), category.updateSubCategory);
router.delete("/:categoryId/subcategories/:subCategoryId", authenticate, authorizeRoles('admin'), category.deleteSubCategory);

module.exports = router;
