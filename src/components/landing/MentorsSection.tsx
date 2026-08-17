"use client";
import React, { useState } from "react";

const mentors = [
  { id: 1, name: "Karimov Jasur", role: "Frontend Developer", img: "/images/mentors/mentor1.png" },
  { id: 2, name: "Toshmatov Bobur", role: "Backend Developer", img: "/images/mentors/mentor2.png" },
  { id: 3, name: "Istamov Xurshid", role: "UI/UX Dizayner", img: "/images/mentors/mentor3.png" },
  { id: 4, name: "Nazarova Malika", role: "Python Developer", img: "/images/mentors/mentor4.png" },
  { id: 5, name: "Yusupova Dilnoza", role: "Mobile Developer", img: "/images/mentors/mentor5.png" },
];

export default function MentorsSection() {
  const [activeId, setActiveId] = useState(3);

  return (
    <section style={{ padding: "80px 0 80px", background: "#fff", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 50, padding: "0 80px" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
          Tajribali Mentorlar
        </h2>
        <p style={{ fontSize: 15, color: "#64748b" }}>
          Barcha kurslarimiz tajribali mentorlar tomonidan tayyorlangan
        </p>
      </div>

      {/* Mentor Cards */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 12,
        padding: "0 60px"
      }}>
        {mentors.map((mentor) => {
          const isActive = mentor.id === activeId;
          return (
            <div
              key={mentor.id}
              onClick={() => setActiveId(mentor.id)}
              style={{
                position: "relative",
                width: isActive ? 240 : 185,
                height: isActive ? 360 : 290,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isActive ? "0 12px 40px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Mentor Photo */}
              <img
                src={mentor.img}
                alt={mentor.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                  display: "block",
                  filter: isActive ? "none" : "brightness(0.75) grayscale(0.2)"
                }}
              />

              {/* Active overlay gradient + info */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                  padding: "60px 16px 18px",
                  color: "#fff"
                }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{mentor.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 14 }}>{mentor.role}</div>
                  {/* Social icons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "T", title: "Telegram" },
                      { label: "In", title: "Instagram" },
                      { label: "F", title: "Facebook" },
                      { label: "Li", title: "LinkedIn" },
                      { label: "G", title: "GitHub" },
                    ].map((icon) => (
                      <div key={icon.title} title={icon.title} style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, cursor: "pointer",
                        transition: "background 0.2s"
                      }}>
                        {icon.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
