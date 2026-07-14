'use client';
import React from "react";
import { C } from "../../constants/styles";
import { FaClock, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

export default function PendingScreen({ setPage, userName, userEmail, userRole, logout }) {
  const [status, setStatus] = React.useState("pending");

  React.useEffect(() => {
    const check = () => {
      // Use prop first, fall back to localStorage
      const email = userEmail || safeLS.getItem("eh_userEmail") || "";
      if (!email) return;
      const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
      const acc = accounts[email.trim().toLowerCase()];
      if (acc && acc.status) setStatus(acc.status);
    };
    check();
    const id = setInterval(check, 1500);
    return () => clearInterval(id);
  }, [userEmail]);

  const isRejected = status === "rejected";
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "52px 44px", maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(0,31,84,0.10)", border: `1px solid ${C.border}`, textAlign: "center" }}>
        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: isRejected ? "#fef2f2" : "#fef3c7", border: `3px solid ${isRejected ? "#fca5a5" : "#fcd34d"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          {isRejected
            ? <FaTimesCircle color="#dc2626" size={36}/>
            : <FaClock color="#d97706" size={36}/>}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 12 }}>
          {status==="approved" ? "You're Approved!" : isRejected ? "Access Denied" : "Request Under Review"}
        </h2>

        <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 8 }}>
          {status==="approved"
            ? `Your ${userRole} account has been approved! You can now log in and access your dashboard.`
            : isRejected
            ? `Your ${userRole} account request has been rejected by the admin.`
            : `Your ${userRole} account request is currently being reviewed by our admin team.`}
        </p>
        <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, marginBottom: 32 }}>
          {status==="approved"
            ? "Please log in again to access your account."
            : isRejected
            ? "Please contact support if you believe this is a mistake."
            : "You'll be able to access the platform as soon as your account is approved. Please check back later."}
        </p>

        {/* Status badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: status==="approved" ? "#f0fdf4" : isRejected ? "#fef2f2" : "#fef3c7", border: `1px solid ${status==="approved" ? "#86efac" : isRejected ? "#fca5a5" : "#fcd34d"}`, borderRadius: 30, padding: "8px 20px", marginBottom: 32 }}>
          {status==="approved" ? <FaCheckCircle color="#15803d" size={13}/> : isRejected ? <FaTimesCircle color="#dc2626" size={13}/> : <FaClock color="#d97706" size={13}/>}
          <span style={{ fontSize: 13, fontWeight: 700, color: status==="approved" ? "#15803d" : isRejected ? "#dc2626" : "#d97706" }}>
            {status==="approved" ? "Approved!" : isRejected ? "Rejected" : "Pending Approval"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {status === "approved" ? (
            <button onClick={() => { logout(); setTimeout(() => setPage("login"), 100); }}
              style={{ width: "100%", padding: "13px 0", background: "#15803d", border: "none", borderRadius: 30, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
              Go to Login
            </button>
          ) : (
            <>
              <button onClick={() => { logout(); window.location.href = "/events"; }}
                style={{ width: "100%", padding: "13px 0", background: C.orange, border: "none", borderRadius: 30, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                Browse Events
              </button>
              <button onClick={() => logout()}
                style={{ width: "100%", padding: "13px 0", background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 30, color: C.navy, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FaSignOutAlt size={12}/> Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
