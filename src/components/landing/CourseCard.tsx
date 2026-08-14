import React from "react";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import Star from "@mui/icons-material/Star";
import StarHalf from "@mui/icons-material/StarHalf";

interface CourseCardProps {
  bannerImg: string;
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
  badgeText,
  badgeColor,
  mentorName,
  mentorImg,
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
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {/* Banner */}
      <div style={{ position: "relative", height: 220, width: "100%", background: "#f1f5f9" }}>
        <img 
          src={bannerImg} 
          alt={title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          onError={(e: any) => e.target.src = "https://placehold.co/400x220?text=Course+Banner"}
        />
        <div style={{ 
          position: "absolute", top: 16, left: 16, 
          background: badgeColor, color: "#fff", 
          padding: "4px 12px", borderRadius: 20, 
          fontSize: 12, fontWeight: 600 
        }}>
          {badgeText}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Mentor & Like */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img 
              src={mentorImg} 
              alt={mentorName} 
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
              onError={(e: any) => e.target.src = "https://placehold.co/32x32"}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{mentorName}</span>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
            <FavoriteBorderOutlined style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>{title}</h3>
        
        {/* Description */}
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: "0 0 16px 0", flex: 1 }}>
          {description}
        </p>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <Star style={{ color: "#fbbf24", width: 16, height: 16 }} />
          <Star style={{ color: "#fbbf24", width: 16, height: 16 }} />
          <Star style={{ color: "#fbbf24", width: 16, height: 16 }} />
          <Star style={{ color: "#fbbf24", width: 16, height: 16 }} />
          <StarHalf style={{ color: "#fbbf24", width: 16, height: 16 }} />
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginLeft: 4 }}>({rating})</span>
        </div>

        {/* Price */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Kurs narxi:</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {price} <span style={{ fontSize: 14, fontWeight: 700 }}>uzs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
