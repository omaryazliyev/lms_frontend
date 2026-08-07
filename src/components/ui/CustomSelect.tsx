import React, { useState, useRef, useEffect } from "react";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Tanlang",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full text-[14px]" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-[40px] px-3 flex items-center justify-between border rounded-[8px] transition-all cursor-pointer ${
          disabled
            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-70"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-100 bg-white"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-slate-800" : "text-slate-400"
          } font-medium`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <KeyboardArrowDownOutlined
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } !w-[20px] !h-[20px]`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[100] top-[44px] left-0 w-full bg-white border border-gray-200 rounded-[8px] shadow-lg py-1 max-h-[220px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-slate-400 text-center">
              Ma'lumot topilmadi
            </div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
