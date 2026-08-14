import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Avatar, CircularProgress } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PlayCircleOutlineOutlined from "@mui/icons-material/PlayCircleOutlineOutlined";
import CustomSelect from "../ui/CustomSelect";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import SectionsTab from "./SectionsTab";

type Course = {
  id: number;
  name: string;
  description: string;
  prise: number;
  level: string;
  banner: string | null;
  intro_video: string | null;
  categories?: { id: number; name: string };
  mentorProfile?: { id: number; users: { id: number; full_name: string } };
  user?: { id: number; full_name: string }; // Assistent
  users: {
    user: { id: number; full_name: string; role: string; file: string | null };
  }[];
};

type Category = { id: number; name: string };
type User = { id: number; full_name: string; role: string; file: string | null; mentorProfile?: { id: number }[] };

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // VIEW MODE
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(() => {
    // Restore from URL on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get("courseId");
      if (courseId) return { id: Number(courseId) } as any;
    }
    return null;
  });
  
  // BATAFSIL MODAL
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState<Course | null>(null);

  // ASSISTENT BIRIKTIRISH MODAL
  const [assistants, setAssistants] = useState<User[]>([]);
  const [assignAssistantOpen, setAssignAssistantOpen] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState("");

  // ADD FORM
  const [form, setForm] = useState({
    name: "", description: "", price: "",
    categoryId: "", mentorId: "", level: "BEGINNER"
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // EDIT FORM
  const [editForm, setEditForm] = useState({
    name: "", description: "", price: "",
    categoryId: "", mentorId: "", level: "BEGINNER"
  });
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cr, ct, ast] = await Promise.all([
        api.get("/courses"),
        api.get("/categories"),
        api.get("/assistant").catch(() => ({ data: [] }))
      ]);
      setCourses(cr.data);
      setCategories(ct.data);
      setAssistants(ast.data);
      
      const m = await api.get("/mentor").catch(() => ({ data: [] }));
      setMentors(m.data.length ? m.data : cr.data.map((c: any) => c.users?.map((u: any) => u.user)).flat());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.categoryId || !form.mentorId) {
      alert("Majburiy maydonlarni to'ldiring");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description || "Ta'rif");
      formData.append("prise", form.price); // Backend uses "prise" based on DTO
      formData.append("categoryId", form.categoryId);
      formData.append("mentorId", form.mentorId); 
      formData.append("level", form.level);
      
      if (bannerFile) formData.append("banner", bannerFile);
      if (videoFile) formData.append("intro_video", videoFile);

      await api.post("/courses", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchAll();
      setAddOpen(false);
      setSuccessMsg("Muvaffaqiyatli qo'shildi");
      setForm({ name: "", description: "", price: "", categoryId: "", mentorId: "", level: "BEGINNER" });
      setBannerFile(null);
      setVideoFile(null);
    } catch (e: any) {
      console.error(e);
      alert("Xato yuz berdi");
    }
  };

  const openEdit = (course: Course) => {
    setEditTargetId(course.id);
    setEditForm({
      name: course.name,
      description: course.description || "",
      price: String(course.prise || ""),
      categoryId: String(course.categories?.id || ""),
      mentorId: String(course.users?.[0]?.user?.id || ""), // Adjust depending on actual backend mentor link
      level: course.level || "BEGINNER",
    });
    setEditBannerFile(null);
    setEditVideoFile(null);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTargetId) return;
    try {
      const formData = new FormData();
      if (editForm.name) formData.append("name", editForm.name);
      if (editForm.description) formData.append("description", editForm.description);
      if (editForm.price) formData.append("prise", editForm.price);
      if (editForm.categoryId) formData.append("categoryId", editForm.categoryId);
      if (editForm.mentorId) formData.append("mentorId", editForm.mentorId);
      if (editForm.level) formData.append("level", editForm.level);

      if (editBannerFile) formData.append("banner", editBannerFile);
      if (editVideoFile) formData.append("intro_video", editVideoFile);

      await api.patch(`/courses/${editTargetId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchAll();
      setEditOpen(false);
      setSuccessMsg("Muvaffaqiyatli o'zgartirildi");
    } catch (e: any) {
      console.error(e);
      alert("Xato yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/courses/${deleteTargetId}`);
      await fetchAll();
      setDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleAssignAssistant = async () => {
    if (!viewCourse || !selectedAssistantId) return;
    try {
      const formData = new FormData();
      formData.append("assistentId", selectedAssistantId);
      await api.patch(`/courses/${viewCourse.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchAll();
      // Update local viewCourse object to show assigned instantly
      const updatedAssistant = assistants.find(a => a.id === Number(selectedAssistantId));
      if (updatedAssistant) {
        setViewCourse({ ...viewCourse, user: { id: updatedAssistant.id, full_name: updatedAssistant.full_name } });
      }
      setAssignAssistantOpen(false);
      setSuccessMsg("Muvaffaqiyatli o'zgartirildi");
    } catch (e: any) {
      console.error(e);
      alert("Xato yuz berdi");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 42, padding: "0 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
  };

  const goToCourse = (course: Course) => {
    setSelectedCourse(course);
    window.history.pushState(null, "", `/admin?tab=courses&courseId=${course.id}`);
  };

  const goBack = () => {
    setSelectedCourse(null);
    window.history.pushState(null, "", "/admin?tab=courses");
  };

  if (selectedCourse) {
    return <SectionsTab course={selectedCourse} onBack={goBack} />;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Kurslar</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 13, color: "#94a3b8" }}>
            <span>Kurslar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>Barcha kurslar</span>
          </div>
        </div>
        {!selectedCourse && (
          <button
            onClick={() => setAddOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0 18px", height: 40,
              background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <AddCircleOutlineOutlined style={{ width: 18, height: 18 }} />
            Qo'shish
          </button>
        )}
      </div>

      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 280 }}>
            <SearchOutlined style={{ position: "absolute", left: 14, top: 11, width: 18, height: 18, color: "#94a3b8" }} />
            <input
              type="text" placeholder="Izlash..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
              Bir sahifada: 
              <div style={{ width: 80 }}>
                <CustomSelect
                  value={"10"}
                  onChange={() => {}}
                  options={[{ value: "10", label: "10" }]}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", width: 40 }}>
                  <input type="checkbox" style={{ cursor: "pointer" }} />
                </th>
                {selectedCourse ? (
                  <>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Ism</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Telefon raqami</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Narxi</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>To'lov turi</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Yaratilgan vaqt</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Banner</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Kurs nomi</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Bo'limlar</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Darajasi</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Narxi</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Kategoriya</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Holati</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Amallar</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              ) : selectedCourse ? (
                // Mock participants view since backend doesn't have a real participants relation yet
                [
                  { id: 1, name: "Akbar", phone: "+998 99 999 99 99", price: "250 000", type: "Payme", date: "01.01.2024" },
                  { id: 2, name: "Sherali", phone: "+998 99 999 99 99", price: "250 000", type: "Naqd", date: "01.01.2024" }
                ].map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", background: "#fff" }}>
                    <td style={{ padding: "16px" }}><input type="checkbox" style={{ cursor: "pointer" }} /></td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#94a3b8", fontSize: 13, fontWeight: 600 }}>{p.name.charAt(0)}</Avatar>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#475569" }}>{p.phone}</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{p.price}</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#475569" }}>{p.type}</td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#475569" }}>{p.date}</td>
                  </tr>
                ))
              ) : (
                filtered.map((course, i) => (
                  <tr key={course.id} onClick={(e) => {
                    // Prevent row click if clicking on actions
                    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
                    goToCourse(course);
                  }} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", cursor: "pointer" }}>
                    <td style={{ padding: "16px" }}>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ width: 56, height: 36, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #a855f7)", overflow: "hidden" }}>
                        {course.banner ? (
                           <img src={`/api/v1/uploads/images/${course.banner}`} alt="banner" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e: any) => e.target.style.display = 'none'} />
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                      {course.name}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button onClick={(e) => { e.stopPropagation(); setViewCourse(course); setViewOpen(true); }} style={{ 
                        display: "flex", alignItems: "center", gap: 6, 
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, color: "#334155", fontWeight: 500
                      }}>
                        Batafsil <DescriptionOutlined style={{ width: 16, height: 16, color: "#64748b" }} />
                      </button>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#334155" }}>
                      {course.level || "Beginner"}
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#334155", fontWeight: 500 }}>
                      {course.prise ? course.prise.toLocaleString() : "0"}
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#334155" }}>
                      {course.categories?.name || "Kategoriyasiz"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ 
                        display: "inline-flex", padding: "4px 10px", borderRadius: 20, 
                        fontSize: 12, fontWeight: 600, 
                        background: "#dcfce7", color: "#16a34a" 
                      }}>
                        Faol
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(course); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <EditOutlined style={{ width: 16, height: 16 }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTargetId(course.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <DeleteOutlineOutlined style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}>
                <CloseOutlined style={{ width: 20, height: 20 }} />
              </button>
            </div>
            
            <div style={{ padding: "0 24px 24px", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {/* Banner Dropzone */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Banner</label>
                  <label style={{ 
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px dashed #cbd5e1", borderRadius: 8, padding: "20px 10px",
                    cursor: "pointer", background: bannerFile ? "#f1f5f9" : "#fff", textAlign: "center", height: 100
                  }}>
                    <CloudUploadOutlined style={{ width: 24, height: 24, color: "#64748b", marginBottom: 8 }} />
                    {bannerFile ? (
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{bannerFile.name}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>Bu yerga bosing <span style={{color: "#64748b", fontWeight: 400}}>yoki faylni suring</span></span>
                        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>SVG, PNG, JPG or GIF (max 800x400px)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setBannerFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                
                {/* Intro Video Dropzone */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Intro video</label>
                  <label style={{ 
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px dashed #cbd5e1", borderRadius: 8, padding: "20px 10px",
                    cursor: "pointer", background: videoFile ? "#f1f5f9" : "#fff", textAlign: "center", height: 100
                  }}>
                    <CloudUploadOutlined style={{ width: 24, height: 24, color: "#64748b", marginBottom: 8 }} />
                    {videoFile ? (
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{videoFile.name}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>Bu yerga bosing <span style={{color: "#64748b", fontWeight: 400}}>yoki faylni suring</span></span>
                        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>.mp4 fayl kengaytma mumkin (max 5 Mb)</span>
                      </>
                    )}
                    <input type="file" accept="video/mp4,video/x-m4v,video/*" style={{ display: "none" }} onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kurs nomi</label>
                <input type="text" placeholder="Kiriting" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kurs haqida</label>
                <textarea rows={3} placeholder="Kiriting" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Darajasi</label>
                  <CustomSelect 
                    value={form.level} 
                    onChange={v => setForm({ ...form, level: v })} 
                    options={[
                      { value: "BEGINNER", label: "Beginner" },
                      { value: "ELEMENTERY", label: "Elementary" },
                      { value: "PRE_INTERMEDIATE", label: "Pre-Intermediate" },
                      { value: "INTERMEDIATE", label: "Intermediate" },
                      { value: "ADVANCED", label: "Advanced" },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Narxi</label>
                  <input type="number" placeholder="0.00 so'm" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kategoriya</label>
                  <CustomSelect 
                    value={form.categoryId} 
                    onChange={v => setForm({ ...form, categoryId: v })}
                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Mentor</label>
                  <CustomSelect 
                    value={form.mentorId} 
                    onChange={v => setForm({ ...form, mentorId: v })}
                    options={mentors.filter(m => m.mentorProfile?.[0]?.id).map(m => ({ value: String(m.mentorProfile![0].id), label: m.full_name }))}
                  />
                </div>
              </div>

              <button onClick={handleAdd} style={{ 
                height: 42, background: "#3b82f6", color: "#fff", 
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, 
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0 24px"
              }}>
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
          <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}>
                <CloseOutlined style={{ width: 20, height: 20 }} />
              </button>
            </div>
            
            <div style={{ padding: "0 24px 24px", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Banner</label>
                  <label style={{ 
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px dashed #cbd5e1", borderRadius: 8, padding: "20px 10px",
                    cursor: "pointer", background: editBannerFile ? "#f1f5f9" : "#fff", textAlign: "center", height: 100
                  }}>
                    <CloudUploadOutlined style={{ width: 24, height: 24, color: "#64748b", marginBottom: 8 }} />
                    {editBannerFile ? (
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{editBannerFile.name}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>Bu yerga bosing <span style={{color: "#64748b", fontWeight: 400}}>yoki faylni suring</span></span>
                        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>SVG, PNG, JPG or GIF (max 800x400px)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setEditBannerFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Intro video</label>
                  <label style={{ 
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px dashed #cbd5e1", borderRadius: 8, padding: "20px 10px",
                    cursor: "pointer", background: editVideoFile ? "#f1f5f9" : "#fff", textAlign: "center", height: 100
                  }}>
                    <CloudUploadOutlined style={{ width: 24, height: 24, color: "#64748b", marginBottom: 8 }} />
                    {editVideoFile ? (
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{editVideoFile.name}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>Bu yerga bosing <span style={{color: "#64748b", fontWeight: 400}}>yoki faylni suring</span></span>
                        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>.mp4 fayl kengaytma mumkin (max 5 Mb)</span>
                      </>
                    )}
                    <input type="file" accept="video/mp4,video/x-m4v,video/*" style={{ display: "none" }} onChange={e => setEditVideoFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kurs nomi</label>
                <input type="text" placeholder="Kiriting" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kurs haqida</label>
                <textarea rows={3} placeholder="Kiriting" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Darajasi</label>
                  <CustomSelect 
                    value={editForm.level} 
                    onChange={v => setEditForm({ ...editForm, level: v })} 
                    options={[
                      { value: "BEGINNER", label: "Beginner" },
                      { value: "ELEMENTERY", label: "Elementary" },
                      { value: "PRE_INTERMEDIATE", label: "Pre-Intermediate" },
                      { value: "INTERMEDIATE", label: "Intermediate" },
                      { value: "ADVANCED", label: "Advanced" },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Narxi</label>
                  <input type="number" placeholder="0.00 so'm" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kategoriya</label>
                  <CustomSelect 
                    value={editForm.categoryId} 
                    onChange={v => setEditForm({ ...editForm, categoryId: v })}
                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Mentor</label>
                  <CustomSelect 
                    value={editForm.mentorId} 
                    onChange={v => setEditForm({ ...editForm, mentorId: v })}
                    options={mentors.filter(m => m.mentorProfile?.[0]?.id).map(m => ({ value: String(m.mentorProfile![0].id), label: m.full_name }))}
                  />
                </div>
              </div>

              <button onClick={handleEdit} style={{ 
                height: 42, background: "#3b82f6", color: "#fff", 
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, 
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0 24px"
              }}>
                <CheckOutlined style={{ width: 16, height: 16 }} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {!!successMsg && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSuccessMsg("")} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 16, padding: "30px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckOutlined style={{ width: 32, height: 32 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>{successMsg}</h2>
            <button onClick={() => setSuccessMsg("")} style={{ padding: "0 32px", height: 40, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Yopish</button>
          </div>
        </div>
      )}

      {/* Batafsil (View) Modal */}
      {viewOpen && viewCourse && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setViewOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Batafsil</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button style={{ width: 32, height: 32, background: "#f8fafc", border: "none", borderRadius: 8, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <VisibilityOutlined style={{ width: 16, height: 16 }} />
                </button>
                <button onClick={() => { setViewOpen(false); openEdit(viewCourse); }} style={{ width: 32, height: 32, background: "#f8fafc", border: "none", borderRadius: 8, color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EditOutlined style={{ width: 16, height: 16 }} />
                </button>
                <button onClick={() => { setViewOpen(false); setDeleteTargetId(viewCourse.id); setDeleteOpen(true); }} style={{ width: 32, height: 32, background: "#f8fafc", border: "none", borderRadius: 8, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DeleteOutlineOutlined style={{ width: 16, height: 16 }} />
                </button>
                <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
                <button onClick={() => setViewOpen(false)} style={{ width: 32, height: 32, background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CloseOutlined style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: "24px", overflowY: "auto" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Kurs nomi</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{viewCourse.name}</div>
              </div>

              <div style={{ width: "100%", height: 240, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #3b82f6, #a855f7)", overflow: "hidden", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {viewCourse.banner ? (
                  <img src={`/api/v1/uploads/images/${viewCourse.banner}`} alt="banner" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e: any) => e.target.style.display = 'none'} />
                ) : (
                   <span style={{color: '#fff', fontWeight: 600}}>Banner rasm</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3b82f6", fontWeight: 600, marginBottom: 24 }}>
                <LinkOutlined style={{ width: 16, height: 16 }} />
                Banner.jpg
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Darajasi</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{viewCourse.level}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Narxi</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{viewCourse.prise != null ? Number(viewCourse.prise).toLocaleString() : "—"} so'm</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Sana</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>24.04.2024 14:01:25</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Kategoriya</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{viewCourse.categories?.name || "Yo'q"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Mentor</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    {viewCourse.mentorProfile?.users?.full_name || 
                     viewCourse.users?.find(u => u.user?.role === "MENTOR")?.user?.full_name || 
                     "Safarov Oybek"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Assistent</div>
                  {viewCourse.user?.full_name ? (
                     <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{viewCourse.user.full_name}</div>
                  ) : (
                    <button onClick={() => setAssignAssistantOpen(true)} style={{ 
                      padding: "6px 12px", background: "#3b82f6", color: "#fff", 
                      border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" 
                    }}>
                      Biriktirish
                    </button>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Sotuvlar soni</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>111</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Holati</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Faol</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assistent Biriktirish Modal */}
      {assignAssistantOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAssignAssistantOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 400, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Assistent biriktirish</h2>
              <button onClick={() => setAssignAssistantOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}>
                <CloseOutlined style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Assistentni tanlang</label>
              <select value={selectedAssistantId} onChange={e => setSelectedAssistantId(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
                <option value="">Tanlash</option>
                {assistants.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
              
              <button onClick={handleAssignAssistant} style={{ 
                height: 38, background: "#3b82f6", color: "#fff", 
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, 
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0 20px"
              }}>
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
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 16, padding: "30px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#ef4444", fontSize: 28, fontWeight: 700 }}>
              ?
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 24px" }}>Siz rostdan ham o'chirmoqchimisiz?</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setDeleteOpen(false)} style={{ padding: "0 24px", height: 40, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleDelete} style={{ padding: "0 24px", height: 40, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
