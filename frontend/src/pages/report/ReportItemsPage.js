import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function ReportItemsPage() {
  const [items, setItems] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/api/items").then((res) => {
      setItems(res.data || []);
    });
  }, []);

  // === Filter Data ===
  const filteredItems = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      i.code?.toLowerCase().includes(filterText.toLowerCase())
  );

  // === Total Semua Barang (Toko) ===
  const totalStockAll = items.reduce((acc, i) => acc + (i.stock || 0), 0);
  const totalValueAll = items.reduce(
    (acc, i) => acc + (i.stock || 0) * (i.sell_price || 0),
    0
  );

  // === Kolom DataTable ===
  const columns = [
    { name: "Kode Barang", selector: (row) => row.code, sortable: true },
    { name: "Nama Barang", selector: (row) => row.name, sortable: true, grow: 2 },
    { name: "Stok", selector: (row) => row.stock, sortable: true, right: true },
    {
      name: "Harga Jual",
      selector: (row) => `Rp ${Number(row.sell_price).toLocaleString("id-ID")}`,
      sortable: true,
      right: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#16A085",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    cells: {
      style: { fontSize: "13px" },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#16A085",
          color: "#fff",
          border: "none",
          padding: "8px 14px",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ← Kembali
      </button>

      <h2 style={{ textAlign: "center", color: "#16A085" }}>📦 Daftar Stok Barang</h2>

      {/* 🔍 Filter Input with Icon */}
      <div style={{ marginBottom: 15, textAlign: "right", position: "relative", width: 250 }}>
        <FaSearch
          style={{
            position: "absolute",
            top: "50%",
            left: 10,
            transform: "translateY(-50%)",
            color: "#888",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Cari kode / nama barang..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: "8px 12px 8px 32px", // padding-left buat space icon
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#16A085")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </div>

      {/* 📊 DataTable */}
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
        highlightOnHover
        striped
        dense
      />

      {/* 📈 Total Section */}
      <div
        style={{
          marginTop: 20,
          background: "#ecf0f1",
          padding: 15,
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        <div>🏪 Total Barang di Toko: {items.length}</div>
        <div>📦 Total Stok di Toko: {totalStockAll}</div>
        <div>💰 Total Nilai Barang di Toko: Rp {totalValueAll.toLocaleString("id-ID")}</div>
      </div>
    </div>
  );
}
