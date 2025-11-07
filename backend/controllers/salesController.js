const db = require("../db");

// --- Ambil semua nota dengan total item dan total harga
exports.getAllSales = (req, res) => {
  const query = `
    SELECT s.id, s.code, s.total, s.date, 
           COUNT(si.id) AS total_items
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
    GROUP BY s.id
    ORDER BY s.id DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// --- Ambil detail nota lengkap
exports.getSaleDetail = (req, res) => {
  const saleId = req.params.id;
  console.log("Fetching sale detail for ID:", saleId); // DEBUG

  db.get("SELECT * FROM sales WHERE id = ?", [saleId], (err, sale) => {
    if (err) {
      console.error("Error fetching sale:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!sale) {
      console.warn("Sale not found for ID:", saleId);
      return res.status(404).json({ error: "Nota tidak ditemukan" });
    }

    console.log("Sale found:", sale); // DEBUG

    db.all(
      `SELECT si.quantity, si.subtotal, i.name, i.sell_price
       FROM sale_items si
       JOIN items i ON i.id = si.item_id
       WHERE si.sale_id = ?`,
      [saleId],
      (err, items) => {
        if (err) {
          console.error("Error fetching sale items:", err);
          return res.status(500).json({ error: err.message });
        }

        if (!items || items.length === 0) {
          console.warn("No items found for sale ID:", saleId);
        } else {
          console.log("Items fetched:", items); // DEBUG
        }

        res.json({
          id: sale.id,
          code: sale.code,
          date: sale.date,
          total: sale.total,
          items: items || [] // pastikan selalu array
        });
      }
    );
  });
};

// --- Fungsi untuk generate kode nota unik
const generateSaleCode = (callback) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 01..12
  const day = now.getDate().toString().padStart(2, "0"); // 01..31

  const prefix = `MP-${year}${month}${day}`; // MP-20251105

  // Hitung jumlah nota hari ini menggunakan ISO date
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  db.get(
    "SELECT COUNT(*) as count FROM sales WHERE date BETWEEN ? AND ?",
    [startOfDay.toISOString(), endOfDay.toISOString()],
    (err, row) => {
      if (err) return callback(err);
      const no = (row.count + 1).toString().padStart(4, "0"); // 0001
      callback(null, `${prefix}-${no}`);
    }
  );
};

// --- Tambah nota multi-item
exports.addSale = (req, res) => {
  const { items } = req.body; // [{ item_id, quantity }]
  if (!items || items.length === 0)
    return res.status(400).json({ error: "Belum ada item di nota" });

  // Dapatkan waktu sekarang di WIB
  const now = new Date();
  const dateTimeWIB = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  ).toISOString();

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    generateSaleCode((err, code) => {
      if (err) {
        console.error("Error generating sale code:", err);
        return db.run("ROLLBACK") && res.status(500).json({ error: err.message });
      }

      console.log("Generated sale code:", code); // DEBUG

      // insert header nota
      db.run(
        "INSERT INTO sales (code, total, date) VALUES (?, ?, ?)",
        [code, 0, dateTimeWIB],
        function (err) {
          if (err) {
            console.error("Error inserting sale header:", err);
            return db.run("ROLLBACK") && res.status(500).json({ error: err.message });
          }

          const saleId = this.lastID;
          console.log("Inserted sale header with ID:", saleId); // DEBUG

          let totalNota = 0;
          const insertStmt = db.prepare(
            "INSERT INTO sale_items (sale_id, item_id, quantity, subtotal) VALUES (?, ?, ?, ?)"
          );

          const processItem = (index) => {
            if (index >= items.length) {
              insertStmt.finalize();
              db.run(
                "UPDATE sales SET total = ? WHERE id = ?",
                [totalNota, saleId],
                (err) => {
                  if (err) {
                    console.error("Error updating sale total:", err);
                    return db.run("ROLLBACK") &&
                      res.status(500).json({ error: err.message });
                  }
                  db.run("COMMIT", (err) => {
                    if (err) console.error("Error committing transaction:", err);
                    console.log(
                      "Sale committed successfully:",
                      saleId,
                      totalNota
                    ); // DEBUG
                    return res.json({ id: saleId, code, total: totalNota });
                  });
                }
              );
              return;
            }

            const i = items[index];
            db.get("SELECT * FROM items WHERE id = ?", [i.item_id], (err, item) => {
              if (err || !item) {
                console.error("Item not found or error:", err, i);
                return db.run("ROLLBACK") &&
                  res.status(404).json({ error: "Barang tidak ditemukan" });
              }
              if (item.stock < i.quantity) {
                console.warn(
                  "Stock not enough:",
                  item.name,
                  item.stock,
                  i.quantity
                );
                return db.run("ROLLBACK") &&
                  res.status(400).json({
                    error: `Stok ${item.name} tidak cukup`,
                  });
              }

              const subtotal = item.sell_price * i.quantity;
              totalNota += subtotal;

              insertStmt.run(
                saleId,
                i.item_id,
                i.quantity,
                subtotal,
                (err) => {
                  if (err) {
                    console.error("Error inserting sale_item:", err);
                    return db.run("ROLLBACK") &&
                      res.status(500).json({ error: err.message });
                  }

                  console.log("Inserted sale_item:", {
                    saleId,
                    item_id: i.item_id,
                    quantity: i.quantity,
                    subtotal,
                  }); // DEBUG

                  // update stock otomatis
                  db.run(
                    "UPDATE items SET stock = stock - ? WHERE id = ?",
                    [i.quantity, i.item_id],
                    (err) => {
                      if (err) {
                        console.error("Error updating stock:", err);
                        return db.run("ROLLBACK") &&
                          res.status(500).json({ error: err.message });
                      }
                      processItem(index + 1);
                    }
                  );
                }
              );
            });
          };

          processItem(0);
        }
      );
    });
  });
};
