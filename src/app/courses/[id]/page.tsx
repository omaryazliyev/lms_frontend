"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/landing/Navbar";
import Footer from "../../../components/landing/Footer";
import api from "../../../api/axios";
import { CircularProgress } from "@mui/material";

interface Lesson {
  id: number;
  name: string;
  description: string;
  file: string;
}

interface Section {
  id: number;
  name: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  prise: number;
  level: string;
  banner: string;
  intro_video: string;
  categories?: { name: string };
  mentorProfile?: {
    job?: string;
    users?: { full_name: string };
  };
  sections: Section[];
}

export default function CourseSinglePage({ params }: { params: any }) {
  const [id, setId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState("");

  // Resolve dynamic params safely
  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setId(p.id);
    });
  }, [params]);

  // Fetch course details on mount
  useEffect(() => {
    if (!id) return;
    api.get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data);
        // Expand first section by default
        if (res.data?.sections?.length > 0) {
          setExpandedSections({ [res.data.sections[0].id]: true });
        }
      })
      .catch((err) => {
        console.error("Kurs ma'lumotlarini yuklashda xatolik:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <Navbar solid={true} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <Navbar solid={true} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 64 }}>📚</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#475569" }}>Kurs topilmadi</h2>
          <Link href="/courses">
            <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
              Barcha kurslarga qaytish
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mentorName = course.mentorProfile?.users?.full_name || "Oybek Safarov";
  const mentorJob = course.mentorProfile?.job || "Front-end Developer, Designer";
  const bannerUrl = course.banner ? `/api/v1/uploads/images/${course.banner}` : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <Navbar solid={true} />

      {/* Hero Banner (Blue Area) */}
      <div style={{
        background: "rgba(37,99,235,1)", // Brand royal blue
        padding: "48px 80px",
        minHeight: "260px",
        position: "relative",
        display: "flex"
      }}>
        <div style={{ width: "62%", color: "#fff", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            {course.name}
          </h1>
          {/* Short Description */}
          <p style={{ fontSize: 16, opacity: 0.95, margin: 0, lineHeight: 1.5, maxWidth: "680px" }}>
            {course.description}
          </p>

          {/* Meta Info Row */}
          <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 12, fontSize: 13, fontWeight: 500, opacity: 0.9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>20 soat 56 daqiqa</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>255 marta ko&apos;rildi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Daraja: {course.level}</span>
            </div>
          </div>
        </div>

        {/* Floating Course Purchase Card */}
        <div style={{
          position: "absolute",
          top: "40px",
          right: "80px",
          width: "340px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          overflow: "hidden",
          zIndex: 10
        }}>
          {/* Card Image */}
          <div style={{ height: 190, background: "#1e293b", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {bannerUrl ? (
              <img src={bannerUrl} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 48 }}>📚</span>
            )}
            {/* Play Overlay Icon */}
            <div style={{
              position: "absolute",
              width: 54, height: 54, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(37,99,235,1)" stroke="none">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
              </svg>
            </div>
          </div>

          {/* Pricing Details */}
          <div style={{ padding: "20px 24px 24px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              {Number(course.prise).toLocaleString("uz-UZ")} UZS
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Asosiy tushunchalarning mustahkam poydevoriga ega bo&apos;ling va qiziqarli va foydali ilovalar yarating!
            </p>

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
              ))}
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginLeft: 6 }}>(4.5)</span>
            </div>

            {/* Buy Button */}
            <Link 
              href={`/register?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`}
              style={{ textDecoration: "none" }}
            >
              <button style={{
                width: "100%", height: 46, background: "rgba(30,41,59,1)", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(30,41,59,1)"}
              >
                Sotib olish
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Main Section */}
      <div style={{ padding: "40px 80px 80px", display: "flex", gap: 32 }}>
        {/* Left Side: Syllabus & Discussions */}
        <div style={{ width: "62%", display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Syllabus Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {course.sections.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                <span style={{ fontSize: 32 }}>📖</span>
                <p style={{ margin: "8px 0 0 0", fontSize: 14, fontWeight: 500 }}>Kurs rejasi hali yuklanmagan</p>
              </div>
            ) : (
              course.sections.map((section) => {
                const isOpen = !!expandedSections[section.id];
                return (
                  <div key={section.id} style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                  }}>
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSection(section.id)}
                      style={{
                        padding: "18px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                        {section.name}
                      </h3>
                      {/* Arrow Icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {/* Section Body */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid #f1f5f9", background: "#fcfdfe", padding: "10px 0" }}>
                        {section.lessons.length === 0 ? (
                          <div style={{ padding: "16px 24px", color: "#94a3b8", fontSize: 13 }}>Mavzular yo&apos;q</div>
                        ) : (
                          section.lessons.map((lesson) => (
                            <div key={lesson.id} style={{
                              padding: "14px 24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: 14,
                              color: "#475569"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {/* Lock Icon */}
                                <div style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                  </svg>
                                </div>
                                <span style={{ fontWeight: 500 }}>{lesson.name}</span>
                              </div>
                              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>9m 34s</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Discussions Section */}
          <div style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "24px 28px"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0" }}>
              Muhokamalar soni: 25 ta
            </h3>

            {/* Write comment */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              {/* User Avatar Initials */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#f1f5f9", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#64748b", fontSize: 14, fontWeight: 700
              }}>
                A
              </div>
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Fikringizni yozib qoldiring"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    width: "100%", height: 42, padding: "0 40px 0 16px",
                    border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13,
                    outline: "none"
                  }}
                />
                <button style={{
                  position: "absolute", right: 8, background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", color: "#3b82f6"
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>

            {/* Comment List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Comment 1 */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 800
                }}>
                  XI
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Xurshid Istamov</span>
                  <p style={{ fontSize: 13, color: "#475569", margin: "2px 0 6px 0", lineHeight: 1.4 }}>
                    Assalomu alaykum. Jonli efir yaxshi bo&apos;lyapti. Faqat ovoz yaxshi eshitilmayapti!
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#94a3b8" }}>
                    <button style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#94a3b8" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      125
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontWeight: 600 }}>
                      Javob berish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Column (Below Floating Card) */}
        <div style={{ width: "340px", display: "flex", flexDirection: "column", gap: 20, marginTop: "200px" }}>
          
          {/* Mentor Profile Details Card */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: "24px 20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              {/* Mentor Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 18, fontWeight: 800
              }}>
                {mentorName.charAt(0)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{mentorName}</span>
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{mentorJob}</span>
              </div>
            </div>

            {/* Mentor Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>100</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>O&apos;quvchilar</div>
              </div>
              <div style={{ borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>2</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Kurslar</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>245</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Ko&apos;rishlar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
