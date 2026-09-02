import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Avatar, Badge, CircularProgress } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import UnfoldMoreOutlined from "@mui/icons-material/UnfoldMoreOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import StarRateRounded from "@mui/icons-material/StarRateRounded";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";

type UserRow = {
  id: number;
  full_name: string;
  phone: string;
  create_at: string;
  role: string;
  file?: string | null;
  email?: string | null;
  courses?: { id: number; name: string }[];
};

// ─── Custom Select Component (if needed inside UsersTab) ────────────────────
function CustomSelect({
  value, onChange, options, placeholder = "Tanlang", disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 16, userSelect: "none" }}>
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 42, padding: "0 14px",
          border: `1px solid ${open ? "#6366f1" : "#e2e8f0"}`,
          borderRadius: 10,
          background: disabled ? "#f8fafc" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 13, color: selected ? "#1e293b" : "#94a3b8",
          fontWeight: selected ? 500 : 400,
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span style={{
          display: "inline-flex", alignItems: "center",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          color: "#94a3b8",
        }}>▼</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden",
        }}>
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8", cursor: "pointer" }}
          >
            {placeholder}
          </div>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 13, cursor: "pointer",
                color: value === opt.value ? "#4f46e5" : "#334155",
                background: value === opt.value ? "#f1f5ff" : "transparent"
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsersTab({ activeSubItem }: { activeSubItem: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [selectedMentor, setSelectedMentor] = useState<UserRow | null>(null);

  const [admins, setAdmins] = useState<UserRow[]>([]);
  const [mentors, setMentors] = useState<UserRow[]>([]);
  const [assistants, setAssistants] = useState<UserRow[]>([]);
  const [students, setStudents] = useState<UserRow[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fish: "", phone: "+998", password: "",
    course: "", tajriba: "", kasb: "", sayt: "http://", qisqacha: "",
    facebook: "", telegram: "", linkedin: "", instagram: "", github: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ fish: "", phone: "", password: "••••••", course: "", tajriba: "", kasb: "", sayt: "", qisqacha: "", facebook: "", telegram: "", linkedin: "", instagram: "", github: "" });
  const [showEditPw, setShowEditPw] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<UserRow | null>(null);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/users/admin");
      setAdmins(res.data);
    } catch (e) { console.error(e); }
  };
  const fetchMentors = async () => {
    try {
      const res = await api.get("/mentor");
      setMentors(res.data);
    } catch (e) { console.error(e); }
  };
  const fetchAssistants = async () => {
    try {
      const res = await api.get("/assistant");
      setAssistants(res.data);
    } catch (e) { console.error(e); }
  };
  const fetchStudents = async () => {
    try {
      const res = await api.get("/student");
      setStudents(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (e) { console.error(e); }
  };
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

  const loadPaymentRequests = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("lms_payment_requests") || "[]");
      setPaymentRequests(raw.filter((r: any) => r.status === "PENDING"));
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdmins(), fetchMentors(), fetchAssistants(), fetchStudents(), fetchCourses()])
      .finally(() => setLoading(false));

    loadPaymentRequests();
    const handleStorage = () => loadPaymentRequests();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleApprovePayment = async (reqItem: any) => {
    try {
      if (reqItem.courseId && reqItem.studentId) {
        await api.patch(`/student/${reqItem.studentId}`, { courseId: reqItem.courseId }).catch(() => {});
      }

      const raw = JSON.parse(localStorage.getItem("lms_payment_requests") || "[]");
      const updated = raw.map((r: any) => r.id === reqItem.id ? { ...r, status: "APPROVED" } : r);
      localStorage.setItem("lms_payment_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));

      await fetchStudents();
      setPaymentRequests(prev => prev.filter(r => r.id !== reqItem.id));
      alert(`✓ ${reqItem.studentName} uchun ${reqItem.courseName} kursi muvaffaqiyatli biriktirildi!`);
    } catch (e) {
      console.error(e);
    }
  };

  const getTableData = (): UserRow[] => {
    switch (activeSubItem) {
      case "Mentorlar": return mentors;
      case "Assistentlar": return assistants;
      case "O'quvchilar": return students;
      default: return admins;
    }
  };

  const filtered = getTableData().filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.includes(search)
  );

  const handleAdd = async () => {
    const errors: Record<string, string> = {};
    if (!form.fish.trim()) errors.fish = "To'liq kiritilmadi";
    if (form.phone.replace(/\D/g, "").length < 10) errors.phone = "Telefon raqam kiritilmadi";
    if (!form.password.trim()) errors.password = "Parol kiritilmadi";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    try {
      const cleanPhone = "+" + form.phone.replace(/\D/g, "");

      const formData = new FormData();
      formData.append("full_name", form.fish);
      formData.append("phone", cleanPhone);
      formData.append("password", form.password);

      if (form.course) formData.append("courseIds[]", form.course);
      
      if (form.tajriba) formData.append("experiense", form.tajriba);
      if (form.kasb) formData.append("job", form.kasb);
      if (form.sayt && form.sayt !== "http://") formData.append("web_link", form.sayt);
      if (form.qisqacha) formData.append("description", form.qisqacha);
      if (form.facebook) formData.append("fecebook", form.facebook);
      if (form.telegram) formData.append("telegram", form.telegram);
      if (form.linkedin) formData.append("linkedin", form.linkedin);
      if (form.instagram) formData.append("instagram", form.instagram);
      if (form.github) formData.append("github", form.github);

      const endpoint = activeSubItem === "Mentorlar" ? "/mentor"
        : activeSubItem === "Assistentlar" ? "/assistant"
        : activeSubItem === "O'quvchilar" ? "/student"
        : "/users/admin";

      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (activeSubItem === "Mentorlar") await fetchMentors();
      else if (activeSubItem === "Assistentlar") await fetchAssistants();
      else if (activeSubItem === "O'quvchilar") await fetchStudents();
      else await fetchAdmins();

      setAddOpen(false);
      setSuccessOpen(true);
      setForm({ fish: "", phone: "+998", password: "", course: "", tajriba: "", kasb: "", sayt: "http://", qisqacha: "", facebook: "", telegram: "", linkedin: "", instagram: "", github: "" });
      setFormErrors({});
    } catch (e: any) {
      console.error("ADD ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async () => {
    if (!editRow) return;
    try {
      const cleanPhone = "+" + editForm.phone.replace(/\D/g, "");

      const formData = new FormData();
      formData.append("full_name", editForm.fish);
      formData.append("phone", cleanPhone);

      if (editForm.password && editForm.password !== "••••••") {
        formData.append("password", editForm.password);
      }
      
      if (editForm.course) formData.append("courseIds[]", editForm.course);
      
      if (editForm.tajriba) formData.append("experiense", editForm.tajriba);
      if (editForm.kasb) formData.append("job", editForm.kasb);
      if (editForm.sayt && editForm.sayt !== "http://") formData.append("web_link", editForm.sayt);
      if (editForm.qisqacha) formData.append("description", editForm.qisqacha);
      if (editForm.facebook) formData.append("fecebook", editForm.facebook);
      if (editForm.telegram) formData.append("telegram", editForm.telegram);
      if (editForm.linkedin) formData.append("linkedin", editForm.linkedin);
      if (editForm.instagram) formData.append("instagram", editForm.instagram);
      if (editForm.github) formData.append("github", editForm.github);

      const endpoint = activeSubItem === "Mentorlar" ? `/mentor/${editRow.id}`
        : activeSubItem === "Assistentlar" ? `/assistant/${editRow.id}`
        : activeSubItem === "O'quvchilar" ? `/student/${editRow.id}`
        : `/users/admin/${editRow.id}`;

      await api.patch(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (activeSubItem === "Mentorlar") await fetchMentors();
      else if (activeSubItem === "Assistentlar") await fetchAssistants();
      else if (activeSubItem === "O'quvchilar") await fetchStudents();
      else await fetchAdmins();

      setEditOpen(false);
      setSuccessOpen(true);
    } catch (e: any) {
      console.error("EDIT ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const endpoint = activeSubItem === "Mentorlar" ? "/mentor"
        : activeSubItem === "Assistentlar" ? "/assistant"
        : activeSubItem === "O'quvchilar" ? "/student"
        : "/users";

      await api.delete(`${endpoint}/${deleteTargetId}`);

      if (activeSubItem === "Mentorlar") await fetchMentors();
      else if (activeSubItem === "Assistentlar") await fetchAssistants();
      else if (activeSubItem === "O'quvchilar") await fetchStudents();
      else await fetchAdmins();

      setDeleteOpen(false);
    } catch (e: any) {
      console.error(e);
      setDeleteOpen(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 42, padding: "0 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>{activeSubItem || "Administratorlar"}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 13, color: "#94a3b8" }}>
            <span>Foydalanuvchilar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>{activeSubItem || "Administratorlar"}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setAddOpen(true);
            setFormErrors({});
            setForm({
              fish: "", phone: "+998", password: "",
              course: "", tajriba: "", kasb: "", sayt: "http://", qisqacha: "",
              facebook: "", telegram: "", linkedin: "", instagram: "", github: "",
            });
          }}
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
      </div>
      {/* PENDING PAYMENT REQUESTS FOR NEW COURSES */}
      {paymentRequests.length > 0 && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>💳</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1e3a8a" }}>Yangi Kurs To'lov So'rovlari ({paymentRequests.length})</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#dbeafe", padding: "2px 8px", borderRadius: 10 }}>Kutilmoqda</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paymentRequests.map((req) => (
              <div key={req.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #cbd5e1", padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{req.studentName} ({req.studentPhone})</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Kurs: <strong style={{ color: "#3b82f6" }}>{req.courseName}</strong> • Narxi: <strong>{Number(req.coursePrice).toLocaleString("uz-UZ")} UZS</strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleApprovePayment(req)}
                    style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <CheckOutlined style={{ width: 14, height: 14 }} /> Tasdiqlash (Kursni berish)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 280 }}>
              <SearchOutlined style={{ position: "absolute", left: 14, top: 11, width: 18, height: 18, color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Qidirish..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 40 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ ...inputStyle, width: "auto", display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", color: "#475569", fontWeight: 500 }}>
              <FilterListOutlined style={{ width: 18, height: 18 }} /> Filter
            </button>
            <button style={{ ...inputStyle, width: "auto", display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", color: "#475569", fontWeight: 500 }}>
              <FileDownloadOutlined style={{ width: 18, height: 18 }} /> Yuklab olish
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>№</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>F.I.SH.</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Telefon raqam</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>Sana <UnfoldMoreOutlined style={{ width: 14, height: 14 }} /></div>
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * perPage, page * perPage).map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                    <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>
                      {(page - 1) * perPage + i + 1}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar src={row.file || undefined} sx={{ width: 36, height: 36, bgcolor: "#3b82f6", fontSize: 13, fontWeight: 600 }}>
                          {row.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{row.full_name}</div>
                          {row.email && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{row.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#334155", fontWeight: 500 }}>
                      {row.phone}
                    </td>
                    <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>
                      {new Date(row.create_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => {
                            setEditRow(row);
                            setEditForm({
                              fish: row.full_name, phone: row.phone, password: "••••••",
                              course: (row as any).courses?.[0]?.name || "", tajriba: (row as any).mentorProfile?.[0]?.experiense?.toString() || "",
                              kasb: (row as any).mentorProfile?.[0]?.job || "", sayt: (row as any).mentorProfile?.[0]?.web_link || "http://",
                              qisqacha: (row as any).mentorProfile?.[0]?.description || "", facebook: (row as any).mentorProfile?.[0]?.fecebook || "",
                              telegram: (row as any).mentorProfile?.[0]?.telegram || "", linkedin: (row as any).mentorProfile?.[0]?.linkedin || "",
                              instagram: (row as any).mentorProfile?.[0]?.instagram || "", github: (row as any).mentorProfile?.[0]?.github || ""
                            });
                            setEditOpen(true);
                          }}
                          style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        ><EditOutlined style={{ width: 16, height: 16 }} /></button>
                        <button
                          onClick={() => { setViewRow(row); setViewOpen(true); }}
                          style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        ><VisibilityOutlined style={{ width: 16, height: 16 }} /></button>
                        <button
                          onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }}
                          style={{ width: 32, height: 32, border: "none", background: "#f8fafc", borderRadius: 8, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        ><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
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
          <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ padding: "24px 30px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ width: 32, height: 32, background: "#f1f5f9", border: "none", borderRadius: 16, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseOutlined style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: 30, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>F.I.SH <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" placeholder="F.I.SH." value={form.fish} onChange={e => setForm({ ...form, fish: e.target.value })} style={{ ...inputStyle, borderColor: formErrors.fish ? "#ef4444" : "#e2e8f0" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Telefon raqam <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" placeholder="+998" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, borderColor: formErrors.phone ? "#ef4444" : "#e2e8f0" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Parol o'ylab toping <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type={showPassword ? "text" : "password"} placeholder="Parol" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, paddingRight: 40, borderColor: formErrors.password ? "#ef4444" : "#e2e8f0" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: 35, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                    {showPassword ? <VisibilityOffOutlined style={{ width: 18, height: 18 }} /> : <VisibilityOutlined style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {activeSubItem !== "Administratorlar" && (
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Kurs tanlang</label>
                    <CustomSelect value={form.course} onChange={v => setForm({ ...form, course: v })} options={courses.map(c => ({ label: c.name, value: String(c.id) }))} placeholder="Kursni tanlang" />
                  </div>
                )}
                {activeSubItem === "Mentorlar" && (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Tajribasi</label>
                      <input type="text" placeholder="Masalan: 3 yil" value={form.tajriba} onChange={e => setForm({ ...form, tajriba: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Kasbi</label>
                      <input type="text" placeholder="Masalan: Frontend developer" value={form.kasb} onChange={e => setForm({ ...form, kasb: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Sayt havolasi</label>
                      <input type="text" placeholder="http://" value={form.sayt} onChange={e => setForm({ ...form, sayt: e.target.value })} style={inputStyle} />
                    </div>
                  </>
                )}
              </div>
              {activeSubItem === "Mentorlar" && (
                <div style={{ marginTop: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Qisqacha ta'rif</label>
                  <textarea rows={3} placeholder="Ta'rif yozing..." value={form.qisqacha} onChange={e => setForm({ ...form, qisqacha: e.target.value })} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "none" }} />
                </div>
              )}
            </div>
            <div style={{ padding: "20px 30px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0, background: "#f8fafc", borderRadius: "0 0 20px 20px" }}>
              <button onClick={() => setAddOpen(false)} style={{ padding: "0 20px", height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleAdd} style={{ padding: "0 24px", height: 42, background: "#3b82f6", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setEditOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ padding: "24px 30px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ width: 32, height: 32, background: "#f1f5f9", border: "none", borderRadius: 16, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseOutlined style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: 30, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>F.I.SH <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" placeholder="F.I.SH." value={editForm.fish} onChange={e => setEditForm({ ...editForm, fish: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Telefon raqam <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" placeholder="+998" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Yangi parol</label>
                  <input type={showEditPw ? "text" : "password"} placeholder="Parol" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowEditPw(!showEditPw)} style={{ position: "absolute", right: 10, top: 35, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                    {showEditPw ? <VisibilityOffOutlined style={{ width: 18, height: 18 }} /> : <VisibilityOutlined style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 30px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0, background: "#f8fafc", borderRadius: "0 0 20px 20px" }}>
              <button onClick={() => setEditOpen(false)} style={{ padding: "0 20px", height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleEdit} style={{ padding: "0 24px", height: 42, background: "#3b82f6", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 400, background: "#fff", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <DeleteOutlineOutlined style={{ width: 28, height: 28, color: "#ef4444" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>O'chirishni tasdiqlaysizmi?</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>Haqiqatan ham bu ma'lumotni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteOpen(false)} style={{ flex: 1, height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Yo'q, bekor qilish</button>
              <button onClick={handleDelete} style={{ flex: 1, height: 42, background: "#ef4444", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Ha, o'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSuccessOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 16, padding: 30, textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckOutlined style={{ width: 32, height: 32, color: "#10b981" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>Muvaffaqiyatli!</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>Yangi ma'lumot tizimga muvaffaqiyatli qo'shildi.</p>
            <button onClick={() => setSuccessOpen(false)} style={{ width: "100%", height: 44, background: "#3b82f6", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Davom etish</button>
          </div>
        </div>
      )}

    </div>
  );
}
