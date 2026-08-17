"use client";
import React, { useState } from "react";
import Link from "next/link";

const filters = ["Barcha kurslar", "Dizayn", "Frontend", "Backend", "Mobil", "Full Stack", "Sun'iy intellekt", "Boshqalar"];

const allCourses = [
  {
    id: 1,
    bannerImg: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
    bannerBg: "#6d28d9",
    badgeText: "UI/UX Dizayn",
    badgeColor: "#22c55e",
    category: "Dizayn",
    mentorName: "Oybek Safarov",
    title: "UI/UX Dizayn",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 2,
    bannerImg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    bannerBg: "#0369a1",
    badgeText: "Frontend",
    badgeColor: "#f97316",
    category: "Frontend",
    mentorName: "Oybek Safarov",
    title: "Frontend dasturlash",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 3,
    bannerImg: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    bannerBg: "#1e3a5f",
    badgeText: "Backend",
    badgeColor: "#3b82f6",
    category: "Backend",
    mentorName: "Oybek Safarov",
    title: "Backend dasturlash",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 4,
    bannerImg: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&q=80",
    bannerBg: "#4c1d95",
    badgeText: "Mobil",
    badgeColor: "#8b5cf6",
    category: "Mobil",
    mentorName: "Oybek Safarov",
    title: "Mobil dasturlash",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 5,
    bannerImg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    bannerBg: "#be185d",
    badgeText: "SMM",
    badgeColor: "#ec4899",
    category: "Boshqalar",
    mentorName: "Oybek Safarov",
    title: "SMM Marketing",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 6,
    bannerImg: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&q=80",
    bannerBg: "#065f46",
    badgeText: "Grafik dizayn",
    badgeColor: "#10b981",
    category: "Dizayn",
    mentorName: "Oybek Safarov",
    title: "Grafik dizayn",
    description: "SMM sohasini 0 dan o\u2019rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
];

function CourseCard({ course }: { course: typeof allCourses[0] }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.12)" : "0 2px 10px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Banner */}
      <div style={{ position: "relative", height: 210, background: course.bannerBg, overflow: "hidden" }}>
        <img
          src={course.bannerImg}
          alt={course.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: course.badgeColor, color: "#fff",
          padding: "4px 14px", borderRadius: 20,
          fontSize: 12, fontWeight: 700
        }}>
          {course.badgeText}
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
              {course.mentorName.charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{course.mentorName}</span>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "#94a3b8"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{course.title}</h3>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: 0, flex: 1 }}>{course.description}</p>

        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[1,2,3,4].map(i => (
            <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
          ))}
          <svg width="15" height="15" viewBox="0 0 24 24">
            <defs><linearGradient id="h2"><stop offset="50%" stopColor="#fbbf24"/><stop offset="50%" stopColor="#e2e8f0"/></linearGradient></defs>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#h2)"></polygon>
          </svg>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginLeft: 4 }}>({course.rating})</span>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Kurs narxi:</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
            {course.price} <span style={{ fontSize: 13 }}>uzs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState("Barcha kurslar");
  const [langOpen, setLangOpen] = useState(false);

  const filtered = activeFilter === "Barcha kurslar"
    ? allCourses
    : allCourses.filter(c => c.category === activeFilter);

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
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: "#475569", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>
          {["Kurslar", "Biz haqimizda", "Bog\u02BFlanish"].map(item => (
            <Link key={item} href="#" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>
              {item}
            </Link>
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
          <button style={{ border: "none", background: "#f1f5f9", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {filtered.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      </div>
    </div>
  );
}
