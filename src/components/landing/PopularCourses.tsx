"use client";
import React, { useState } from "react";
import CourseCard from "./CourseCard";

const filters = ["Barcha kurslar", "Dizayn", "Frontend", "Backend", "Mobil", "Full Stack", "Sun'iy intellekt", "Boshqalar"];

const mockCourses = [
  {
    id: 1,
    bannerImg: "/images/courses/php.png",
    badgeText: "PHP, Laravel",
    badgeColor: "#22c55e",
    mentorName: "Oybek Safarov",
    mentorImg: "/images/mentor1.jpg",
    title: "PHP, Laravel",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 2,
    bannerImg: "/images/courses/react.png",
    badgeText: "JavaScript, React.js",
    badgeColor: "#ec4899",
    mentorName: "Oybek Safarov",
    mentorImg: "/images/mentor1.jpg",
    title: "React.js",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 3,
    bannerImg: "/images/courses/python.png",
    badgeText: "C++, Python",
    badgeColor: "#ef4444",
    mentorName: "Oybek Safarov",
    mentorImg: "/images/mentor1.jpg",
    title: "C++",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  },
  {
    id: 4,
    bannerImg: "/images/courses/go.png",
    badgeText: "C++", // Mocked as C++ in the user's design image
    badgeColor: "#eab308",
    mentorName: "Oybek Safarov",
    mentorImg: "/images/mentor1.jpg",
    title: "Go",
    description: "SMM sohasini 0 dan o'rganing va faoliyatingizni eng yaxshi kompaniyada olib boring",
    rating: 4.5,
    price: "250 000"
  }
];

export default function PopularCourses() {
  const [activeFilter, setActiveFilter] = useState("Barcha kurslar");

  return (
    <section style={{ padding: "80px 80px", background: "#f8fafc" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {mockCourses.map(course => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
}
