import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [name, setName] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [profitPercent, setProfitPercent] = useState("");
  const [stockQty, setStockQty] = useState("");

  const fetchStocks = async () => {
    const res = await axios.get(`${API_URL}/items`);
    setStocks(res.data);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

const addStock = async () => {
  if (!name || !buyPrice || !profitPercent || !stockQty) {
    alert("Lengkapi semua field stok!");
    return;
  }

  const bp = parseFloat(buyPrice);
  const pp = parseFloat(profitPercent);
  const sellPrice = bp + (bp * pp) / 100;

  try {
    await axios.post(`${API_URL}/items`, {
      name,
      buy_price: bp,
      sell_price: sellPrice,
      stock: parseInt(stockQty),
    });

    setName("");
    setBuyPrice("");
    setProfitPercent("");
    setStockQty("");
    fetchStocks();
  } catch (err) {
    console.error("Gagal menambah stok:", err);
    alert("Gagal menambah stok. Periksa backend.");
  }
};


  return (
    <div>
      <h2>📦 Manajemen Stok Barang</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input placeholder="Nama Barang" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Harga Beli" type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
        <input placeholder="Persentase Laba (%)" type="number" value={profitPercent} onChange={e => setProfitPercent(e.target.value)} />
        <input placeholder="Jumlah Stok" type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} />
        <button onClick={addStock}>Tambah</button>
      </div>

    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead style={{ background: "#eee" }}>
        <tr>
        <th>Nama</th>
        <th>Harga Beli</th>
        <th>Harga Jual</th>
        <th>Stok</th>
        </tr>
    </thead>
    <tbody>
        {stocks.map(i => (
        <tr key={i.id}>
            <td>{i.name}</td>
            <td>Rp {i.buy_price}</td>
            <td>Rp {i.sell_price}</td>
            <td>{i.stock}</td>
        </tr>
        ))}
    </tbody>
    </table>

    </div>
  );
}
