const express = require("express");
const router = express.Router();
const purchasesController = require("../controllers/purchasesController");

router.get("/", purchasesController.getPurchases);
router.post("/", purchasesController.addPurchase);
router.put("/:id", purchasesController.updatePurchase);
router.get("/:id", purchasesController.getPurchaseById);
router.delete("/:id", purchasesController.deletePurchase); // ✅ this line matters

module.exports = router;
