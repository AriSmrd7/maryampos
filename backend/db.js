const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.resolve(__dirname, "../database/pos.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Gagal buka DB:", err.message);
  else console.log("✅ Database connected at", dbPath);
});

db.serialize(() => {
  // Barang master
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT,
      buy_price REAL,
      sell_price REAL,
      margin INTEGER,
      stock INTEGER DEFAULT 0
    )
  `);

  // Pencatatan pembelian
  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT,
      quantity INTEGER,
      total_cost REAL,
      unit_cost REAL,
      date TEXT
    )
  `);

  // Header nota penjualan
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      total REAL NOT NULL,
      date TEXT NOT NULL
    )
  `);

  // Detail nota per item
  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `);
});

module.exports = db;
