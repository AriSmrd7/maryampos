import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⬅️ Tambahkan ini

export default function ReportPage() {
  const [report, setReport] = useState({
    totalPurchases: 0,
    totalStock: 0,
    totalSales: 0,
    omzet: 0,
    profit: 0,
  });

  const navigate = useNavigate(); // ⬅️ Gunakan navigate untuk pindah halaman

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [purchasesRes, itemsRes, salesRes] = await Promise.all([
        axios.get("http://localhost:4000/api/purchases"),
        axios.get("http://localhost:4000/api/items"),
        axios.get("http://localhost:4000/api/sales"),
      ]);

      const purchases = purchasesRes.data || [];
      const items = itemsRes.data || [];
      const sales = salesRes.data || [];

      const totalPurchases = purchases.reduce(
        (sum, p) => sum + Number(p.total_cost || 0),
        0
      );

      const totalStock = items.length;

      const totalSales = sales.reduce(
        (sum, s) => sum + Number(s.total || 0),
        0
      );

      const omzet = totalSales;
      const profit = omzet - totalPurchases;

      setReport({ totalPurchases, totalStock, totalSales, omzet, profit });
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  const Card = ({ title, value, icon, bg, path }) => (
    <div
      style={{
        flex: "1 1 220px",
        margin: 15,
        background: bg,
        borderRadius: 18,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        padding: "25px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        color: "#fff",
        transition: "transform 0.2s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
      }}
      onClick={() => navigate(`/report/${path}`)} // ⬅️ Navigasi ke halaman report detail
    >
      <div style={{ fontSize: 44, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>{title}</h3>
      <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{value}</p>
      <small
        style={{
          marginTop: 18,
          fontSize: 13,
          opacity: 0.8,
          fontStyle: "italic",
        }}
      >
        Klik untuk lihat detail →
      </small>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2
        style={{
          textAlign: "center",
          color: "#1F618D",
          marginBottom: 40,
          fontSize: 30,
        }}
      >
        📊 Laporan Keuangan & Stok
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Card
          title="Total Pembelian"
          value={formatCurrency(report.totalPurchases)}
          icon="🧾"
          bg="#8E44AD"
          path="purchases"
        />
        <Card
          title="Jumlah Jenis Barang"
          value={`${report.totalStock} jenis`}
          icon="📦"
          bg="#16A085"
          path="items"
        />
        <Card
          title="Total Penjualan"
          value={formatCurrency(report.totalSales)}
          icon="🛒"
          bg="#3498DB"
          path="sales"
        />
        <Card
          title="Omzet"
          value={formatCurrency(report.omzet)}
          icon="💰"
          bg="#F39C12"
          path="omzet"
        />
        <Card
          title="Laba Bersih"
          value={formatCurrency(report.profit)}
          icon="📈"
          bg="#27AE60"
          path="profit"
        />
      </div>
    </div>
  );
}
