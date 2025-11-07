import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";

export default function ReportPurchasesPage() {
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/purchases");
      setData(res.data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);

  // Filter data by date and search text
  const filtered = data.filter((d) => {
    const date = new Date(d.date);
    const matchesDate =
      (!fromDate || date >= new Date(fromDate)) &&
      (!toDate || date <= new Date(toDate));

    const matchesText =
      d.code.toLowerCase().includes(filterText.toLowerCase()) ||
      d.name.toLowerCase().includes(filterText.toLowerCase());

    return matchesDate && matchesText;
  });

  const totalCost = filtered.reduce((sum, d) => sum + Number(d.total_cost || 0), 0);

  const columns = [
    { name: "Kode", selector: (row) => row.code, sortable: true, wrap: true },
    { name: "Nama Barang", selector: (row) => row.name, sortable: true, wrap: true },
    { name: "Qty", selector: (row) => row.quantity, sortable: true, right: true },
    {
      name: "Total Cost",
      selector: (row) => formatCurrency(row.total_cost),
      sortable: true,
      right: true,
    },
    { name: "Tanggal", selector: (row) => row.date, sortable: true, wrap: true },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#8E44AD",
        color: "white",
        fontWeight: "bold",
        fontSize: "0.95rem",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "rgba(142, 68, 173,0.1)",
        cursor: "pointer",
      },
      style: {
        fontSize: "0.9rem",
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#8E44AD",
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

      <h2 style={{ textAlign: "center", color: "#8E44AD", marginBottom: 20 }}>
        Detail Pembelian
      </h2>

      {/* ==== FILTER DATE & SEARCH ==== */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        {/* Date From */}
        <div>
          <label>Dari:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              marginLeft: 5,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3498DB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
          />
        </div>

        {/* Date To */}
        <div>
          <label>Sampai:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              marginLeft: 5,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3498DB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
          />
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginLeft: "auto", minWidth: 250 }}>
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
            placeholder="Cari kode atau nama barang..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              padding: "6px 8px 6px 32px",
              width: "85%",
              borderRadius: 4,
              border: "1px solid #ccc",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3498DB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
          />
        </div>
      </div>

      {/* ==== DATATABLE ==== */}
      <DataTable
        columns={columns}
        data={filtered}
        customStyles={customStyles}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}        
        highlightOnHover
        dense
        responsive
      />

      {/* Total Pembelian */}
      <div
        style={{
          textAlign: "right",
          marginTop: 20,
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        Total Pembelian: {formatCurrency(totalCost)}
      </div>
    </div>
  );
}
