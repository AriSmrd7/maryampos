const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/itemsController");

router.get("/", itemsController.getItems);
router.get("/ready", itemsController.getReadyItems);
router.post("/", itemsController.addItem);
router.post("/margin", itemsController.updateMargin);
router.put("/:id/stock", itemsController.updateStock);
router.delete("/:id", itemsController.deleteItem);

module.exports = router;
