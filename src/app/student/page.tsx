"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import BookOutlined from "@mui/icons-material/BookOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import ExitToAppOutlined from "@mui/icons-material/ExitToAppOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LaunchOutlined from "@mui/icons-material/LaunchOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";

import api from "../../api/axios";

interface Course {
  id: number;
  name: string;
  description: string;
  prise: number;
  level: string;
  banner: string | null;
  category?: { id: number; name: string };
  mentorProfile?: { id: number; user?: { id: number; full_name: string } };
}

interface NotificationItem {
  id: number;
  senderName: string;
  courseName: string;
  text: string;
  time: string;
  isRead: boolean;
}

const SIDEBAR_BG = "rgb(13,16,23)";
const ACCENT = "#3b82f6";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("my");
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [likedCourses, setLikedCourses] = useState<Set<number>>(new Set());

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      senderName: "Ali Valiyev (Mentor)",
      courseName: "Web Dizayn",
      text: "Savolingizga javob berildi: 'Darsdagi vazifani tekshirib ko'ring'",
      time: "11:15",
      isRead: false
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload) {
          setUser({ id: Number(payload.id), full_name: payload.full_name || "O'quvchi", role: payload.role || "STUDENT" });
        }
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    api.get("/student/my-course")
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setMyCourses(data);
      })
      .catch(() => setMyCourses([]))
      .finally(() => setLoadingMy(false));
  }, []);

  useEffect(() => {
    api.get("/courses")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setAllCourses(data);
      })
      .catch(() => setAllCourses([]))
      .finally(() => setLoadingAll(false));
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setNotificationsOpen(false);
  };

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLikedCourses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const initials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "S";

  const myCourseIds = new Set(myCourses.map(c => c.id));

  const navItems = [
    { key: "my", label: "Mening kurslarim", icon: <BookOutlined style={{ width: 17, height: 17 }} /> },
    { key: "all", label: "Barcha kurslar", icon: <GridViewOutlined style={{ width: 17, height: 17 }} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 280, minWidth: 280, background: SIDEBAR_BG, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#3b82f6" }}>iT</span>
              <span style={{ color: "#fff" }}>live</span>
            </span>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: "#3b82f6", marginBottom: 3 }} />
          </div>
        </div>
        <div style={{ padding: "0 14px 8px" }}>
          <div style={{ height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#94a3b8" }}>
            BOSHQARUV PANELI
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 14px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key as "all" | "my")} style={{ width: "100%", height: 40, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, border: "none", background: isActive ? "rgba(59,130,246,0.18)" : "transparent", color: isActive ? "#60a5fa" : "#94a3b8", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 14px 24px" }}>
          <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); window.location.href = "/login"; }} style={{ width: "100%", height: 40, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, border: "none", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <ExitToAppOutlined style={{ width: 17, height: 17 }} /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            {activeTab === "my" ? "Mening kurslarim" : "Barcha kurslar"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* NOTIFICATION BELL WITH UNREAD BADGE & DROPDOWN */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotificationsOpen(p => !p)} style={{ width: 40, height: 40, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16, fontWeight: 700 } }}>
                  <NotificationsNoneOutlined style={{ width: 20, height: 20, color: unreadCount > 0 ? ACCENT : "#64748b" }} />
                </Badge>
              </button>

              {notificationsOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setNotificationsOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", padding: "12px 0", zIndex: 50 }}>
                    <div style={{ padding: "0 16px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Bildirishnomalar</span>
                        {unreadCount > 0 && <span style={{ background: "#eff6ff", color: ACCENT, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{unreadCount} yangi</span>}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <DoneAllOutlined style={{ width: 14, height: 14 }} /> Barchasi o'qildi
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Bildirishnomalar yo'q</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)}
                            style={{ padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: n.isRead ? "transparent" : "#eff6ff", borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials(n.senderName)}</Avatar>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{n.senderName}</span>
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>{n.time}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.text}</div>
                            </div>
                            {!n.isRead && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, marginTop: 5, flexShrink: 0 }} />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PROFILE MENU */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#3b82f6", fontSize: 11, fontWeight: 700 }}>{initials(user?.full_name)}</Avatar>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{user?.full_name || "O'quvchi"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Talaba</div>
                </div>
                <KeyboardArrowDown style={{ width: 14, height: 14, color: "#94a3b8", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {profileOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "4px 0", zIndex: 50 }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 13, color: "#475569", textDecoration: "none" }}>
                      <LaunchOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /> Saytga qaytish
                    </Link>
                    <div style={{ borderTop: "1px solid #e2e8f0", margin: "3px 0" }} />
                    <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); window.location.href = "/login"; }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "#ef4444", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                      <ExitToAppOutlined style={{ width: 16, height: 16, color: "#ef4444" }} /> Profildan chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>

          {/* MY COURSES */}
          {activeTab === "my" && (
            loadingMy ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><CircularProgress size={36} style={{ color: "#3b82f6" }} /></div>
            ) : myCourses.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "80px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Hali sotib olingan kurslar yo'q</p>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Barcha kurslarni ko'rib, o'zingizga mos kursni tanlang</p>
                <button onClick={() => setActiveTab("all")} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Kurslarni ko'rish
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, maxWidth: 1100 }}>
                {myCourses.map(course => {
                  const isLiked = likedCourses.has(course.id);
                  return (
                    <div key={course.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                      <div style={{ position: "relative", height: 175, background: "#1e293b", overflow: "hidden" }}>
                        {course.banner ? (
                          <img src={`/api/v1/uploads/images/${course.banner}`} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => e.target.src = "https://placehold.co/400x200?text=No+Banner"} />
                        ) : (
                          <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📚</div>
                        )}
                        <span style={{ position: "absolute", left: 12, top: 12, background: "#10b981", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{course.category?.name || "Boshqalar"}</span>
                      </div>
                      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#3b82f6", fontSize: 10, fontWeight: 700 }}>{initials(course.mentorProfile?.user?.full_name || "M")}</Avatar>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{course.mentorProfile?.user?.full_name || "Mentor"}</span>
                          </div>
                          <button onClick={(e) => handleLike(course.id, e)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                            {isLiked ? <FavoriteOutlined style={{ width: 17, height: 17, color: "#ef4444" }} /> : <FavoriteBorderOutlined style={{ width: 17, height: 17, color: "#94a3b8" }} />}
                          </button>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{course.name}</h3>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 5, fontWeight: 600 }}><span>Ko'rildi:</span><span>0%</span></div>
                          <div style={{ width: "100%", height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}><div style={{ width: "0%", height: "100%", background: "#3b82f6", borderRadius: 3 }} /></div>
                        </div>
                        <Link href={`/student/courses/${course.id}`} style={{ textDecoration: "none", marginTop: "auto" }}>
                          <button style={{ width: "100%", height: 38, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#2563eb"} onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}>
                            Ko'rishni boshlash
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ALL COURSES */}
          {activeTab === "all" && (
            loadingAll ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><CircularProgress size={36} style={{ color: "#3b82f6" }} /></div>
            ) : allCourses.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "80px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>Hozircha kurslar mavjud emas</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, maxWidth: 1100 }}>
                {allCourses.map(course => {
                  const owned = myCourseIds.has(course.id);
                  const isLiked = likedCourses.has(course.id);
                  return (
                    <div key={course.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${owned ? "#bbf7d0" : "#e2e8f0"}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", position: "relative" }}>
                      {owned && (
                        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 5, background: "#22c55e", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
                          ✓ Sotib olingan
                        </div>
                      )}
                      <div style={{ position: "relative", height: 175, background: "#1e293b", overflow: "hidden" }}>
                        {course.banner ? (
                          <img src={`/api/v1/uploads/images/${course.banner}`} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => e.target.src = "https://placehold.co/400x200?text=No+Banner"} />
                        ) : (
                          <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📚</div>
                        )}
                        <span style={{ position: "absolute", left: 12, top: 12, background: "#f97316", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{course.category?.name || "Boshqalar"}</span>
                      </div>
                      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#6366f1", fontSize: 10, fontWeight: 700 }}>{initials(course.mentorProfile?.user?.full_name || "M")}</Avatar>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{course.mentorProfile?.user?.full_name || "Mentor"}</span>
                          </div>
                          <button onClick={(e) => handleLike(course.id, e)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                            {isLiked ? <FavoriteOutlined style={{ width: 17, height: 17, color: "#ef4444" }} /> : <FavoriteBorderOutlined style={{ width: 17, height: 17, color: "#94a3b8" }} />}
                          </button>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{course.name}</h3>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{course.description?.slice(0, 80)}{course.description?.length > 80 ? "..." : ""}</p>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                          {Number(course.prise).toLocaleString("uz-UZ")}
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b", marginLeft: 4 }}>UZS</span>
                        </div>
                        {owned ? (
                          <Link href={`/student/courses/${course.id}`} style={{ textDecoration: "none", marginTop: "auto" }}>
                            <button style={{ width: "100%", height: 38, background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#16a34a"} onMouseLeave={e => e.currentTarget.style.background = "#22c55e"}>
                              Ko'rishni boshlash
                            </button>
                          </Link>
                        ) : (
                          <Link href={`/register?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`} style={{ textDecoration: "none", marginTop: "auto" }}>
                            <button style={{ width: "100%", height: 38, background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onMouseEnter={e => e.currentTarget.style.background = "#1e293b"} onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}>
                              <ShoppingCartOutlined style={{ width: 16, height: 16 }} /> Sotib olish
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
