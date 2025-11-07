import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { components } from "react-select";

const API_URL = "http://localhost:4000/api";

export default function SalesPage() {
  const [items, setItems] = useState([]);
  const [notaItems, setNotaItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState("");
  const [total, setTotal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [notaDetails, setNotaDetails] = useState({});

  const formatWIBTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }) + " WIB";
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  
  const addItemToNota = () => {
    if (!selectedItem || !qty) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Pilih barang dan isi jumlah!"
      });
    }

    const stockItemIndex = items.findIndex(i => i.id === selectedItem.value);
    const stockItem = items[stockItemIndex];

    if (!stockItem || stockItem.stock <= 0) {
      return Swal.fire({
        icon: "error",
        title: "Stok habis",
        text: `Stok ${selectedItem.name} kosong!`
      });
    }

    if (parseInt(qty) > stockItem.stock) {
      return Swal.fire({
        icon: "error",
        title: "Stok tidak cukup",
        text: `Stok ${selectedItem.name} hanya ${stockItem.stock}`
      });
    }


    const existingIndex = notaItems.findIndex(i => i.item_id === selectedItem.value);

    if (existingIndex >= 0) {
      const updatedNota = [...notaItems];
      const newQty = updatedNota[existingIndex].quantity + parseInt(qty);

      if (newQty > stockItem.stock) {
        return Swal.fire({
          icon: "error",
          title: "Stok tidak cukup",
          text: `Jumlah total melebihi stok. Stok tersedia: ${stockItem.stock}`
        });
      }

      updatedNota[existingIndex].quantity = newQty;
      updatedNota[existingIndex].total = newQty * selectedItem.sell_price;
      setNotaItems(updatedNota);
    } else {
      setNotaItems([
        ...notaItems,
        {
          item_id: selectedItem.value,
          code: selectedItem.code,
          name: selectedItem.label.replace(/- Stok: \d+$/, "").replace(/\(Rp .*?\)/, ""),
          quantity: parseInt(qty),
          sell_price: selectedItem.sell_price,
          total: selectedItem.sell_price * parseInt(qty)
        }
      ]);
    }

    // **Kurangi stok di UI secara sementara**
    const updatedItems = [...items];
    updatedItems[stockItemIndex].stock -= parseInt(qty);
    setItems(updatedItems);

    setSelectedItem(null);
    setQty("");
  };



  const submitNota = async () => {
    if (notaItems.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Belum ada item di nota"
      });
    }

    try {
      const res = await axios.post(`${API_URL}/sales`, {
        items: notaItems.map(i => ({ item_id: i.item_id, quantity: i.quantity }))
      });

      const now = new Date();
      const dateWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

      const saleData = {
        id: res.data.id,
        code: res.data.code,
        date: res.data.date || dateWIB.toISOString(),
        total: res.data.total,
        items: notaItems.map(i => ({
          name: i.name,
          quantity: i.quantity,
          sell_price: i.sell_price,
          subtotal: i.total
        }))
      };

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `Nota berhasil dicatat: <b>${saleData.code}</b><br>Total: Rp ${saleData.total.toLocaleString()}`,
        timer: 3000,
        timerProgressBar: true
      });

      setNotaItems([]);
      setTotal(saleData.total);
      await fetchItems();

      setNotaDetails(saleData);
      setSelectedSale(saleData.id);

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.error || "Gagal mencatat nota"
      });
    }
  };

  const options = items
    .filter(i => i.sell_price && i.sell_price >= 0)
    .map(i => ({
      value: i.id,
      label: i.name, // label dasar tetap
      code: i.code,
      name: i.name,
      sell_price: i.sell_price,
      stock: i.stock
    }));


  const customSelectStyles = {
    container: (provided) => ({
      ...provided,
      maxWidth: 300,
      minWidth: 200
    }),
    menu: (provided) => ({
      ...provided,
      maxWidth: 300
    }),
    control: (provided) => ({
      ...provided,
      minHeight: 36
    }),
    option: (provided) => ({
      ...provided,
      fontSize: 14
    })
  };

  const CustomOption = ({ innerProps, innerRef, data, isFocused }) => {
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 12px",
          backgroundColor: isFocused ? "#EAF2F8" : "#fff", // Warna saat hover
          borderBottom: "1px solid #eee",
          fontSize: 14,
          color: data.stock === 0 ? "#E74C3C" : "#333",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: isFocused ? 15 : 14, // perbesar teks saja
            fontWeight: isFocused ? "600" : "normal",
            transition: "all 0.15s ease",
          }}
        >
          <strong>{data.code}</strong> - {data.name}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: isFocused ? 15 : 14, transition: "all 0.15s ease" }}>
            Rp {Math.round(data.sell_price).toLocaleString()}
          </span>
          <span
            style={{
              marginLeft: 42,
              fontWeight: "bold",
              color: data.stock === 0 ? "#E74C3C" : "#333",
              minWidth: 60,
              textAlign: "right",
              fontSize: isFocused ? 15 : 14,
              transition: "all 0.15s ease",
            }}
          >
            Stok: {data.stock}
          </span>
        </div>
      </div>
    );
  };

  const CustomSingleValue = ({ data, ...props }) => {
    return (
      <components.SingleValue {...props}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", marginRight: 8 }}>{data.code} - </span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.name}
          </span>
          <span style={{ marginLeft: 16 }}>Rp {Math.round(data.sell_price).toLocaleString()}</span> {/* jarak lebih jauh */}
          <span
            style={{
              marginLeft: 32, // beri jarak ekstra dari harga
              fontWeight: "bold",
              color: data.stock === 0 ? "#E74C3C" : "#333",
              minWidth: 80,
              textAlign: "right"
            }}
          >
            Stok: {data.stock}
          </span>
        </div>
      </components.SingleValue>
    );
  };


  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1F618D" }}>🛒 Penjualan</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
        <div style={{ flex: "0 0 650px" }}>
          <label>Pilih Barang</label>
          <Select
            value={selectedItem}
            onChange={setSelectedItem}
            options={options}
            placeholder="Cari barang..."
            isClearable
            styles={{
              ...customSelectStyles,
              container: (provided) => ({ ...provided, width: "100%" }),
              menu: (provided) => ({ ...provided, width: "100%" }),
            }}
            components={{ 
              Option: CustomOption,  // tetap pakai custom option di dropdown
              SingleValue: CustomSingleValue // tampilkan stok saat dipilih
            }}
            isOptionDisabled={(option) => option.stock === 0}
          />

        </div>

        <div style={{ flex: "0 0 150px" }}>
          <label>Qty</label>
          <input
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={e => setQty(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 5,
              boxSizing: "border-box",
              height: 38,
            }}
          />
        </div>

        <div style={{ flex: "0 0 auto" }}>
          <button
            onClick={addItemToNota}
            style={{
              padding: "8px 16px",
              borderRadius: 5,
              backgroundColor: "#28B463",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              minHeight: 38,
            }}
          >
            Tambah
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>📝 Nota Sementara</h4>
        {notaItems.length === 0 ? (
          <p>Belum ada item.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
              <thead>
                <tr style={{ background: "#f2f3f4" }}>
                  <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "left" }}>Nama</th>
                  <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>Jumlah</th>
                  <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>Harga</th>
                  <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {notaItems.map((i, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 6, border: "1px solid #ccc", textAlign: "left" }}>{i.name}</td>
                    <td style={{ padding: 6, border: "1px solid #ccc", textAlign: "right" }}>{i.quantity}</td>
                    <td style={{ padding: 6, border: "1px solid #ccc", textAlign: "right" }}>{i.sell_price.toLocaleString()}</td>
                    <td style={{ padding: 6, border: "1px solid #ccc", textAlign: "right" }}>{i.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={submitNota}
                style={{
                  padding: "8px 16px",
                  borderRadius: 5,
                  backgroundColor: "#3498DB",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Simpan Nota
              </button>
            </div>
          </>
        )}
      </div>

      {total && <p>💵 Total transaksi terakhir: <b>Rp {total.toLocaleString()}</b></p>}

      {notaDetails && selectedSale && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center"
          }}
          onClick={() => setSelectedSale(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 380,
              maxHeight: "80%",
              overflowY: "auto",
              fontFamily: "'Courier New', monospace"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ textAlign: "center", marginBottom: 5 }}>🧾 Nota {notaDetails.code}</h3>
            <p style={{ textAlign: "center", marginTop: 0, marginBottom: 10 }}>
              Tanggal: {formatWIBTime(notaDetails.date)}
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", border: "1px solid #ccc" }}>Nama</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", border: "1px solid #ccc" }}>Jumlah</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", border: "1px solid #ccc" }}>Harga</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", border: "1px solid #ccc" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {notaDetails.items?.map((i, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "4px 6px", border: "1px solid #ccc", textAlign: "left" }}>{i.name}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #ccc", textAlign: "right" }}>{i.quantity}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #ccc", textAlign: "right" }}>{Number(i.sell_price).toLocaleString()}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #ccc", textAlign: "right" }}>{Number(i.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ textAlign: "right", fontWeight: "bold", marginTop: 5 }}>
              Total: Rp {Number(notaDetails.total || 0).toLocaleString()}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  backgroundColor: "#28B463",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Print
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  backgroundColor: "#E74C3C",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
