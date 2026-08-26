"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Smartphone from "@mui/icons-material/Smartphone";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../../api/axios";

export default function Login() {
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState(false);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+998")) {
      if (
        value.startsWith("+99") ||
        value.startsWith("+9") ||
        value.startsWith("+") ||
        value.length === 0
      ) {
        setPhone("+998");
        return;
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

  const handleCloseAlert = () =>
    setAlertState((p) => ({ ...p, open: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentWarning(false);
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length !== 12) {
      setAlertState({
        open: true,
        severity: "error",
        message: "Iltimos, telefon raqamingizni to'liq kiriting!",
      });
      return;
    }
    if (!password) {
      setAlertState({
        open: true,
        severity: "error",
        message: "Iltimos, parolingizni kiriting!",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = "+" + digits;
      const res = await api.post("/auth/login", {
        phone: cleanPhone,
        password,
      });

      const { access_token, refresh_token } = res.data.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const payload = JSON.parse(atob(access_token.split(".")[1]));

      setLoading(false);
      if (payload.role === "SUPERADMIN" || payload.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }
    } catch (err: any) {
      setLoading(false);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "";
      
      // Agar to'lov tasdiqlanmagan bo'lsa (403 Forbidden)
      if (status === 403 || msg.includes("tasdiqlanmagan") || msg.includes("To'lovingiz")) {
        setPaymentWarning(true);
      } else {
        setAlertState({
          open: true,
          severity: "error",
          message: Array.isArray(msg) ? msg[0] : msg || "Telefon yoki parol noto'g'ri!",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* ===== Left Panel ===== */}
      <div className="hidden md:flex md:w-[58%] bg-[#e8f2fc] items-center justify-center p-8 border-r border-[#d4e8f9]">
        <div className="w-full max-w-[520px]">
          <Image
            src="/images/illustration.png"
            alt="Login illustration"
            width={520}
            height={520}
            priority
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* ===== Right Panel ===== */}
      <div className="w-full md:w-[42%] bg-white flex flex-col min-h-screen relative justify-center">
        {/* Logo — top right */}
        <div className="absolute top-8 right-8 flex items-end gap-0.5">
          <span className="text-[24px] font-extrabold leading-none tracking-tight">
            <span className="text-[#1a1a2e]">iT</span>
            <span className="text-[#2563eb]">live</span>
          </span>
          <span className="text-[#2563eb] text-[10px] font-bold leading-none mb-0.5">
            *
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[370px] mx-auto px-8">
          {/* Title Section */}
          <div className="text-center" style={{ marginBottom: 30 }}>
            <h1 className="text-[30px] font-extrabold text-[#0f172a] tracking-tight leading-none mb-2">
              Xush kelibsiz!
            </h1>
            <p className="text-[14px] text-gray-500 font-medium">
              Tizimga kirish uchun ma'lumotlaringizni kiriting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Phone */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                Telefon raqami
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="+998"
                  className="w-full h-[45px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[8px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
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
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                Parol
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-[45px] px-4 pr-10 text-[14px] border border-[#e2e8f0] rounded-[8px] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all bg-white placeholder-[#94a3b8] text-gray-800"
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

            {paymentWarning && (
              <div 
                className="bg-[#fff1f2] border border-[#fecaca] rounded-[8px] p-4 text-[13px] text-[#990011] leading-relaxed text-left"
                style={{ animation: "shake 0.3s ease" }}
              >
                To'lovingiz hali admin tomonidan tasdiqlanmagan. Iltimos, kuting yoki adminga murojaat qiling. Adminga murojaat:{" "}
                <a 
                  href="https://t.me/yazliyevv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-extrabold hover:underline underline decoration-[#990011]"
                >
                  @yazliyevv
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "46px",
                borderRadius: "10px",
                backgroundColor: "#990011", // Gilos rang
                boxShadow: "0 4px 12px rgba(153, 0, 17, 0.2)"
              }}
              className="w-full hover:opacity-95 active:scale-[0.98] transition-all text-white font-bold text-[14px] flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <>
                  {/* Login Sign Icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                  </svg>
                  Kirish
                </>
              )}
            </button>

            {/* Bottom Links */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#990011] font-bold hover:underline"
              >
                Parolni unutdingizmi?
              </Link>
              <p className="text-[12px] text-gray-500">
                Menda hisob mavjud emas!{" "}
                <Link href="/register" className="text-[#3b82f6] font-semibold hover:underline">
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>
          </form>
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

      {/* Shake Keyframe Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

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

    </div>
  );
}
