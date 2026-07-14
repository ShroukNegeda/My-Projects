'use client';
import { useState, useEffect, useRef } from "react";
import { apiUpdateProfile } from "@/lip/api";
import { C } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import {
  FaUser, FaEnvelope, FaShieldAlt, FaTicketAlt,
  FaHeart, FaSignOutAlt, FaEdit, FaCheck, FaTimes,
  FaCamera, FaTrash, FaPlus
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

export default function ProfilePage({
  setPage, userName, setUserName,
  userEmail, setUserEmail,
  userRole,
  favorites = [], bookedTickets = [],
  logout,
}) {
  const [editingName,  setEditingName]  = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [draftName,    setDraftName]    = useState(userName  || "");
  const [draftEmail,   setDraftEmail]   = useState(userEmail || "");
  const [emailError,   setEmailError]   = useState("");
  const [savedMsg,     setSavedMsg]     = useState("");
  const getPhotoKey = (email) => email ? `eh_photo_${email.toLowerCase().trim()}` : null;
  const [photo, setPhoto] = useState(() => {
    const k = getPhotoKey(userEmail);
    return k ? safeLS.getItem(k) || null : null;
  });
  // Re-read photo whenever the logged-in email changes
  useEffect(() => {
    const k = getPhotoKey(userEmail);
    setPhoto(k ? safeLS.getItem(k) || null : null);
  }, [userEmail]);
  const fileRef = useRef();

  const initials = (userName || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const flash = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  const handleSaveName = async () => {
    if (!draftName.trim()) return;
    try { await apiUpdateProfile(draftName.trim(), userEmail); } catch(e) {}
    setUserName(draftName.trim());
    setEditingName(false);
    flash("✓ Name saved");
  };

  const handleSaveEmail = async () => {
    if (!draftEmail.trim()) { setEmailError("Email cannot be empty"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail.trim())) { setEmailError("Enter a valid email"); return; }
    try { await apiUpdateProfile(userName, draftEmail.trim()); } catch(e) {}
    setUserEmail(draftEmail.trim());
    setEditingEmail(false);
    setEmailError("");
    flash("✓ Email saved");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const k = getPhotoKey(userEmail);
    if (!k) { alert("Please log in first"); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 300;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      try {
        safeLS.setItem(k, dataUrl);
        setPhoto(dataUrl);
        window.dispatchEvent(new Event("storage"));
        e.target.value = ""; // Allows re-selecting the same file if needed
      } catch(err) {
        alert("Could not save photo. Please choose a smaller image.");
      }
    };
    img.src = url;
  };


  const removePhoto = () => {
    if (!userEmail) return;
    const k = getPhotoKey(userEmail);
    safeLS.removeItem(k);
    setPhoto(null);
    window.dispatchEvent(new Event("storage"));
  };
  const roleColor = {
    User:  { bg: "#eff6ff", color: "#1d4ed8" },
    Organizer: { bg: "#fef3c7", color: "#b45309" },
    Speaker:   { bg: "#f0fdf4", color: "#15803d" },
    Sponsor:   { bg: "#fdf4ff", color: "#7e22ce" },
  }[userRole] || { bg: "#f1f5f9", color: "#475569" };

  const stats = [
    { icon: <FaTicketAlt color={C.orange} size={18} />, label: "Tickets Booked", value: bookedTickets.length },
    { icon: <FaHeart     color={C.orange} size={18} />, label: "Favorite Events",   value: favorites.length    },
  ];

  // Editable field component
  const EditRow = ({ icon, label, value, editing, onEdit, draft, setDraft, onSave, onCancel, error, type = "text", placeholder }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff8f3", border: "1px solid #ffe4cc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>{label}</div>
        {editing ? (
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={type}
                value={draft}
                onChange={e => { setDraft(e.target.value); }}
                onKeyDown={e => e.key === "Enter" && onSave()}
                autoFocus
                placeholder={placeholder}
                style={{ fontSize: 14, fontWeight: 600, color: C.navy, border: `2px solid ${error ? "#ef4444" : C.navy}`, borderRadius: 8, padding: "5px 10px", fontFamily: "Poppins, sans-serif", outline: "none", flex: 1 }}
              />
              <button onClick={onSave}  style={{ background: "#10b981", border: "none", borderRadius: 8, padding: "7px 9px", cursor: "pointer", display: "flex" }}><FaCheck color="#fff" size={12} /></button>
              <button onClick={onCancel} style={{ background: "#ef4444", border: "none", borderRadius: 8, padding: "7px 9px", cursor: "pointer", display: "flex" }}><FaTimes color="#fff" size={12} /></button>
            </div>
            {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{value || <span style={{ color: C.gray, fontWeight: 400 }}>Not set</span>}</span>
            <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: C.gray }}>
              <FaEdit size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif" }}>
      <NavBar page="profile" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>

        <div onClick={() => setPage("events")} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, color: C.navy, marginBottom: 28, fontSize: 14, fontWeight: 500 }}>
          <HiOutlineArrowLeft size={20} /> Back
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, margin: 0 }}>My Profile</h1>
          {savedMsg && <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>{savedMsg}</span>}
        </div>

        {/* Avatar + name card */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "32px 28px", boxShadow: "0 2px 16px rgba(0,31,84,0.08)", border: `1px solid ${C.border}`, marginBottom: 16 }}>

          {/* Avatar with photo upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.navy}, #3b4fd4)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,31,84,0.25)", flexShrink: 0, position: "relative" }}>
                {photo
                  ? <img src={photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{initials}</span>}
              </div>
              {/* Camera button */}
              <button type="button" onClick={() => fileRef.current.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: C.orange, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <FaCamera color="#fff" size={11} />
              </button>
              {/* 🗑️ Delete photo button */}
              {photo && (
                <button type="button" onClick={removePhoto} style={{ position: "absolute", top: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"}}>
                  <FaTrash color="#fff" size={11} />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{userName}</div>
              <span style={{ fontSize: 12, fontWeight: 700, background: roleColor.bg, color: roleColor.color, padding: "3px 12px", borderRadius: 20 }}>
                {userRole || "Member"}
              </span>
            </div>
          </div>

          {/* Editable fields */}
          <EditRow
            icon={<FaUser color={C.orange} size={13} />}
            label="Full Name" value={userName}
            editing={editingName} onEdit={() => { setEditingName(true); setDraftName(userName || ""); }}
            draft={draftName} setDraft={setDraftName}
            onSave={handleSaveName} onCancel={() => setEditingName(false)}
            placeholder="Your full name"
          />
          <EditRow
            icon={<FaEnvelope color={C.orange} size={13} />}
            label="Email Address" value={userEmail} type="email"
            editing={editingEmail} onEdit={() => { setEditingEmail(true); setDraftEmail(userEmail || ""); setEmailError(""); }}
            draft={draftEmail} setDraft={v => { setDraftEmail(v); setEmailError(""); }}
            onSave={handleSaveEmail} onCancel={() => { setEditingEmail(false); setEmailError(""); }}
            error={emailError} placeholder="your@email.com"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff8f3", border: "1px solid #ffe4cc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaShieldAlt color={C.orange} size={13} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>Role</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{userRole || "—"}</div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 600px) {
            div[style*="gridTemplateColumns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
        `}</style>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {stats.map(({ icon, label, value }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff8f3", border: "1px solid #ffe4cc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.navy }}>{value}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 10px rgba(0,31,84,0.06)" }}>
          {[
            { icon: <FaTicketAlt color={C.orange} size={14} />, label: "My Tickets",   pg: "my-tickets" },
            { icon: <FaHeart     color={C.orange} size={14} />, label: "Saved Events", pg: "favorites"  },
          ].map(({ icon, label, pg }, i, arr) => (
            <div key={label} onClick={() => setPage(pg)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff8f3", border: "1px solid #ffe4cc", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, flex: 1 }}>{label}</span>
              <span style={{ color: C.gray, fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={() => logout && logout()}
          style={{ width: "100%", padding: "14px 0", background: "#fff", border: "1.5px solid #fca5a5", borderRadius: 14, color: "#ef4444", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <FaSignOutAlt size={15} /> Log Out
        </button>
      </div>
    </div>
  );
}
