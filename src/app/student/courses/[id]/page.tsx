"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import BookOutlined from "@mui/icons-material/BookOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import ArrowBack from "@mui/icons-material/ArrowBack";
import PlayCircleFilledWhiteOutlined from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import StarBorderOutlined from "@mui/icons-material/StarBorderOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import api from "../../../../api/axios";

type Lesson = {
  id: number;
  name: string;
  description: string;
  file: string | null;
  materials?: { id: number; description: string; files?: { id: number; file: string }[] }[];
  homeworks?: { id: number; description: string; file: string | null }[];
  exams?: { id: number; question: string; variantA: string; variantB: string; variantC: string; variantD: string; answer: string }[];
};

type Section = { id: number; name: string; lessons: Lesson[] };
type Course = { id: number; name: string; sections: Section[] };
type QaItem = { id: string; text: string; author: string; createdAt: string; fileName?: string; answer?: string; answerAuthor?: string; answerTime?: string };

interface NotificationItem {
  id: number;
  senderName: string;
  courseName: string;
  text: string;
  time: string;
  isRead: boolean;
}

const SIDEBAR_BG = "rgb(13,16,23)";
const BLUE = "#3b82f6";

const initials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "S";

function fileUrl(filename?: string | null) {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  const name = filename.split(/[/\\]/).pop() || filename;
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return `/api/v1/uploads/images/${name}`;
  if (/\.(mp4|webm|mov|ogg|mkv)$/i.test(name)) return `/api/v1/uploads/videos/${name}`;
  if (/\.(pdf|xls|xlsx|csv|doc|docx|zip)$/i.test(name)) return `/api/v1/uploads/files/${name}`;
  return `/api/v1/uploads/videos/${name}`;
}

function loadQa(lessonId: number): QaItem[] {
  try {
    return JSON.parse(localStorage.getItem(`lesson-qa-${lessonId}`) || "[]");
  } catch {
    return [];
  }
}

export default function StudentCoursePlayer() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params?.id);

  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<"qa" | "materials" | "homeworks" | "exams">("qa");
  const [rating, setRating] = useState(0);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaText, setQaText] = useState("");
  const [qaFile, setQaFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QaItem[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ full_name: payload.full_name || "O'quvchi", role: payload.role || "STUDENT" });
    } catch {
      setUser({ full_name: "O'quvchi" });
    }
  }, [router]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const myRes = await api.get("/student/my-course");
        const mine = Array.isArray(myRes.data?.data) ? myRes.data.data : Array.isArray(myRes.data) ? myRes.data : [];
        if (!mine.some((c: any) => Number(c.id) === courseId)) {
          if (!cancelled) setForbidden(true);
          return;
        }
        const res = await api.get(`/courses/${courseId}`);
        const data = res.data;
        const sections: Section[] = (data.sections || []).map((s: any) => ({
          ...s,
          lessons: s.lessons || [],
        }));
        if (cancelled) return;
        setCourse({ id: data.id, name: data.name, sections });
        const firstOpen: Record<number, boolean> = {};
        sections.forEach((s, i) => { firstOpen[s.id] = i === 0; });
        setOpenSections(firstOpen);
        const firstLesson = sections.find((s) => s.lessons?.length)?.lessons?.[0] || null;
        setActiveLesson(firstLesson);
      } catch (e) {
        console.error(e);
        if (!cancelled) setForbidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    setQuestions(loadQa(activeLesson.id));
    setRating(Number(localStorage.getItem(`lesson-rating-${activeLesson.id}`) || 0));
    setExamAnswers({});
    setExamSubmitted(false);
    setTab("qa");
  }, [activeLesson?.id]);

  // WebSocket for Live Q&A and Real-time Notifications
  useEffect(() => {
    const wsUrl = "ws://3.75.176.131:8080/ws";
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "qa_reply" || data.type === "notification") {
            const timeStr = new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

            if (data.questionId) {
              setQuestions(prev => prev.map(q => q.id === data.questionId ? {
                ...q,
                answer: data.text,
                answerAuthor: data.author || "Mentor",
                answerTime: timeStr
              } : q));
            }

            setNotifications(prev => [
              {
                id: Date.now(),
                senderName: data.author || "Mentor",
                courseName: course?.name || "Kurs",
                text: data.text || "Savolingizga yangi javob keldi",
                time: timeStr,
                isRead: false
              },
              ...prev
            ]);
          }
        } catch {}
      };

      socket.onerror = () => {
        setWsConnected(false);
      };

      socket.onclose = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [course?.name]);

  const allLessons = useMemo(
    () => (course?.sections || []).flatMap((s) => s.lessons || []),
    [course]
  );
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : null;

  const saveQuestion = () => {
    if (!activeLesson || !qaText.trim()) {
      alert("Savol matnini kiriting");
      return;
    }
    const item: QaItem = {
      id: String(Date.now()),
      text: qaText.trim(),
      author: user?.full_name || "O'quvchi",
      createdAt: new Date().toLocaleString("uz-UZ"),
      fileName: qaFile?.name,
    };
    const next = [item, ...questions];
    setQuestions(next);
    localStorage.setItem(`lesson-qa-${activeLesson.id}`, JSON.stringify(next));

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "qa_question",
        courseId: courseId,
        lessonId: activeLesson.id,
        questionId: item.id,
        text: qaText.trim(),
        author: user?.full_name || "O'quvchi"
      }));
    }

    setQaText("");
    setQaFile(null);
    setQaOpen(false);
  };

  const setLessonRating = (value: number) => {
    if (!activeLesson) return;
    setRating(value);
    localStorage.setItem(`lesson-rating-${activeLesson.id}`, String(value));
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const examScore = useMemo(() => {
    const exams = activeLesson?.exams || [];
    if (!examSubmitted || !exams.length) return null;
    const correct = exams.filter((q) => examAnswers[q.id] === q.answer).length;
    return { correct, total: exams.length };
  }, [activeLesson, examAnswers, examSubmitted]);

  const videoSrc = fileUrl(activeLesson?.file);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", fontFamily: "'Inter', sans-serif" }}>
      <aside style={{ width: 280, minWidth: 280, background: SIDEBAR_BG, display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 20px" }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{ color: BLUE }}>iT</span>
            <span style={{ color: "#fff" }}>live</span>
          </span>
        </div>
        <div style={{ padding: "0 14px 8px" }}>
          <div style={{ height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#94a3b8" }}>
            BOSHQARUV PANELI
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 14px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          <Link href="/student" style={{ textDecoration: "none" }}>
            <div style={{ height: 40, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
              <GridViewOutlined style={{ width: 17, height: 17 }} /> Barcha kurslar
            </div>
          </Link>
          <Link href="/student" style={{ textDecoration: "none" }}>
            <div style={{ height: 40, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, background: "rgba(59,130,246,0.18)", color: "#60a5fa", fontSize: 14, fontWeight: 700 }}>
              <BookOutlined style={{ width: 17, height: 17 }} /> Mening kurslarim
            </div>
          </Link>
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 64, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            Student
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* NOTIFICATION BELL WITH UNREAD BADGE & DROPDOWN */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotificationsOpen(p => !p)} style={{ width: 40, height: 40, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16, fontWeight: 700 } }}>
                  <NotificationsNoneOutlined style={{ width: 20, height: 20, color: unreadCount > 0 ? BLUE : "#64748b" }} />
                </Badge>
              </button>

              {notificationsOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setNotificationsOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", padding: "12px 0", zIndex: 50 }}>
                    <div style={{ padding: "0 16px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Bildirishnomalar</span>
                        {unreadCount > 0 && <span style={{ background: "#eff6ff", color: BLUE, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{unreadCount} yangi</span>}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: BLUE, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <DoneAllOutlined style={{ width: 14, height: 14 }} /> Barchasi o'qildi
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Bildirishnomalar yo'q</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => { setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x)); setTab("qa"); setNotificationsOpen(false); }}
                            style={{ padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: n.isRead ? "transparent" : "#eff6ff", borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: BLUE, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials(n.senderName)}</Avatar>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{n.senderName}</span>
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>{n.time}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.text}</div>
                            </div>
                            {!n.isRead && <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, marginTop: 5, flexShrink: 0 }} />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: BLUE, fontSize: 11, fontWeight: 700 }}>{initials(user?.full_name || "I")}</Avatar>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{user?.full_name || "O'quvchi"}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>O'quvchi</div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={36} style={{ color: BLUE }} />
            </div>
          ) : forbidden || !course ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Bu kursga kirish mumkin emas</div>
              <Link href="/student" style={{ color: BLUE, fontWeight: 600 }}>Kurslar ro'yxatiga qaytish</Link>
            </div>
          ) : (
            <>
              <aside style={{ width: 300, minWidth: 300, background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto", padding: 16 }}>
                <Link href="/student" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: BLUE, fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 16 }}>
                  <ArrowBack style={{ width: 16, height: 16 }} /> Kurslar ro'yxatiga qaytish
                </Link>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "8px 0 16px" }}>{course.name}</h2>
                {(course.sections || []).map((section) => (
                  <div key={section.id} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => setOpenSections((p) => ({ ...p, [section.id]: !p[section.id] }))}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", padding: "8px 4px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#334155" }}
                    >
                      {section.name}
                      {openSections[section.id] ? <KeyboardArrowUp style={{ width: 18, height: 18 }} /> : <KeyboardArrowDown style={{ width: 18, height: 18 }} />}
                    </button>
                    {openSections[section.id] && (section.lessons || []).map((lesson) => {
                      const active = lesson.id === activeLesson?.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
                            background: active ? "#eff6ff" : "transparent",
                            color: active ? BLUE : "#334155", fontWeight: active ? 700 : 500, fontSize: 13,
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? BLUE : "#cbd5e1", flexShrink: 0 }} />
                          {lesson.name}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </aside>

              <section style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {!activeLesson ? (
                  <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", color: "#94a3b8" }}>
                    Bu kursda hali dars yo'q
                  </div>
                ) : (
                  <div style={{ maxWidth: 920 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{activeLesson.name}</h1>
                      {nextLesson && (
                        <button onClick={() => setActiveLesson(nextLesson)} style={{ height: 38, padding: "0 16px", background: BLUE, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Keyingi dars →
                        </button>
                      )}
                    </div>

                    <div style={{ background: "#000", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                      {videoSrc ? (
                        <video key={videoSrc} src={videoSrc} controls style={{ width: "100%", maxHeight: 480, display: "block" }} />
                      ) : (
                        <div style={{ height: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 8 }}>
                          <PlayCircleFilledWhiteOutlined style={{ width: 48, height: 48 }} />
                          Video yuklanmagan
                        </div>
                      )}
                    </div>

                    {activeLesson.description && (
                      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: "0 0 20px" }}>{activeLesson.description}</p>
                    )}

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Darsni baholashni istaysizmi?</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setLessonRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                            {rating >= n ? <StarOutlined style={{ color: "#f59e0b" }} /> : <StarBorderOutlined style={{ color: "#cbd5e1" }} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                      {([
                        ["qa", "Q&A"],
                        ["materials", "Materiallar"],
                        ["homeworks", "Vazifalar"],
                        ["exams", "Imtihonlar"],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setTab(key)}
                          style={{
                            height: 38, padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                            border: tab === key ? "none" : "1px solid #e2e8f0",
                            background: tab === key ? BLUE : "#fff",
                            color: tab === key ? "#fff" : "#64748b",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
                      {tab === "qa" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Savol va javoblar</h3>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: wsConnected ? "#22c55e" : "#e53935", display: "inline-block" }} />
                                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{wsConnected ? "Live WebSocket" : "Online"}</span>
                              </div>
                              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Savollar: {questions.length} ta · Javoblar: {questions.filter(q => q.answer).length} ta</div>
                            </div>
                            <button onClick={() => setQaOpen(true)} style={{ height: 38, padding: "0 16px", background: BLUE, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                              Savol so'rash
                            </button>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Barcha savollar</div>
                          {questions.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: 14 }}>Hali savollar yo'q. Birinchi bo'lib savol bering!</div>
                          ) : questions.map((q) => (
                            <div key={q.id} style={{ padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: "#2563eb", fontSize: 14, fontWeight: 700 }}>{initials(q.author)}</Avatar>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 800, color: "#991b1b", fontSize: 15 }}>{q.author}</div>
                                  <div style={{ fontSize: 14, color: "#0f172a", marginTop: 4, fontWeight: 500 }}>{q.text}</div>
                                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{q.createdAt}</div>

                                  {/* Mentor Answer (nested card matching user image) */}
                                  {q.answer ? (
                                    <div style={{ display: "flex", gap: 12, marginTop: 14, background: "#f8f9fa", borderRadius: 12, padding: "14px 18px", border: "1px solid #f1f5f9" }}>
                                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#16a34a", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials(q.answerAuthor || "Mentor")}</Avatar>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                          <span style={{ fontWeight: 800, color: "#16a34a", fontSize: 14 }}>{q.answerAuthor || "Mentor"}</span>
                                          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>(mentor)</span>
                                        </div>
                                        <div style={{ fontSize: 14, color: "#0f172a", marginTop: 4, fontWeight: 500 }}>{q.answer}</div>
                                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{q.answerTime || q.createdAt}</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Hali javob berilmagan</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {tab === "materials" && (
                        <>
                          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Materiallar</h3>
                          {!(activeLesson.materials || []).length ? (
                            <div style={{ color: "#94a3b8" }}>Bu dars uchun material yo'q</div>
                          ) : (activeLesson.materials || []).map((m) => (
                            <div key={m.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ fontSize: 14, color: "#334155", marginBottom: 8 }}>{m.description}</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {(m.files || []).map((f) => (
                                  <a key={f.id} href={fileUrl(f.file)} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#eff6ff", color: BLUE, borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                    {f.file?.toLowerCase().endsWith(".pdf") ? <PictureAsPdfOutlined style={{ width: 16, height: 16 }} /> : <InsertDriveFileOutlined style={{ width: 16, height: 16 }} />}
                                    {f.file?.split(/[/\\]/).pop()}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {tab === "homeworks" && (
                        <>
                          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Vazifalar</h3>
                          {!(activeLesson.homeworks || []).length ? (
                            <div style={{ color: "#94a3b8", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24 }}>
                              <AssignmentOutlined style={{ color: "#f59e0b" }} /> Hali vazifa qo'shilmagan
                            </div>
                          ) : (activeLesson.homeworks || []).map((h) => (
                            <div key={h.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ fontSize: 14, color: "#334155" }}>{h.description}</div>
                              {h.file && (
                                <a href={fileUrl(h.file)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, color: BLUE, fontWeight: 700, fontSize: 13 }}>
                                  Faylni ochish
                                </a>
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {tab === "exams" && (
                        <>
                          <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Imtihonlar</h3>
                          {!(activeLesson.exams || []).length ? (
                            <div style={{ color: "#94a3b8" }}>Bu dars uchun savol yo'q</div>
                          ) : (
                            <>
                              {(activeLesson.exams || []).map((q, idx) => (
                                <div key={q.id} style={{ marginBottom: 18 }}>
                                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{idx + 1}. {q.question}</div>
                                  {(["variantA", "variantB", "variantC", "variantD"] as const).map((v) => (
                                    <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, cursor: "pointer" }}>
                                      <input
                                        type="radio"
                                        name={`exam-${q.id}`}
                                        checked={examAnswers[q.id] === v}
                                        disabled={examSubmitted}
                                        onChange={() => setExamAnswers((p) => ({ ...p, [q.id]: v }))}
                                      />
                                      {q[v]}
                                      {examSubmitted && q.answer === v && <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 12 }}>To'g'ri javob</span>}
                                    </label>
                                  ))}
                                </div>
                              ))}
                              {!examSubmitted ? (
                                <button onClick={() => setExamSubmitted(true)} style={{ height: 38, padding: "0 18px", background: BLUE, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                                  Tekshirish
                                </button>
                              ) : (
                                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                                  Natija: {examScore?.correct}/{examScore?.total}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {qaOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)" }} onClick={() => setQaOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 480, background: "#fff", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Savol so'rash</h2>
              <button onClick={() => setQaOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><CloseOutlined /></button>
            </div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Savol matni</label>
            <textarea value={qaText} onChange={(e) => setQaText(e.target.value)} rows={5} placeholder="Savolingizni yozing..." style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", color: "#64748b", fontSize: 13 }}>
              <CloudUploadOutlined style={{ width: 18, height: 18 }} />
              Fayl biriktirish (ixtiyoriy)
              <input type="file" hidden onChange={(e) => setQaFile(e.target.files?.[0] || null)} />
            </label>
            {qaFile && <div style={{ fontSize: 12, color: "#16a34a", marginTop: 6 }}>{qaFile.name}</div>}
            <button onClick={saveQuestion} style={{ marginTop: 16, height: 40, padding: "0 18px", background: BLUE, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <SendOutlined style={{ width: 16, height: 16 }} /> Yuborish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
