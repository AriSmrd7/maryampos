import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaFileExcel, FaFileImport, FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API_URL = "http://localhost:4000/api";

export default function PurchasePage() {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [modalData, setModalData] = useState({
    id: "",
    name: "",
    quantity: 0,
    total_cost: 0,
    stock: 0,
    code: "",
    itemId: null,
  });
  const [manualStock, setManualStock] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_URL}/purchases`);
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    }
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
    fetchPurchases();
    fetchItems();
  }, []);

  // ==== STYLING INPUT FIELD ====
  const inputStyle = {
    padding: "6px",
    borderRadius: 4,
    border: "1px solid #ccc",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const inputWidths = {
    code: 100,
    name: 200,
    quantity: 80,
    total_cost: 120,
  };

  const handleFocusStyle = (e) => {
    e.target.style.borderColor = "#2E86C1";
    e.target.style.boxShadow = "0 0 5px rgba(46, 134, 193, 0.5)";
  };

  const handleBlurStyle = (e) => {
    e.target.style.borderColor = "#ccc";
    e.target.style.boxShadow = "none";
  };

  // ==== TAMBAH PEMBELIAN ====
  const handleAddPurchase = async () => {
    setButtonClicked(true);
    setTimeout(() => setButtonClicked(false), 200);

    if (
      !modalData.code ||
      !modalData.name ||
      !modalData.quantity ||
      !modalData.total_cost
    ) {
      alert("Lengkapi semua field!");
      return;
    }

    try {
      await axios.post(`${API_URL}/purchases`, {
        code: modalData.code,
        name: modalData.name,
        quantity: modalData.quantity,
        total_cost: modalData.total_cost,
      });

      const existingItem = items.find((i) => i.code === modalData.code);
      if (existingItem) {
        await axios.put(`${API_URL}/items/${existingItem.id}/stock`, {
          stock: existingItem.stock + modalData.quantity,
        });
      }

      fetchPurchases();
      fetchItems();

      setModalData({
        id: "",
        name: "",
        quantity: 0,
        total_cost: 0,
        stock: 0,
        code: "",
        itemId: null,
      });

      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan pembelian");
    }
  };

  // ==== UPDATE PEMBELIAN ====
  const openUpdateModal = (purchase) => {
    const item = items.find((i) => i.code === purchase.code);
    setModalData({
      id: purchase.id,
      name: purchase.name,
      quantity: purchase.quantity,
      total_cost: purchase.total_cost,
      stock: item?.stock || 0,
      code: purchase.code,
      itemId: item?.id || null,
    });
    setManualStock(false);
    setSelectedPurchase(purchase.id);
  };

  // ==== HAPUS PEMBELIAN ====
  const handleDeletePurchase = async (id, code) => {
    const confirm = await Swal.fire({
      title: "Hapus Pembelian?",
      text: `Yakin ingin menghapus data dengan kode "${code}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E74C3C",
      cancelButtonColor: "#7F8C8D",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/purchases/${id}`);
      await fetchPurchases(); // Refresh list
      Swal.fire({
        icon: "success",
        title: "Dihapus!",
        text: "Data pembelian berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus data pembelian", "error");
    }
  };

  const handleSaveUpdate = async () => {
    try {
      if (!modalData.quantity || !modalData.total_cost || !modalData.name) {
        alert("Lengkapi semua field!");
        return;
      }

      await axios.put(`${API_URL}/purchases/${modalData.id}`, {
        name: modalData.name,
        total_cost: parseFloat(modalData.total_cost),
        quantity: parseInt(modalData.quantity),
      });

      if (manualStock && modalData.itemId !== null) {
        await axios.put(`${API_URL}/items/${modalData.itemId}/stock`, {
          stock: parseInt(modalData.stock),
        });
      }

      setSelectedPurchase(null);
      fetchPurchases();
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan update");
    }
  };

  // ==== FILTER DATA ====
  const filteredPurchases = purchases.filter(
    (p) =>
      p.code.toLowerCase().includes(filterText.toLowerCase()) ||
      p.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // ==== COLUMNS DATATABLE ====
  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "60px",
      center: true,
    },
    {
      name: "Kode",
      selector: (row) => row.code,
      sortable: true,
      width: "100px",
      center: true,
    },
    { name: "Nama Barang", selector: (row) => row.name, sortable: true },
    {
      name: "Jumlah Isi",
      selector: (row) => row.quantity,
      sortable: true,
      width: "180px",
      center: true,
    },
    {
      name: "Harga Beli Satuan",
      selector: (row) =>
        Math.round(row.total_cost / row.quantity).toLocaleString(),
      sortable: true,
      right: true,
    },
    {
      name: "Harga Total Beli",
      selector: (row) => Math.round(Number(row.total_cost)).toLocaleString(),
      sortable: true,
      right: true,
    },
    {
      name: "Stok Saat Ini",
      selector: (row) => {
        const item = items.find((i) => i.code === row.code);
        return item?.stock || 0;
      },
      sortable: true,
      width: "160px",
      center: true,
      cell: (row) => {
        const item = items.find((i) => i.code === row.code);
        const stock = item?.stock ?? 0;

        // Warna berdasarkan level stok
        let bgColor = "#28B463"; // hijau
        if (stock < 10) bgColor = "#E74C3C"; // merah
        else if (stock < 50) bgColor = "#558d68ff"; // kuning

        return (
          <div
            style={{
              display: "inline-block",
              minWidth: 40,
              padding: "4px 10px",
              borderRadius: 7,
              backgroundColor: bgColor,
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.85rem",
              textAlign: "center",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";
            }}
          >
            {stock.toLocaleString()}
          </div>
        );
      },
    },

    {
      name: "Aksi",
      cell: (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => openUpdateModal(row)}
            style={{
              padding: "4px 8px",
              backgroundColor: "#ffa20dff",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              minWidth: 60,
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: "bolder",
            }}
          >
            UPDATE
          </button>

          <button
            onClick={() => handleDeletePurchase(row.id, row.code)}
            style={{
              padding: "4px 8px",
              backgroundColor: "#E74C3C",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              minWidth: 60,
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: "bolder",
            }}
          >
            DELETE
          </button>
        </div>
      ),
      width: "240px",
      center: true,
    },
  ];

  const customStyles = {
    table: { style: { fontSize: "0.8rem", borderCollapse: "collapse" } },
    headCells: {
      style: {
        borderBottom: "2px solid #2E86C1",
        padding: "4px 6px",
        fontSize: "1rem",
        fontWeight: "bold",
        backgroundColor: "#2E86C1",
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
        backgroundColor: "rgba(46, 134, 193, 0.1)",
        outline: "none",
      },
    },
  };

  // === FUNGSI EXPORT ===
  // === FUNGSI EXPORT ===
  const handleExportExcel = () => {
    if (!filteredPurchases || filteredPurchases.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Tidak ada data untuk diekspor!",
        confirmButtonColor: "#2E86C1",
      });
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredPurchases);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pembelian");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `pembelian_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);

      // ✅ Notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil Diekspor!",
        text: `File "${fileName}" berhasil disimpan.`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengekspor",
        text: "Terjadi kesalahan saat membuat file Excel.",
        confirmButtonColor: "#E74C3C",
      });
    }
  };

  // === FUNGSI IMPORT ===
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length || !jsonData[0].code) {
        Swal.fire(
          "Format salah",
          "File Excel tidak memiliki kolom 'code'",
          "error"
        );
        return;
      }

      try {
        // Ambil data pembelian dari database
        const res = await axios.get(`${API_URL}/purchases`);
        const existing = res.data;

        // Gabungkan data import dengan yang sudah ada
        const merged = [...existing];
        jsonData.forEach((item) => {
          const found = merged.find((p) => p.code === item.code);
          if (found) {
            found.quantity += Number(item.quantity || 0);
            found.total_cost += Number(item.total_cost || 0);
          } else {
            merged.push(item);
          }
        });

        // Simpan kembali ke database (opsional)
        await Promise.all(
          jsonData.map(async (item) => {
            const exist = existing.find((p) => p.code === item.code);
            if (exist) {
              await axios.put(`${API_URL}/purchases/${exist.id}`, {
                ...exist,
                quantity: exist.quantity + Number(item.quantity || 0),
                total_cost: exist.total_cost + Number(item.total_cost || 0),
              });
            } else {
              await axios.post(`${API_URL}/purchases`, item);
            }
          })
        );

        // Update state pembelian di frontend
        setPurchases(merged);

        Swal.fire("Sukses!", "Data berhasil diimpor & digabungkan", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal mengimpor data", "error");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2E86C1", marginBottom: 15 }}>
        📦 Pembelian Barang
      </h2>

      {/* ==== FORM TAMBAH ==== */}
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
          Form Pembelian
        </legend>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {/* === Input Kode === */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Kode</label>
            <input
              type="text"
              value={modalData.code}
              onChange={(e) =>
                setModalData({ ...modalData, code: e.target.value })
              }
              style={{ ...inputStyle, width: inputWidths.code }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />
          </div>

          {/* === Input Nama === */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Nama Barang</label>
            <input
              type="text"
              value={modalData.name}
              onChange={(e) =>
                setModalData({ ...modalData, name: e.target.value })
              }
              style={{ ...inputStyle, width: inputWidths.name }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />
          </div>

          {/* === Input Jumlah === */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Jumlah Isi</label>
            <input
              type="number"
              value={modalData.quantity}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  quantity: parseInt(e.target.value),
                })
              }
              style={{ ...inputStyle, width: inputWidths.quantity }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />
          </div>

          {/* === Input Harga === */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Harga Total</label>
            <input
              type="number"
              value={modalData.total_cost}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  total_cost: parseFloat(e.target.value),
                })
              }
              style={{ ...inputStyle, width: inputWidths.total_cost }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />
          </div>

          {/* === Tombol Tambah === */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleAddPurchase}
              style={{
                padding: "6px 12px",
                backgroundColor: "#28B463",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                transform: buttonClicked ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
            >
              Tambah
            </button>
          </div>
        </div>
      </fieldset>

      {/* === Tombol Export & Import (kanan atas tabel) === */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
          marginBottom: 5,
          marginTop: 30,
        }}
      >
        {/* Tombol Export */}
        <button
          onClick={handleExportExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            backgroundColor: "#2ECC71", // hijau lembut
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#27AE60")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#2ECC71")
          }
        >
          <FaFileExcel size={18} />
          Export Excel
        </button>

        {/* Tombol Import */}
        <label
          htmlFor="importExcel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            backgroundColor: "#3498DB", // biru lembut
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#2980B9")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#3498DB")
          }
        >
          <FaFileImport size={18} />
          Import Excel
        </label>

        <input
          id="importExcel"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportExcel}
          style={{ display: "none" }}
        />
      </div>

      {/* ==== TABLE SECTION TANPA FIELDSET ==== */}
      <h3
        style={{
          color: "#303030",
          fontWeight: "bold",
          marginBottom: 10,
          fontSize: "1rem",
        }}
      >
        📋 Daftar Pembelian
      </h3>

      {/* === Filter === */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginBottom: 10,
        }}
      >
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
            fontSize: "1rem",
            width: "250px",
            borderRadius: 4,
            border: "1px solid #ccc",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2ECC71")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </div>

      {/* === Notifikasi === */}
      {showMessage && (
        <div
          style={{
            marginBottom: 10,
            padding: "6px 12px",
            backgroundColor: "#D5F5E3",
            color: "#145A32",
            borderRadius: 5,
            fontWeight: "bold",
            transition: "opacity 0.3s",
          }}
        >
          ✅ Baru saja menambah data
        </div>
      )}

      {/* === Tabel === */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
        highlightOnHover
        responsive
        customStyles={customStyles}
        noDataComponent="Belum ada data pembelian"
      />

      {/* ==== MODAL UPDATE ==== */}
      {selectedPurchase && (
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
          }}
          onClick={() => setSelectedPurchase(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: "center" }}>Update Pembelian</h3>

            <label>Nama Barang</label>
            <input
              type="text"
              value={modalData.name}
              onChange={(e) =>
                setModalData({ ...modalData, name: e.target.value })
              }
              style={{ ...inputStyle, width: "100%" }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />

            <label>Jumlah Isi</label>
            <input
              type="number"
              value={modalData.quantity}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  quantity: parseInt(e.target.value),
                })
              }
              style={{ ...inputStyle, width: "100%" }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />

            <label>Harga Total (Rp)</label>
            <input
              type="number"
              value={modalData.total_cost}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  total_cost: parseFloat(e.target.value),
                })
              }
              style={{ ...inputStyle, width: "100%" }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />

            <label>
              <input
                type="checkbox"
                checked={manualStock}
                onChange={(e) => setManualStock(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Ubah stok manual
            </label>

            <input
              type="number"
              value={modalData.stock}
              onChange={(e) =>
                setModalData({ ...modalData, stock: parseInt(e.target.value) })
              }
              disabled={!manualStock}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 10,
                backgroundColor: manualStock ? "#fff" : "#eee",
              }}
              onFocus={handleFocusStyle}
              onBlur={handleBlurStyle}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <button
                onClick={handleSaveUpdate}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#28B463",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                Simpan
              </button>
              <button
                onClick={() => setSelectedPurchase(null)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#E74C3C",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
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
