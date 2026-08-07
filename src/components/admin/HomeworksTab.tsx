import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { CircularProgress } from "@mui/material";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CustomSelect from "../ui/CustomSelect";

type Homework = {
  id: number;
  description: string;
  file: string | null;
  create_at: string;
  lessons: { id: number; name: string; sections?: { name: string; courses?: { name: string } } };
};

type Lesson = { id: number; name: string };

type HomeworksTabProps = {
  initialLessonId?: number | null;
};

export default function HomeworksTab({ initialLessonId }: HomeworksTabProps) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [form, setForm] = useState({ description: "", lessonId: "" });
  const [hwFile, setHwFile] = useState<File | null>(null);

  const [editRow, setEditRow] = useState<Homework | null>(null);
  const [editForm, setEditForm] = useState({ description: "", lessonId: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hwRes, lesRes] = await Promise.all([
        api.get("/homeworks"),
        api.get("/lessons"),
      ]);
      setHomeworks(hwRes.data);
      setLessons(lesRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // If navigated from Darslar with a lesson pre-selected, open add modal
    if (initialLessonId) {
      setAddOpen(true);
      setForm({ description: "", lessonId: initialLessonId.toString() });
      setHwFile(null);
    }
  }, [initialLessonId]);

  const handleAdd = async () => {
    if (!form.description || !form.lessonId) return;
    try {
      const fd = new FormData();
      fd.append("lessonId", form.lessonId);
      fd.append("description", form.description);
      if (hwFile) fd.append("file", hwFile);
      await api.post("/homeworks", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchData();
      setAddOpen(false);
      setForm({ description: "", lessonId: "" });
      setHwFile(null);
    } catch (e) { console.error(e); }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.description) return;
    try {
      const fd = new FormData();
      fd.append("description", editForm.description);
      if (editForm.lessonId) fd.append("lessonId", editForm.lessonId);
      if (hwFile) fd.append("file", hwFile);
      await api.patch(`/homeworks/${editRow.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchData();
      setEditOpen(false);
      setHwFile(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/homeworks/${deleteTargetId}`);
      await fetchData();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 42, padding: "0 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, color: "#1e293b",
    outline: "none", boxSizing: "border-box",
  };

  const paginated = homeworks.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Vazifalar</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
            <span>Kurslar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>Vazifalar</span>
          </div>
        </div>
        <button onClick={() => {
            setAddOpen(true);
            setForm({ description: "", lessonId: "" });
            setHwFile(null);
          }} style={{ padding: "0 18px", height: 40, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Vazifa qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", width: "45%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Vazifa ta'rifi <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Biriktirilgan fayl <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
                </th>
                <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
              ) : homeworks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 56, height: 56, background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AssignmentOutlined style={{ width: 28, height: 28, color: "#f59e0b" }} />
                      </div>
                      <div style={{ fontSize: 14, color: "#94a3b8" }}>Hali vazifa qo'shilmagan</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 500, color: "#475569" }}>{row.lessons?.name}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{row.description}</td>
                    <td style={{ padding: "16px 20px" }}>
                      {row.file ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#fef3c7", color: "#92400e", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                          <AssignmentOutlined style={{ width: 14, height: 14 }} /> Fayl
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => { setEditRow(row); setEditForm({ description: row.description, lessonId: row.lessons?.id?.toString() }); setHwFile(null); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
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
            <span>Sahifada {Math.min((page-1)*perPage+1, homeworks.length)}-{Math.min(page*perPage, homeworks.length)} gacha. Umumiy {homeworks.length}ta</span>
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", fontWeight: 500, cursor: "pointer" }}>
              <div style={{ width: 24, height: 24, background: "#16a34a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <DownloadOutlined style={{ width: 14, height: 14 }} />
              </div>
              ({homeworks.length}) Yuklab olish .XLS
            </button>
          </div>
          {Math.ceil(homeworks.length / perPage) > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {Array.from({ length: Math.ceil(homeworks.length / perPage) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, background: p === page ? "#3b82f6" : "none", color: p === page ? "#fff" : "#475569", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Vazifa qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars</label>
              <div style={{ marginBottom: 16 }}>
                <CustomSelect 
                  value={form.lessonId} 
                  onChange={v => setForm({ ...form, lessonId: v })}
                  options={lessons.map(l => ({ value: String(l.id), label: l.name }))}
                />
              </div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Vazifa ta'rifi</label>
              <input type="text" placeholder="Kiriting" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Fayl biriktirish (ixtiyoriy)</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>PDF, DOCX, PNG va boshqalar</div>
                <input type="file" onChange={e => setHwFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                {hwFile && <div style={{ marginTop: 12, fontSize: 12, color: "#10b981", fontWeight: 500 }}>{hwFile.name}</div>}
              </div>
              <button onClick={handleAdd} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#f59e0b", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setEditOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Vazifani tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars</label>
              <div style={{ marginBottom: 16 }}>
                <CustomSelect 
                  value={editForm.lessonId} 
                  onChange={v => setEditForm({ ...editForm, lessonId: v })}
                  options={lessons.map(l => ({ value: String(l.id), label: l.name }))}
                />
              </div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Vazifa ta'rifi</label>
              <input type="text" placeholder="Kiriting" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Yangi fayl (ixtiyoriy)</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden", marginBottom: 12 }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>PDF, DOCX, PNG va boshqalar</div>
                <input type="file" onChange={e => setHwFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>
              {editRow?.file && (
                <div style={{ border: "1px dashed #fde68a", borderRadius: 12, padding: "16px", background: "#fffbeb", display: "flex", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, background: "#fef3c7", color: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <AssignmentOutlined style={{ width: 20, height: 20 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{editRow.file}</div>
                      <CheckCircleOutlined style={{ width: 16, height: 16, color: "#f59e0b" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Yuklangan</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 6, background: "#fde68a", borderRadius: 3 }}>
                        <div style={{ width: "100%", height: "100%", background: "#f59e0b", borderRadius: 3 }}></div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>100%</span>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={handleEdit} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#f59e0b", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, padding: "30px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>?</div>
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
