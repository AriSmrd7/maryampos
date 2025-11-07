import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DataTable from "react-data-table-component";

export default function ReportOmzetPage() {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/sales")
      .then((res) => setSales(res.data || []))
      .catch((err) => console.error("Error fetching sales:", err));
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  // === Kelompokkan omzet per tanggal ===
  const grouped = sales.reduce((acc, s) => {
    const date = s.date?.split("T")[0] || s.date;
    acc[date] = (acc[date] || 0) + Number(s.total || 0);
    return acc;
  }, {});

  let rows = Object.entries(grouped)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // === Filter berdasarkan range tanggal ===
  if (fromDate || toDate) {
    rows = rows.filter((r) => {
      const d = new Date(r.date);
      return (
        (!fromDate || d >= new Date(fromDate)) &&
        (!toDate || d <= new Date(toDate))
      );
    });
  }

  const totalOmzet = rows.reduce((sum, r) => sum + r.total, 0);

  // === Hitung Omzet Hari Ini, Minggu Ini, Bulan Ini ===
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let omzetToday = 0,
    omzetWeek = 0,
    omzetMonth = 0;

  for (const s of sales) {
    const date = new Date(s.date);
    const total = Number(s.total || 0);
    if (s.date?.startsWith(todayDate)) omzetToday += total;
    if (date >= startOfWeek && date <= today) omzetWeek += total;
    if (date >= startOfMonth && date <= today) omzetMonth += total;
  }

  // === DataTable Columns ===
  const columns = [
    {
      name: "Tanggal",
      selector: (row) => row.date,
      sortable: true,
      wrap: true,
    },
    {
      name: "Total Omzet",
      selector: (row) => formatCurrency(row.total),
      sortable: true,
      right: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#F39C12",
        color: "white",
        fontWeight: "bold",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "rgba(243, 156, 18, 0.1)",
        cursor: "pointer",
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#F39C12",
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

      <h2
        style={{
          textAlign: "center",
          color: "#F39C12",
          marginBottom: 20,
        }}
      >
        📈 Laporan Omzet Harian
      </h2>

      {/* === 3 Card Omzet === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        <div
          style={{
            background: "#fff8e1",
            borderRadius: 10,
            padding: "15px 20px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ marginBottom: 5, color: "#757575" }}>Omzet Hari Ini</h4>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#F39C12" }}>
            {formatCurrency(omzetToday)}
          </div>
        </div>

        <div
          style={{
            background: "#e1f5fe",
            borderRadius: 10,
            padding: "15px 20px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ marginBottom: 5, color: "#0277bd" }}>Omzet Minggu Ini</h4>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#0288d1" }}>
            {formatCurrency(omzetWeek)}
          </div>
        </div>

        <div
          style={{
            background: "#e8f5e9",
            borderRadius: 10,
            padding: "15px 20px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ marginBottom: 5, color: "#2e7d32" }}>Omzet Bulan Ini</h4>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#43a047" }}>
            {formatCurrency(omzetMonth)}
          </div>
        </div>
      </div>

      {/* === Filter tanggal dengan styling === */}
      <div
        style={{
          textAlign: "center",
          marginTop: 30,
          marginBottom: 30,
          background: "#fff3e0",
          padding: "15px 0",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <label style={{ fontWeight: "500", color: "#333" }}>Dari: </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            marginLeft: 5,
            marginRight: 15,
          }}
        />
        <label style={{ fontWeight: "500", color: "#333" }}>Sampai: </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            marginLeft: 5,
          }}
        />
      </div>

      {/* === Chart === */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <h3
          style={{ color: "#F39C12", textAlign: "center", marginBottom: 20 }}
        >
          Grafik Omzet Harian
        </h3>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#F39C12"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === Table === */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <DataTable
          title="Daftar Omzet Harian"
          columns={columns}
          data={rows}
          customStyles={customStyles}
          pagination
          paginationPerPage={20}
          paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
          highlightOnHover
          dense
        />
      </div>

      <div
        style={{
          textAlign: "right",
          marginTop: 20,
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        Total Omzet: {formatCurrency(totalOmzet)}
      </div>
    </div>
  );
}
