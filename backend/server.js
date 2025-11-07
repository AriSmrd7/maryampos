const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
const itemsRouter = require("./routes/items");
const salesRouter = require("./routes/sales");
const purchasesRouter = require("./routes/purchases"); // ✅ tambahkan
app.use("/api/items", itemsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/purchases", purchasesRouter); // ✅ tambahkan

app.listen(4000, () => console.log("✅ Backend running on http://localhost:4000"));
