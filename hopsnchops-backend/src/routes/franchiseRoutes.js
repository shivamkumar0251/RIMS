const express = require("express");
const franchise = require("../controllers/franchiseController");
const router = express.Router();

router.get("/", franchise.getFranchises);

module.exports = router;
