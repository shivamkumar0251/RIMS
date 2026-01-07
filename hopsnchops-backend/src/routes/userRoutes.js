const express = require("express");
const users = require("../controllers/userController");
const { validateLoginBody } = require("../validator/usersValidation");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", validateLoginBody, users.userLogin);
router.post("/checkToken", authenticate,  users.checkToken);
router.post("/logout", authenticate, users.userLogout);
router.post("/forgotPassword", users.forgotPassword);
router.post("/resetPassword", users.resetPassword);
router.get("/profile", authenticate, users.userProfile);

module.exports = router;
