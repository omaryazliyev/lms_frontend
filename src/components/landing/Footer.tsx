"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
      {/* CTA Section */}
      <div style={{
        textAlign: "center",
        padding: "72px 80px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16
      }}>
        {/* Logo */}
        <div style={{ fontSize: 32, fontWeight: 800, color: "#3b82f6", marginBottom: 8 }}>
          iTlive<span style={{ fontSize: 40, lineHeight: 0 }}>.</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Biz bilan muvaffaqiyatga erishing
        </h2>
        <p style={{ fontSize: 15, color: "#f97316", fontWeight: 500, margin: 0 }}>
          Eng kuchlilar biz bilan qoladi!
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#334155",
            border: "1px solid #cbd5e1", borderRadius: 8,
            padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"></polygon>
            </svg>
            Intro video
          </button>
          <Link href="#contact" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8,
              padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)"
            }}>
              Bog&apos;lanish
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid #e2e8f0",
        padding: "20px 80px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>
          &copy; 2024. Barcha huquqlar himoyalangan
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="#" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>
            Terminlar
          </Link>
          <Link href="#" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>
            Xavfsizlik
          </Link>
        </div>
      </div>
    </footer>
  );
}
