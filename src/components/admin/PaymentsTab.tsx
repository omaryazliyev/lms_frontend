"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  CircularProgress,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  file?: string;
  isPaid: boolean;
  create_at: string;
  courseId?: number | null;
  course?: { id: number; name: string } | null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const BLUE = "#3b82f6";

export default function PaymentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success",
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/student");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setStudents(data);
    } catch {
      setAlert({ open: true, msg: "Ma'lumot yuklanmadi", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/courses");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setCourses(data);
    } catch {
      console.error("Kurslarni yuklab bo'lmadi");
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [fetchStudents, fetchCourses]);

  const handleTogglePaid = async (student: Student) => {
    setTogglingId(student.id);
    try {
      const res = await api.patch(`/student/${student.id}/toggle-paid`);
      setStudents(prev =>
        prev.map(s => s.id === student.id ? { ...s, isPaid: res.data.isPaid } : s)
      );
      if (res.data.isPaid) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        setAlert({ open: true, msg: "To'lov bekor qilindi", sev: "success" });
      }
    } catch {
      setAlert({ open: true, msg: "Xatolik yuz berdi", sev: "error" });
    } finally {
      setTogglingId(null);
    }
  };

  const handleAssignCourse = async (studentId: number, courseId: number | null) => {
    setAssigningId(studentId);
    try {
      await api.patch(`/student/${studentId}/assign-course`, { courseId });
      setStudents(prev =>
        prev.map(s => {
          if (s.id !== studentId) return s;
          const foundCourse = courses.find(c => c.id === courseId) || null;
          return { ...s, courseId, course: foundCourse };
        })
      );
      setAlert({ open: true, msg: "Kurs muvaffaqiyatli belgilandi!", sev: "success" });
    } catch {
      setAlert({ open: true, msg: "Kursni belgilashda xatolik", sev: "error" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Talabani o'chirishni xohlaysizmi?")) return;
    try {
      await api.delete(`/student/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      setAlert({ open: true, msg: "Talaba o'chirildi", sev: "success" });
    } catch {
      setAlert({ open: true, msg: "O'chirishda xatolik", sev: "error" });
    }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (d: string) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" })
        + " - " + dt.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    } catch { return d; }
  };

  const initials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const avatarColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#06b6d4"];
  const avatarColor = (id: number) => avatarColors[id % avatarColors.length];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>To'lovlar</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 13, color: "#64748b" }}>
          <span>Foydalanuvchilar</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>•</span>
          <span>To'lovlar</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ position: "relative", maxWidth: 300, flex: 1 }}>
          <SearchOutlined style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "#94a3b8", width: 18, height: 18
          }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Izlash..."
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 12, height: 38,
              border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13,
              outline: "none", color: "#334155", background: "#fff", boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a"
          }}>
            ⏳ Kutilmoqda: {students.filter(s => !s.isPaid).length}
          </div>
          <div style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0"
          }}>
            ✓ Tasdiqlangan: {students.filter(s => s.isPaid).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <CircularProgress size={32} style={{ color: BLUE }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Talaba", "Telefon", "Tanlangan kurs", "Holati", "Tasdiqlash", "Amallar"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: 12,
                      fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                      Talabalar topilmadi
                    </td>
                  </tr>
                ) : paginated.map((student, idx) => (
                  <tr key={student.id} style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                    transition: "background 0.15s"
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                  >
                    {/* ID */}
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                      {student.id}
                    </td>

                    {/* Name */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar sx={{
                          width: 32, height: 32, fontSize: 12, fontWeight: 700,
                          bgcolor: avatarColor(student.id)
                        }}>
                          {initials(student.full_name)}
                        </Avatar>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                            {student.full_name}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatDate(student.create_at)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>
                      {student.phone}
                    </td>

                    {/* Course assignment */}
                    <td style={{ padding: "12px 16px", minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <SchoolOutlined style={{ width: 15, height: 15, color: "#94a3b8", flexShrink: 0 }} />
                        <select
                          value={student.courseId ?? ""}
                          disabled={assigningId === student.id}
                          onChange={e => {
                            const val = e.target.value;
                            handleAssignCourse(student.id, val ? Number(val) : null);
                          }}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 12,
                            color: student.courseId ? "#0f172a" : "#94a3b8",
                            outline: "none",
                            background: "#f8fafc",
                            cursor: "pointer",
                            maxWidth: 140,
                            fontWeight: student.courseId ? 600 : 400,
                          }}
                        >
                          <option value="">— Tanlang —</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {assigningId === student.id && (
                          <CircularProgress size={12} style={{ color: BLUE }} />
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "12px 16px" }}>
                      {student.isPaid ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0"
                        }}>
                          <CheckCircleOutlined style={{ width: 13, height: 13 }} />
                          Tasdiqlangan
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa"
                        }}>
                          <HourglassEmptyOutlined style={{ width: 13, height: 13 }} />
                          Kutilmoqda
                        </span>
                      )}
                    </td>

                    {/* Toggle paid button */}
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => handleTogglePaid(student)}
                        disabled={togglingId === student.id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                          cursor: togglingId === student.id ? "not-allowed" : "pointer",
                          border: "none", transition: "all 0.2s",
                          background: student.isPaid ? "#fee2e2" : "#dbeafe",
                          color: student.isPaid ? "#dc2626" : BLUE,
                          opacity: togglingId === student.id ? 0.6 : 1,
                        }}
                        onMouseEnter={e => {
                          if (togglingId !== student.id) {
                            (e.currentTarget as HTMLButtonElement).style.background = student.isPaid ? "#fecaca" : "#bfdbfe";
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = student.isPaid ? "#fee2e2" : "#dbeafe";
                        }}
                      >
                        {togglingId === student.id ? (
                          <CircularProgress size={12} style={{ color: "inherit" }} />
                        ) : student.isPaid ? (
                          <>✕ Bekor qilish</>
                        ) : (
                          <><CheckCircleOutlined style={{ width: 13, height: 13 }} /> Tasdiqlash</>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => handleDelete(student.id)}
                        style={{
                          width: 30, height: 30, borderRadius: 7,
                          border: "1px solid #fecaca", background: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                      >
                        <DeleteOutlined style={{ width: 15, height: 15, color: "#ef4444" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid #e2e8f0", background: "#f8fafc"
          }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Sahifada 1-{Math.min(page * pageSize, filtered.length)} gacha.{" "}
              Umumiy {filtered.length}ta
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Bir sahifada:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 6px",
                  fontSize: 12, color: "#334155", outline: "none", background: "#fff"
                }}
              >
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                  background: page === 1 ? "#f8fafc" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
                  fontSize: 12, color: page === 1 ? "#94a3b8" : "#334155"
                }}
              >Oldingi</button>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", padding: "4px 6px" }}>
                {page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                  background: page === totalPages ? "#f8fafc" : "#fff",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontSize: 12, color: page === totalPages ? "#94a3b8" : "#334155"
                }}
              >Keyingi</button>
            </div>
          </div>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3500}
        onClose={() => setAlert(a => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert(a => ({ ...a, open: false }))}
          severity={alert.sev}
          variant="filled"
          sx={{ borderRadius: "8px", fontFamily: "inherit", fontSize: "14px" }}
        >
          {alert.msg}
        </Alert>
      </Snackbar>

      {/* Muvaffaqiyat modali */}
      {showSuccess && (
        <div
          onClick={() => setShowSuccess(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes popIn {
              0% { transform: scale(0.7); opacity: 0 }
              70% { transform: scale(1.08) }
              100% { transform: scale(1); opacity: 1 }
            }
            @keyframes checkDraw {
              0% { stroke-dashoffset: 60 }
              100% { stroke-dashoffset: 0 }
            }
            @keyframes ringPulse {
              0% { transform: scale(0.8); opacity: 0 }
              60% { transform: scale(1.15); opacity: 0.5 }
              100% { transform: scale(1); opacity: 1 }
            }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "52px 64px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)",
              minWidth: 320,
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
              animation: "ringPulse 0.4s ease",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24"
                fill="none" stroke="#fff" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" style={{
                  strokeDasharray: 60,
                  strokeDashoffset: 0,
                  animation: "checkDraw 0.4s 0.2s ease both",
                }} />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 22, fontWeight: 800, color: "#0f172a",
                margin: 0, letterSpacing: -0.5
              }}>
                Muvaffaqiyatli tasdiqlandi
              </p>
              <p style={{ fontSize: 14, color: "#64748b", margin: "8px 0 0" }}>
                Talaba endi tizimga kira oladi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
