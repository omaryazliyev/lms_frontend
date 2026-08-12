import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { CircularProgress } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import CustomSelect from "../ui/CustomSelect";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import LessonsTab from "./LessonsTab";

type Section = {
  id: number;
  name: string;
  create_at: string;
  course: { id: number; name: string };
};

type Course = { id: number; name: string };

type Props = {
  course?: Course;
  onBack?: () => void;
};

export default function SectionsTab({ course, onBack }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [form, setForm] = useState({ name: "", courseId: course ? course.id.toString() : "" });
  const [editRow, setEditRow] = useState<Section | null>(null);
  const [editForm, setEditForm] = useState({ name: "", courseId: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [secRes, couRes] = await Promise.all([
        api.get("/sections"),
        api.get("/courses")
      ]);
      setSections(secRes.data);
      setCourses(couRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = sections
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => course ? s.course?.id === course.id : true);

  const handleAdd = async () => {
    if (!form.name) {
      alert("Iltimos, bo'lim nomini kiriting");
      return;
    }
    if (!form.courseId) {
      alert("Iltimos, kursni tanlang");
      return;
    }
    try {
      await api.post("/sections", { name: form.name, courseId: Number(form.courseId) });
      await fetchData();
      setAddOpen(false);
      setForm({ name: "", courseId: course ? course.id.toString() : "" });
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.name) {
      alert("Iltimos, bo'lim nomini kiriting");
      return;
    }
    try {
      await api.patch(`/sections/${editRow.id}`, { name: editForm.name, courseId: Number(editForm.courseId) });
      await fetchData();
      setEditOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/sections/${deleteTargetId}`);
      await fetchData();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 42, padding: "0 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
  };

  if (selectedSection) {
    return (
      <LessonsTab
        course={course}
        section={selectedSection}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Bo'limlar</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
            <span style={{ cursor: onBack ? "pointer" : "default", color: onBack ? "#3b82f6" : "inherit" }} onClick={onBack}>
              Kurslar
            </span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            {course ? (
              <>
                <span style={{ color: "#475569", fontWeight: 500 }}>{course.name}</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
              </>
            ) : null}
            <span style={{ color: "#475569", fontWeight: 500 }}>Bo'limlar</span>
          </div>
        </div>
        <button onClick={() => { setAddOpen(true); setForm({ name: "", courseId: course ? course.id.toString() : "" }); }} style={{ padding: "0 18px", height: 40, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Bo'lim qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Bo'lim nomi</th>
              <th style={{ padding: "14px 24px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, width: 150 }}>
                <FilterListOutlined style={{ width: 18, height: 18, color: "#94a3b8" }} /> Amallar
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Ma'lumot topilmadi.</td></tr>
            ) : (
              filtered.slice((page - 1) * perPage, page * perPage).map((row) => (
                <tr key={row.id} onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  setSelectedSection(row);
                }} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: "18px 24px", fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{row.name}</td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => { setEditRow(row); setEditForm({ name: row.name, courseId: row.courses?.id?.toString() }); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
                      <button onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#475569" }}>
          <span>Sahifada 0-10 gacha. Umumiy 2ta</span>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", fontWeight: 500, cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, background: "#16a34a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <DownloadOutlined style={{ width: 14, height: 14 }} />
            </div>
            (2) Yuklab olish .XLS
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#475569" }}>
          <span>Bir sahifada: 10 <span style={{fontSize: 10}}>▼</span></span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer" }}>1</button>
            <button style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer" }}>2</button>
            <button style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer" }}>3</button>
            <span>...</span>
            <button style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer" }}>15</button>
          </div>
          <button style={{ background: "none", border: "none", color: "#0f172a", fontWeight: 600, cursor: "pointer" }}>Keyingi</button>
        </div>
      </div>

      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Bo'lim qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24 }}>
              {!course && (
                <>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Biriktirilgan kurs</label>
                  <div style={{ marginBottom: 16 }}>
                    <CustomSelect 
                      value={form.courseId} 
                      onChange={v => setForm({ ...form, courseId: v })}
                      options={courses.map(c => ({ value: String(c.id), label: c.name }))}
                    />
                  </div>
                </>
              )}
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Bo'lim nomi</label>
              <input type="text" placeholder="Kiriting" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              
              <button onClick={handleAdd} style={{ marginTop: 24, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setEditOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24 }}>
              {!course && (
                <>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Biriktirilgan kurs</label>
                  <div style={{ marginBottom: 16 }}>
                    <CustomSelect 
                      value={editForm.courseId} 
                      onChange={v => setEditForm({ ...editForm, courseId: v })}
                      options={courses.map(c => ({ value: String(c.id), label: c.name }))}
                    />
                  </div>
                </>
              )}
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Bo'lim nomi</label>
              <input type="text" placeholder="Kiriting" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              
              <button onClick={handleEdit} style={{ marginTop: 24, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, padding: "30px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>
                ?
              </div>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 24px" }}>Rostdan ham o'chirmoqchimisiz?</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setDeleteOpen(false)} style={{ padding: "0 20px", height: 38, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleDelete} style={{ padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}>O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
