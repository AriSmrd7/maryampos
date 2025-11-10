const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== Existing Routes =====
const itemsRouter = require("./routes/items");
const salesRouter = require("./routes/sales");
const purchasesRouter = require("./routes/purchases");
app.use("/api/items", itemsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/purchases", purchasesRouter);

// ===== BACKUP CONFIG =====
const DATABASE_PATH = path.join(__dirname, "../database/pos.db");
const BACKUP_DIR = path.join(__dirname, "../database/backups");

// Create backup folder if missing
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log("📁 Created backup directory:", BACKUP_DIR);
}

// ===== BACKUP ROUTES =====

// Get latest backup info
app.get("/api/backup/latest", (req, res) => {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".db"))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.json({ latest: null });
    }

    res.json({
      latest: files[0].name,
      time: files[0].time,
    });
  } catch (err) {
    console.error("❌ Error fetching latest backup:", err);
    res.status(500).json({ error: "Failed to read backup folder" });
  }
});

// Create a new backup
app.post("/api/backup/create", (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
    fs.copyFileSync(DATABASE_PATH, backupFile);

    console.log(`✅ Backup created: ${backupFile}`);
    res.json({
      message: "Backup created successfully",
      file: path.basename(backupFile),
    });
  } catch (err) {
    console.error("❌ Error creating backup:", err);
    res.status(500).json({ error: "Failed to create backup" });
  }
});

// ===== SERVER START =====
app.listen(4000, () =>
  console.log("✅ Backend running on http://localhost:4000")
);
