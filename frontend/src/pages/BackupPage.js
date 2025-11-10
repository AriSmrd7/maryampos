import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:4000/api";

export default function BackupPage() {
  const [latestBackup, setLatestBackup] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestBackup = async () => {
    try {
      const res = await axios.get(`${API_URL}/backup/latest`);
      setLatestBackup(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/backup/create`);
      Swal.fire("Success", res.data.message, "success");
      fetchLatestBackup();
    } catch (err) {
      Swal.fire("Error", "Failed to create backup", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBackup();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#2E86C1" }}>💾 Backup Database</h2>
      <p style={{ marginBottom: 30 }}>
        This will back up <code>pos.db</code> safely to your <code>/database/backups</code> folder.
      </p>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: 20,
          borderRadius: 10,
          display: "inline-block",
          minWidth: 300,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: 10 }}>
          Latest Backup:
        </p>

        {latestBackup?.time ? (
          <p>
            📁 <b>{latestBackup.latest}</b> <br />
            🕒 {new Date(latestBackup.time).toLocaleString()}
          </p>
        ) : (
          <p>No backup found yet.</p>
        )}

        <button
          onClick={handleBackup}
          disabled={loading}
          style={{
            marginTop: 15,
            backgroundColor: "#2E86C1",
            color: "white",
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Backing up..." : "Backup Now"}
        </button>
      </div>
    </div>
  );
}
