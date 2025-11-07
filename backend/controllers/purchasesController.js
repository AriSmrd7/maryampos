const db = require("../db");

// --- Ambil semua data pembelian
exports.getPurchases = (req, res) => {
  db.all("SELECT * FROM purchases ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// --- Tambah pembelian barang
exports.addPurchase = (req, res) => {
  const { code, name, quantity, total_cost } = req.body;
  if (!code || !name || !quantity || !total_cost)
    return res.status(400).json({ error: "Lengkapi semua field" });

  const unit_cost = total_cost / quantity;
  const date = new Date().toISOString().split("T")[0];

  db.run(
    "INSERT INTO purchases (code, name, quantity, total_cost, unit_cost, date) VALUES (?, ?, ?, ?, ?, ?)",
    [code, name, quantity, total_cost, unit_cost, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Tambah atau update ke tabel items
      db.get("SELECT * FROM items WHERE code = ?", [code], (err, row) => {
        if (err) console.error("DB Error saat cek items:", err.message);

        if (row) {
          // Barang sudah ada → update stok & harga beli
          db.run(
            "UPDATE items SET stock = stock + ?, buy_price = ? WHERE code = ?",
            [quantity, unit_cost, code],
            (err2) => {
              if (err2) console.error("Gagal update items:", err2.message);
            }
          );
        } else {
          // Barang baru → tambahkan ke tabel items
          db.run(
            "INSERT INTO items (code, name, buy_price, stock) VALUES (?, ?, ?, ?)",
            [code, name, unit_cost, quantity],
            (err3) => {
              if (err3) console.error("Gagal insert ke items:", err3.message);
            }
          );
        }
      });

      res.json({ message: "✅ Pembelian dicatat", unit_cost });
    }
  );
};

// Update purchase
exports.updatePurchase = (req, res) => {
  const { id } = req.params;
  const { name, total_cost, quantity } = req.body;

  if (!id || !name || !total_cost || !quantity) {
    return res.status(400).json({ error: "Lengkapi semua field" });
  }

  // Ambil purchase lama dulu
  db.get("SELECT * FROM purchases WHERE id = ?", [id], (err, purchase) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!purchase) return res.status(404).json({ error: "Pembelian tidak ditemukan" });

    const oldQuantity = purchase.quantity;
    const unit_cost = total_cost / quantity;

    // Update purchases
    db.run(
      "UPDATE purchases SET name = ?, total_cost = ?, quantity = ?, unit_cost = ? WHERE id = ?",
      [name, total_cost, quantity, unit_cost, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Update stok di items
        db.get("SELECT * FROM items WHERE code = ?", [purchase.code], (err, item) => {
          if (err) console.error(err);
          if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });

          // Hitung selisih quantity
          const diffQty = quantity - oldQuantity;

          db.run(
            "UPDATE items SET stock = stock + ?, buy_price = ? WHERE code = ?",
            [diffQty, unit_cost, purchase.code],
            function (err) {
              if (err) return res.status(500).json({ error: err.message });

              res.json({ message: "✅ Pembelian dan stok diperbarui", changes: this.changes });
            }
          );
        });
      }
    );
  });
};

// Ambil satu pembelian by ID
exports.getPurchaseById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM purchases WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Pembelian tidak ditemukan" });
    res.json(row);
  });
};
