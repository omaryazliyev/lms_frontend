"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import BookOutlined from "@mui/icons-material/BookOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlined from "@mui/icons-material/ExitToAppOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import LaunchOutlined from "@mui/icons-material/LaunchOutlined";

import api from "../../api/axios";

interface Course {
  id: number;
  name: string;
  description: string;
  prise: number;
  level: string;
  banner: string | null;
  category?: { id: number; name: string };
  mentorProfile?: { id: number; user: { id: number; full_name: string } };
}

const SIDEBAR_BG = "rgb(13,16,23)";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [likedCourses, setLikedCourses] = useState<Set<number>>(new Set());

  // Token'dan o'quvchi ma'lumotlarini o'qish
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload) {
          setUser({
            id: payload.id,
            full_name: payload.full_name || "O'quvchi",
            role: payload.role || "STUDENT"
          });
        }
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
  }, []);

  // Faqat o'z kursini yuklash
  useEffect(() => {
    api.get("/student/my-course")
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : 
                     Array.isArray(res.data) ? res.data : [];
        setCourses(data);
      })
      .catch(err => {
        console.error("Kursni yuklashda xatolik:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLikedCourses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const initials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "S";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", fontFamily: "'Inter', sans-serif" }}>
      {/* ═══════════════════════════ SIDEBAR ═══════════════════════════ */}
      <aside style={{
        width: 320, minWidth: 320,
        background: SIDEBAR_BG,
        display: "flex", flexDirection: "column",
        minHeight: "100vh",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#3b82f6" }}>iT</span>
              <span style={{ color: "#fff" }}>live</span>
            </span>
            <span style={{
              display: "inline-block", width: 7, height: 7,
              borderRadius: 2, background: "#3b82f6",
              marginBottom: 3,
            }} />
          </div>
        </div>

        {/* Boshqaruv paneli header */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{
            height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#94a3b8",
          }}>
            BOSHQARUV PANELI
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav style={{ flex: 1, padding: "16px 14px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          <button style={{
            width: "100%", height: 38,
            padding: "0 12px",
            display: "flex", alignItems: "center",
            gap: 10, borderRadius: 8, border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer", textAlign: "left",
          }}>
            <BookOutlined style={{ width: 17, height: 17, color: "#fff" }} />
            Mening kurslarim
          </button>
        </nav>
      </aside>

      {/* ═══════════════════════════ MAIN CONTENT ═══════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        
        {/* Header */}
        <header style={{
          height: 64, background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", flexShrink: 0,
        }}>
          {/* Dashboard Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#e2e8f0" }}>
              <svg width="12" height="12" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Student</span>
          </div>

          {/* Right Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Notification Icon */}
            <button style={{ width: 40, height: 40, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Badge variant="dot" color="error" sx={{ "& .MuiBadge-badge": { width: 6, height: 6, minWidth: 6, top: 2, right: 2 } }}>
                <NotificationsNoneOutlined style={{ width: 20, height: 20, color: "#64748b" }} />
              </Badge>
            </button>

            {/* Settings Icon */}
            <button style={{ width: 40, height: 40, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SettingsOutlined style={{ width: 20, height: 20, color: "#64748b" }} />
            </button>

            {/* Language dropdown */}
            <div style={{ position: "relative" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 8, height: 40,
                padding: "0 12px", background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#0f172a", fontWeight: 600
              }}>
                O'zbek tili <KeyboardArrowDown style={{ width: 14, height: 14, color: "#64748b" }} />
              </button>
            </div>

            {/* User Profile menu */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px 5px 5px",
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 10, cursor: "pointer",
              }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700 }}>
                  {initials(user?.full_name)}
                </Avatar>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{user?.full_name || "O'quvchi"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Talaba</div>
                </div>
                <KeyboardArrowDown style={{ width: 14, height: 14, color: "#94a3b8", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {profileOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 200, background: "#fff",
                    border: "1px solid #e2e8f0", borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "4px 0", zIndex: 50,
                  }}>
                    <Link href="/" style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 14px", fontSize: 13, color: "#475569",
                      textDecoration: "none",
                    }}>
                      <LaunchOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /> Saytga qaytish
                    </Link>
                    <div style={{ borderTop: "1px solid #e2e8f0", margin: "3px 0" }} />
                    <button onClick={() => { 
                      localStorage.removeItem("access_token"); 
                      localStorage.removeItem("refresh_token");
                      setProfileOpen(false);
                      window.location.href = "/login";
                    }} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 14px", fontSize: 13, fontWeight: 700,
                      color: "#ef4444", background: "none", border: "none",
                      width: "100%", textAlign: "left", cursor: "pointer",
                    }}>
                      <ExitToAppOutlined style={{ width: 16, height: 16, color: "#ef4444" }} /> Profildan chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Body content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mening kurslarim</h1>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
              <CircularProgress size={36} style={{ color: "#3b82f6" }} />
            </div>
          ) : courses.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>📚</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Sizda hali sotib olingan kurslar mavjud emas.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, maxWidth: 1200 }}>
              {courses.map(course => {
                const isLiked = likedCourses.has(course.id);
                // Mock progress bar percentages based on id
                const progress = course.id % 2 === 0 ? 40 : 0;
                
                return (
                  <div key={course.id} style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    {/* Banner Image wrapper */}
                    <div style={{ position: "relative", height: 180, background: "#1e293b", overflow: "hidden" }}>
                      {course.banner ? (
                        <img 
                          src={`/api/v1/uploads/images/${course.banner}`} 
                          alt={course.name} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e: any) => e.target.src = 'https://placehold.co/400x250?text=No+Banner'}
                        />
                      ) : (
                        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
                          No Banner
                        </div>
                      )}
                      {/* Category Badge */}
                      <span style={{
                        position: "absolute", left: 12, top: 12,
                        background: "#10b981", color: "#fff",
                        padding: "4px 10px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}>
                        {course.category?.name || "Boshqalar"}
                      </span>
                    </div>

                    {/* Content details */}
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                      {/* Mentor Info line */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: "#3b82f6", fontSize: 10, fontWeight: 700 }}>
                            {initials(course.mentorProfile?.user?.full_name || "Mentor")}
                          </Avatar>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                            {course.mentorProfile?.user?.full_name || "Oybek Safarov"}
                          </span>
                        </div>
                        <button onClick={(e) => handleLike(course.id, e)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
                          {isLiked ? (
                            <FavoriteOutlined style={{ width: 18, height: 18, color: "#ef4444" }} />
                          ) : (
                            <FavoriteBorderOutlined style={{ width: 18, height: 18, color: "#94a3b8" }} />
                          )}
                        </button>
                      </div>

                      {/* Course Title */}
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "4px 0 0", lineHeight: 1.3 }}>
                        {course.name}
                      </h3>

                      {/* Progress Bar container */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
                          <span>Ko'rildi:</span>
                          <span>{progress}%</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${progress}%`, height: "100%", background: "#3b82f6", borderRadius: 3 }} />
                        </div>
                      </div>

                      {/* Launch Button */}
                      <Link href={`/student/courses/${course.id}`} style={{ textDecoration: "none", marginTop: "auto" }}>
                        <button style={{
                          width: "100%", height: 38,
                          background: "#3b82f6", color: "#fff",
                          border: "none", borderRadius: 8,
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "background 0.2s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
                          onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}
                        >
                          Ko'rishni boshlash
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
