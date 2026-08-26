"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import CourseCard from "./CourseCard";
import api from "../../api/axios";

const filters = ["Barcha kurslar", "Dizayn", "Frontend", "Backend", "Mobil", "Full Stack", "Sun'iy intellekt", "Boshqalar"];

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

export default function PopularCourses() {
  const [activeFilter, setActiveFilter] = useState("Barcha kurslar");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Categories badge colors map
  const badgeColors: Record<string, string> = {
    Frontend: "#f97316", Backend: "#3b82f6", Dizayn: "#22c55e",
    Mobil: "#8b5cf6", "Full Stack": "#ec4899", "Sun'iy intellekt": "#06b6d4", Boshqalar: "#64748b",
  };

  return (
    <section id="courses" style={{ padding: "80px 80px", background: "#f8fafc" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Ommabop kurslar</h2>
        <p style={{ fontSize: 15, color: "#64748b", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          Kasbga yo&apos;naltirilgan praktikumlar yordamida eng tez va samarali yo&apos;llar bilan mutaxassislar qatoriga qo&apos;shiling. Har bir praktikum soha mutaxassislari tomonidan eng zamonaviy o&apos;quv reja asosida tayyorlangan
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 40 }}>
        {filters.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: isActive ? "none" : "1px solid #cbd5e1",
                background: isActive ? "#3b82f6" : "#fff",
                color: isActive ? "#fff" : "#3b82f6",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 250 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", gridColumn: "span 3" }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📚</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Hozircha kurslar mavjud emas</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {filtered.slice(0, 6).map(course => {
            const categoryName = course.categories?.name || "Boshqalar";
            const bannerUrl = course.banner
              ? `/api/v1/uploads/images/${course.banner}`
              : "";

            return (
              <CourseCard
                key={course.id}
                bannerImg={bannerUrl}
                bannerBg="#1e3a5f"
                badgeText={categoryName}
                badgeColor={badgeColors[categoryName] || "#64748b"}
                mentorName={course.mentorProfile?.users?.full_name || "Mentor"}
                mentorImg=""
                title={course.name}
                description={course.description}
                rating={4.5}
                price={Number(course.prise).toLocaleString("uz-UZ")}
              />
            );
          })}
        </div>
      )}

      {/* Show all button */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/courses" style={{ textDecoration: "none" }}>
          <button style={{
            background: "#3b82f6", color: "#fff", border: "none",
            borderRadius: 8, padding: "14px 36px", fontSize: 15,
            fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)"
          }}>
            Barcha kurslarni ko&apos;rish
          </button>
        </Link>
      </div>
    </section>
  );
}
