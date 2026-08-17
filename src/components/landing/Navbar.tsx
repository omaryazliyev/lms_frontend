"use client";
import React, { useState } from "react";
import Link from "next/link";
import { KeyboardArrowDownOutlined, DarkModeOutlined } from "@mui/icons-material";

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 80px",
      background: "transparent",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <h1 style={{ margin: 0, color: "#3b82f6", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center" }}>
          iTlive<span style={{ fontSize: 40, lineHeight: 0, marginLeft: 2 }}>.</span>
        </h1>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#0f172a", fontWeight: 600, fontSize: 15, borderBottom: "2px solid #3b82f6", paddingBottom: 4 }}>Asosiy</Link>
        
        <div style={{ position: "relative" }} onMouseEnter={() => setCoursesOpen(true)} onMouseLeave={() => setCoursesOpen(false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#475569", fontWeight: 500, fontSize: 15, cursor: "pointer", paddingBottom: 4 }}>
            Kurslar <KeyboardArrowDownOutlined style={{ width: 18, height: 18 }} />
          </div>
          {coursesOpen && (
            <div style={{
              position: "absolute", top: "100%", left: 0, background: "#fff", borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "12px 0", minWidth: 160, display: "flex", flexDirection: "column"
            }}>
              {["UI/UX Dizayn", "Frontend", "Backend", "Python"].map(c => (
                <Link key={c} href="#" style={{ textDecoration: "none", color: "#334155", padding: "10px 20px", fontSize: 14, fontWeight: 500, display: "block" }}>
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="#about" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>Biz haqimizda</Link>
        <Link href="#contact" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>Bog&apos;lanish</Link>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Language Selector */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155" }} onClick={() => setLangOpen(!langOpen)}>
          O&apos;z <KeyboardArrowDownOutlined style={{ width: 16, height: 16 }} />
          {langOpen && (
            <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", width: "100%" }}>
              <div style={{ padding: "8px 12px", fontSize: 14 }}>O&apos;z</div>
              <div style={{ padding: "8px 12px", fontSize: 14 }}>Ru</div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button style={{ border: "none", background: "#f1f5f9", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155" }}>
          <DarkModeOutlined style={{ width: 18, height: 18 }} />
        </button>

        {/* Login Button */}
        <Link href="/login" style={{ textDecoration: "none" }}>
          <button style={{
            background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Kirish / Ro&apos;yxatdan o&apos;tish
          </button>
        </Link>
      </div>
    </nav>
  );
}
