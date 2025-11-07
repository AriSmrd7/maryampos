const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

router.get("/", salesController.getAllSales);
router.get("/:id", salesController.getSaleDetail); // detail per nota
router.post("/", salesController.addSale);

module.exports = router;
