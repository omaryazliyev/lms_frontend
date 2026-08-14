import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { CircularProgress } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";

type Category = {
  id: number;
  name: string;
  create_at: string;
};

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Forms
  const [form, setForm] = useState({ name: "" });
  const [editRow, setEditRow] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name.trim()) {
      setFormErrors({ name: "Kategoriya nomi majburiy" });
      return;
    }

    try {
      await api.post("/categories", { name: form.name });
      await fetchCategories();
      setAddOpen(false);
      setSuccessOpen(true);
      setForm({ name: "" });
      setFormErrors({});
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleEdit = async () => {
    if (!editRow || !editForm.name.trim()) return;
    try {
      await api.patch(`/categories/${editRow.id}`, { name: editForm.name });
      await fetchCategories();
      setEditOpen(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/categories/${deleteTargetId}`);
      await fetchCategories();
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Kategoriyalar</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 13, color: "#94a3b8" }}>
            <span>Kurslar</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>Kategoriyalar</span>
          </div>
        </div>
        <button
          onClick={() => {
            setAddOpen(true);
            setFormErrors({});
            setForm({ name: "" });
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

      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #e2e8f0", padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 280, display: "flex", alignItems: "center" }}>
            <SearchOutlined style={{ position: "absolute", left: 14, width: 18, height: 18, color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Izlash"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
            />
            <FilterListOutlined style={{ position: "absolute", right: 14, width: 18, height: 18, color: "#64748b", cursor: "pointer" }} />
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

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0f172a", width: 60 }}>ID</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Kategoriya nomi</th>
                <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <FilterListOutlined style={{ width: 16, height: 16, color: "#94a3b8" }} /> Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ padding: 40, textAlign: "center" }}><CircularProgress size={24} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Ma'lumot topilmadi.</td></tr>
              ) : (
                filtered.slice((page - 1) * perPage, page * perPage).map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px", fontSize: 13, color: "#0f172a" }}>{(page - 1) * perPage + i + 1}</td>
                    <td style={{ padding: "16px", fontSize: 14, fontWeight: 500, color: "#475569" }}>{row.name}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          onClick={() => { setEditRow(row); setEditForm({ name: row.name }); setEditOpen(true); }}
                          style={{ width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 6, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        ><EditOutlined style={{ width: 16, height: 16 }} /></button>
                        <button
                          onClick={() => { setDeleteTargetId(row.id); setDeleteOpen(true); }}
                          style={{ width: 32, height: 32, border: "1px solid #fecaca", background: "#fff", borderRadius: 6, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        ><DeleteOutlineOutlined style={{ width: 16, height: 16 }} /></button>
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
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setAddOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Qo'shish</h2>
              <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><CloseOutlined style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Kategoriya nomi</label>
                <input type="text" placeholder="Kiriting" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, borderColor: formErrors.name ? "#ef4444" : "#e2e8f0" }} />
                {formErrors.name && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{formErrors.name}</div>}
              </div>
              <button onClick={handleAdd} style={{ marginTop: 24, padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
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
          <div style={{ position: "relative", width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 30px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} style={{ width: 32, height: 32, background: "#f1f5f9", border: "none", borderRadius: 16, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><CloseOutlined style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: 30 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Nomi <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="Nomi" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ padding: "20px 30px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12, background: "#f8fafc", borderRadius: "0 0 20px 20px" }}>
              <button onClick={() => setEditOpen(false)} style={{ padding: "0 20px", height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleEdit} style={{ padding: "0 24px", height: 42, background: "#3b82f6", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, padding: "30px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#ef4444" }}>?</span>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 24px" }}>Muvaffaqiyatli o'chirildi</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setDeleteOpen(false)} style={{ padding: "0 20px", height: 38, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleDelete} style={{ padding: "0 20px", height: 38, background: "#3b82f6", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSuccessOpen(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, padding: "40px 20px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckOutlined style={{ width: 32, height: 32, color: "#fff" }} />
              </div>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 24px" }}>Muvaffaqiyatli qo'shildi</h2>
            <button onClick={() => setSuccessOpen(false)} style={{ padding: "0 32px", height: 38, background: "#3b82f6", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
}
