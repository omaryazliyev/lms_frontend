"use client";
import React from "react";
import Link from "next/link";

export default function OnlineBanner() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      padding: "80px 80px",
      position: "relative",
      overflow: "hidden",
      textAlign: "center"
    }}>
      {/* World map dot pattern background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        opacity: 0.6
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.3 }}>
          Istalgan nuqtadan onlayn o&apos;qish imkoniyati
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 36 }}>
          Biz sizga bu imkoniyatni taqdim qilamiz
        </p>
        <Link href="/register" style={{ textDecoration: "none" }}>
          <button style={{
            background: "#fff", color: "#2563eb", border: "none",
            borderRadius: 8, padding: "14px 36px", fontSize: 15,
            fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
          }}>
            Ro&apos;yxatdan o&apos;tish
          </button>
        </Link>
      </div>
    </section>
  );
}
