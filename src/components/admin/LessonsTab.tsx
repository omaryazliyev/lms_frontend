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
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import PlayCircleFilledWhiteOutlined from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";

type Lesson = {
  id: number;
  name: string;
  description: string;
  file: string | null;
  create_at: string;
  sections: { id: number; name: string; courses: { id: number; name: string } };
};

import LessonDetails from "./LessonDetails";

type Section = { id: number; name: string; courses: { name: string } };

export default function LessonsTab() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [playVideoUrl, setPlayVideoUrl] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "", sectionId: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const [editRow, setEditRow] = useState<Lesson | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", sectionId: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lesRes, secRes] = await Promise.all([
        api.get("/lessons"),
        api.get("/sections")
      ]);
      setLessons(lesRes.data);
      setSections(secRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = lessons.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name || !form.sectionId) return;
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("sectionId", form.sectionId);
      if (videoFile) formData.append("file", videoFile);

      await api.post("/lessons", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchData();
      setAddOpen(false);
      setForm({ name: "", description: "", sectionId: "" });
      setVideoFile(null);
    } catch (e) { console.error(e); }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.name) return;
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("sectionId", editForm.sectionId);
      if (videoFile) formData.append("file", videoFile);

      await api.patch(`/lessons/${editRow.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchData();
      setEditOpen(false);
      setVideoFile(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/lessons/${deleteTargetId}`);
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

  if (selectedLesson) {
    return <LessonDetails lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Darslar</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
            <span>Kurslar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span>Frontend dasturlash</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span>Bo'limlar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>Darslar</span>
          </div>
        </div>
        <button onClick={() => {
            setAddOpen(true);
            setForm({ name: "", description: "", sectionId: "" });
            setVideoFile(null);
          }} style={{ padding: "0 18px", height: 40, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Dars qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Biriktirilgan kurs <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars mavzusi <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", width: "30%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars haqida <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars video fayli <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>Materiallar</th>
                <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Ma'lumot topilmadi.</td></tr>
              ) : (
                filtered.slice((page - 1) * perPage, page * perPage).map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 500, color: "#475569" }}>{row.sections?.courses?.name || "Noma'lum kurs"}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 500, color: "#475569" }}>{row.name}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{row.description}</td>
                    <td style={{ padding: "16px 20px" }}>
                      {row.file ? (
                        <div onClick={() => setPlayVideoUrl(row.file!)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f0fdf4", color: "#16a34a", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          <PlayCircleFilledWhiteOutlined style={{ width: 16, height: 16 }} /> Video
                        </div>
                      ) : (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f8fafc", color: "#94a3b8", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                          <PlayCircleFilledWhiteOutlined style={{ width: 16, height: 16 }} /> Video yo'q
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <button onClick={() => setSelectedLesson(row)} style={{ padding: "6px 16px", height: 32, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Biriktirish
                      </button>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => { setEditRow(row); setEditForm({ name: row.name, description: row.description, sectionId: row.sections?.id?.toString() }); setVideoFile(null); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
                        <button onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
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
      </div>

      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Dars qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Bo'lim nomi</label>
              <div style={{ marginBottom: 16 }}>
                <CustomSelect 
                  value={form.sectionId} 
                  onChange={v => setForm({ ...form, sectionId: v })}
                  options={sections.map(s => ({ value: String(s.id), label: `${s.name} (${s.courses?.name})` }))}
                />
              </div>
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars nomi</label>
              <input type="text" placeholder="Kiriting" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars haqida</label>
              <input type="text" placeholder="Kiriting" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Video fayl</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Bu yerga bosing</span> yoki faylni suring
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>.mp4 yoki .MOV</div>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                {videoFile && <div style={{ marginTop: 12, fontSize: 13, color: "#10b981", fontWeight: 500 }}>Tanlandi: {videoFile.name}</div>}
              </div>
              
              <button onClick={handleAdd} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setEditOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Bo'lim nomi</label>
              <div style={{ marginBottom: 16 }}>
                <CustomSelect 
                  value={editForm.sectionId} 
                  onChange={v => setEditForm({ ...editForm, sectionId: v })}
                  options={sections.map(s => ({ value: String(s.id), label: `${s.name} (${s.courses?.name})` }))}
                />
              </div>
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars nomi</label>
              <input type="text" placeholder="Kiriting" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars haqida</label>
              <input type="text" placeholder="Kiriting" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Video fayl</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden", marginBottom: 12 }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Bu yerga bosing</span> yoki faylni suring
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>.mp4 yoki .MOV</div>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>

              {/* Fake Progress Bar for UI mockup matching */}
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "16px", background: "#fff", display: "flex", gap: 12, position: "relative" }}>
                <div style={{ width: 36, height: 36, background: "#3b82f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                  <PlayCircleFilledWhiteOutlined style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Kirish.mp4</div>
                    <CheckCircleOutlined style={{ width: 16, height: 16, color: "#3b82f6" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>4.2 MB</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", background: "#3b82f6", borderRadius: 3 }}></div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>100%</span>
                  </div>
                </div>
              </div>
              
              <button onClick={handleEdit} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
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

      {/* Video Play Modal */}
      {playVideoUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)" }} onClick={() => setPlayVideoUrl(null)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 800, background: "#000", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
              <button onClick={() => setPlayVideoUrl(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                <CloseOutlined style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <video 
              src={playVideoUrl.startsWith('http') ? playVideoUrl : `/api/v1/uploads/videos/${playVideoUrl.split('/').pop()}`} 
              controls 
              autoPlay 
              style={{ width: "100%", maxHeight: "80vh", display: "block" }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
