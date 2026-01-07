const express = require("express");
const admin = require("../controllers/adminController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/usersRegistration", authenticate, authorizeRoles('admin', 'super_admin'), admin.usersRegistration);
router.get("/getusers", authenticate, authorizeRoles('admin', 'super_admin'), admin.getAllUsersByFranchise);
// router.post("/addCategory", authenticate, authorizeRoles('admin'), admin.addCategory); // Duplicate
// router.get("/getCategories", authenticate, admin.getCategoriesByFranchise); // Duplicate

module.exports = router;
