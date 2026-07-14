'use client';
import { useState, useEffect } from "react";
import { C } from "../constants/styles";
import {
  FaThLarge, FaCalendarAlt, FaPlusCircle, FaHeadset,
  FaSignOutAlt, FaChevronRight, FaUser, FaMicrophone,
  FaHandshake, FaTrophy
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

const ORGANIZER_ITEMS = [
  { icon: <FaThLarge size={16} />,     label: "Dashboard",    key: "organizer-dashboard" },
  { icon: <FaCalendarAlt size={16} />, label: "Events",       key: "events" },
  { icon: <FaPlusCircle size={16} />,  label: "Create Event", key: "create-event" },
  { icon: <FaHeadset size={16} />,     label: "Help & Support",key: "help" },
];
const SPEAKER_ITEMS = [
  { icon: <FaThLarge size={16} />,    label: "Dashboard",      key: "speaker-dashboard",    route: "speaker-dashboard" },
  { icon: <FaMicrophone size={16} />, label: "Join as Speaker", key: "join-as-speaker-nav", route: "events" },
  { icon: <FaCalendarAlt size={16} />,label: "Events",          key: "events-speaker",       route: "events" },
  { icon: <FaHeadset size={16} />,    label: "Help & Support",  key: "help-speaker",         route: "help" },
];
const SPONSOR_ITEMS = [
  { icon: <FaThLarge size={16} />,    label: "Dashboard",          key: "sponsor-dashboard",     route: "sponsor-dashboard" },
  { icon: <FaTrophy size={16} />,     label: "Sponsorship Tiers",  key: "sponsorship-tiers-nav", route: "events" },
  { icon: <FaCalendarAlt size={16} />,label: "Events",              key: "events-sponsor",        route: "events" },
  { icon: <FaHeadset size={16} />,    label: "Help & Support",      key: "help-sponsor",          route: "help" },
];

function getItems(userRole) {
  if (userRole === "Speaker")   return SPEAKER_ITEMS;
  if (userRole === "Sponsor")   return SPONSOR_ITEMS;
  return ORGANIZER_ITEMS;
}

export default function SidebarLayout({ active, setPage, children, userName, userEmail, userRole, logout }) {
  const [photo, setPhoto] = useState(() => {
    const k = userEmail ? `eh_photo_${userEmail.toLowerCase()}` : null;
    return k ? safeLS.getItem(k) : null;
  });
  useEffect(() => {
    const sync = () => {
      const k = userEmail ? `eh_photo_${userEmail.toLowerCase()}` : null;
      const val = k ? safeLS.getItem(k) : null;
      setPhoto(val);
    };
    sync();
    const id = setInterval(sync, 300);
    return () => clearInterval(id);
  }, [userEmail]);
  const sideItems = getItems(userRole);
  const initials  = (userName || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const roleColor = {
    Organizer: { bg: "#fef3c7", color: "#b45309" },
    Speaker:   { bg: "#f0fdf4", color: "#15803d" },
    Sponsor:   { bg: "#fdf4ff", color: "#7e22ce" },
  }[userRole] || { bg: "#f1f5f9", color: "#475569" };

  const profilePage = {
    Organizer: "organizer-profile",
    Speaker:   "speaker-profile",
    Sponsor:   "sponsor-profile",
  }[userRole] || "profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 68px)" }}>
      <style>{`
        .sb-item { transition: background .15s, border-color .15s; }
        .sb-item:hover { background: #f0f4ff !important; }
        .sb-logout:hover { background: #fff1f0 !important; }
        .sb-logout:hover .sb-logout-text { color: #ef4444 !important; }
        .sb-logout:hover .sb-logout-icon { color: #ef4444 !important; }
        .sb-avatar:hover { opacity: 0.88; }
        .sb-mobile-nav::-webkit-scrollbar { display: none; }

        @media (max-width: 992px) {
          .sb-container {
            display: none !important;
          }
          .sb-mobile-nav {
            display: flex !important;
          }
          .sb-content {
            padding: 24px 16px !important;
            margin-left: 0 !important;
          }
          .sb-wrapper {
             min-height: auto !important;
          }
        }
      `}</style>

      {/* Mobile Horizontal Navigation List */}
      <div className="sb-mobile-nav" style={{ 
        display: "none", 
        background: C.white, 
        borderBottom: `1px solid ${C.border}`, 
        padding: "12px 16px", 
        overflowX: "auto", 
        whiteSpace: "nowrap", 
        gap: 10, 
        scrollbarWidth: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}>
        <div onClick={() => setPage(profilePage)}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: active === profilePage ? "#eef2ff" : "#f8fafc", color: active === profilePage ? C.navy : C.gray, fontSize: 13, fontWeight: 600, border: `1px solid ${active === profilePage ? C.navy : "#e2e8f0"}`, cursor: "pointer" }}>
          <FaUser size={14} /> Profile
        </div>
        {sideItems.map((item) => (
          <div key={item.key} onClick={() => setPage(item.route || item.key)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: active === item.key ? "#eef2ff" : "#f8fafc", color: active === item.key ? C.navy : C.gray, fontSize: 13, fontWeight: 600, border: `1px solid ${active === item.key ? C.navy : "#e2e8f0"}`, cursor: "pointer" }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar ── */}
      <div className="sb-container" style={{ width: 240, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "calc(100vh - 68px)" }}>

        {/* Avatar block — clickable → My Profile */}
        <div
          className="sb-avatar"
          onClick={() => setPage(profilePage)}
          style={{ padding: "20px 20px 18px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "opacity .15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            {/* Avatar */}
            <div style={{ width: 46, height: 46, minWidth: 46, minHeight: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${C.navy}, #3b4fd4)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,31,84,0.2)", position: "relative" }}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, borderRadius: "50%" }} />
                : <span style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>{initials}</span>}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userName || "User"}
              </div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userEmail || ""}
              </div>
            </div>
          </div>
          {/* Role badge */}
          <span style={{ fontSize: 11, fontWeight: 700, background: roleColor.bg, color: roleColor.color, padding: "2px 10px", borderRadius: 20 }}>
            {userRole}
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 12px 0", overflowY: "auto" }}>
          {/* My Profile pinned at top */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 10px 6px" }}>
            Account
          </div>
          <div
            className="sb-item"
            onClick={() => setPage(profilePage)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, marginBottom: 8, cursor: "pointer", background: active === profilePage ? "#eef2ff" : "transparent", borderLeft: active === profilePage ? `3px solid ${C.navy}` : "3px solid transparent", fontFamily: "Poppins, sans-serif" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: active === profilePage ? C.navy : C.gray, display: "flex" }}><FaUser size={15} /></span>
              <span style={{ fontSize: 13, fontWeight: active === profilePage ? 700 : 500, color: active === profilePage ? C.navy : C.gray }}>My Profile</span>
            </div>
            {active === profilePage && <FaChevronRight size={10} color={C.navy} />}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 10px 6px" }}>
            Main Menu
          </div>
          {sideItems.map((item) => {
            const isActive = active === item.key;
            return (
              <div key={item.key} className="sb-item" onClick={() => setPage(item.route || item.key)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, marginBottom: 2, cursor: "pointer", background: isActive ? "#eef2ff" : "transparent", borderLeft: isActive ? `3px solid ${C.navy}` : "3px solid transparent", fontFamily: "Poppins, sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: isActive ? C.navy : C.gray, display: "flex" }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.navy : C.gray }}>{item.label}</span>
                </div>
                {isActive && <FaChevronRight size={10} color={C.navy} />}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: `1px solid ${C.border}` }}>
          <div className="sb-item sb-logout" onClick={() => logout ? logout() : setPage("landing")}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, cursor: "pointer", borderLeft: "3px solid transparent" }}>
            <span className="sb-logout-icon" style={{ color: C.gray, display: "flex" }}><FaSignOutAlt size={16} /></span>
            <span className="sb-logout-text" style={{ fontSize: 13, fontWeight: 500, color: C.gray, fontFamily: "Poppins, sans-serif" }}>Log Out</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="sb-content" style={{ flex: 1, padding: "40px 48px", background: C.bg, overflowY: "auto" }}>
        {children}
      </div>
      </div>
    </div>
  );
}
