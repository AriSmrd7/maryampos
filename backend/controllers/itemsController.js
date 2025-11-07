const db = require("../db");

exports.getItems = (req, res) => {
  const query = `
    SELECT id, code, name, buy_price, sell_price, margin, IFNULL(stock,0) AS stock
    FROM items
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// --- Barang siap dijual (punya margin)
exports.getReadyItems = (req, res) => {
  const query = `
    SELECT id, code, name, buy_price, sell_price, margin, IFNULL(stock,0) AS stock
    FROM items
    WHERE margin IS NOT NULL AND margin > 0
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// --- Tambah item baru
exports.addItem = (req, res) => {
  const { code, name, buy_price, sell_price } = req.body;
  const margin = ((sell_price - buy_price) / buy_price) * 100;
  db.run(
    "INSERT INTO items (code, name, buy_price, sell_price, margin, stock) VALUES (?, ?, ?, ?, ?, 0)",
    [code, name, buy_price, sell_price, margin],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: "Item added" });
    }
  );
};

// --- Update margin
exports.updateMargin = (req, res) => {
  const { code, margin } = req.body;
  db.get("SELECT * FROM items WHERE code = ?", [code], (err, item) => {
    if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });

    const sell_price = item.buy_price + (item.buy_price * margin / 100);
    db.run(
      "UPDATE items SET margin = ?, sell_price = ? WHERE code = ?",
      [margin, sell_price, code],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Margin diperbarui", sell_price });
      }
    );
  });
};
// --- Update stok manual (misalnya dari admin)
exports.updateStock = (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined)
    return res.status(400).json({ error: "Jumlah stok harus diisi" });

  const query = `UPDATE items SET stock = ? WHERE id = ?`;
  db.run(query, [stock, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Stok diperbarui", stock: stock });
  });
};


// --- Hapus item
exports.deleteItem = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "🗑️ Item dihapus", changes: this.changes });
  });
};
