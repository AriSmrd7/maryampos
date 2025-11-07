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

export default function ReportSalesPage() {
  const [sales, setSales] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/sales")
      .then((res) => setSales(res.data || []))
      .catch((err) => console.error("Error fetching sales:", err));
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  // Filter sales by date
  const filtered = sales.filter((s) => {
    if (!from && !to) return true;
    const d = new Date(s.date);
    return (!from || d >= new Date(from)) && (!to || d <= new Date(to));
  });

  // Hitung total penjualan
  const totalSales = filtered.reduce((sum, s) => sum + Number(s.total || 0), 0);

  // Group sales per date untuk chart: jumlah nota per tanggal
  const groupedNotes = filtered.reduce((acc, s) => {
    const date = s.date?.split("T")[0] || s.date;
    acc[date] = (acc[date] || 0) + 1; // total nota
    return acc;
  }, {});

  const chartData = Object.entries(groupedNotes)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // DataTable columns
  const columns = [
    { name: "Kode Transaksi", selector: (row) => row.code, sortable: true, wrap: true },
    { name: "Barang", selector: (row) => row.name, sortable: true, wrap: true },
    { name: "Qty", selector: (row) => row.quantity, sortable: true, right: true },
    { name: "Total", selector: (row) => formatCurrency(row.total), sortable: true, right: true },
    { name: "Tanggal", selector: (row) => row.date, sortable: true, wrap: true },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#3498DB",
        color: "white",
        fontWeight: "bold",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        cursor: "pointer",
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#3498DB",
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

      <h2 style={{ textAlign: "center", color: "#3498DB" }}>Detail Penjualan</h2>

      {/* Filter tanggal */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          margin: "20px 0",
        }}
      >
        <div>
          <label>Dari:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginLeft: 5 }}
          />
        </div>
        <div>
          <label>Sampai:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginLeft: 5 }}
          />
        </div>
      </div>

      {/* Chart Nota per Tanggal */}
      <div
        style={{
          width: "100%",
          height: 300,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: 30,
        }}
      >
        <h3 style={{ textAlign: "center", color: "#3498DB", marginBottom: 20 }}>
          Jumlah Nota per Tanggal
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v) => `${v} nota`} />
            <Line type="monotone" dataKey="total" stroke="#3498DB" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table DataTable */}
      <DataTable
        title={`Daftar Penjualan (${filtered.length} transaksi)`}
        columns={columns}
        data={filtered}
        customStyles={customStyles}
        pagination
        highlightOnHover
        dense
      />

      <div style={{ textAlign: "right", fontWeight: "bold", marginTop: 10, fontSize: "1.1rem" }}>
        Total Penjualan: {formatCurrency(totalSales)}
      </div>
    </div>
  );
}
