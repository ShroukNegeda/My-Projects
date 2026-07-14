'use client';
import { apiGetEvents } from "@/lip/api";
import { useState, useEffect } from "react";
import { C, S } from "../../constants/styles";
import SidebarLayout from "../../components/SidebarLayout";
import { FaTrophy, FaEye, FaUserCheck, FaArrowUp, FaCalendarAlt, FaHandshake, FaTrash } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

const BAR_COLORS = ["#2563eb", "#f97316", "#a855f7", "#14b8a6", "#f5c518"];

export default function SponsorDashboard({ setPage, userName, userEmail, userRole, logout, bookedTickets, setBookedTickets, favorites, setFavorites, setSelectedEvent }) {

    // Get all events this sponsor has joined
  const [sponsoredEvents, setSponsoredEvents] = useState([]);

  // Function to load sponsored events (extracted for reuse)
  const getSponsoredEvents = () => {
    if (!userEmail) return Promise.resolve([]);
    
    // Always check both API and local storage
    return Promise.all([
      apiGetEvents().then(data => {
        const all = (data.data || data.events || data || []);
        return all.filter(ev => {
          // Check if user is in API sponsors (case-insensitive)
          const inApiSponsors = (ev.sponsors || []).some(s => s.email && s.email.toLowerCase() === userEmail?.toLowerCase());
          if (!inApiSponsors) return false;
          // Check localStorage - only filter out if user explicitly left (empty sponsors array)
          const extKey = `eh_extras_${ev.id}`;
          const extras = JSON.parse(safeLS.getItem(extKey) || "{}");
          // Only hide if user explicitly left (sponsors array exists and is empty)
          if (extras && extras.hasOwnProperty('sponsors') && Array.isArray(extras.sponsors) && extras.sponsors.length === 0) {
            return false; // User left this event
          }
          // Otherwise show the API event (either no localStorage yet, or user is still in it)
          return true;
        }).map(ev => {
          const extKey = `eh_extras_${ev.id}`;
          const extras = JSON.parse(safeLS.getItem(extKey) || "{}");
          return {
            id: ev.id, 
            title: ev.title || extras.eventData?.title || "Event",
            loc: ev.location || ev.venue_name || extras.eventData?.loc || "",
            date: ev.start_time || ev.date || extras.eventData?.date || "",
            endDateISO: ev.end_time || "",
            endTime: ev.endTime || "",
            photo: ev.image || ev.photo || extras.eventData?.photo || "https://picsum.photos/seed/ev"+ev.id+"/400/300",
            sponsors: ev.sponsors || [],
          };
        });
      }).catch((err) => {
        console.warn("apiGetEvents error:", err.message);
        return [];
      }),
      Promise.resolve().then(() => {
        // Load local sponsorships from extras storage
        const customEvents = JSON.parse(safeLS.getItem("eh_events") || "[]");
        const localSponsors = [];
        
        // First, check for ANY extras storage keys that have sponsor applications
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("eh_extras_")) {
            const eventId = key.replace("eh_extras_", "");
            const extras = JSON.parse(safeLS.getItem(key) || "{}");
            const sponsors = extras.sponsors || [];
            const userSponsor = sponsors.find(s => s && s.email && s.email.toLowerCase() === userEmail.toLowerCase());
            
            if (userSponsor) {
              // First check eh_extras for eventData (has correct photo from event detail page)
              let eventData = extras.eventData || null;

              // Fallback to eh_events
              if (!eventData) {
                eventData = customEvents.find(e => String(e.id) === eventId);
              }

              // Fallback to base events
              if (!eventData) {
                const BASE_TITLES = ["Tech Summit 2026","AI Horizons","Design Week","Startup Night","Art Basel Cairo","Cloud Expo","UX Masters","Business Forum"];
                const baseIdx = parseInt(eventId);
                if (!isNaN(baseIdx) && baseIdx < 8) {
                  eventData = { id: eventId, title: BASE_TITLES[baseIdx], photo: `https://picsum.photos/seed/event${baseIdx}/400/300`, loc: "", date: "", endDateISO: "", endTime: "" };
                } else {
                  eventData = { id: eventId, title: "Event " + eventId, photo: `https://picsum.photos/seed/ev${eventId}/400/300`, loc: "", date: "", endDateISO: "", endTime: "" };
                }
              }

              // Check if already added (avoid duplicates)
              if (!localSponsors.find(p => String(p.id) === String(eventId))) {
                localSponsors.push({
                  id: eventData.id, title: eventData.title,
                  loc: eventData.loc || eventData.location || "",
                  date: eventData.date || eventData.start_time || "",
                  endDateISO: eventData.endDateISO || eventData.end_time || "",
                  endTime: eventData.endTime || "",
                  photo: eventData.photo || eventData.image || `https://picsum.photos/seed/ev${eventData.id}/400/300`,
                  sponsors: sponsors,
                });
              }
            }
          }
        }
        return localSponsors;
      })
    ]).then(([apiEvents, localEvents]) => {
      // Merge, avoiding duplicates
      const seen = new Set(apiEvents.map(e => String(e.id)));
      const merged = [
        ...apiEvents,
        ...localEvents.filter(e => !seen.has(String(e.id)))
      ];
      return merged;
    }).catch(() => []);
  };

  useEffect(() => {
    getSponsoredEvents().then(events => {
      setSponsoredEvents(events);
    });
  }, [userEmail]);

const formatEventDate = (dateStr = "", endDateISO = "", endTimeStr = "") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const isISO = !isNaN(d.getTime()) && (dateStr.includes("T") || dateStr.includes("-"));
  if (isISO) {
    // Parse as local time to avoid UTC shift
    const parts = dateStr.replace("Z","").split("T");
    const [yr, mo, dy] = parts[0].split("-").map(Number);
    const [hr, mn] = (parts[1] || "00:00").split(":").map(Number);
    const local = new Date(yr, mo - 1, dy, hr, mn);
    const datePart = local.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const startTime = local.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    // Prefer endTimeStr (display string like "2:00 PM") over parsing endDateISO
    let endT = endTimeStr || "";
    if (!endT && endDateISO) {
      const ep = endDateISO.replace("Z","").split("T");
      const [ey, em, ed] = ep[0].split("-").map(Number);
      const [eh, emn] = (ep[1] || "00:00").split(":").map(Number);
      const endLocal = new Date(ey, em - 1, ed, eh, emn);
      endT = endLocal.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return datePart + ", " + startTime + (endT ? " – " + endT : "");
  }
  // Already display string
  const commaIdx = dateStr.indexOf(",");
  const datePart = commaIdx > -1 ? dateStr.slice(0, commaIdx).trim() : dateStr;
  const startTime = commaIdx > -1 ? dateStr.slice(commaIdx + 1).trim() : "";
  const endT = endTimeStr || "";
  return datePart + (startTime ? ", " + startTime : "") + (endT ? " – " + endT : "");
};

  // Year chart — percentage (max year = 100%)
  const yearRaw = sponsoredEvents.reduce((acc, ev) => {
    const year = String(new Date(ev.date).getFullYear());
    const found = acc.find(i => i.name === year);
    if (found) found.value += 1; else acc.push({ name: year, value: 1 });
    return acc;
  }, []).sort((a, b) => a.name - b.name);
  const maxYear = Math.max(...yearRaw.map(d => d.value), 1);
  const yearData = yearRaw.map(d => ({ name: d.name, value: Math.round((d.value / maxYear) * 100) }));

  // Month chart — percentage, only months with events
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthRaw = monthNames.map((month, index) => ({
    name: month,
    value: sponsoredEvents.filter(ev => new Date(ev.date).getMonth() === index).length,
  })).filter(d => d.value > 0);
  const maxMonth = Math.max(...monthRaw.map(d => d.value), 1);
  const monthData = monthRaw.map(d => ({ name: d.name, value: Math.round((d.value / maxMonth) * 100) }));

  const leaveEvent = (ev) => {
    const extKey = `eh_extras_${ev.id}`;
    const extras = JSON.parse(safeLS.getItem(extKey) || "{}");
    if (extras.sponsors) extras.sponsors = extras.sponsors.filter(s => s.email && s.email.toLowerCase() !== userEmail?.toLowerCase());
    safeLS.setItem(extKey, JSON.stringify(extras));

    // Also remove from eh_events if present
    const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
    const idx = events.findIndex(e => String(e.id) === String(ev.id));
    if (idx !== -1 && events[idx].sponsors) {
      events[idx].sponsors = events[idx].sponsors.filter(s => s.email && s.email.toLowerCase() !== userEmail?.toLowerCase());
      safeLS.setItem("eh_events", JSON.stringify(events));
    }
    window.dispatchEvent(new Event("storage"));
    getSponsoredEvents().then(events => setSponsoredEvents(events));
  };

  // Get highest tier across all events
  const myTier = (() => {
    const tiers = sponsoredEvents.flatMap(e => e.sponsors.filter(s => s.email && s.email.toLowerCase() === userEmail?.toLowerCase()).map(s => s.tier));
    if (tiers.includes("Gold")) return "Gold";
    if (tiers.includes("Silver")) return "Silver";
    if (tiers.includes("Bronze")) return "Bronze";
    return "—";
  })();

  const STAT_CARDS = [
    { label: "Sponsorship Tier",  value: myTier,                         icon: <FaTrophy    size={20} color={C.orange} />, trend: null },
    { label: "Events Sponsored",  value: String(sponsoredEvents.length),  icon: <FaCalendarAlt size={20} color="#2563eb"/>, trend: null },
    { label: "Active Packages",   value: String(sponsoredEvents.length),  icon: <FaEye       size={20} color="#14b8a6" />, trend: null },
  ];
  const [photo, setPhoto] = useState(() => {
    if (!userEmail) return null;
    const stored = safeLS.getItem(`eh_photo_${userEmail.toLowerCase().trim()}`);
    const isValid = stored && stored.startsWith('data:image');
    return isValid ? stored : null;
  });
  useEffect(() => {
    const sync = () => {
      if (!userEmail) {
        setPhoto(null);
        return;
      }
      const k = `eh_photo_${userEmail.toLowerCase().trim()}`;
      const stored = safeLS.getItem(k);
      setPhoto(stored && stored.startsWith('data:image') ? stored : null);
    };

    sync();
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 300);
    return () => { clearInterval(id); window.removeEventListener("storage", sync); };
  }, [userEmail]);
  return (
    <div style={S.page}>
      <style>{`
        .stat-card { transition: transform .2s, box-shadow .2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,31,84,0.13) !important; }
        .chart-card { transition: box-shadow .2s; }
        .chart-card:hover { box-shadow: 0 8px 28px rgba(0,31,84,0.13) !important; }
        
        @media (max-width: 1200px) {
          .sidebar-container, [class*="sidebar-container"] { width: 220px !important; }
        }

        @media (max-width: 992px) {
          .sidebar-container, [class*="sidebar-container"], aside {
            display: none !important;
          }
          /* Force the main content area to adjust its margin/padding */
          .sidebar-container + div, aside + div {
            margin-left: 0 !important;
            padding: 24px 16px !important;
          }
          /* Cleanup header */
          h1 { font-size: 20px !important; }
          .welcome-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      <SidebarLayout active="sponsor-dashboard" setPage={setPage} userName={userName} userEmail={userEmail} userRole={userRole} logout={logout} userPhoto={photo}>

        {/* Welcome */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #1a1f5e, #3b4fd4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,31,84,0.25)", flexShrink: 0, position: "relative" }}>
              {photo ?
                <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", position: "absolute", inset: 0 }} />
                : <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{(userName||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</span>
              }
            </div>
            <div>
              <p style={{ fontSize: 15, color: C.gray, margin: 0 }}>Welcome back,</p>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.orange, margin: 0 }}>{userName}!</h1>
            </div>
          </div>
          <div style={{ background: "#fff7ed", borderRadius: 10, padding: "8px 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <FaTrophy color={C.orange} size={14} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{myTier !== "—" ? `${myTier} Sponsor` : "No Active Sponsorship"}</span>
           </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="stat-card"
              onClick={() => { let a=0; const t=()=>{const el=document.getElementById("my-sponsored-events"); if(el){el.scrollIntoView({behavior:"smooth",block:"start"});}else if(a++<10){setTimeout(t,200);}};setTimeout(t,300); }}
              style={{ ...S.statCard, display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(0,31,84,0.06)", cursor: s.label==="Events Sponsored" ? "pointer" : "default" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.gray, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{s.value}</div>
              </div>
              {s.trend && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                  <FaArrowUp size={10} /> {s.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="chart-card"
            style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}` }}>
            <h3 style={{ marginBottom: 4, fontWeight: 700, fontSize: 15, color: C.navy }}>Sales Growth</h3>
            <p style={{ fontSize: 12, color: C.gray, marginBottom: 16 }}>Revenue trend over the years</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => v + "%"}/>
                <Tooltip formatter={(v) => [v + "%", "Share"]} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }}/></LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card"
            style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}` }}>
            <h3 style={{ marginBottom: 4, fontWeight: 700, fontSize: 15, color: C.navy }}>Payouts</h3>
            <p style={{ fontSize: 12, color: C.gray, marginBottom: 16 }}>Monthly payout breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => v + "%"} />
                <Tooltip formatter={(v) => [v + "%", "Share"]} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: "#2563eb" }} connectNulls={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* My Sponsored Events */}
        <div id="my-sponsored-events" style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}`, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.navy, margin: 0 }}>My Sponsored Events</h3>
            <button onClick={() => setPage("events")} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <FaHandshake size={10}/> Browse Events
            </button>
          </div>
          {sponsoredEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.gray, fontSize: 14 }}>
              <FaHandshake size={32} color={C.border} style={{ marginBottom: 12 }}/>
              <div>You haven't sponsored any events yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sponsoredEvents.map(ev => {
                const mySponsor = ev.sponsors?.find(s => s.email && s.email.toLowerCase() === userEmail?.toLowerCase()) || {};
                const tierColor = { Platinum:"#475569", Gold:"#b45309", Silver:"#6b7280", Bronze:"#92400e" }[mySponsor?.tier] || C.navy;
                const tierBg    = { Gold:"#fef3c7", Silver:"#f3f4f6", Bronze:"#fef9ee" }[mySponsor?.tier] || "#f8fafc";
                return (
                  <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", borderRadius:12, border:`1px solid ${C.border}`, background:"#fafbff", cursor:"pointer", transition:"background 0.15s" }}
                  onClick={() => { safeLS.setItem("eh_scroll_to_community","1"); safeLS.setItem("eh_active_event_id", String(ev.id)); safeLS.setItem("eh_active_event_data", JSON.stringify(ev)); if(setSelectedEvent) setSelectedEvent(ev); window.location.href = `/event-detail?id=${ev.id}`; }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fafbff"}>
                    <img src={ev.photo} alt={ev.title} style={{ width:60, height:60, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize:12, color:C.gray }}>{ev.loc}</div>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, background:tierBg, color:tierColor, padding:"4px 14px", borderRadius:20, flexShrink:0 }}>
                      {mySponsor?.tier} Sponsor
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); leaveEvent(ev); }}
                      style={{ padding:"6px 14px", borderRadius:8, background:"#fff", border:"1.5px solid #fecaca", cursor:"pointer", fontSize:12, fontWeight:700, color:"#ef4444", fontFamily:"Poppins, sans-serif", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                      <FaTrash size={10}/> Leave
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </SidebarLayout>
    </div>
  );
}
