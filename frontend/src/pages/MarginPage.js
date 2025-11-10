import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";

const API_URL = "http://localhost:4000/api";

export default function MarginPage() {
  const [previewSellPrice, setPreviewSellPrice] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [margin, setMargin] = useState("");
  const [newSellPrice, setNewSellPrice] = useState(null);
  const [filterText, setFilterText] = useState("");

  const fetchItems = async () => {
    const res = await axios.get(`${API_URL}/items`);
    setItems(res.data);
  };

  
  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!selectedItem || !margin) {
      setPreviewSellPrice(null);
      return;
    }

    const item = items.find(i => i.code === selectedItem.value);
    if (item && item.buy_price) {
      const newPrice = item.buy_price * (1 + parseFloat(margin || 0) / 100);
      setPreviewSellPrice(newPrice);
    } else {
      setPreviewSellPrice(null);
    }
  }, [selectedItem, margin, items]);

  // Inside your component, add helper functions
  const handleFocusStyle = (e) => {
    e.target.style.borderColor = "#2E86C1";
    e.target.style.boxShadow = "0 0 5px rgba(46, 134, 193, 0.4)";
  };

  const handleBlurStyle = (e) => {
    e.target.style.borderColor = "#ccc";
    e.target.style.boxShadow = "none";
  };

  const handleHoverStyle = (e) => {
    e.target.style.borderColor = "#2E86C1";
  };

  const handleUnhoverStyle = (e) => {
    e.target.style.borderColor = "#ccc";
  };

  const handleUpdateMargin = async () => {
    if (!selectedItem || !margin) return alert("Pilih barang dan isi margin!");

    const res = await axios.post(`${API_URL}/items/margin`, {
      code: selectedItem.value,
      margin: parseFloat(margin),
    });
    setNewSellPrice(res.data.sell_price);
    fetchItems();
    setSelectedItem(null);
    setMargin("");
  };

  const itemsWithMargin = items.filter(i => i.sell_price && i.sell_price > 0);

  const filteredItems = itemsWithMargin.filter(
    i =>
      i.code.toLowerCase().includes(filterText.toLowerCase()) ||
      i.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const selectOptions = items
    .filter(i => !i.sell_price || i.sell_price <= 0 || !i.margin || i.margin <= 0)
    .map(i => ({
      value: i.code,
      label: `${i.name} — Stok: ${i.stock} — Harga Beli: Rp ${i.buy_price?.toLocaleString() ?? 0}`
    }));

  const columns = [
    { name: "Kode", selector: row => row.code, sortable: true, width: "180px", center: true },
    { name: "Nama Barang", selector: row => row.name, sortable: true },
    { 
      name: "Harga Beli Satuan (Rp)", 
      selector: row => Math.round(row.buy_price ?? 0).toLocaleString(), 
      sortable: true, 
      right: true, 
      width: "320px"
    },
    { 
      name: "Margin (%)", 
      selector: row => Math.round(row.margin ?? 0).toLocaleString(), 
      sortable: true, 
      right: true,
      width: "200px"
    },
    { 
      name: "Harga Jual Satuan (Rp)", 
      selector: row => row.sell_price ?? 0,
      sortable: true,
      right: true,
      width: "320px",
      cell: row => (
        <div style={{
          fontWeight: "bold",
          fontSize: "1rem",
          color: "#196F3D",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          padding: "2px 6px",
          borderRadius: 4,
          textAlign: "right"
        }}>
          Rp {Math.round(row.sell_price).toLocaleString()}
        </div>
      )
    },
    { 
      name: "Stok (pcs)", 
      selector: row => row.stock, 
      sortable: true, 
      center: true,
      width: "180px"
    },
  ];

  const customStyles = {
    table: { style: { fontSize: "0.8rem", borderCollapse: "collapse" } },
    headCells: {
      style: {
        borderBottom: "2px solid #1F618D",
        padding: "4px 6px",
        fontSize: "1rem",
        fontWeight: "bold",
        backgroundColor: "#1F618D",
        color: "#fff",
        textAlign: "center",
        borderRight: "1px solid #ccc"
      }
    },
    cells: { 
      style: { 
        padding: "4px 6px",
        borderRight: "1px solid #ccc"
      } 
    },
    rows: {
      style: { minHeight: "28px", borderBottom: "1px solid #ccc" },
      highlightOnHoverStyle: { backgroundColor: 'rgba(31, 97, 141, 0.1)', outline: 'none' }
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1F618D", marginBottom: 20 }}>💰 Hitung Laba / Margin</h2>

    {/* === FIELDSET: Pencarian Barang & Margin === */}
    <fieldset
      style={{
        border: "2px solid #c7c7c7ff",
        borderRadius: 8,
        padding: "15px 20px",
        marginBottom: 25,
        backgroundColor: "#F8F9F9",
      }}
    >
      <legend
        style={{
          padding: "0 10px",
          color: "#2E86C1",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        Hitung Margin
      </legend>

      {/* === Dropdown + Input + Tombol === */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Dropdown cari barang */}
        <div style={{ flex: 1, minWidth: "100%" }}>
          <Select
            value={selectedItem}
            onChange={setSelectedItem}
            options={selectOptions}
            placeholder="Cari dan pilih barang..."
            isClearable
            styles={{
              container: (provided) => ({
                ...provided,
                width: "100%",
              }),
              menu: (provided) => ({
                ...provided,
                width: "100%",
              }),
            }}
          />
        </div>

        {/* Input margin */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4, fontWeight: "bold", color: "#34495E" }}>
            Margin (%)
          </label>
            <input
              placeholder="Masukkan margin"
              type="number"
              value={margin}
              onChange={(e) => {
                const val = e.target.value;
                setMargin(val);
                if (selectedItem) {
                  const item = items.find(i => i.code === selectedItem.value);
                  if (item && item.buy_price) {
                    const newPrice = item.buy_price * (1 + parseFloat(val || 0) / 100);
                    setPreviewSellPrice(newPrice);
                  } else {
                    setPreviewSellPrice(null);
                  }
                }
              }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
              onMouseOver={handleHoverStyle}
              onMouseOut={handleUnhoverStyle}
              style={{
                width: 140,
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
                transition: "all 0.2s ease",
              }}
            />
          {previewSellPrice && (
            <small style={{ color: "#27AE60", fontWeight: "bold", marginTop: 4 }}>
              → Perkiraan Harga Jual: Rp {Math.round(previewSellPrice).toLocaleString()}
            </small>
          )}
        </div>

        {/* Tombol Hitung */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <button
            onClick={handleUpdateMargin}
            style={{
              padding: "8px 16px",
              borderRadius: 5,
              border: "none",
              backgroundColor: "#28B463",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#239B56")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#28B463")}
          >
            Hitung
          </button>
        </div>
      </div>
    </fieldset>



      {newSellPrice && (
        <p style={{ marginBottom: 20, fontSize: 16 }}>
          💵 Harga jual baru: <b>Rp {Math.round(newSellPrice).toLocaleString()}</b>
        </p>
      )}

      <hr style={{ margin: "30px 0", borderColor: "#eee" }} />

      {/* Filter DataTable */}
      <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
        <FaSearch 
          style={{ 
            position: "absolute", 
            top: "50%", 
            left: 10, 
            transform: "translateY(-50%)", 
            color: "#888" 
          }} 
        />
        <input
          type="text"
          placeholder="Cari kode atau nama barang..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: "6px 8px 6px 32px", // padding left cukup untuk icon
            fontSize: "1rem",
            width: "250px",
            maxWidth: "100%",
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
        highlightOnHover
        responsive
        customStyles={customStyles}
        noDataComponent="Belum ada data pembelian"
      />
    </div>
  );
}
