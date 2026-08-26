"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlined from "@mui/icons-material/ExitToAppOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import LaunchOutlined from "@mui/icons-material/LaunchOutlined";

import api from "../../api/axios";
import UsersTab from "../../components/admin/UsersTab";
import CategoriesTab from "../../components/admin/CategoriesTab";
import CoursesTab from "../../components/admin/CoursesTab";
import SectionsTab from "../../components/admin/SectionsTab";
import LessonsTab from "../../components/admin/LessonsTab";
import ProfilePage from "../../components/admin/ProfilePage";

type SubItem = { label: string };
type NavItem = {
  label: string;
  Icon: React.ElementType;
  subItems?: SubItem[];
};

const NAV: NavItem[] = [
  { label: "Asosiy", Icon: GridViewOutlined },
  {
    label: "Foydalanuvchilar", Icon: PeopleAltOutlined,
    subItems: [
      { label: "Administratorlar" },
      { label: "Mentorlar" },
      { label: "Assistentlar" },
      { label: "O'quvchilar" },
    ],
  },
  {
    label: "Kurslar", Icon: ArticleOutlined,
    subItems: [
      { label: "Barcha kurslar" },
      { label: "Kategoriyalar" },
    ],
  },
  { label: "To'lovlar", Icon: PaymentsOutlined },
  { label: "Izohlar", Icon: ChatBubbleOutlineOutlined },
];

const SIDEBAR_BG = "rgb(13,16,23)";
const SIDEBAR_W_OPEN = 320;
const SIDEBAR_W_COLLAPSED = 88;

const iconBtn: React.CSSProperties = {
  width: 40, height: 40,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

export default function AdminDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [activeSubItem, setActiveSubItem] = useState("");
  const [activeNav, setActiveNav] = useState("Asosiy");
  
  const [user, setUser] = useState<any>(null);

  // Dashboard stats — backenddan haqiqiy sonlar
  const [stats, setStats] = useState({
    admins: 0, mentors: 0, assistants: 0, students: 0, courses: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminsRes, mentorsRes, assistantsRes, studentsRes, coursesRes] = await Promise.all([
          api.get("/users/admin").catch(() => ({ data: [] })),
          api.get("/mentor").catch(() => ({ data: [] })),
          api.get("/assistant").catch(() => ({ data: [] })),
          api.get("/student").catch(() => ({ data: [] })),
          api.get("/courses/admin/all").catch(() => api.get("/courses")).catch(() => ({ data: [] }))
        ]);

        const admins = Array.isArray(adminsRes.data) ? adminsRes.data : [];
        const mentors = Array.isArray(mentorsRes.data) ? mentorsRes.data : [];
        const assistants = Array.isArray(assistantsRes.data) ? assistantsRes.data : [];
        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const coursesRaw = coursesRes.data;
        const courses = Array.isArray(coursesRaw) ? coursesRaw : coursesRaw?.data || [];

        setStats({
          admins:     admins.length,
          mentors:    mentors.length,
          assistants: assistants.length,
          students:   students.length,
          courses:    courses.length,
        });
      } catch (e) {
        console.error("Stats yuklashda xatolik:", e);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Sync state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "courses") {
      setActiveNav("Kurslar");
      setOpenMenus(["Kurslar"]);
      setActiveSubItem("Barcha kurslar");
    } else if (tab === "categories") {
      setActiveNav("Kurslar");
      setOpenMenus(["Kurslar"]);
      setActiveSubItem("Kategoriyalar");
    } else if (tab === "users") {
      setActiveNav("Foydalanuvchilar");
      setOpenMenus(["Foydalanuvchilar"]);
    }
  }, []);

  // Update URL when tab changes
  const navigateTo = (nav: string, subItem: string) => {
    setActiveNav(nav);
    setActiveSubItem(subItem);
    let url = "/admin";
    if (nav === "Kurslar" && subItem === "Barcha kurslar") {
      url = "/admin?tab=courses";
    } else if (nav === "Kurslar" && subItem === "Kategoriyalar") {
      url = "/admin?tab=categories";
    } else if (nav === "Foydalanuvchilar") {
      url = "/admin?tab=users";
    }
    window.history.replaceState(null, "", url);
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Restore user fetch effect
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload && payload.id) {
          api.get(`/users/admin/${payload.id}`).then(res => {
            setUser(res.data);
          }).catch(err => console.error(err));
        }
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
  }, []);

  const SIDEBAR_W = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_OPEN;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", fontFamily: "'Inter', sans-serif" }}>
      {/* ═══════════════════════════ SIDEBAR ═══════════════════════════ */}
      <aside style={{
        width: SIDEBAR_W, minWidth: SIDEBAR_W,
        background: SIDEBAR_BG,
        display: "flex", flexDirection: "column",
        minHeight: "100vh",
        transition: "width 0.25s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <div style={{
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}>
          {!collapsed && (
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
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: 32, height: 32, border: "1px solid #2a3a50", borderRadius: 7,
            background: "transparent", color: "#94a3b8", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginLeft: collapsed ? "auto" : 0, flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M17 19l-7-7 7-7" />
              }
            </svg>
          </button>
        </div>

        {!collapsed && (
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
        )}

        <nav style={{ flex: 1, padding: "16px 14px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ label, Icon, subItems }) => {
            const isOpen = openMenus.includes(label);
            const isActive = activeNav === label;
            const hasSub = subItems && subItems.length > 0;

            return (
              <div key={label}>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    if (hasSub) {
                      setActiveNav(label);
                      toggleMenu(label);
                    } else {
                      navigateTo(label, "");
                    }
                  }}
                  style={{
                    width: "100%", height: 38,
                    padding: "0 12px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 10, borderRadius: 8, border: "none",
                    background: isActive && !hasSub ? "rgba(255,255,255,0.1)" : "transparent",
                    color: isActive && !hasSub ? "#fff" : "rgba(255,255,255,0.8)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14, fontWeight: isActive && !hasSub ? 600 : 500, lineHeight: "17px", letterSpacing: 0,
                    cursor: "pointer", textAlign: "left",
                  }}
                  onMouseEnter={e => {
                    if (!(isActive && !hasSub)) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={e => {
                    if (!(isActive && !hasSub)) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon style={{ width: 17, height: 17, color: "#fff" }} />
                    {!collapsed && label}
                  </span>
                  {!collapsed && hasSub && (
                    <KeyboardArrowDown style={{
                      width: 14, height: 14, color: "#fff",
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }} />
                  )}
                </button>

                {!collapsed && hasSub && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 1,
                    paddingLeft: 40,
                    maxHeight: isOpen ? subItems!.length * 35 + 4 : 0,
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
                  }}>
                    {subItems!.map(sub => (
                      <button
                        key={sub.label}
                        onClick={() => { setShowProfile(false); navigateTo(label, sub.label); }}
                        style={{
                          height: 34,
                          padding: "0 12px",
                          display: "flex", alignItems: "center",
                          borderRadius: 8, border: "none",
                          background: activeSubItem === sub.label ? "#1e293b" : "transparent",
                          color: activeSubItem === sub.label ? "#fff" : "#94a3b8",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 14, fontWeight: 500, lineHeight: "17px", letterSpacing: 0,
                          cursor: "pointer", textAlign: "left", width: "100%",
                        }}
                        onMouseEnter={e => { if (activeSubItem !== sub.label) e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { if (activeSubItem !== sub.label) e.currentTarget.style.color = "#94a3b8"; }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ═══════════════════════════ MAIN ═══════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 56, background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" fill="none" stroke="#475569" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Admin</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={iconBtn}>
              <Badge badgeContent={2} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 15, minWidth: 15 } }}>
                <NotificationsNoneOutlined style={{ width: 20, height: 20, color: "#64748b" }} />
              </Badge>
            </button>
            <button style={iconBtn}>
              <SettingsOutlined style={{ width: 20, height: 20, color: "#64748b" }} />
            </button>
            <button style={{ ...iconBtn, width: "auto", padding: "0 12px", gap: 6, fontSize: 13, fontWeight: 500, color: "#475569" }}>
              O'zbek tili <KeyboardArrowDown style={{ width: 15, height: 15, color: "#94a3b8" }} />
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px 5px 5px",
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 10, cursor: "pointer",
              }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700 }}>
                  {user?.full_name ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "A"}
                </Avatar>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{user?.full_name || "Admin"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Administrator</div>
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
                    {[
                      { href: "/", Icon: LaunchOutlined, label: "Saytga qaytish" },
                    ].map(({ href, Icon, label }) => (
                      <Link key={label} href={href} onClick={() => setProfileOpen(false)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 14px", fontSize: 13, color: "#475569",
                        textDecoration: "none",
                      }}>
                        <Icon style={{ width: 16, height: 16, color: "#94a3b8" }} /> {label}
                      </Link>
                    ))}
                    <button onClick={() => { setShowProfile(true); setProfileOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 14px", fontSize: 13, color: "#475569",
                      background: "none", border: "none", width: "100%",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <AccountCircleOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /> Profil ma'lumotlari
                    </button>
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

        {/* Body */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {showProfile && <ProfilePage user={user} onUpdate={(updated) => setUser({ ...user, ...updated })} />}

          {!showProfile && activeNav === "Asosiy" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Asosiy</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 13, color: "#64748b" }}>
                  <span>Boshqaruv paneli</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>•</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 24 }}>
                {[
                  { label: "Jami Administratorlar", value: stats.admins },
                  { label: "Jami Mentorlar",        value: stats.mentors },
                  { label: "Jami Assistentlar",     value: stats.assistants },
                  { label: "Jami O'quvchilar",      value: stats.students },
                  { label: "Jami Kurslar",          value: stats.courses },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
                    padding: "20px 24px", display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#000", lineHeight: 1.2 }}>
                      {statsLoading ? <span style={{ fontSize: 16, color: "#94a3b8" }}>...</span> : value}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showProfile && activeNav === "Foydalanuvchilar" && <UsersTab activeSubItem={activeSubItem} />}
          {!showProfile && activeNav === "Kurslar" && activeSubItem === "Barcha kurslar" && <CoursesTab />}
          {!showProfile && activeNav === "Kurslar" && activeSubItem === "Kategoriyalar" && <CategoriesTab />}
          {!showProfile && activeNav === "Kurslar"
            && !["Barcha kurslar", "Kategoriyalar"].includes(activeSubItem)
            && activeSubItem !== ""
            && (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 15 }}>
              Tez orada qo'shiladi...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
