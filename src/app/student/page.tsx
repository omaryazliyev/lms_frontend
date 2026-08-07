"use client";

import React from "react";
import Link from "next/link";
import ExitToAppOutlined from "@mui/icons-material/ExitToAppOutlined";

export default function StudentDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f4f7fa", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "500px" }}>
        <h1 style={{ fontSize: "24px", color: "#0f172a", marginBottom: "16px" }}>O'quvchi paneli</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Siz o'quvchi (STUDENT) sifatida muvaffaqiyatli kirdingiz. Hozircha o'quvchilar uchun maxsus dashboard ishlab chiqilmoqda.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px",
            padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            width: "100%"
          }}
        >
          <ExitToAppOutlined style={{ width: 18, height: 18 }} /> Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}
