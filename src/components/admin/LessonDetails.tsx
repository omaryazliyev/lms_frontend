import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { CircularProgress } from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";

type Material = {
  id: number;
  description: string;
  lessonId?: number;
  files: { id: number; file: string }[];
  lesson?: { id: number; name: string };
  lessons?: { id: number; name: string };
};

type Homework = {
  id: number;
  description: string;
  file: string | null;
  lessonId?: number;
  lesson?: { id: number; name: string };
  lessons?: { id: number; name: string };
};

const asList = (data: any) => (Array.isArray(data) ? data : []);
const relatedLesson = (row: { lesson?: { id: number; name: string }; lessons?: { id: number; name: string } }) =>
  row.lesson || row.lessons;
const belongsToLesson = (row: { lessonId?: number; lesson?: { id: number }; lessons?: { id: number } }, lessonId: number) =>
  Number(row.lessonId ?? relatedLesson(row as any)?.id) === Number(lessonId);
const showApiError = (e: any, fallback: string) => {
  const msg = e?.response?.data?.message;
  alert(Array.isArray(msg) ? msg.join("\n") : (msg || fallback));
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 14px",
  border: "1px solid #e2e8f0", borderRadius: 10,
  fontSize: 13, color: "#1e293b",
  outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

function getFileIcon(fileUrl: string) {
  if (fileUrl.toLowerCase().endsWith(".pdf")) {
    return <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "#fef2f2", color: "#ef4444", borderRadius: 6, fontSize: 11, fontWeight: 600 }}><PictureAsPdfOutlined style={{ width: 14, height: 14 }} /> PDF</div>;
  }
  return <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", borderRadius: 6, fontSize: 11, fontWeight: 600 }}><InsertDriveFileOutlined style={{ width: 14, height: 14 }} /> Excel</div>;
}

/* ======================== MATERIALS TAB ======================== */
function MaterialsSection({ lesson }: { lesson: any }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [form, setForm] = useState({ description: "" });
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [editRow, setEditRow] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({ description: "" });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get("/materials");
      setMaterials(asList(res.data).filter((m: any) => belongsToLesson(m, lesson.id)));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMaterials(); }, [lesson.id]);

  const handleAdd = async () => {
    if (!form.description.trim()) {
      alert("Iltimos, material uchun izoh kiriting");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("lessonId", String(lesson.id));
      fd.append("description", form.description.trim());
      materialFiles.forEach(f => fd.append("files", f));
      await api.post("/materials", fd);
      await fetchMaterials();
      setAddOpen(false);
      setForm({ description: "" });
      setMaterialFiles([]);
    } catch (e) {
      console.error(e);
      showApiError(e, "Material qo'shishda xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.description.trim()) return;
    try {
      const fd = new FormData();
      fd.append("description", editForm.description.trim());
      materialFiles.forEach(f => fd.append("files", f));
      await api.patch(`/materials/${editRow.id}`, fd);
      await fetchMaterials();
      setEditOpen(false);
      setMaterialFiles([]);
    } catch (e) {
      console.error(e);
      showApiError(e, "Materialni tahrirlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/materials/${deleteTargetId}`);
      await fetchMaterials();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setAddOpen(true); setForm({ description: "" }); setMaterialFiles([]); }}
          style={{ padding: "0 18px", height: 40, background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", width: "40%" }}>Material uchun izoh</th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Biriktirilgan fayllar <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Material topilmadi.</td></tr>
            ) : materials.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 500, color: "#475569" }}>{relatedLesson(row)?.name || lesson.name || "-"}</td>
                <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{row.description}</td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {row.files?.map(f => <React.Fragment key={f.id}>{getFileIcon(f.file)}</React.Fragment>)}
                  </div>
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => { setEditRow(row); setEditForm({ description: row.description }); setMaterialFiles([]); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
                    <button onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", fontSize: 13, color: "#475569" }}>
          <span>Umumiy {materials.length}ta</span>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", fontWeight: 500, cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, background: "#16a34a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <DownloadOutlined style={{ width: 14, height: 14 }} />
            </div>
            ({materials.length}) Yuklab olish .XLS
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Material qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars</label>
              <input type="text" disabled value={lesson.name} style={{ ...inputStyle, marginBottom: 16, background: "#f1f5f9" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Material uchun izoh</label>
              <input type="text" placeholder="Kiriting" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Fayl biriktirish</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#3b82f6", fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>SVG, PNG, JPG or GIF (max. 800x400px)</div>
                <input type="file" multiple onChange={e => setMaterialFiles(Array.from(e.target.files || []))} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                {materialFiles.length > 0 && <div style={{ marginTop: 12, fontSize: 12, color: "#10b981", fontWeight: 500 }}>{materialFiles.map(f => f.name).join(", ")}</div>}
              </div>
              <button onClick={handleAdd} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Saqlash</button>
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
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Dars</label>
              <input type="text" disabled value={lesson.name} style={{ ...inputStyle, marginBottom: 16, background: "#f1f5f9" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Material uchun izoh</label>
              <input type="text" placeholder="Kiriting" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Fayl biriktirish (Qo'shimcha)</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden", marginBottom: 12 }}>
                <CloudUploadOutlined style={{ width: 28, height: 28, color: "#64748b", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#3b82f6", fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>SVG, PNG, JPG or GIF (max. 800x400px)</div>
                <input type="file" multiple onChange={e => setMaterialFiles(Array.from(e.target.files || []))} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>
              {editRow?.files?.map(f => (
                <div key={f.id} style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "16px", background: "#fff", display: "flex", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, background: f.file.endsWith(".pdf") ? "#fef2f2" : "#f0fdf4", color: f.file.endsWith(".pdf") ? "#ef4444" : "#16a34a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {f.file.endsWith(".pdf") ? <PictureAsPdfOutlined style={{ width: 20, height: 20 }} /> : <InsertDriveFileOutlined style={{ width: 20, height: 20 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{f.file}</div>
                      <CheckCircleOutlined style={{ width: 16, height: 16, color: "#3b82f6" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Yuklangan</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                        <div style={{ width: "100%", height: "100%", background: "#3b82f6", borderRadius: 3 }}></div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>100%</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleEdit} style={{ marginTop: 24, padding: "0 24px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Saqlash</button>
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
    </>
  );
}

/* ======================== HOMEWORKS TAB ======================== */
function HomeworksSection({ lesson }: { lesson: any }) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [form, setForm] = useState({ description: "" });
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [editRow, setEditRow] = useState<Homework | null>(null);
  const [editForm, setEditForm] = useState({ description: "" });

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homeworks");
      setHomeworks(asList(res.data).filter((h: any) => belongsToLesson(h, lesson.id)));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHomeworks(); }, [lesson.id]);

  const handleAdd = async () => {
    if (!form.description.trim()) {
      alert("Iltimos, vazifa matnini kiriting");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("lessonId", String(lesson.id));
      fd.append("description", form.description.trim());
      if (hwFile) fd.append("file", hwFile);
      await api.post("/homeworks", fd);
      await fetchHomeworks();
      setAddOpen(false);
      setForm({ description: "" });
      setHwFile(null);
    } catch (e) {
      console.error(e);
      showApiError(e, "Vazifa qo'shishda xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.description.trim()) return;
    try {
      const fd = new FormData();
      fd.append("description", editForm.description.trim());
      if (hwFile) fd.append("file", hwFile);
      await api.patch(`/homeworks/${editRow.id}`, fd);
      await fetchHomeworks();
      setEditOpen(false);
      setHwFile(null);
    } catch (e) {
      console.error(e);
      showApiError(e, "Vazifani tahrirlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/homeworks/${deleteTargetId}`);
      await fetchHomeworks();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setAddOpen(true); setForm({ description: "" }); setHwFile(null); }}
          style={{ padding: "0 18px", height: 40, background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Vazifa qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Dars <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", width: "45%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Topshiriq <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Fayl <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
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
            ) : homeworks.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 500, color: "#475569" }}>{relatedLesson(row)?.name || lesson.name || "-"}</td>
                <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{row.description}</td>
                <td style={{ padding: "16px 20px" }}>
                  {row.file ? getFileIcon(row.file) : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => { setEditRow(row); setEditForm({ description: row.description }); setHwFile(null); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
                    <button onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", fontSize: 13, color: "#475569" }}>
          <span>Umumiy {homeworks.length}ta</span>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", fontWeight: 500, cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, background: "#16a34a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <DownloadOutlined style={{ width: 14, height: 14 }} />
            </div>
            ({homeworks.length}) Yuklab olish .XLS
          </button>
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
              <input type="text" disabled value={lesson.name} style={{ ...inputStyle, marginBottom: 16, background: "#f1f5f9", color: "#64748b" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Topshiriq</label>
              <input type="text" placeholder="Kiriting" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Fayl</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "28px 24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden", marginBottom: 16 }}>
                <CloudUploadOutlined style={{ width: 32, height: 32, color: "#94a3b8", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#3b82f6", fontWeight: 600 }}>Bu yerga bosing</span> yoki faylni suring</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>XLS, CSV</div>
                <input type="file" onChange={e => setHwFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                {hwFile && <div style={{ marginTop: 12, fontSize: 12, color: "#10b981", fontWeight: 500 }}>{hwFile.name}</div>}
              </div>
              <button onClick={handleAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>✓</span> Saqlaish
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
              <input type="text" disabled value={lesson.name} style={{ ...inputStyle, marginBottom: 16, background: "#f1f5f9", color: "#64748b" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Topshiriq</label>
              <input type="text" placeholder="Kiriting" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Fayl biriktirish</label>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "28px 24px", textAlign: "center", background: "#f8fafc", position: "relative", overflow: "hidden", marginBottom: 12 }}>
                <CloudUploadOutlined style={{ width: 32, height: 32, color: "#94a3b8", marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><span style={{ color: "#3b82f6", fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>SVG, PNG, JPG or GIF (max. 800×400px)</div>
                <input type="file" onChange={e => setHwFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>
              {editRow?.file && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, background: "#fef2f2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PictureAsPdfOutlined style={{ width: 22, height: 22, color: "#ef4444" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{editRow.file.split('/').pop()?.split('?')[0] || editRow.file}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>4.2 MB</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3 }}>
                        <div style={{ width: "100%", height: "100%", background: "#3b82f6", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>100%</span>
                    </div>
                  </div>
                  <CheckCircleOutlined style={{ width: 18, height: 18, color: "#3b82f6", flexShrink: 0 }} />
                </div>
              )}
              <button onClick={handleEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>✓</span> Saqlash
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
    </>
  );
}

/* ======================== EXAMS TAB ======================== */
type Exam = {
  id: number;
  question: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  answer: string;
  lessonId: number;
};

const variantLabels: Record<string, string> = { variantA: "A", variantB: "B", variantC: "C", variantD: "D" };

const QuestionForm = ({ data, onChange, inputStyle }: { data: any; onChange: (d: any) => void; inputStyle: any }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Savol</label>
    <input type="text" placeholder="Kiriting" value={data.question} onChange={e => onChange({ ...data, question: e.target.value })} style={{ ...inputStyle, marginBottom: 16 }} />
    {(["variantA", "variantB", "variantC", "variantD"] as const).map(v => (
      <div key={v} style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{variantLabels[v]} variant</label>
        <input type="text" placeholder="Kiriting" value={data[v]} onChange={e => onChange({ ...data, [v]: e.target.value })} style={{ ...inputStyle, marginBottom: 6 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: data.answer === v ? "#3b82f6" : "#64748b", fontWeight: data.answer === v ? 600 : 400 }}>
          <input type="checkbox" checked={data.answer === v} onChange={() => onChange({ ...data, answer: v })} style={{ width: 15, height: 15, accentColor: "#3b82f6" }} />
          To'g'ri javob
        </label>
      </div>
    ))}
  </div>
);

function ExamsSection({ lesson }: { lesson: any }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<Exam | null>(null);

  const emptyForm = { question: "", variantA: "", variantB: "", variantC: "", variantD: "", answer: "variantA" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exams");
      setExams(asList(res.data).filter((e: Exam) => Number(e.lessonId) === Number(lesson.id)));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchExams(); }, [lesson.id]);

  const handleAdd = async () => {
    if (!form.question.trim() || !form.variantA.trim() || !form.variantB.trim() || !form.variantC.trim() || !form.variantD.trim()) {
      alert("Iltimos, savol va barcha variantlarni to'ldiring");
      return;
    }
    try {
      await api.post("/exams", { ...form, lessonId: Number(lesson.id) });
      await fetchExams();
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      showApiError(e, "Savol qo'shishda xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!editRow) return;
    try {
      await api.patch(`/exams/${editRow.id}`, editForm);
      await fetchExams();
      setEditOpen(false);
    } catch (e) {
      console.error(e);
      showApiError(e, "Savolni tahrirlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/exams/${deleteTargetId}`);
      await fetchExams();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  // variantLabels and QuestionForm were moved outside to prevent re-mounting and losing focus

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setAddOpen(true); setForm(emptyForm); }}
          style={{ padding: "0 18px", height: 40, background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} /> Savol qo'shish
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a", width: 40 }}>№</th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Savol <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>A javob <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>B javob <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>C javob <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>D javob <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /></div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 60, textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 56, height: 56, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AssignmentOutlined style={{ width: 28, height: 28, color: "#3b82f6" }} />
                    </div>
                    <div style={{ fontSize: 14, color: "#94a3b8" }}>Hali savol qo'shilmagan</div>
                  </div>
                </td>
              </tr>
            ) : exams.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{idx + 1}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500, color: "#0f172a", maxWidth: 200 }}>{row.question}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>{row.variantA}</span>
                    {row.answer === "variantA" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 7px", width: "fit-content" }}>To'g'ri javob</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>{row.variantB}</span>
                    {row.answer === "variantB" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 7px", width: "fit-content" }}>To'g'ri javob</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>{row.variantC}</span>
                    {row.answer === "variantC" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 7px", width: "fit-content" }}>To'g'ri javob</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>{row.variantD}</span>
                    {row.answer === "variantD" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 7px", width: "fit-content" }}>To'g'ri javob</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => { setEditRow(row); setEditForm({ question: row.question, variantA: row.variantA, variantB: row.variantB, variantC: row.variantC, variantD: row.variantD, answer: row.answer }); setEditOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><EditOutlined style={{ width: 16, height: 16 }} /></button>
                    <button onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Savol qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <QuestionForm data={form} onChange={setForm} inputStyle={inputStyle} />
              <button onClick={handleAdd} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <CheckCircleOutlined style={{ width: 16, height: 16 }} /> Saqlash
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
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              <QuestionForm data={editForm} onChange={setEditForm} inputStyle={inputStyle} />
              <button onClick={handleEdit} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <CheckCircleOutlined style={{ width: 16, height: 16 }} /> Saqlash
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
    </>
  );
}

/* ======================== MAIN COMPONENT ======================== */
export default function LessonDetails({ lesson, onBack }: { lesson: any; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("Materiallar");
  const [fullLesson, setFullLesson] = useState<any>(lesson);

  useEffect(() => {
    setFullLesson(lesson);
    if (!lesson?.id) return;
    api.get(`/lessons/${lesson.id}`)
      .then((res) => setFullLesson({ ...lesson, ...res.data }))
      .catch(() => {});
  }, [lesson?.id]);

  const courseName =
    fullLesson?.section?.course?.name ||
    fullLesson?.sections?.course?.name ||
    fullLesson?.sections?.courses?.name ||
    "Noma'lum";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Darslar</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
          <span style={{ cursor: "pointer" }} onClick={onBack}>Kurslar</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
          <span>{courseName}</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
          <span>Bo'limlar</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
          <span style={{ cursor: "pointer" }} onClick={onBack}>Darslar</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
          <span style={{ color: "#475569", fontWeight: 500 }}>{fullLesson?.name || lesson.name}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {["Materiallar", "Vazifalar", "Imtihonlar"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0 20px", height: 40,
              background: activeTab === tab ? "#3b82f6" : "#fff",
              color: activeTab === tab ? "#fff" : "#64748b",
              border: activeTab === tab ? "none" : "1px solid #e2e8f0",
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Materiallar" && <MaterialsSection lesson={fullLesson} />}
      {activeTab === "Vazifalar" && <HomeworksSection lesson={fullLesson} />}
      {activeTab === "Imtihonlar" && <ExamsSection lesson={fullLesson} />}
    </div>
  );
}
