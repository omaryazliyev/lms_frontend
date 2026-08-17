"use client";
import React from "react";

export default function HeroSection() {
  return (
    <section style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "160px 80px 100px", 
      background: "linear-gradient(to right bottom, #f8fafc, #fff)",
      minHeight: "100vh"
    }}>
      <div style={{ flex: 1, maxWidth: 600 }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.2, color: "#0f172a", marginBottom: 24 }}>
          <span style={{ color: "#8b5cf6" }}>Kelajak</span> <span style={{ color: "#ef4444" }}>kasblarini</span> biz bilan o’rganing!
        </h1>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
          Tekinga o&apos;qib, pul ishlashga nima deysiz? Ishonmayapsizmi? Biz buni isbotlaymiz. Hammasi o&apos;zingizga bog&apos;liq.
        </p>
        <button style={{ 
          background: "#3b82f6", color: "#fff", border: "none", borderRadius: 30, 
          padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
        }}>
          Kurslar bilan tanishish
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 600, aspectRatio: "1/1" }}>
          <img 
            src="/images/illustration.png" 
            alt="Hero Illustration" 
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e: any) => e.target.src = "https://placehold.co/600x600?text=Hero+Illustration"}
          />
        </div>
      </div>
    </section>
  );
}
