const express = require("express");
const outlet = require("../controllers/outletController");
const router = express.Router();

router.get("/", outlet.getOutlets);

module.exports = router;
