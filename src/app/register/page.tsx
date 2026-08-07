"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import Smartphone from "@mui/icons-material/Smartphone";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../../api/axios";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+998")) {
      if (value.startsWith("+99") || value.startsWith("+9") || value.startsWith("+") || value.length === 0) {
        setPhone("+998"); return;
      }
      value = "+998" + value.replace(/[^\d]/g, "");
    }
    const digits = value.slice(4).replace(/[^\d]/g, "");
    const d = digits.slice(0, 9);
    let f = "+998";
    if (d.length > 0) f += " " + d.slice(0, 2);
    if (d.length > 2) f += " " + d.slice(2, 5);
    if (d.length > 5) f += " " + d.slice(5, 7);
    if (d.length > 7) f += " " + d.slice(7, 9);
    setPhone(f);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && phone.length <= 4) e.preventDefault();
  };

  const handleCloseAlert = () => setAlertState((p) => ({ ...p, open: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAlertState({ open: true, severity: "error", message: "Iltimos, to'liq ismingizni kiriting!" });
      return;
    }
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length !== 12) {
      setAlertState({ open: true, severity: "error", message: "Iltimos, telefon raqamingizni to'liq kiriting!" });
      return;
    }
    if (!password) {
      setAlertState({ open: true, severity: "error", message: "Iltimos, parolingizni kiriting!" });
      return;
    }
    if (password.length < 6) {
      setAlertState({ open: true, severity: "error", message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!" });
      return;
    }
    if (password !== confirmPassword) {
      setAlertState({ open: true, severity: "error", message: "Kiritilgan parollar bir-biriga mos kelmadi!" });
      return;
    }
    
    setLoading(true);
    try {
      const cleanPhone = "+" + digits;
      const res = await api.post("/auth/register", {
        full_name: fullName.trim(),
        phone: cleanPhone,
        password
      });

      const { access_token, refresh_token } = res.data.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const payload = JSON.parse(atob(access_token.split(".")[1]));

      setLoading(false);
      setShowSuccessModal(true);
      // We will clear the form but actually we are authenticated.
      setFullName(""); setPhone("+998"); setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setLoading(false);
      const msg = err?.response?.data?.message || "Ro'yxatdan o'tishda xatolik!";
      setAlertState({
        open: true,
        severity: "error",
        message: Array.isArray(msg) ? msg[0] : msg,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* ===== Left Panel ===== */}
      <div className="hidden md:flex md:w-[58%] bg-[#e8f2fc] items-center justify-center p-8 border-r border-[#d4e8f9]">
        <div className="w-full max-w-[520px]">
          <Image
            src="/images/illustration.png"
            alt="Registration illustration"
            width={520}
            height={520}
            priority
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* ===== Right Panel ===== */}
      <div className="w-full md:w-[42%] bg-white flex flex-col min-h-screen relative">
        {/* Logo — top right */}
        <div className="absolute top-8 right-8 flex items-end gap-0.5">
          <span className="text-[24px] font-extrabold leading-none tracking-tight">
            <span className="text-[#1a1a2e]">iT</span><span className="text-[#2563eb]">live</span>
          </span>
          <span className="text-[#2563eb] text-[10px] font-bold leading-none mb-0.5">*</span>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-8" style={{ paddingTop: "28%" }}>
          <div className="w-full max-w-[340px]">
            {/* Title */}
            <h1 className="text-[22px] font-bold text-gray-900 text-center" style={{ marginBottom: 25 }}>
              Ro'yxatdan o'tish
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 25 }}>
              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  To'liq ismingizni kiriting <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Kiritish"
                    className="w-full h-[42px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <div className="absolute right-3 flex items-center pointer-events-none text-[#94a3b8]">
                    <PersonOutlined className="!w-[18px] !h-[18px]" />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  Telefon raqamingiz <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="+998"
                    className="w-full h-[42px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                  />
                  <div className="absolute right-3 flex items-center pointer-events-none text-[#94a3b8]">
                    <Smartphone className="!w-[18px] !h-[18px]" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  Parolni kiriting
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-[42px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 p-1.5 rounded-md text-[#94a3b8] hover:bg-gray-50 hover:text-gray-600 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {showPassword ? (
                      <Visibility className="!w-[18px] !h-[18px]" />
                    ) : (
                      <VisibilityOff className="!w-[18px] !h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  Parolni tasdiqlang
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-[42px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 p-1.5 rounded-md text-[#94a3b8] hover:bg-gray-50 hover:text-gray-600 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <Visibility className="!w-[18px] !h-[18px]" />
                    ) : (
                      <VisibilityOff className="!w-[18px] !h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ height: "48px", borderRadius: "50px", backgroundColor: "rgba(59,129,244,1)" }}
                className="w-full hover:opacity-90 active:scale-[0.98] transition-all text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : "Davom etish"}
              </button>

              {/* Bottom link */}
              <p className="text-center text-[12px] text-gray-500">
                Menda hisob mavjud!{" "}
                <Link href="/login" className="text-[#3b82f6] font-semibold hover:underline">
                  Kirish
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* MUI Alert */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertState.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>

      {/* Success Modal matching Figma spec */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
          <div 
            className="w-[380px] bg-white rounded-[24px] text-center shadow-2xl mx-4 flex flex-col items-center justify-between"
            style={{ padding: "35px 30px 35px 30px", minHeight: "270px" }}
          >
            {/* Green outer & inner circle checkmark */}
            <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center">
              <div className="w-11 h-11 bg-[#13c35b] rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            {/* Modal text */}
            <h2 className="text-[16px] font-bold text-gray-900 leading-snug px-2">
              Muvaffaqiyatli ro'yxatdan o'tdingiz
            </h2>
            {/* Action button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.href = "/login";
              }}
              style={{
                height: "38px",
                borderRadius: "8px",
                backgroundColor: "rgba(59,129,244,1)",
                paddingLeft: "32px",
                paddingRight: "32px",
              }}
              className="text-white text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
            >
              Kirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
