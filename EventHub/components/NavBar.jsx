'use client';
import { C, S } from "../constants/styles";
import { useState, useEffect } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { HiOutlineX } from "react-icons/hi";
import { apiGetFavoritesCount } from "@/lip/api";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

export default function NavBar({ page, setPage, userRole, userName, userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userName) {
      setFavoritesCount(null);
      return;
    }
    apiGetFavoritesCount()
      .then((res) => {
        const n =
          res?.data?.count ??
          res?.data ??
          res?.message?.count ??
          res?.count;
        setFavoritesCount(typeof n === "number" ? n : parseInt(String(n ?? ""), 10) || 0);
      })
      .catch(() => setFavoritesCount(null));
  }, [userName]);

  useEffect(() => {
    const sync = () => {
      const k = userEmail ? `eh_photo_${userEmail.toLowerCase().trim()}` : null;
      setPhoto(k ? safeLS.getItem(k) : null);
    };
    sync();
    const id = setInterval(sync, 300);
    return () => clearInterval(id);
  }, [userEmail]);

  const links = [
    { label: "Events", key: "events" },
    { label: "MyTickets", key: "my-tickets" },
    { label: "Favorites", key: "favorites" },
    { label: "Create Event", key: "create-event" },
    { label: "Help & Support", key: "help" },
  ];

  return (
    
    <div style={{ ...S.nav, position: "relative" }}>

      {/* LEFT SIDE - Logo */}
      <div onClick={() => setPage("landing")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
        <img className="nav-logo" src="/img/logo.png" alt="EventHub" style={{ height: 110, width: 110, marginTop: 10, objectFit: "contain" }}/>
      </div>

      {/* CENTER - Desktop Links */}
      <div className="nav-links">
        {links.map((l) => (
          <span key={l.key} onClick={() => setPage(l.key)} style={{ ...S.navLink, ...(page === l.key ? S.navLinkActive : {}) }}>
            {l.label}
            {l.key === "favorites" && favoritesCount != null && favoritesCount > 0 ? (
              <span style={{
                marginLeft: 6,
                fontSize: 10,
                fontWeight: 800,
                background: C.orange,
                color: "#fff",
                borderRadius: 10,
                padding: "2px 7px",
                verticalAlign: "middle",
              }}>{favoritesCount > 99 ? "99+" : favoritesCount}</span>
            ) : null}
          </span>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        {/* Only render auth section after mount to avoid hydration mismatch */}
        {mounted && (
          userName ? (
            <div onClick={() => {
                if (userRole === "Admin") setPage("admin-dashboard");
              else if (userRole === "Organizer") setPage("organizer-dashboard");
                else if (userRole === "Speaker") setPage("speaker-dashboard");
                else if (userRole === "Sponsor") setPage("sponsor-dashboard");
                else setPage("profile");
              }}
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "6px 10px", borderRadius: 30, transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div className="nav-user-info" style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{userName}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{userRole}</div>
              </div>
              <div style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.navy}, #3b4fd4)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,31,84,0.25)", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                {photo
                  ? <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0, borderRadius: "50%" }} />
                  : <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{userName[0].toUpperCase()}</span>}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={() => setPage("introduce-yourself")} className="signup-btn">Sign Up</button>
              <button onClick={() => setPage("login")} className="login-btn">Log In</button>
            </div>
          )
        )}

        {/* Hamburger */}
        <div onClick={() => setMenuOpen(!menuOpen)} className="hamburger">
          {menuOpen ? <HiOutlineX size={26} color={C.navy} /> : <HiOutlineMenu size={26} color={C.navy} />}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map((l) => (
            <span key={l.key} onClick={() => { setPage(l.key); setMenuOpen(false); }} style={{ ...S.navLink, ...(page === l.key ? S.navLinkActive : {}) }}>
              {l.label}
              {l.key === "favorites" && favoritesCount != null && favoritesCount > 0 ? (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: C.orange }}>({favoritesCount})</span>
              ) : null}
            </span>
          ))}
        </div>
      )}

      <style>{`
        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .auth-buttons { display: flex; gap: 10px; }
        .signup-btn { padding: 10px 18px; border: 1px solid ${C.navy}; border-radius: 20px; background: transparent; color: ${C.navy}; font-weight: 600; cursor: pointer; }
        .login-btn { padding: 10px 22px; border: none; border-radius: 20px; background: ${C.orange}; color: ${C.white}; font-weight: 600; cursor: pointer; }
        .hamburger { display: none; font-size: 22px; cursor: pointer; }
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .nav-user-info { display: none; }
          .hamburger { display: block; }
          .nav-logo { height: 80px !important; width: 80px !important; }
          .signup-btn, .login-btn { padding: 6px 12px; font-size: 12px; }
        }
        .mobile-menu { position: absolute; top: 75px; right: 20px; background: ${C.white}; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 12px; z-index: 1000; }
      `}</style>
    </div>
  );
}
