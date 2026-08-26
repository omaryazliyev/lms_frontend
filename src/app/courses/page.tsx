"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../api/axios";

const filters = ["Barcha kurslar", "Dizayn", "Frontend", "Backend", "Mobil", "Full Stack", "Sun'iy intellekt", "Boshqalar"];

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
  : "http://3.75.176.131:8080";

interface Course {
  id: number;
  name: string;
  description: string;
  prise: number;
  level: string;
  banner: string;
  categories?: { name: string };
  mentorProfile?: { users?: { full_name: string } };
}

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i === Math.ceil(rating) && rating % 1 !== 0;
        return (
          <svg key={i} width="15" height="15" viewBox="0 0 24 24">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${i}`}>
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={`url(#h${i})`} />
              </>
            ) : (
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={filled ? "#fbbf24" : "#e2e8f0"} />
            )}
          </svg>
        );
      })}
      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginLeft: 4 }}>({rating})</span>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const bannerUrl = course.banner
    ? `${BACKEND_BASE}/api/v1/uploads/images/${course.banner}`
    : null;
  const mentorName = course.mentorProfile?.users?.full_name || "Mentor";
  const categoryName = course.categories?.name || "Boshqalar";

  const badgeColors: Record<string, string> = {
    Frontend: "#f97316", Backend: "#3b82f6", Dizayn: "#22c55e",
    Mobil: "#8b5cf6", "Full Stack": "#ec4899", "Sun'iy intellekt": "#06b6d4", Boshqalar: "#64748b",
  };
  const badgeColor = badgeColors[categoryName] || "#64748b";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.12)" : "0 2px 10px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease", cursor: "pointer",
        display: "flex", flexDirection: "column"
      }}
    >
      {/* Banner */}
      <div style={{ position: "relative", height: 210, background: "#1e3a5f", overflow: "hidden" }}>
        {bannerUrl ? (
          <img src={bannerUrl} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48 }}>📚</span>
          </div>
        )}
        <div style={{
          position: "absolute", top: 14, left: 14, background: badgeColor,
          color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700
        }}>
          {categoryName}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 800
            }}>
              {mentorName.charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{mentorName}</span>
          </div>
          <button onClick={() => setLiked(!liked)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "#94a3b8"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{course.name}</h3>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: 0, flex: 1,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
          {course.description}
        </p>

        <StarRating rating={4.5} />

        <div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Kurs narxi:</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
            {Number(course.prise).toLocaleString("uz-UZ")} <span style={{ fontSize: 13 }}>uzs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState("Barcha kurslar");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    api.get("/courses")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCourses(data);
      })
      .catch(err => {
        console.error("Kurslarni yuklashda xatolik:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "Barcha kurslar"
    ? courses
    : courses.filter(c => c.categories?.name === activeFilter);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 80px", background: "#fff",
        borderBottom: "2px solid #3b82f6", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#3b82f6" }}>iTlive<span style={{ fontSize: 32, lineHeight: 0 }}>.</span></span>
          </Link>
          {["Kurslar", "Biz haqimizda", "Bog\u02BFlanish"].map(item => (
            <Link key={item} href="#" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>{item}</Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", padding: "7px 12px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", position: "relative" }}
            onClick={() => setLangOpen(!langOpen)}
          >
            O&apos;z ▾
            {langOpen && (
              <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 60, zIndex: 10 }}>
                <div style={{ padding: "8px 12px", fontSize: 13 }}>O&apos;z</div>
                <div style={{ padding: "8px 12px", fontSize: 13 }}>Ru</div>
              </div>
            )}
          </div>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Kirish / Ro&apos;yxatdan o&apos;tish
            </button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: "40px 80px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 28 }}>Kurslar</h1>

        {/* Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
          {filters.map(f => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: isActive ? "none" : "1px solid #cbd5e1",
                  background: isActive ? "#3b82f6" : "#fff",
                  color: isActive ? "#fff" : "#3b82f6",
                  transition: "all 0.2s"
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
            <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Hozircha kurslar mavjud emas</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  );
}
