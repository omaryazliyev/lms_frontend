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
  const [alertState, setAlertState] = useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      // Phone raqamdan faqat raqamlarni olib, +998XXXXXXXXX formatga keltiramiz
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
      const msg = err?.response?.data?.message || "Telefon yoki parol noto'g'ri!";
      setAlertState({
        open: true,
        severity: "error",
        message: msg,
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
            alt="Login illustration"
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
            <span className="text-[#1a1a2e]">iT</span>
            <span className="text-[#2563eb]">live</span>
          </span>
          <span className="text-[#2563eb] text-[10px] font-bold leading-none mb-0.5">
            *
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-8" style={{ paddingTop: "28%" }}>
          <div className="w-full max-w-[340px]">
            {/* Title */}
            <h1 className="text-[22px] font-bold text-gray-900 text-center" style={{ marginBottom: 25 }}>
              Kirish
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 25 }}>
              {/* Phone */}
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  Telefon raqamingiz{" "}
                  <span className="text-red-500">*</span>
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
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[13px] font-medium text-gray-700">
                    Parol
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-[#3b82f6] font-semibold hover:underline"
                  >
                    Parolni unutdingizmi?
                  </Link>
                </div>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: "48px",
                  borderRadius: "50px",
                  backgroundColor: "rgba(59,129,244,1)",
                }}
                className="w-full hover:opacity-90 active:scale-[0.98] transition-all text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Kirish"
                )}
              </button>

              {/* Bottom link */}
              <p className="text-center text-[12px] text-gray-500">
                Menda hisob mavjud emas!{" "}
                <Link
                  href="/register"
                  className="text-[#3b82f6] font-semibold hover:underline"
                >
                  Ro'yxatdan o'tish
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

    </div>
  );
}
