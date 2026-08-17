"use client";
import React from "react";
import Link from "next/link";

export default function JoinSection() {
  return (
    <section style={{ padding: "80px 80px", background: "#fff" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
          Bizga qo&apos;shiling
        </h2>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, maxWidth: 600 }}>
          Bizning saytimizga nafaqat o&apos;rganuvchi balki yetarlicha tajribangiz bo&apos;lsa mentor sifatida ham qo&apos;shilishingiz mumkin
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 40 }}>
        {/* Student Card */}
        <div style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "#fff"
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>O&apos;quvchimisiz?</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Agarda o&apos;quvchi bo&apos;lsangiz bizning xalqaro darajadagi tajribali mentorlarimizga shogird bo&apos;ling
          </p>
          <div>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#3b82f6", color: "#fff", border: "none",
                borderRadius: 8, padding: "12px 28px", fontSize: 14,
                fontWeight: 600, cursor: "pointer"
              }}>
                Boshlash
              </button>
            </Link>
          </div>
        </div>

        {/* Mentor Card */}
        <div style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "#fff"
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Mentormisiz?</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Bizning mualliflar jamoamizga qo&apos;shilib, o&apos;z tajribangizni boshqalar bilan oson va qulay platforma orqali ulashing
          </p>
          <div>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#3b82f6", color: "#fff", border: "none",
                borderRadius: 8, padding: "12px 28px", fontSize: 14,
                fontWeight: 600, cursor: "pointer"
              }}>
                Qo&apos;shilish
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
