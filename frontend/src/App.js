import React from "react";
import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import PurchasePage from "./pages/PurchasePage";
import MarginPage from "./pages/MarginPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ReportPage from "./pages/ReportPage";
import ReportPurchasesPage from "./pages/report/ReportPurchasesPage";
import ReportSalesPage from "./pages/report/ReportSalesPage";
import ReportItemsPage from "./pages/report/ReportItemsPage";
import ReportOmzetPage from "./pages/report/ReportOmzetPage";
import ReportProfitPage from "./pages/report/ReportProfitPage";

export default function App() {
  const linkStyle = {
    padding: "10px 18px",
    margin: "5px",
    textDecoration: "none",
    borderRadius: 10,
    transition: "all 0.3s ease",
    fontWeight: 500,
    fontSize: 14,
    display: "inline-block",
  };

  const activeStyle = {
    backgroundColor: "#2E86C1",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.15)",
  };

  const navDefaultStyle = {
    backgroundColor: "#F2F3F4",
    color: "#2E86C1",
  };

  return (
    <Router>
      {/* Root flex container */}
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f5f6f7",
        }}
      >
        {/* ===== NAVBAR FIXED ===== */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            zIndex: 999,
            padding: "10px 0",
          }}
        >
          <div
            style={{
              width: "95%",
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Logo + teks agak ke kiri */}
            <div style={{ textAlign: "left", marginLeft: -150 }}>
              <h1
                style={{
                  margin: 0,
                  color: "#1F618D",
                  fontSize: 22,
                  fontWeight: "bolder",
                }}
              >
                🧾 Maryam Print Corner
              </h1>
              <small
                style={{
                  color: "#566573",
                  fontSize: 12,
                  marginLeft: 37,
                }}
              >
                Toko Alat Tulis & Fotokopi
              </small>
            </div>

            {/* Navbar tetap di kanan */}
            <nav
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <NavLink
                to="/purchase"
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : { ...linkStyle, ...navDefaultStyle }
                }
              >
                📦 Pembelian
              </NavLink>

              <NavLink
                to="/margin"
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : { ...linkStyle, ...navDefaultStyle }
                }
              >
                💰 Hitung Laba
              </NavLink>

              <NavLink
                to="/sales"
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : { ...linkStyle, ...navDefaultStyle }
                }
              >
                🛒 Penjualan
              </NavLink>

              <NavLink
                to="/sales-history"
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : { ...linkStyle, ...navDefaultStyle }
                }
              >
                📋 Riwayat
              </NavLink>

              <NavLink
                to="/report"
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : { ...linkStyle, ...navDefaultStyle }
                }
              >
                📊 Laporan
              </NavLink>
            </nav>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main
          style={{
            flex: 1,
            paddingTop: 90,
            width: "95%",
            maxWidth: 1600,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 25,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              minHeight: 400,
            }}
          >
            <Routes>
              <Route path="/" element={<PurchasePage />} />
              <Route path="/purchase" element={<PurchasePage />} />
              <Route path="/margin" element={<MarginPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/sales-history" element={<SalesHistoryPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/report/purchases" element={<ReportPurchasesPage />} />
              <Route path="/report/sales" element={<ReportSalesPage />} />
              <Route path="/report/items" element={<ReportItemsPage />} />
              <Route path="/report/omzet" element={<ReportOmzetPage />} />
              <Route path="/report/profit" element={<ReportProfitPage />} />
            </Routes>
          </div>
        </main>

        {/* ===== FOOTER STICKY ===== */}
        <footer
          style={{
            color: "#aaa",
            fontSize: 13,
            textAlign: "center",
            padding: "15px 0",
            marginTop: "auto",
          }}
        >
          &copy; {new Date().getFullYear()} Maryam Print Corner. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}
