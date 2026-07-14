'use client';
import { C } from "../constants/styles";
import { FaLock, FaTimes, FaTicketAlt, FaHeart, FaQrcode } from "react-icons/fa";

const PERKS = [
  { icon: <FaTicketAlt color={C.orange} size={14} />, text: "Book tickets for any event" },
  { icon: <FaHeart     color={C.orange} size={14} />, text: "Save your favorite events"  },
  { icon: <FaQrcode    color={C.orange} size={14} />, text: "Access your QR tickets anytime" },
];

export default function AuthGuardModal({ onLogin, onSignup, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 999,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "40px 36px",
          width: 440,
          maxWidth: "90vw",
          boxShadow: "0 12px 48px rgba(0,31,84,0.2)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: C.gray, lineHeight: 1 }}
        >
          <FaTimes size={18} />
        </button>

        {/* Lock icon */}
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "#f0f4ff", border: `2px solid ${C.navy}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20, flexShrink: 0,
        }}>
          <FaLock color={C.navy} size={26} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 8px", textAlign: "center" }}>
          Sign in Required
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: 13, color: C.gray, margin: "0 0 28px", textAlign: "center", lineHeight: 1.6 }}>
          You need to be signed in to continue.
        </p>

        {/* Perks */}
        <div style={{
          width: "100%",
          background: "#f8f9fb",
          borderRadius: 12,
          padding: "6px 20px",
          marginBottom: 28,
          boxSizing: "border-box",
        }}>
          {PERKS.map(({ icon, text }, i) => (
            <div
              key={text}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 0",
                borderBottom: i < PERKS.length - 1 ? "1px solid #eef0f4" : "none",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#fff", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={onLogin}
          style={{
            width: "100%", padding: "14px 0",
            background: C.navy, color: "#fff",
            border: "none", borderRadius: 30,
            fontWeight: 700, fontSize: 15,
            cursor: "pointer", fontFamily: "Poppins, sans-serif",
            marginBottom: 12,
            boxShadow: "0 4px 14px rgba(0,31,84,0.25)",
          }}
        >
          Log In
        </button>
        <button
          onClick={onSignup}
          style={{
            width: "100%", padding: "14px 0",
            background: "transparent", color: C.navy,
            border: `1.5px solid ${C.border}`, borderRadius: 30,
            fontWeight: 700, fontSize: 15,
            cursor: "pointer", fontFamily: "Poppins, sans-serif",
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
