'use client';
import { useState, useEffect } from "react";
import { apiGetSponsorPackages, apiSelectSponsorPackage } from "@/lip/api";
import { C, S } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import { FaHandshake, FaCheckCircle } from "react-icons/fa";

const TIER_ROWS = [
  ["Logo on website",       "Small",  "Medium",        "Big"],
  ["Exhibit booth space",   "✗",      "A small table", "Booth (3×3)"],
  ["Speaking slot",         "✗",      "10 minutes",    "30 minutes"],
  ["Complimentary tickets", "2",      "4",             "8"],
  ["Price",                 "$100",   "$150",          "$250"],
];

const TIERS = ["Bronze", "Silver", "Gold"];

export default function SponsorshipTiersPage({ setPage, userName, userEmail, userRole }) {
  const [selected, setSelected] = useState(null);
  const [success,  setSuccess]  = useState(false);
  const [eventId, setEventId] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);

  // localStorage Safe
  const safeLS = typeof window !== 'undefined' ? localStorage : {
    getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
  };

  // Increased limits to support base64 images (speakers/sponsors)
  const MAX_STORAGE_SIZE = 500000; // ~500KB per item
  const MAX_SPONSORS = 30;
  // Cleanup only if extremely large to prevent data loss
  const CLEANUP_THRESHOLD = 2000000; // 2MB

  const safeSetItem = (key, value) => {
    try {
      if (typeof value !== 'string') {
        const strValue = JSON.stringify(value);
        if (strValue.length > MAX_STORAGE_SIZE) {
          console.warn(`❌ ${key} too large (${strValue.length} characters)`);
          return false;
        }
        safeLS.setItem(key, strValue);
      } else {
        safeLS.setItem(key, value);
      }
      return true;
    } catch (e) {
      console.warn('❌ localStorage error:', e.message);
      return false;
    }
  };

  const cleanupStorage = () => {
    try {
      for (let i = safeLS.length - 1; i >= 0; i--) {
        const key = safeLS.key(i);
        if (key && key.startsWith('eh_extras_')) {
          try {
            const data = safeLS.getItem(key);
            if (data && new Blob([data]).size > CLEANUP_THRESHOLD) {
              safeLS.removeItem(key);
              console.log(`✅ deleted ${key}`);
            }
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    cleanupStorage();
    
    const eid = safeLS.getItem("eh_active_event_id") || "";
    setEventId(eid);
    
    if (!eid) return;
    
    try {
      const custom = JSON.parse(safeLS.getItem("eh_events") || "[]");
      const BASE_TITLES = ["Tech Summit 2026","AI Horizons","Design Week","Startup Night","Art Basel Cairo","Cloud Expo","UX Masters","Business Forum"];
      const base = Array.from({length:8},(_,i)=>({id:i, photo:`https://picsum.photos/seed/event${i}/400/300`, title:BASE_TITLES[i]}));
      
      const extrasStr = safeLS.getItem(`eh_extras_${eid}`) || "{}";
      const extras = JSON.parse(extrasStr);
      let event = extras.eventData || null;
      
      if (!event) {
        event = [...custom,...base].find(e => String(e.id) === eid) || null;
      }
      
      setActiveEvent(event || null);
    } catch (e) {
      console.warn('Event load error:', e);
    }
  }, []);

  // API packages
  useEffect(() => {
    apiGetSponsorPackages()
      .then(data => {
        const pkgs = data.data || data || [];
        if (pkgs.length > 0) console.log("Sponsor packages:", pkgs);
      })
      .catch(err => console.warn("Packages error:", err.message));
  }, []);

  // Save sponsor - 100% fixed
  const saveSponsorSafely = (eventId, entry) => {
    try {
      const extKey = `eh_extras_${eventId}`;
      let extras = { sponsors: [], eventData: null };

      // Safe data reading
      try {
        const dataStr = safeLS.getItem(extKey);
        if (dataStr && dataStr !== "{}") {
          const parsed = JSON.parse(dataStr);
          extras = {
            ...parsed,
            sponsors: Array.isArray(parsed.sponsors) ? parsed.sponsors : []
          };
        }
      } catch (e) {
        console.warn(`fail save ${extKey}:`, e);
        extras = { sponsors: [] };
      }

      // Safe user search
      const userEmailLower = entry.email?.toLowerCase();
      let userIndex = -1;
      
      for (let i = 0; i < extras.sponsors.length; i++) {
        if (extras.sponsors[i]?.email?.toLowerCase() === userEmailLower) {
          userIndex = i;
          break;
        }
      }

      // Update or add
      if (userIndex !== -1) {
        extras.sponsors[userIndex] = entry;
      } else {
        extras.sponsors.push(entry);
        // Maintain max limit
        if (extras.sponsors.length > MAX_SPONSORS) {
          extras.sponsors = extras.sponsors.slice(-MAX_SPONSORS);
        }
      }

      // Compact data
      const compactData = {
        ...extras,
        // We keep full sponsor objects to preserve logos/links
        sponsors: extras.sponsors
      };

      const saved = safeSetItem(extKey, compactData);
      if (saved) {
        console.log(`✅ saved ${entry.name} - ${entry.tier}`);
        window.dispatchEvent(new Event("storage"));
      }

      // Safe eh_events update
      try {
        const eventsStr = safeLS.getItem("eh_events") || "[]";
        const allEvents = JSON.parse(eventsStr);
        const eventIdx = allEvents.findIndex(e => String(e.id) === eventId);
        
        if (eventIdx !== -1) {
          if (!Array.isArray(allEvents[eventIdx].sponsors)) {
            allEvents[eventIdx].sponsors = [];
          }
          
          let eventUserIdx = -1;
          for (let i = 0; i < allEvents[eventIdx].sponsors.length; i++) {
            if (allEvents[eventIdx].sponsors[i]?.email?.toLowerCase() === userEmailLower) {
              eventUserIdx = i;
              break;
            }
          }
          
          if (eventUserIdx !== -1) {
            allEvents[eventIdx].sponsors[eventUserIdx] = entry;
          } else {
            allEvents[eventIdx].sponsors.push(entry);
            if (allEvents[eventIdx].sponsors.length > MAX_SPONSORS) {
              allEvents[eventIdx].sponsors = allEvents[eventIdx].sponsors.slice(-MAX_SPONSORS);
            }
          }
          
          safeSetItem("eh_events", allEvents);
        }
      } catch (e) {
        console.warn('eh_events fail:', e);
      }

    } catch (e) {
      console.error('❌ save fail:', e);
    }
  };

  // Main confirmation
  const handleConfirm = async () => {
    if (!selected) {
      alert("📋 Please select a sponsorship tier first");
      return;
    }
    
    if (!eventId) {
      alert("🎯 No event selected. Go to the event and click 'Join as Sponsor'");
      return;
    }

    // API
    const packageMap = { Bronze: 1, Silver: 2, Gold: 3 };
    try {
      await apiSelectSponsorPackage(packageMap[selected] || 1, eventId);
    } catch(e) {
      console.warn("API:", e.message);
    }

    // Sponsor data
    const entry = {
      name: userName || userEmail || "Sponsor",
      email: userEmail?.toLowerCase() || "no-email",
      tier: selected,
      timestamp: Date.now()
    };

    saveSponsorSafely(eventId, entry);
    setSuccess(true);
  };

  return (
    <div style={S.page}>
      <style>{`
        .confirm-btn { transition: background .2s, transform .15s; }
        .confirm-btn:hover:not(:disabled) { background: #ea6c00 !important; transform: scale(1.03); }
        .tier-col { cursor: pointer; transition: all 0.15s; }
        .tier-col:hover { filter: brightness(0.97); }
      `}</style>

      <NavBar page="events" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      <div className="sponsorship-main-content" style={{ padding: "40px 60px 60px" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, color: C.navy, lineHeight: 1.25 }}>
              Partner with us & elevate<br/>your brand
            </h1>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 8 }}>
              Choose the appropriate package for {" "}
              <span style={{ color: C.orange, fontWeight: 700 }}>{activeEvent?.title || "this event"}</span>
            </p>
          </div>
          <div style={{ height: 280, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,31,84,0.10)" }}>
            <img 
              src={activeEvent?.photo || "https://picsum.photos/seed/sponsor-banner/800/400"} 
              alt="Sponsorship" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 40 }}/>

        {success ? (
          <div style={{ 
            background: C.white, borderRadius: 16, padding: "48px 32px", 
            textAlign: "center", boxShadow: "0 4px 24px rgba(0,31,84,0.08)", 
            border: `1px solid ${C.border}`, maxWidth: 500, margin: "0 auto" 
          }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <FaCheckCircle color="#10b981" size={28}/>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Package Confirmed!</h2>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 8 }}>
              You've selected the <strong style={{ color: C.orange }}>{selected}</strong> sponsorship package.
            </p>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 24, lineHeight: 1.6 }}>
              Your sponsorship has been added to the event. The organizer will be in touch soon.
            </p>
            <button 
              onClick={() => setPage("sponsor-dashboard")}
              style={{ 
                background: C.orange, color: "#fff", border: "none", borderRadius: 10, 
                padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", 
                fontFamily: "Poppins, sans-serif" 
              }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(0,31,84,0.07)", maxWidth: 760, margin: "0 auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Features", ...TIERS].map((h, i) => (
                    <th key={h} className={i > 0 ? "tier-col" : ""}
                      onClick={() => i > 0 && setSelected(TIERS[i-1])}
                      style={{
                        padding: "16px 20px", textAlign: "center", fontSize: 14, fontWeight: 700,
                        color: selected === h ? C.orange : C.navy,
                        background: selected === h ? "#fff7ed" : "#f8f9fb",
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft:  selected === h ? `2px solid ${C.orange}` : `1px solid ${C.border}`,
                        minWidth: i === 0 ? 120 : 100, // Ensure minimum width for columns
                        borderRight: selected === h ? `2px solid ${C.orange}` : "none",
                        borderTop:   selected === h ? `2px solid ${C.orange}` : "none",
                        position: "relative",
                      }}>
                      {h}
                      {selected === h && (
                        <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaCheckCircle color="#fff" size={10}/>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIER_ROWS.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => {
                      const tierName = TIERS[ci - 1];
                      const isSelected = ci > 0 && selected === tierName;
                      return (
                        <td key={ci} className={ci > 0 ? "tier-col" : ""}
                          onClick={() => ci > 0 && setSelected(tierName)}
                          style={{
                            padding: "15px 20px", textAlign: "center", fontSize: 14,
                            color: ci === 0 ? C.navy : cell === "✗" ? "#d1d5db" : C.gray,
                            fontWeight: ci === 0 ? 600 : ri === TIER_ROWS.length - 1 ? 800 : 400,
                            borderBottom: ri < TIER_ROWS.length - 1 ? `1px solid ${C.border}` : "none",
                            minWidth: ci === 0 ? 120 : 100, // Ensure minimum width for columns
                            borderLeft:  isSelected ? `2px solid ${C.orange}` : `1px solid ${C.border}`,
                            borderRight: isSelected ? `2px solid ${C.orange}` : "none",
                            background: isSelected ? "#fff7ed" : "transparent",
                          }}>
                          {ri === TIER_ROWS.length - 1 && ci > 0
                            ? <span style={{ color: C.orange, fontSize: 16, fontWeight: 800 }}>{cell}</span>
                            : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, background: "#fafafa" }}>
              <span style={{ fontSize: 13, color: C.gray }}>
                {selected
                  ? <span>Selected: <strong style={{ color: C.orange }}>{selected}</strong> — click a column to change</span>
                  : "Click a column to select your tier"}
              </span>
              <button 
                className="confirm-btn" 
                onClick={handleConfirm}
                disabled={!selected || !eventId}
                style={{ 
                  background: selected && eventId ? C.orange : "#d1d5db", 
                  color: "#fff", border: "none", borderRadius: 10, 
                  padding: "12px 32px", fontWeight: 700, fontSize: 14, 
                  cursor: selected && eventId ? "pointer" : "not-allowed", 
                  fontFamily: "Poppins, sans-serif", display: "flex", 
                  alignItems: "center", gap: 8, 
                  boxShadow: selected && eventId ? "0 4px 14px rgba(249,115,22,0.3)" : "none" 
                }}
              >
                <FaHandshake size={15}/> Confirm Package
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          @media (max-width: 992px) {
            .sponsorship-main-content {
              padding: 24px 16px 40px !important;
            }
            .sponsorship-main-content > div:first-child { /* Header grid */
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .sponsorship-main-content > div:first-child > div:last-child { /* Image container */
              height: 200px !important;
            }
            .sponsorship-main-content h1 {
              font-size: 24px !important;
            }
            .tiers-table-wrapper {
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
            }
            .tiers-table-wrapper table {
              width: auto !important; /* Allow table to be wider than its container */
              min-width: 100%; /* Ensure it takes at least 100% width */
            }
            .tiers-table-wrapper th, .tiers-table-wrapper td {
              padding: 12px 10px !important; /* Reduce padding */
              font-size: 13px !important; /* Reduce font size */
            }
          }
        `}</style>
      </div>
    </div>
  );
}