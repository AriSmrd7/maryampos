import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ReportProfitPage() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:4000/api/sales"),
      axios.get("http://localhost:4000/api/purchases"),
    ])
      .then(([sRes, pRes]) => {
        setSales(sRes.data || []);
        setPurchases(pRes.data || []);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  // === Kelompokkan data penjualan & pembelian per tanggal ===
  const groupedSales = sales.reduce((acc, s) => {
    const date = s.date?.split("T")[0] || s.date;
    acc[date] = (acc[date] || 0) + Number(s.total || 0);
    return acc;
  }, {});

  const groupedPurchases = purchases.reduce((acc, p) => {
    const date = p.date?.split("T")[0] || p.date;
    acc[date] = (acc[date] || 0) + Number(p.total_cost || 0);
    return acc;
  }, {});

  const allDates = Array.from(
    new Set([...Object.keys(groupedSales), ...Object.keys(groupedPurchases)])
  ).sort((a, b) => new Date(a) - new Date(b));

  let rows = allDates.map((date) => {
    const omzet = groupedSales[date] || 0;
    const belanja = groupedPurchases[date] || 0;
    const laba = omzet - belanja;
    return { date, omzet, belanja, laba };
  });

  // === Filter tanggal ===
  if (fromDate || toDate) {
    rows = rows.filter((r) => {
      const d = new Date(r.date);
      return (
        (!fromDate || d >= new Date(fromDate)) &&
        (!toDate || d <= new Date(toDate))
      );
    });
  }

  const totalProfit = rows.reduce((sum, r) => sum + r.laba, 0);

  // === Hitung Laba Hari Ini, Minggu Ini, Bulan Ini ===
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let labaToday = 0,
    labaWeek = 0,
    labaMonth = 0;

  for (const r of rows) {
    const d = new Date(r.date);
    const total = Number(r.laba || 0);
    if (r.date === todayDate) labaToday += total;
    if (d >= startOfWeek && d <= today) labaWeek += total;
    if (d >= startOfMonth && d <= today) labaMonth += total;
  }

  // === Kolom DataTable ===
  const columns = [
    {
      name: "Tanggal",
      selector: (row) => row.date,
      sortable: true,
      width: "150px",
    },
    {
      name: "Omzet",
      selector: (row) => formatCurrency(row.omzet),
      sortable: true,
      right: true,
    },
    {
      name: "Pembelian",
      selector: (row) => formatCurrency(row.belanja),
      sortable: true,
      right: true,
    },
    {
      name: "Laba Bersih",
      selector: (row) => formatCurrency(row.laba),
      sortable: true,
      right: true,
    },
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: "48px",
        fontSize: "15px",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#27AE60",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    cells: {
      style: {
        padding: "10px 14px",
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#27AE60",
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
          color: "#27AE60",
          marginBottom: 20,
        }}
      >
        💹 Laporan Laba Bersih
      </h2>

      {/* === Card Ringkasan === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 15,
          marginBottom: 30,
        }}
      >
        <Card color="#e8f5e9" title="Laba Hari Ini" value={formatCurrency(labaToday)} accent="#43a047" />
        <Card color="#fff3e0" title="Laba Minggu Ini" value={formatCurrency(labaWeek)} accent="#f57c00" />
        <Card color="#e1f5fe" title="Laba Bulan Ini" value={formatCurrency(labaMonth)} accent="#0288d1" />
      </div>

      {/* === Filter tanggal === */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 25,
          background: "#f1f8e9",
          padding: "10px 0",
          borderRadius: 8,
        }}
      >
        <label>Dari: </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 6,
            marginLeft: 5,
          }}
        />
        <label style={{ marginLeft: 10 }}>Sampai: </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 6,
            marginLeft: 5,
          }}
        />
      </div>

      {/* === Grafik === */}
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
          style={{ color: "#27AE60", textAlign: "center", marginBottom: 20 }}
        >
          Grafik Laba Bersih Harian
        </h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Line
              type="monotone"
              dataKey="laba"
              stroke="#27AE60"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === DataTable === */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <DataTable
          columns={columns}
          data={rows}
          customStyles={customStyles}
          pagination
          highlightOnHover
          noDataComponent="Tidak ada data"
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
        Total Laba Bersih: {formatCurrency(totalProfit)}
      </div>
    </div>
  );
}

// === Komponen Kartu Ringkasan ===
function Card({ color, title, value, accent }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 10,
        padding: "15px 20px",
        textAlign: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h4 style={{ marginBottom: 5, color: accent }}>{title}</h4>
      <div style={{ fontSize: 22, fontWeight: "bold", color: accent }}>
        {value}
      </div>
    </div>
  );
}
