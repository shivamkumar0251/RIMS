const express = require("express");
const inquiry = require("../controllers/inquiryController");
const { validateFranchiseInquiry } = require("../validator/franchiseInquiry");
const router = express.Router();

router.post("/", validateFranchiseInquiry, inquiry.franchiseInquiry);

module.exports = router;
