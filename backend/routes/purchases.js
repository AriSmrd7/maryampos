const express = require("express");
const router = express.Router();
const purchasesController = require("../controllers/purchasesController");

// Routes
router.get("/", purchasesController.getPurchases);
router.post("/", purchasesController.addPurchase);
router.put("/:id", purchasesController.updatePurchase); // HARUS ADA
router.get("/:id", purchasesController.getPurchaseById);

module.exports = router;
