"use client";
import React from "react";

interface CourseCardProps {
  bannerImg: string;
  bannerBg: string;
  badgeText: string;
  badgeColor: string;
  mentorName: string;
  mentorImg: string;
  title: string;
  description: string;
  rating: number;
  price: string;
}

export default function CourseCard({
  bannerImg,
  bannerBg,
  badgeText,
  badgeColor,
  mentorName,
  title,
  description,
  rating,
  price
}: CourseCardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
      }}
    >
      {/* Banner */}
      <div style={{
        position: "relative",
        height: 200,
        width: "100%",
        background: bannerBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        {bannerImg ? (
          <img
            src={bannerImg}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ fontSize: 40 }}>📚</div>
        )}
        {/* Badge */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: badgeColor, color: "#fff",
          padding: "5px 14px", borderRadius: 20,
          fontSize: 12, fontWeight: 700,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}>
          {badgeText}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Mentor & Like */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Avatar placeholder */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700
            }}>
              {mentorName.charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{mentorName}</span>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>{title}</h3>

        {/* Description */}
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: "0 0 16px 0", flex: 1 }}>
          {description}
        </p>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 16 }}>
          {[1,2,3,4].map(i => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
          ))}
          <svg width="16" height="16" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#half)"></polygon>
          </svg>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginLeft: 4 }}>({rating})</span>
        </div>

        {/* Price */}
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Kurs narxi:</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {price} <span style={{ fontSize: 14, fontWeight: 700 }}>uzs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
