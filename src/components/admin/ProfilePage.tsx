import React, { useState, useEffect } from "react";
import { Avatar, CircularProgress } from "@mui/material";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import api from "../../api/axios";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  color: "#1e293b",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

export default function ProfilePage({ user, onUpdate }: { user?: any; onUpdate?: (u: any) => void }) {
  const [activeTab, setActiveTab] = useState("Shaxsiy ma'lumotlar");
  const [saving, setSaving] = useState(false);

  // Personal info state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setAvatarPreview(user.file ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/uploads/images/${user.file}` : null);
    }
  }, [user]);

  // Security state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSavePersonal = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("phone", phone);
      formData.append("email", email);
      if (avatar) {
        formData.append("file", avatar);
      }

      await api.patch(`/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (onUpdate) onUpdate({ full_name: fullName, phone, email, file: avatar ? avatar.name : user.file }); // To fully sync file we might need a reload or a fresh fetch, but this will trigger a state update
      alert("Ma'lumotlar muvaffaqiyatli saqlandi!");
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!user) return;
    if (!currentPass || !newPass || !confirmPass) {
      alert("Barcha maydonlarni to'ldiring!");
      return;
    }
    if (newPass !== confirmPass) {
      alert("Yangi parollar mos kelmadi!");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}`, {
        password: newPass
      });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      alert("Parol muvaffaqiyatli o'zgartirildi!");
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi. Joriy parol noto'g'ri bo'lishi mumkin.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotif = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
    } finally {
      setSaving(false);
    }
  };

  const TABS = ["Shaxsiy ma'lumotlar", "Xavfsizlik", "Bildirishnomalar"];

  const SaveBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "0 20px", height: 38,
        background: saving ? "#93c5fd" : "#3b82f6",
        border: "none", borderRadius: 8,
        fontSize: 13, fontWeight: 600, color: "#fff",
        cursor: saving ? "not-allowed" : "pointer",
        marginTop: 4,
      }}
    >
      {saving ? <CircularProgress size={14} color="inherit" /> : <CheckOutlined style={{ width: 16, height: 16 }} />}
      Saqlash
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {activeTab === "Shaxsiy ma'lumotlar" ? "Shaxsiy ma'lumotlar" : "Profil sozlamalari"}
        </h1>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left sidebar tabs */}
        <div style={{
          width: 220, background: "#fff", borderRadius: 12,
          border: "1px solid #e2e8f0", padding: "6px 0", flexShrink: 0,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: "100%", textAlign: "left",
                padding: "11px 18px",
                background: activeTab === tab ? "#f1f5f9" : "transparent",
                border: "none", borderRadius: 0,
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#0f172a" : "#475569",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 28 }}>

          {/* ─── Shaxsiy ma'lumotlar ─── */}
          {activeTab === "Shaxsiy ma'lumotlar" && (
            <div>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <Avatar
                    src={avatarPreview || undefined}
                    sx={{ width: 70, height: 70, bgcolor: "#3b82f6", fontSize: 24, fontWeight: 700 }}
                  >
                    {fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </Avatar>
                  <label style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                  </label>
                </div>
                <button
                  onClick={handleRemoveAvatar}
                  style={{
                    padding: "6px 16px", height: 32, background: "#fff",
                    border: "1px solid #e2e8f0", borderRadius: 6,
                    fontSize: 13, fontWeight: 500, color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  O'chirish
                </button>
              </div>

              {/* Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>To'liq ism</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Istamov Xurshid"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+998 91 791 11 22"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <SaveBtn onClick={handleSavePersonal} />
              </div>
            </div>
          )}

          {/* ─── Xavfsizlik ─── */}
          {activeTab === "Xavfsizlik" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>Joriy parol</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>Yangi parol</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>Yangi parolni tasdiqlang</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  style={inputStyle}
                />
              </div>
              <div>
                <SaveBtn onClick={handleSaveSecurity} />
              </div>
            </div>
          )}

          {/* ─── Bildirishnomalar ─── */}
          {activeTab === "Bildirishnomalar" && (
            <div>
              <div style={{
                border: "1px solid #e2e8f0", borderRadius: 10,
                padding: "20px 20px", marginBottom: 20,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                  Pochta bildirishnomalari
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#475569" }}>
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={e => setEmailNotif(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#3b82f6", cursor: "pointer" }}
                  />
                  Bildirishnomalarni qabul qilish
                </label>
              </div>
              <SaveBtn onClick={handleSaveNotif} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
