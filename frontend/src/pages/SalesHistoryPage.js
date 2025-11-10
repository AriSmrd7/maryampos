import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";

const API_URL = "http://localhost:4000/api";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [notaDetails, setNotaDetails] = useState({});
  const [filterText, setFilterText] = useState("");

  // Helper untuk format tanggal + jam WIB tanpa detik
  const formatWIB = (dateStr) => {
    if (!dateStr) return "";
    const d =
      dateStr.length === 10
        ? new Date(`${dateStr}T00:00:00+07:00`)
        : new Date(dateStr);
    return d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      // second: "2-digit",  <-- hapus detik
    }) + " WIB";
  };



  // Fetch semua sales
  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_URL}/sales`);
      const salesRounded = res.data.map((s) => ({
        ...s,
        total: Math.round(s.total),
      }));
      setSales(salesRounded);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Fetch detail nota
  const fetchNotaDetail = async (saleId) => {
    try {
      const res = await axios.get(`${API_URL}/sales/${saleId}`);
      const itemsWithRounded =
        res.data.items?.map((i) => ({
          ...i,
          sell_price: Math.round(i.sell_price),
          subtotal: Math.round(i.subtotal),
        })) || [];

      setNotaDetails({
        ...res.data,
        total: Math.round(res.data.total),
        items: itemsWithRounded,
      });
      setSelectedSale(saleId);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail nota");
    }
  };

  // Kolom DataTable
  const columns = [
    { name: "Nota", selector: (row) => row.code, sortable: true },
    {
      name: "Tanggal",
      selector: (row) => formatWIB(row.date),
      sortable: true,
    },
    { name: "Total Item", selector: (row) => row.total_items, sortable: true, center: true },
    {
      name: "Total Harga (Rp)",
      selector: (row) => row.total.toLocaleString(),
      sortable: true,
      right: true,
    },
    {
      name: "Aksi",
      cell: (row) => (
        <button
          onClick={() => fetchNotaDetail(row.id)}
          style={{
            padding: "2px 6px",
            fontSize: "0.75rem",
            backgroundColor: "#3498DB",
            color: "#fff",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          Detail
        </button>
      ),
      center: true,
    },
  ];

  const filteredSales = sales.filter(
    (s) => s.code && s.code.toLowerCase().includes(filterText.toLowerCase())
  );

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
        borderRight: "1px solid #ccc",
      },
    },
    cells: {
      style: {
        padding: "4px 6px",
        borderRight: "1px solid #ccc",
      },
    },
    rows: {
      style: { minHeight: "28px", borderBottom: "1px solid #ccc" },
      highlightOnHoverStyle: {
        backgroundColor: "rgba(31, 97, 141, 0.1)",
        outline: "none",
      },
    },
  };

  return (
    <div style={{ padding: 10, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1F618D", marginBottom: 6, fontSize: "1rem" }}>📋 Riwayat Penjualan</h2>
      <p style={{ marginBottom: 8, fontSize: "0.8rem" }}>
        💰 Total Omset: Rp{" "}
        {Math.round(sales.reduce((sum, s) => sum + (s.total || 0), 0)).toLocaleString()}
      </p>

      <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
        <FaSearch
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Cari Nota..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: "4px 6px 4px 28px", // tambahkan padding-left agar tidak tertutup icon
            width: "200px",
            maxWidth: "100%",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: 3,
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredSales}
        pagination
        paginationPerPage={50}
        paginationRowsPerPageOptions={[25, 50, 100, 200]}
        highlightOnHover
        responsive
        customStyles={customStyles}
        noDataComponent="Belum ada data pembelian"
      />

      {/* Modal Detail Nota */}
      {notaDetails && selectedSale && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            zIndex: 999,
          }}
          onClick={() => setSelectedSale(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 10,
              borderRadius: 6,
              width: 360,
              maxHeight: "85%",
              overflowY: "auto",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.8rem",
              boxShadow: "0 1px 8px rgba(0,0,0,0.2)",
              border: "1px solid #ccc",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: "center", marginBottom: 2, fontSize: "0.9rem" }}>
              🧾 Nota {notaDetails.code}
            </h3>
            <p style={{ textAlign: "center", marginTop: 0, marginBottom: 10 }}>
              Tanggal: {formatWIB(notaDetails.date)}
            </p>
            <hr style={{ marginBottom: 4, borderColor: "#ccc" }} />

            {/* Items */}
            <div>
              {notaDetails.items.map((i, idx) => (
                <div key={idx} style={{ marginBottom: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{i.name}</span>
                    <span>
                      {i.quantity} x {i.sell_price.toLocaleString()}
                    </span>
                    <span>Rp {i.subtotal.toLocaleString()}</span>
                  </div>
                  <hr style={{ border: "0.5px solid #ccc", margin: "2px 0" }} />
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "0.85rem",
                marginBottom: 6,
              }}
            >
              <span>Total</span>
              <span>Rp {notaDetails.total.toLocaleString()}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: "3px 8px",
                  borderRadius: 3,
                  backgroundColor: "#28B463",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
              >
                Print
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 3,
                  backgroundColor: "#E74C3C",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
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
