'use client';
import { apiGetEvents } from "@/lip/api";
import { useState, useEffect } from "react";
import { C, S } from "../../constants/styles";
import SidebarLayout from "../../components/SidebarLayout";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaFileAlt, FaArrowUp, FaCircle, FaTrash, FaMicrophone, FaBuilding } from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};


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

export default function SpeakerDashboard({ setPage, userName, userEmail, userRole, logout, bookedTickets, setBookedTickets, favorites, setFavorites, setSelectedEvent }) {
  const [photo, setPhoto] = useState(() => {
    if (!userEmail) return null;
    const stored = safeLS.getItem(`eh_photo_${userEmail.toLowerCase().trim()}`);
    return (stored && stored.startsWith('data:image')) ? stored : null;
  });
  useEffect(() => {
    const sync = () => {
      if (!userEmail) { setPhoto(null); return; }
      const stored = safeLS.getItem(`eh_photo_${userEmail.toLowerCase().trim()}`);
      setPhoto(stored && stored.startsWith('data:image') ? stored : null);
    };

    sync();
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 300);
    return () => { clearInterval(id); window.removeEventListener("storage", sync); };
  }, [userEmail]);

  const [myEvents, setMyEvents] = useState([]);
  
  // Calculate stats
  const totalSpeakers = myEvents.reduce((acc, ev) => acc + (ev.speakers?.length || 0), 0);
  const totalSponsors = myEvents.reduce((acc, ev) => acc + (ev.sponsors?.length || 0), 0);
  
  const STAT_CARDS = [
    { label: "Sessions",      value: String(myEvents.length), icon: <FaFileAlt    size={18} color={C.orange} />, trend: null },
    { label: "Total Speakers", value: String(totalSpeakers), icon: <FaMicrophone  size={18} color="#2563eb" />, trend: null },
    { label: "Total Sponsors",  value: String(totalSponsors), icon: <FaBuilding   size={18} color="#a855f7" />, trend: null },
  ];
  useEffect(() => {
    if (!userEmail) return;
    
    console.log('[DEBUG] SpeakerDashboard loading for user:', userEmail);
    
    const loadEvents = () => {
    // Always check both API and local storage
    Promise.all([
      apiGetEvents().then(data => {
        const all = (data.data || data.events || data || []);
        return all.filter(ev =>
          (ev.speakers || []).some(s => s.email === userEmail)
        ).map(ev => ({
          id: ev.id, title: ev.title,
          loc: ev.location || ev.venue_name || "",
          date: ev.start_time || ev.date || "",
          endDateISO: ev.end_time || "",
          endTime: ev.endTime || "",
          startTime: ev.startTime || "",
          photo: ev.image || ev.photo || "https://picsum.photos/seed/ev"+ev.id+"/400/300",
          speakers: ev.speakers || [],
        }));
      }).catch(() => []),
      Promise.resolve().then(() => {
        // Load local proposals from extras storage
        const customEvents = JSON.parse(safeLS.getItem("eh_events") || "[]");
        const localProposals = [];
        
        // First, check for ANY extras storage keys that have speaker proposals
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("eh_extras_")) {
            const eventId = key.replace("eh_extras_", "");
            const extras = JSON.parse(safeLS.getItem(key) || "{}");
            const speakers = extras.speakers || [];
            const userSpeaker = speakers.find(s => s && s.email && s.email.toLowerCase() === userEmail.toLowerCase());
            
            if (userSpeaker) {
              // Sync speaker data from current user profile
              const userProfile = JSON.parse(safeLS.getItem("eh_user_profile") || "null") || {};
              const currentUserPhoto = safeLS.getItem(`eh_photo_${userEmail.toLowerCase().trim()}`) || userProfile.photo;
              
              // Update speaker entry with current profile data
              let updated = false;
              if (currentUserPhoto && userSpeaker.photo !== currentUserPhoto) {
                userSpeaker.photo = currentUserPhoto;
                updated = true;
              }
              if (userProfile.job_title && !userSpeaker.job_title) {
                userSpeaker.job_title = userProfile.job_title;
                updated = true;
              }
              if (userProfile.company && !userSpeaker.company) {
                userSpeaker.company = userProfile.company;
                updated = true;
              }
              if (userProfile.phone && !userSpeaker.phone) {
                userSpeaker.phone = userProfile.phone;
                updated = true;
              }
              if (userProfile.linkedin && !userSpeaker.linkedin) {
                userSpeaker.linkedin = userProfile.linkedin;
                updated = true;
              }
              
              // Save updated data back to extras
              if (updated) {
                const si = extras.speakers.findIndex(s => s.email?.toLowerCase().trim() === userEmail.toLowerCase().trim());
                if (si !== -1) {
                  extras.speakers[si] = { ...extras.speakers[si], ...userSpeaker };
                  safeLS.setItem(extrasKey, JSON.stringify(extras));
                }
              }
              // Find event in eh_events or create a stub
              let eventData = customEvents.find(e => String(e.id) === eventId);
              // First check if eventData was saved in extras
              if (!eventData && extras.eventData) {
                eventData = extras.eventData;
              }
              if (!eventData) {
                // Check base events
                const BASE_TITLES = ["Tech Summit 2026","AI Horizons","Design Week","Startup Night","Art Basel Cairo","Cloud Expo","UX Masters","Business Forum"];
                const baseIdx = parseInt(eventId);
                if (!isNaN(baseIdx) && baseIdx < 8) {
                  eventData = { id: eventId, title: BASE_TITLES[baseIdx], photo: `https://picsum.photos/seed/event${baseIdx}/400/300`, loc: "", date: "", endDateISO: "", endTime: "", startTime: "" };
                } else {
                  eventData = { id: eventId, title: "Event " + eventId, photo: `https://picsum.photos/seed/ev${eventId}/400/300`, loc: "", date: "", endDateISO: "", endTime: "", startTime: "" };
                }
              }
              
              // Check if already added (avoid duplicates)
              if (!localProposals.find(p => String(p.id) === String(eventId))) {
                localProposals.push({
                  id: eventData.id, title: eventData.title,
                  loc: eventData.loc || "",
                  date: eventData.date || "",
                  endDateISO: eventData.endDateISO || "",
                  endTime: eventData.endTime || "",
                  startTime: eventData.startTime || "",
                  photo: eventData.photo || `https://picsum.photos/seed/ev${eventData.id}/400/300`,
                  speakers: speakers,
                });
              }
            }
          }
        }
        return localProposals;
      })
    ]).then(([apiEvents, localEvents]) => {
      // Merge: API events first, then add local events that aren't in API
      // BUT: if local event has this user as speaker, prefer local version
      const apiIds = new Set(apiEvents.map(e => String(e.id)));
      const localIds = new Set(localEvents.map(e => String(e.id)));
      
      // Keep API events that aren't in local
      const apiOnly = apiEvents.filter(e => !localIds.has(String(e.id)));
      
      // Merge: local events (which have speaker data) + API-only events
      const merged = [...localEvents, ...apiOnly];
      
      setMyEvents(merged);
    }).catch((err) => {
      // Even on error, try to show local events
      const localOnly = JSON.parse(safeLS.getItem("eh_events") || "[]")
        .filter(e => e.speakers?.some(s => s.email === userEmail));
      setMyEvents(localOnly);
    });
    };
    
    // Load immediately
    loadEvents();
    
    // Refresh when storage changes
    const handleStorage = () => {
      loadEvents();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userEmail]);

  const leaveEvent = (ev) => {
        // Remove from extras
    const extKey = `eh_extras_${ev.id}`;
    const extras = JSON.parse(safeLS.getItem(extKey) || "{}");
    if (extras.speakers) extras.speakers = extras.speakers.filter(s => s.email !== userEmail);
    safeLS.setItem(extKey, JSON.stringify(extras));
    // Remove from custom events
    const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
    const idx = events.findIndex(e => e.id === ev.id);
    if (idx !== -1) {
      events[idx].speakers = (events[idx].speakers || []).filter(s => s.email !== userEmail);
      safeLS.setItem("eh_events", JSON.stringify(events));
    }
    window.dispatchEvent(new Event("storage"));
  };

  const leaveAllEvents = () => {
    if (!window.confirm("Leave all events as speaker? This cannot be undone.")) return;
    
    // Remove from all extras
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("eh_extras_")) {
        const extras = JSON.parse(safeLS.getItem(key) || "{}");
        if (extras.speakers) {
          extras.speakers = extras.speakers.filter(s => s.email !== userEmail);
          safeLS.setItem(key, JSON.stringify(extras));
        }
      }
    }
    
    // Remove from all custom events
    const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
    events.forEach(e => {
      if (e.speakers) {
        e.speakers = e.speakers.filter(s => s.email !== userEmail);
      }
    });
    safeLS.setItem("eh_events", JSON.stringify(events));
    
    window.dispatchEvent(new Event("storage"));
    setMyEvents([]);
    alert("You have been removed from all events as speaker.");
  };

  const deleteAllMyEvents = () => {
    if (!window.confirm("Delete ALL events where you are a speaker? This cannot be undone!")) return;
    
    // Get all event IDs where user is a speaker
    const eventsToDelete = new Set();
    
    // Check eh_extras keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("eh_extras_")) {
        const eventId = key.replace("eh_extras_", "");
        const extras = JSON.parse(safeLS.getItem(key) || "{}");
        const hasUserAsSpeaker = (extras.speakers || []).some(s => s.email === userEmail);
        if (hasUserAsSpeaker) {
          eventsToDelete.add(eventId);
        }
      }
    }
    
    // Check eh_events
    const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
    events.forEach(e => {
      const hasUserAsSpeaker = (e.speakers || []).some(s => s.email === userEmail);
      if (hasUserAsSpeaker) {
        eventsToDelete.add(String(e.id));
      }
    });
    
    // Delete all extras keys for these events
    eventsToDelete.forEach(eventId => {
      safeLS.removeItem(`eh_extras_${eventId}`);
    });
    
    // Remove events from eh_events
    const remainingEvents = events.filter(e => !eventsToDelete.has(String(e.id)));
    safeLS.setItem("eh_events", JSON.stringify(remainingEvents));
    
    window.dispatchEvent(new Event("storage"));
    setMyEvents([]);
    alert(`Deleted ${eventsToDelete.size} events where you were a speaker.`);
  };

  const nuclearCleanup = () => {
    if (!window.confirm("NUCLEAR CLEANUP: This will remove ALL speaker data from ALL events. Continue?")) return;
    
    let cleanedCount = 0;
    
    // Clean ALL eh_extras keys - remove user from speakers array but keep other data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("eh_extras_")) {
        const extras = JSON.parse(safeLS.getItem(key) || "{}");
        if (extras.speakers && extras.speakers.some(s => s.email === userEmail)) {
          extras.speakers = extras.speakers.filter(s => s.email !== userEmail);
          if (extras.speakers.length === 0 && (!extras.sponsors || extras.sponsors.length === 0)) {
            // Remove empty extras key entirely
            safeLS.removeItem(key);
          } else {
            safeLS.setItem(key, JSON.stringify(extras));
          }
          cleanedCount++;
        }
      }
    }
    
    // Clean ALL events in eh_events
    const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
    let modifiedEvents = false;
    events.forEach(e => {
      if (e.speakers && e.speakers.some(s => s.email === userEmail)) {
        e.speakers = e.speakers.filter(s => s.email !== userEmail);
        modifiedEvents = true;
      }
    });
    if (modifiedEvents) {
      safeLS.setItem("eh_events", JSON.stringify(events));
    }
    
    window.dispatchEvent(new Event("storage"));
    setMyEvents([]);
    alert(`Nuclear cleanup complete. Removed you from ${cleanedCount} event records.`);
  };

  const removeFromFirstFourEvents = () => {
    if (!window.confirm("Remove from first 4 events as speaker?")) return;
    
    // Get first 4 events from myEvents state
    const eventsToClean = myEvents.slice(0, 4);
    let cleanedCount = 0;
    
    eventsToClean.forEach(ev => {
      const eventId = String(ev.id);
      
      // Remove from eh_extras
      const extKey = `eh_extras_${eventId}`;
      const extras = JSON.parse(safeLS.getItem(extKey) || "{}");
      if (extras.speakers && extras.speakers.some(s => s.email === userEmail)) {
        extras.speakers = extras.speakers.filter(s => s.email !== userEmail);
        if (extras.speakers.length === 0 && (!extras.sponsors || extras.sponsors.length === 0)) {
          safeLS.removeItem(extKey);
        } else {
          safeLS.setItem(extKey, JSON.stringify(extras));
        }
        cleanedCount++;
      }
      
      // Remove from eh_events
      const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
      const idx = events.findIndex(e => String(e.id) === eventId);
      if (idx !== -1 && events[idx].speakers) {
        events[idx].speakers = events[idx].speakers.filter(s => s.email !== userEmail);
        safeLS.setItem("eh_events", JSON.stringify(events));
      }
    });
    
    window.dispatchEvent(new Event("storage"));
    // Refresh myEvents
    setMyEvents(prev => prev.slice(4));
    alert(`Removed from ${cleanedCount} events. Remaining events: ${myEvents.length - cleanedCount}`);
  };
  return (
    <div style={S.page}>
      <style>{`
        .stat-card { transition: transform .2s, box-shadow .2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,31,84,0.13) !important; }
        .session-row { transition: background .15s; }
        .session-row:hover { background: #f8f9fb !important; }
        
        @media (max-width: 1200px) {
          .sidebar-container, [class*="sidebar-container"] { width: 220px !important; }
        }

        @media (max-width: 992px) {
          .sidebar-container, [class*="sidebar-container"], aside {
            display: none !important;
          }
          /* Adjust main content offset */
          .sidebar-container + div, aside + div {
            margin-left: 0 !important;
            padding: 24px 16px !important;
          }
          /* Responsive cleanup */
          h1 { font-size: 20px !important; }
          table { display: block !important; overflow-x: auto !important; }
        }
      `}</style>

      <SidebarLayout active="speaker-dashboard" setPage={setPage} userName={userName} userEmail={userEmail} userRole={userRole} logout={logout} userPhoto={photo}>

        {/* Welcome header with real avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #1a1f5e, #3b4fd4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,31,84,0.25)", flexShrink: 0, position: "relative" }}>      
            {photo ? <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", position: "absolute", inset: 0 }} /> : <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{(userName||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</span>}
          </div>
          <div>
            <p style={{ fontSize: 15, color: C.gray, margin: 0 }}>Welcome back,</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.orange, margin: 0 }}>{userName}!</h1>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="stat-card"
              onClick={() => { let a=0; const t=()=>{const el=document.getElementById("my-speaker-events"); if(el){el.scrollIntoView({behavior:"smooth",block:"start"});}else if(a++<10){setTimeout(t,200);}};setTimeout(t,300); }}
              style={{ ...S.statCard, display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(0,31,84,0.06)" }}>
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

        {/* Sessions table */}
        <div style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: C.navy }}>My Sessions</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fb" }}>
                {[
                  ["Title",       <FaFileAlt size={11} />],
                  ["Date & Time", <FaCalendarAlt size={11} />],
                  ["Venue",       <FaMapMarkerAlt size={11} />],
                  ["Duration",    <FaClock size={11} />],
                  ["Status",      <FaCircle size={11} />],
                ].map(([h, icon]) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: C.navy, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.navy }}>
                      <span style={{ color: C.orange }}>{icon}</span> {h}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myEvents.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: C.gray, fontSize: 13 }}>No sessions yet — join an event as a speaker to see your sessions here.</td></tr>
              ) : myEvents.map((ev, i) => {
                const mySession = ev.speakers?.find(s => s.email === userEmail) || {};
                return (
                  <tr key={i} className="session-row" style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                    onClick={() => { safeLS.setItem("eh_active_event_id", String(ev.id)); safeLS.setItem("eh_active_event_data", JSON.stringify(ev)); if(setSelectedEvent) setSelectedEvent(ev); window.location.href = `/event-detail?id=${ev.id}`; }}>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: C.navy }}>
                      <div>{mySession.title || "—"}</div>
                      <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{ev.title}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: C.gray }}>{formatEventDate(ev.date, ev.endDateISO, ev.endTime) || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: C.gray }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <FaMapMarkerAlt color={C.orange} size={11} /> {ev.loc || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: C.gray }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <FaClock color={C.orange} size={11} /> {mySession.duration || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#fff7ed", color: "#f97316", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                        {mySession.format || "Upcoming"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>


        {/* My Speaker Events */}
        <div id="my-speaker-events" style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}`, marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.navy, margin: 0 }}>My Speaker Sessions</h3>
            <button onClick={() => setPage("events")} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <FaMicrophone size={10}/> Browse Events
            </button>
          </div>
          {myEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.gray, fontSize: 14 }}>
              <FaMicrophone size={32} color={C.border} style={{ marginBottom: 12 }}/>
              <div>You haven't joined any events as a speaker yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myEvents.map(ev => {
                const mySession = ev.speakers.find(s => s.email === userEmail);
                return (
                  <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", borderRadius:12, border:`1px solid ${C.border}`, background:"#fafbff", cursor:"pointer", transition:"background 0.15s" }}
                  onClick={() => { safeLS.setItem("eh_scroll_to_community","1"); safeLS.setItem("eh_active_event_id", String(ev.id)); safeLS.setItem("eh_active_event_data", JSON.stringify(ev)); if(setSelectedEvent) setSelectedEvent(ev); window.location.href = `/event-detail?id=${ev.id}`; }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fafbff"}>
                    <img src={ev.photo} alt={ev.title} style={{ width:60, height:60, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize:12, color:C.gray }}>{formatEventDate(ev.date, ev.endDateISO, ev.endTime)} · {ev.loc}</div>
                      {mySession?.title && <div style={{ fontSize:12, color:C.orange, fontWeight:600, marginTop:2 }}>"{mySession.title}"</div>}
                    </div>
                    <button onClick={() => leaveEvent(ev)}
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
