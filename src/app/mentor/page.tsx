"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import ExitToAppOutlined from "@mui/icons-material/ExitToAppOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import api from "../../api/axios";

const SIDEBAR_BG = "rgb(13,16,23)";
const ACCENT = "#e53935";

interface Course {
  id: number; name: string; prise: number; level: string;
  banner: string | null; isActive: boolean;
  category?: { name: string };
  mentorProfile?: { id: number; usersId?: number; user?: { id: number; full_name: string } };
}
interface Student {
  id: number; full_name: string; phone: string;
  create_at: string; courseId?: number; course?: { id?: number; prise: number; name: string };
}
interface Homework {
  id: number; description: string; file?: string;
  lesson?: { name: string; section?: { name: string; course?: { id?: number; name: string } } };
}
interface QAMessage { id: number; text: string; sender: "student" | "mentor"; senderName: string; time: string; }

export default function MentorPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [foydalanuvchilarOpen, setFoydalanuvchilarOpen] = useState(true);
  const [materiallarOpen, setMateriallarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingHW, setLoadingHW] = useState(true);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [selectedQAStudent, setSelectedQAStudent] = useState<Student | null>(null);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [qaSearch, setQaSearch] = useState("");
  const [selectedQACourse, setSelectedQACourse] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const p = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: Number(p.id), full_name: p.full_name || "Mentor", role: p.role });
      } catch {}
    }
  }, []);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(Array.isArray(res.data) ? res.data : (res.data?.data ?? [])))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));

    api.get("/student")
      .then(res => setStudents(Array.isArray(res.data) ? res.data : (res.data?.data ?? [])))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));

    api.get("/homeworks")
      .then(res => setHomeworks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setHomeworks([]))
      .finally(() => setLoadingHW(false));
  }, []);

  const initials = (n: string) => n?.split(" ").map((x: string) => x[0]).join("").slice(0, 2).toUpperCase() || "M";
  const logout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); window.location.href = "/login"; };

  // 1. Mentor Courses Scope
  const mentorCourses = React.useMemo(() => {
    if (!user) return courses;
    const uid = Number(user.id);
    const uName = user.full_name?.trim().toLowerCase() || "";

    const matched = courses.filter(c => {
      const pUserId = c.mentorProfile?.user?.id !== undefined ? Number(c.mentorProfile.user.id) : (c.mentorProfile?.usersId !== undefined ? Number(c.mentorProfile.usersId) : null);
      const pUserName = c.mentorProfile?.user?.full_name ? c.mentorProfile.user.full_name.trim().toLowerCase() : "";

      const idMatch = uid !== null && pUserId !== null && uid === pUserId;
      const nameMatch = uName !== "" && pUserName !== "" && (uName === pUserName || uName.includes(pUserName) || pUserName.includes(uName));

      return idMatch || nameMatch;
    });

    return matched;
  }, [courses, user]);

  // 2. Mentor Students Scope
  const mentorStudents = React.useMemo(() => {
    const mIds = new Set(mentorCourses.map(c => Number(c.id)));
    const mNames = new Set(mentorCourses.map(c => c.name.trim().toLowerCase()));

    return students.filter(s => {
      if (!s.course && !s.courseId) return false;
      const cId = s.courseId ? Number(s.courseId) : (s.course?.id ? Number(s.course.id) : null);
      const cName = s.course?.name ? s.course.name.trim().toLowerCase() : "";

      const idMatch = cId !== null && mIds.has(cId);
      const nameMatch = cName !== "" && mNames.has(cName);

      return idMatch || nameMatch;
    });
  }, [students, mentorCourses]);

  // 3. Mentor Homeworks Scope
  const mentorHomeworks = React.useMemo(() => {
    const mIds = new Set(mentorCourses.map(c => Number(c.id)));
    const mNames = new Set(mentorCourses.map(c => c.name.trim().toLowerCase()));

    return homeworks.filter(hw => {
      const hwCourseId = hw.lesson?.section?.course?.id ? Number(hw.lesson.section.course.id) : null;
      const hwCourseName = hw.lesson?.section?.course?.name ? hw.lesson.section.course.name.trim().toLowerCase() : "";
      if (hwCourseId === null && hwCourseName === "") return true;

      const idMatch = hwCourseId !== null && mIds.has(hwCourseId);
      const nameMatch = hwCourseName !== "" && mNames.has(hwCourseName);

      return idMatch || nameMatch;
    });
  }, [homeworks, mentorCourses]);

  // 4. Filters
  const filteredStudents = React.useMemo(() => {
    return mentorStudents.filter(s => {
      const matchCourse = !selectedCourseFilter || s.course?.name === selectedCourseFilter;
      const matchSearch = !studentSearch || s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || s.phone.includes(studentSearch);
      return matchCourse && matchSearch;
    });
  }, [mentorStudents, selectedCourseFilter, studentSearch]);

  const filteredQAStudents = React.useMemo(() => {
    return mentorStudents.filter(s =>
      (!selectedQACourse || s.course?.name === selectedQACourse) &&
      (!qaSearch || s.full_name.toLowerCase().includes(qaSearch.toLowerCase()))
    );
  }, [mentorStudents, selectedQACourse, qaSearch]);

  // Auto-select QA student when tab opens
  useEffect(() => {
    if (activeTab === "qa" && filteredQAStudents.length > 0 && !selectedQAStudent) {
      const s = filteredQAStudents[0];
      setSelectedQAStudent(s);
      setQaMessages([
        { id: 1, text: `Assalomu alaykum ustoz, ${s.course?.name || "kurs"} bo'yicha savolim bor edi.`, sender: "student", senderName: s.full_name, time: "10:30" },
        { id: 2, text: "Vazifani tekshirib bera olasizmi?", sender: "student", senderName: s.full_name, time: "10:32" }
      ]);
    }
  }, [activeTab, filteredQAStudents, selectedQAStudent]);

  const sendMessage = () => {
    if (!qaInput.trim() || !selectedQAStudent) return;
    setQaMessages(prev => [...prev, {
      id: Date.now(),
      text: qaInput,
      sender: "mentor",
      senderName: user?.full_name || "Mentor",
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    }]);
    setQaInput("");
  };

  const selectQAStudent = (s: Student) => {
    setSelectedQAStudent(s);
    setQaMessages([
      { id: 1, text: `Assalomu alaykum ustoz, ${s.course?.name || "dars"} bo'yicha savolim bor edi.`, sender: "student", senderName: s.full_name, time: "10:30" },
      { id: 2, text: "Topshiriqni qayta yukladim, ko'rib berolasizmi?", sender: "student", senderName: s.full_name, time: "10:32" }
    ]);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 240, minWidth: 240, background: SIDEBAR_BG, display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{ color: ACCENT }}>iT</span><span style={{ color: "#fff" }}>live</span>
          </span>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: ACCENT, marginBottom: 3, marginLeft: 2 }} />
        </div>
        <div style={{ padding: "12px 14px 4px" }}>
          <div style={{ height: 28, borderRadius: 6, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>BOSHQARUV PANELI</div>
        </div>
        <nav style={{ flex: 1, padding: "8px 10px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={() => setActiveTab("dashboard")} style={{ width: "100%", height: 38, padding: "0 10px", display: "flex", alignItems: "center", gap: 9, borderRadius: 7, border: "none", background: activeTab === "dashboard" ? "rgba(229,57,53,0.15)" : "transparent", color: activeTab === "dashboard" ? ACCENT : "#94a3b8", fontSize: 13, fontWeight: activeTab === "dashboard" ? 700 : 500, cursor: "pointer", textAlign: "left" }}>
            <GridViewOutlined style={{ width: 17, height: 17 }} /> Asosiy
          </button>
          <div>
            <button onClick={() => setFoydalanuvchilarOpen(p => !p)} style={{ width: "100%", height: 38, padding: "0 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, border: "none", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}><PeopleOutlined style={{ width: 17, height: 17 }} /> Foydalanuvchilar</span>
              {foydalanuvchilarOpen ? <KeyboardArrowDown style={{ width: 15, height: 15 }} /> : <KeyboardArrowRight style={{ width: 15, height: 15 }} />}
            </button>
            {foydalanuvchilarOpen && (
              <button onClick={() => setActiveTab("students")} style={{ width: "100%", height: 34, padding: "0 10px 0 36px", display: "flex", alignItems: "center", borderRadius: 7, border: "none", background: activeTab === "students" ? "rgba(229,57,53,0.12)" : "transparent", color: activeTab === "students" ? ACCENT : "#64748b", fontSize: 12.5, fontWeight: activeTab === "students" ? 700 : 400, cursor: "pointer", textAlign: "left" }}>O`quvchilarim</button>
            )}
          </div>
          <div>
            <button onClick={() => setMateriallarOpen(p => !p)} style={{ width: "100%", height: 38, padding: "0 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, border: "none", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}><MenuBookOutlined style={{ width: 17, height: 17 }} /> Materiallar</span>
              {materiallarOpen ? <KeyboardArrowDown style={{ width: 15, height: 15 }} /> : <KeyboardArrowRight style={{ width: 15, height: 15 }} />}
            </button>
            {materiallarOpen && [
              { key: "courses", label: "Mening kurslarim" },
              { key: "qa", label: "Savol-javoblar" },
              { key: "homeworks", label: "Uyga vazifalar" },
            ].map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)} style={{ width: "100%", height: 34, padding: "0 10px 0 36px", display: "flex", alignItems: "center", borderRadius: 7, border: "none", background: activeTab === item.key ? "rgba(229,57,53,0.12)" : "transparent", color: activeTab === item.key ? ACCENT : "#64748b", fontSize: 12.5, fontWeight: activeTab === item.key ? 700 : 400, cursor: "pointer", textAlign: "left" }}>{item.label}</button>
            ))}
          </div>
        </nav>
        <div style={{ padding: "12px 10px 20px" }}>
          <button onClick={logout} style={{ width: "100%", height: 38, padding: "0 10px", display: "flex", alignItems: "center", gap: 9, borderRadius: 7, border: "none", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <ExitToAppOutlined style={{ width: 17, height: 17 }} /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ height: 60, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircleOutlined style={{ width: 18, height: 18, color: ACCENT }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Mentor</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ width: 38, height: 38, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Badge variant="dot" color="error" sx={{ "& .MuiBadge-badge": { width: 5, height: 5, minWidth: 5 } }}>
                <NotificationsNoneOutlined style={{ width: 18, height: 18, color: "#64748b" }} />
              </Badge>
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 5px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, cursor: "pointer" }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: ACCENT, fontSize: 11, fontWeight: 700 }}>{initials(user?.full_name)}</Avatar>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{user?.full_name || "Mentor"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Mentor</div>
                </div>
                <KeyboardArrowDown style={{ width: 14, height: 14, color: "#94a3b8" }} />
              </button>
              {profileOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 180, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: "4px 0", zIndex: 50 }}>
                    <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "#ef4444", background: "none", border: "none", width: "100%", cursor: "pointer" }}>
                      <ExitToAppOutlined style={{ width: 15, height: 15 }} /> Profildan chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* BODY */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Xush kelibsiz, {user?.full_name || "Mentor"}!</h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>Bu yerda o`zingizga tegishli kurslar va o`quvchilarni boshqarishingiz mumkin.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Jami Kurslar", value: mentorCourses.length, icon: <MenuBookOutlined style={{ width: 22, height: 22, color: "#3b82f6" }} />, bg: "#eff6ff", border: "#bfdbfe" },
                  { label: "Nashr qilingan", value: mentorCourses.filter((c: Course) => c.isActive).length, icon: <CheckCircleOutlined style={{ width: 22, height: 22, color: "#10b981" }} />, bg: "#f0fdf4", border: "#bbf7d0" },
                  { label: "Sotib olganlar", value: mentorStudents.length, icon: <SchoolOutlined style={{ width: 22, height: 22, color: ACCENT }} />, bg: "#fff1f2", border: "#fecdd3" },
                  { label: "Jami baholar", value: 0, icon: <StarOutlined style={{ width: 22, height: 22, color: "#f59e0b" }} />, bg: "#fffbeb", border: "#fde68a" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}><h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mening kurslarim</h2></div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["KURS","KATEGORIYA","NARXI","DARAJASI","HOLATI","SOTIB OLGAN","BAHO"].map(h => <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingCourses ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}><CircularProgress size={28} style={{ color: ACCENT }} /></td></tr>
                    : mentorCourses.length === 0 ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>Kurslar mavjud emas</td></tr>
                    : mentorCourses.map((c: Course) => (
                      <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f1f5f9", overflow: "hidden", flexShrink: 0 }}>{c.banner ? <img src={`/api/v1/uploads/images/${c.banner}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>}</div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{c.category?.name || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{Number(c.prise).toLocaleString("uz-UZ")} so`m</td>
                        <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "#fff1f2", padding: "3px 10px", borderRadius: 20 }}>{c.level}</span></td>
                        <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, fontWeight: 600, color: c.isActive ? "#16a34a" : "#64748b", background: c.isActive ? "#f0fdf4" : "#f8fafc", padding: "3px 10px", borderRadius: 20, border: `1px solid ${c.isActive ? "#bbf7d0" : "#e2e8f0"}` }}>{c.isActive ? "Nashr qilingan" : "Nofaol"}</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{mentorStudents.filter((s: Student) => s.course?.name === c.name).length}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13 }}><span style={{ color: "#f59e0b" }}>★</span> 0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* O'QUVCHILARIM */}
          {activeTab === "students" && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>O`quvchilarim</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>Mening kurslarim &bull; O`quvchilar</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <select value={selectedCourseFilter} onChange={e => setSelectedCourseFilter(e.target.value)} style={{ height: 38, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", minWidth: 180 }}>
                  <option value="">Barcha kurslar</option>
                  {mentorCourses.map((c: Course) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", height: 38, maxWidth: 320 }}>
                <SearchOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} />
                <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Izlash..." style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }} />
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["ID","O`QUVCHI","TELEFON RAQAM","NARXI","SOTIB OLGAN SANA"].map(h => <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingStudents ? <tr><td colSpan={5} style={{ textAlign: "center", padding: 32 }}><CircularProgress size={28} style={{ color: ACCENT }} /></td></tr>
                    : filteredStudents.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>O`quvchilar topilmadi</td></tr>
                    : filteredStudents.map((s: Student) => (
                      <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{s.id}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700 }}>{initials(s.full_name)}</Avatar>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{s.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{s.phone}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{s.course ? `${Number(s.course.prise).toLocaleString("uz-UZ")} so\`m` : "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{s.create_at ? new Date(s.create_at).toLocaleDateString("uz-UZ") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>Jami {filteredStudents.length} ta o`quvchi</div>
              </div>
            </div>
          )}

          {/* MENING KURSLARIM */}
          {activeTab === "courses" && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Mening kurslarim</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>Materiallar &bull; Mening kurslarim</p>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["BANNER","KURS NOMI","DARAJASI","NARXI","KATEGORIYA","HOLATI","AMALLAR"].map(h => <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingCourses ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}><CircularProgress size={28} style={{ color: ACCENT }} /></td></tr>
                    : mentorCourses.length === 0 ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>Kurslar mavjud emas</td></tr>
                    : mentorCourses.map((c: Course) => (
                      <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px" }}><div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", overflow: "hidden" }}>{c.banner ? <img src={`/api/v1/uploads/images/${c.banner}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>}</div></td>
                        <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", cursor: "pointer" }}>{c.name}</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{c.level}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{Number(c.prise).toLocaleString("uz-UZ")}</td>
                        <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{c.category?.name || "—"}</span></td>
                        <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, fontWeight: 600, color: c.isActive ? "#16a34a" : "#64748b", background: c.isActive ? "#f0fdf4" : "#f8fafc", padding: "3px 10px", borderRadius: 20, border: `1px solid ${c.isActive ? "#bbf7d0" : "#e2e8f0"}` }}>{c.isActive ? "Faol" : "Nofaol"}</span></td>
                        <td style={{ padding: "12px 16px" }}><button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><VisibilityOutlined style={{ width: 18, height: 18 }} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>Jami {mentorCourses.length} ta kurs</div>
              </div>
            </div>
          )}

          {/* SAVOL-JAVOBLAR */}
          {activeTab === "qa" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Savol-javoblar</h1>
                <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />online</span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 14px" }}>{mentorCourses[0]?.name || ""}</p>
              <div style={{ flex: 1, display: "flex", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ width: 280, borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                  <div style={{ padding: 10 }}>
                    <select value={selectedQACourse} onChange={e => { setSelectedQACourse(e.target.value); setSelectedQAStudent(null); }} style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", outline: "none", marginBottom: 8 }}>
                      <option value="">Barcha kurslar</option>
                      {mentorCourses.map((c: Course) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "0 10px", height: 32 }}>
                      <SearchOutlined style={{ width: 13, height: 13, color: "#94a3b8" }} />
                      <input value={qaSearch} onChange={e => setQaSearch(e.target.value)} placeholder="Izlash..." style={{ border: "none", outline: "none", fontSize: 12, background: "transparent", width: "100%" }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {filteredQAStudents.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>O`quvchilar yo`q</div>
                    : filteredQAStudents.map((s: Student) => (
                      <div key={s.id} onClick={() => selectQAStudent(s)} style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 9, cursor: "pointer", background: selectedQAStudent?.id === s.id ? "#fff1f2" : "transparent", borderBottom: "1px solid #f1f5f9", borderLeft: selectedQAStudent?.id === s.id ? `3px solid ${ACCENT}` : "3px solid transparent" }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700 }}>{initials(s.full_name)}</Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{s.full_name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Assalomu alaykum ustoz...</div>
                        </div>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", display: "inline-block", flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {!selectedQAStudent ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>Savolni tanlang</div> : (
                    <>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{selectedQAStudent.full_name}</div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                        {qaMessages.map((m: QAMessage) => (
                          <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "mentor" ? "flex-end" : "flex-start", gap: 8 }}>
                            {m.sender === "student" && <Avatar sx={{ width: 26, height: 26, bgcolor: "#3b82f6", fontSize: 10 }}>{initials(m.senderName)}</Avatar>}
                            <div>
                              <div style={{ maxWidth: 300, padding: "8px 12px", borderRadius: m.sender === "mentor" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.sender === "mentor" ? "#3b82f6" : "#f1f5f9", color: m.sender === "mentor" ? "#fff" : "#0f172a", fontSize: 13 }}>{m.text}</div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: m.sender === "mentor" ? "right" : "left" }}>{m.time}</div>
                            </div>
                            {m.sender === "mentor" && <Avatar sx={{ width: 26, height: 26, bgcolor: ACCENT, fontSize: 10 }}>{initials(user?.full_name)}</Avatar>}
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
                        <input value={qaInput} onChange={e => setQaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Xabar yozing..." style={{ flex: 1, height: 36, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none" }} />
                        <button onClick={sendMessage} style={{ width: 36, height: 36, background: ACCENT, border: "none", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <SendOutlined style={{ width: 15, height: 15, color: "#fff" }} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* UYGA VAZIFALAR */}
          {activeTab === "homeworks" && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>Uyga vazifalar</h1>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["#","TAVSIF","DARS","BO`LIM","KURS","FAYL"].map(h => <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {loadingHW ? <tr><td colSpan={6} style={{ textAlign: "center", padding: 32 }}><CircularProgress size={28} style={{ color: ACCENT }} /></td></tr>
                    : mentorHomeworks.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>Uyga vazifalar mavjud emas</td></tr>
                    : mentorHomeworks.map((hw: Homework, i: number) => (
                      <tr key={hw.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{i + 1}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#0f172a", maxWidth: 280 }}>{hw.description}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{hw.lesson?.name || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{hw.lesson?.section?.name || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>{hw.lesson?.section?.course?.name || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>{hw.file ? <a href={`/api/v1/uploads/files/${hw.file}`} target="_blank" style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>📎 Yuklab olish</a> : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
