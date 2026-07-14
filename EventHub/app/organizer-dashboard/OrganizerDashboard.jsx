'use client';
import { apiGetEvents, getToken, loadOrganizerOwnedEventIds } from "@/lip/api";
import { deleteEventWithSync, canUserDeleteEvent } from "@/lip/eventDeleteHelpers";
import { useState, useEffect, useCallback } from "react";
import { C, S } from "../../constants/styles";
import SidebarLayout from "../../components/SidebarLayout";
import { FaDollarSign, FaTicketAlt, FaBuilding, FaMicrophone, FaArrowUp, FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

const resolveEventPhoto = (ev) => {
  if (!ev.photo || ev.photo.startsWith("__local__")) {
    const stored = safeLS.getItem(`eh_ephoto_${ev.id}`);
    if (stored) return { ...ev, photo: stored };
    return { ...ev, photo: `https://picsum.photos/seed/event${ev.id}/400/300` };
  }
  return ev;
};

const CATEGORY_LABEL_BY_ID = {
  1: "Design",
  2: "Tech",
  3: "Business",
  4: "Art",
  5: "AI",
  6: "Health",
  7: "Music",
  8: "Sports",
  9: "Education",
  10: "Finance",
};

export default function OrganizerDashboard({ setPage, userName, userEmail, userRole, logout, bookedTickets, setBookedTickets, favorites, setFavorites, setSelectedEvent }) {

  const [photo, setPhoto] = useState(() => {
    if (!userEmail) return null;
    const k = `eh_photo_${userEmail.toLowerCase().trim()}`;
    const stored = safeLS.getItem(k);
    return (stored && stored.startsWith('data:image')) ? stored : null;
  });

  const [myEvents, setMyEvents] = useState([]);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const parseEventsArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.message?.data)) return res.message.data;
    if (Array.isArray(res?.events)) return res.events;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const normName = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const loadMyEvents = useCallback(() => {
    const meName = normName(userName);
    const meEmail = String(userEmail || "").toLowerCase().trim();
    const ownedSet = new Set(loadOrganizerOwnedEventIds(userEmail));
    const allLocal = JSON.parse(safeLS.getItem("eh_events") || "[]");
    console.log('[DEBUG] OrganizerDashboard all local events:', allLocal.length, allLocal.map(e => ({ id: e.id, title: e.title, organizer: e.organizer, organizerEmail: e.organizerEmail })));
    const localMine = allLocal
      .map(resolveEventPhoto)
      .filter((e) => {
        const orgEmail = String(e.organizerEmail || e.organizer_email || e.created_by_email || "").toLowerCase().trim();
        const orgName = normName(e.organizer || "");
        // Match by organizer name, email, or if no organizer set (locally created events before fix)
        const matches = (meName && orgName === meName) ||
          (meEmail && orgEmail && orgEmail === meEmail) ||
          (!orgName && !orgEmail); // Show orphaned events too
        console.log('[DEBUG] Event filter:', e.id, e.title, 'organizer:', orgName, 'meName:', meName, 'matches:', matches);
        return matches;
      });

    apiGetEvents()
      .then((data) => {
        const all = parseEventsArray(data);
        const mineFromApi = all
          .filter((ev) => {
            if (ownedSet.size && ownedSet.has(String(ev.id))) return true;
            const orgName = normName(
              ev.organizer_name ||
                ev.organizer?.name ||
                ev.organizerName ||
                ev.created_by_name ||
                ev.user?.name
            );
            const orgEmail = String(
              ev.organizer_email ||
                ev.organizer?.email ||
                ev.organizerEmail ||
                ev.created_by_email ||
                ev.user?.email ||
                "",
            )
              .toLowerCase()
              .trim();
            const uid =
              ev.user_id ??
              ev.organizer_id ??
              ev.created_by ??
              ev.creator_id ??
              ev.owner_id;
            const meUid = safeLS.getItem("eh_userId");
            if (meUid && uid != null && String(uid) === String(meUid)) return true;
            return (
              (orgName && meName && orgName === meName) ||
              (orgEmail && meEmail && orgEmail === meEmail)
            );
          })
          .map((ev) => {
            const t = String(ev.type || "").toLowerCase();
            const locType = t === "online" ? "online" : "in-person";
            const priceNum =
              ev.price_type === "free" || ev.price == null || ev.price === ""
                ? ""
                : String(ev.price).replace(/[^\d.]/g, "");
            const cat =
              (typeof ev.category === "object" && ev.category?.name) ||
              ev.category ||
              CATEGORY_LABEL_BY_ID[ev.category_id] ||
              CATEGORY_LABEL_BY_ID[String(ev.category_id)] ||
              "Tech";
            return {
              id: ev.id,
              title: ev.title,
              loc: ev.location || ev.venue_name || "",
              date: ev.start_time || ev.date || "",
              endDateISO: ev.end_time || "",
              startTime: ev.start_time || "",
              endTime: ev.end_time || "",
              price:
                ev.price_type === "free" ? "Free" : ev.price ? "$" + ev.price : "Free",
              photo:
                ev.image ||
                ev.photo ||
                ev.image_url ||
                ev.cover_image ||
                ev.thumbnail ||
                resolveEventPhoto({ id: ev.id, photo: "__local__" }).photo,
              capacity: ev.capacity || "",
              description: ev.description || "",
              address: ev.address || "",
              cat,
              category_id: ev.category_id,
              type: ev.type,
              locType,
              price_type: ev.price_type,
              tickets: [
                {
                  id: 1,
                  name: "General",
                  price: priceNum,
                  quantity: "",
                },
              ],
              organizer: userName,
              speakers: ev.speakers || [],
              sponsors: ev.sponsors || [],
            };
          });
        const seen = new Set(mineFromApi.map((e) => String(e.id)));
        const merged = mineFromApi.concat(
          localMine.filter((e) => !seen.has(String(e.id))),
        );
        
        // Merge with eh_extras to get speakers/sponsors from localStorage
        const withExtras = merged.map(ev => {
          const extras = JSON.parse(safeLS.getItem(`eh_extras_${ev.id}`) || "{}");
          return {
            ...ev,
            speakers: [...(ev.speakers || []), ...(extras.speakers || [])].filter((s, i, arr) => 
              arr.findIndex(x => (x.email || x.id) === (s.email || s.id)) === i
            ),
            sponsors: [...(ev.sponsors || []), ...(extras.sponsors || [])].filter((s, i, arr) => 
              arr.findIndex(x => (x.email || x.id) === (s.email || s.id)) === i
            ),
          };
        });
        
        setMyEvents(withExtras);
      })
      .catch(() => {
        // Also merge with extras in fallback case
        const withExtras = localMine.map(ev => {
          const extras = JSON.parse(safeLS.getItem(`eh_extras_${ev.id}`) || "{}");
          return {
            ...ev,
            speakers: [...(ev.speakers || []), ...(extras.speakers || [])].filter((s, i, arr) => 
              arr.findIndex(x => (x.email || x.id) === (s.email || s.id)) === i
            ),
            sponsors: [...(ev.sponsors || []), ...(extras.sponsors || [])].filter((s, i, arr) => 
              arr.findIndex(x => (x.email || x.id) === (s.email || s.id)) === i
            ),
          };
        });
        setMyEvents(withExtras);
      });
  }, [userName, userEmail]);

  useEffect(() => {
    loadMyEvents();
  }, [loadMyEvents]);

  // Also force reload on mount (for when navigating back from other pages)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[DEBUG] OrganizerDashboard mount reload');
      loadMyEvents();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (String(userRole || "") !== "Organizer") return;
    if (!getToken()) setPage("login");
  }, [userRole, setPage]);

  useEffect(() => {
    window.addEventListener("eventsUpdated", loadMyEvents);
    return () => window.removeEventListener("eventsUpdated", loadMyEvents);
  }, [loadMyEvents]);

  // Sales Growth — percentage by year (max year = 100%)
  const salesRaw = myEvents.reduce((acc, ev) => {
    const year = String(new Date(ev.date).getFullYear());
    const found = acc.find(i => i.y === year);
    if (found) found.v += 1; else acc.push({ y: year, v: 1 });
    return acc;
  }, []).sort((a, b) => a.y - b.y);
  const maxSales = Math.max(...salesRaw.map(d => d.v), 1);
  const salesData = salesRaw.map(d => ({ y: d.y, v: Math.round((d.v / maxSales) * 100) }));

  // Payouts — percentage by month, only months with events
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthRaw = monthNames.map((month, index) => ({
    name: month,
    v: myEvents.filter(ev => new Date(ev.date).getMonth() === index).length,
  })).filter(d => d.v > 0);
  const maxPayout = Math.max(...monthRaw.map(d => d.v), 1);
  const payoutData = monthRaw.map(d => ({ name: d.name, v: Math.round((d.v / maxPayout) * 100) }));
  const totalSponsors = myEvents.reduce((acc, e) => acc + (e.sponsors?.length || 0), 0);
  const totalSpeakers = myEvents.reduce((acc, e) => acc + (e.speakers?.length || 0), 0);
  const totalTickets  = myEvents.reduce((acc, e) => acc + (parseInt(e.capacity) || 0), 0);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const STAT_CARDS = [
    { label: "My Events",      value: String(myEvents.length),                         icon: <FaDollarSign  size={20} color={C.orange} />, bg: "#fff7ed", trend: null },
    { label: "Total Capacity", value: totalTickets > 0 ? String(totalTickets) : "—",   icon: <FaTicketAlt   size={20} color="#2563eb"  />, bg: "#eff6ff", trend: null },
    { label: "Sponsors",       value: String(totalSponsors),                           icon: <FaBuilding    size={20} color="#14b8a6"  />, bg: "#f0fdfa", trend: null },
    { label: "Speakers",       value: String(totalSpeakers),                           icon: <FaMicrophone  size={20} color="#a855f7"  />, bg: "#faf5ff", trend: null },
  ];
  useEffect(() => {
    const syncPhoto = () => {
      if (!userEmail) {
        setPhoto(null);
        return;
      }
      const k = `eh_photo_${userEmail.toLowerCase().trim()}`;
      const stored = safeLS.getItem(k);
      setPhoto(stored && stored.startsWith('data:image') ? stored : null);
    };

    syncPhoto();
    window.addEventListener("storage", syncPhoto);
    const id = setInterval(syncPhoto, 500);
    return () => {
      window.removeEventListener("storage", syncPhoto);
      clearInterval(id);
    };
  }, [userEmail]);

const formatEventDate = (
  dateStr = "",
  endDateISO = "",
  endTimeStr = "",
  startTimeStr = "",
  startAmPm = "",
  endAmPm = ""
) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const isISO = !isNaN(d.getTime()) && (dateStr.includes("T") || dateStr.includes("-"));

  if (isISO) {
    const parts = dateStr.replace("Z","").split("T");
    const [yr, mo, dy] = parts[0].split("-").map(Number);
    const [hr, mn] = (parts[1] || "00:00").split(":").map(Number);

    const local = new Date(yr, mo - 1, dy, hr, mn);

    const datePart = local.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const startTime = startTimeStr
      ? `${startTimeStr} ${startAmPm}`.trim()
      : local.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });

    let endT = "";

    if (endTimeStr) {
      endT = `${endTimeStr} ${endAmPm}`.trim();
    } else if (endDateISO) {
      const ep = endDateISO.replace("Z","").split("T");
      const [ey, em, ed] = ep[0].split("-").map(Number);
      const [eh, emn] = (ep[1] || "00:00").split(":").map(Number);

      endT = new Date(ey, em-1, ed, eh, emn).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }

    return datePart + ", " + startTime + (endT ? " – " + endT : "");
  }

  const commaIdx = dateStr.indexOf(",");
  const datePart = commaIdx > -1 ? dateStr.slice(0, commaIdx).trim() : dateStr;
  const startTime = commaIdx > -1 ? dateStr.slice(commaIdx + 1).trim() : "";
  const endT = endTimeStr || "";

  return datePart + (startTime ? ", " + startTime : "") + (endT ? " – " + endT : "");
};

  return (
    <div style={S.page}>
      <style>{`
        .stat-card { transition: transform .2s, box-shadow .2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,31,84,0.13) !important; }
        .chart-card { transition: box-shadow .2s; }
        .chart-card:hover { box-shadow: 0 8px 28px rgba(0,31,84,0.13) !important; }
        .create-btn { transition: background .2s, transform .15s; }
        .create-btn:hover { background: #ea6c00 !important; transform: scale(1.03); }
        
        @media (max-width: 1200px) {
          .sidebar-container, [class*="sidebar-container"] { width: 220px !important; }
        }

        @media (max-width: 992px) {
          .sidebar-container, [class*="sidebar-container"], aside {
            display: none !important;
          }
          /* Force content to fill the full width */
          .sidebar-container + div, aside + div {
            margin-left: 0 !important;
            padding: 24px 16px !important;
          }
          /* Scale down headers */
          h1 { font-size: 20px !important; }
          .create-btn { padding: 10px 14px !important; font-size: 11px !important; }
        }
      `}</style>

      <SidebarLayout active="organizer-dashboard" setPage={setPage} userName={userName} userEmail={userEmail} userRole={userRole} logout={logout} userPhoto={photo}>

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
          <button className="create-btn" onClick={() => setPage("create-event")}
            style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}>
            <FaPlus size={12} /> Create Event
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 32 }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="stat-card"
              onClick={() => { if(s.label === "My Events") { const el = document.getElementById("my-events"); if(el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } }}
              style={{ background: C.white, borderRadius: 14, padding: "20px 20px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(0,31,84,0.06)", cursor: s.label === "My Events" ? "pointer" : "default" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.icon}
                </div>
                {s.trend && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                    <FaArrowUp size={9} /> {s.trend}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.gray, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{s.value}</div>
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
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="y" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => v + "%"} />
                <Tooltip formatter={(v) => [v + "%", "Share"]} />
                <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card"
            style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}` }}>
            <h3 style={{ marginBottom: 4, fontWeight: 700, fontSize: 15, color: C.navy }}>Payouts</h3>
            <p style={{ fontSize: 12, color: C.gray, marginBottom: 16 }}>Monthly payout breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={payoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => v + "%"} />
                <Tooltip formatter={(v) => [v + "%", "Share"]} />
                <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: "#2563eb" }} connectNulls={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* My Events */}
        <div id="my-events" style={{ background: C.white, borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,31,84,0.06)", border: `1px solid ${C.border}`, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.navy, margin: 0 }}>My Events</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAllEvents(!showAllEvents)} style={{ background: "#f1f5f9", color: C.navy, border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                {showAllEvents ? "Show Mine Only" : "Show All Events"}
              </button>
              <button onClick={() => setPage("create-event")} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                <FaPlus size={10}/> New Event
              </button>
            </div>
          </div>
          {/* Debug: Show all events from localStorage when toggle is on */}
          {showAllEvents && (
            <div style={{ background: "#fef3c7", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: "#92400e" }}>DEBUG: All events in eh_events</div>
              {JSON.parse(safeLS.getItem("eh_events") || "[]").map(e => (
                <div key={e.id} style={{ marginBottom: 4, color: "#666" }}>
                  ID:{e.id} | Title:{e.title?.slice(0, 20)} | Org:{e.organizer?.slice(0, 15)} | OrgEmail:{e.organizerEmail?.slice(0, 15)}
                </div>
              ))}
            </div>
          )}
          {myEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.gray, fontSize: 14 }}>
              <FaCalendarAlt size={32} color={C.border} style={{ marginBottom: 12 }}/>
              <div>No events yet. Create your first event!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myEvents.map(ev => (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fafbff", cursor: "pointer", transition: "background 0.15s" }}
                  onClick={() => { 
                    safeLS.setItem("eh_scroll_to_section","speakers-section");
                    safeLS.setItem("eh_active_event_id", String(ev.id));
                    // Save event data - try full first, then slim if quota exceeded
                    try {
                      safeLS.setItem("eh_active_event_data", JSON.stringify(ev));
                    } catch (e) {
                      // If quota exceeded, store slimmed version without heavy fields
                      const slimEv = {
                        id: ev.id,
                        title: ev.title,
                        loc: ev.loc,
                        date: ev.date,
                        endDateISO: ev.endDateISO,
                        price: ev.price,
                        cat: ev.cat,
                        photo: ev.photo?.startsWith('data:') ? null : ev.photo, // don't store base64
                        description: ev.description?.slice(0, 200), // truncate
                        speakers: (ev.speakers || []).slice(0, 3), // limit
                        sponsors: (ev.sponsors || []).slice(0, 3), // limit
                      };
                      try {
                        safeLS.setItem("eh_active_event_data", JSON.stringify(slimEv));
                      } catch (e2) {
                        // Last resort: just store ID and let event-detail fetch from API
                        console.warn('[OrganizerDashboard] Could not store event data, will fetch from API');
                      }
                    }
                    if(setSelectedEvent) setSelectedEvent(ev);
                    window.location.href = `/event-detail?id=${ev.id}`;
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fafbff"}>
                  <img src={ev.photo} alt={ev.title} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0, display: 'block', position: 'relative', inset: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: C.gray }}>{formatEventDate(ev.date, ev.endDateISO, ev.endTime, ev.startTime, ev.startAmPm, ev.endAmPm)} · {ev.loc}</div>
                    <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginTop: 2 }}>{ev.price || "Free"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { if(setSelectedEvent) setSelectedEvent({...ev, isEditing:true}); setPage("create-event"); }}
                      style={{ padding: "6px 14px", borderRadius: 8, background: "#fff", border: `1.5px solid ${C.border}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                      <FaEdit size={11}/> Edit
                    </button>
                    {canUserDeleteEvent(ev, userRole, userName, userEmail) && (
                      <button 
                        onClick={async () => {
                          if (!window.confirm("Delete this event?")) return;
                          setDeletingEventId(ev.id);
                          console.log('[OrganizerDashboard] Deleting event:', {
                            eventId: ev.id,
                            eventTitle: ev.title,
                            userRole,
                            userName,
                            userEmail,
                          });
                          try {
                            await deleteEventWithSync(ev, userEmail, userRole, userName);
                            setDeletingEventId(null);
                          } catch (e) {
                            console.error('[OrganizerDashboard] Delete error:', e);
                            setDeletingEventId(null);
                            const errorMsg = e?.message || "Could not delete event";
                            
                            // Check if it's an auth error
                            if (errorMsg.includes('session expired') || errorMsg.includes('authentication failed') || errorMsg.includes('Unauthorized')) {
                              const shouldRetry = window.confirm("❌ " + errorMsg + "\n\nWould you like to log in again?");
                              if (shouldRetry) {
                                setPage("login");
                              }
                            } else {
                              alert("❌ " + errorMsg);
                            }
                          }
                        }}
                        disabled={deletingEventId === ev.id}
                        style={{ 
                          padding: "6px 10px", 
                          borderRadius: 8, 
                          background: "#fff", 
                          border: "1.5px solid #fecaca", 
                          cursor: deletingEventId === ev.id ? "not-allowed" : "pointer", 
                          fontSize: 12, 
                          fontWeight: 700,
                          color: "#ef4444", 
                          display: "flex", 
                          alignItems: "center",
                          gap: 5,
                          opacity: deletingEventId === ev.id ? 0.6 : 1,
                          transition: "opacity 0.2s"
                        }}>
                        <FaTrash size={11}/> {deletingEventId === ev.id ? "..." : ""}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </SidebarLayout>
    </div>
  );
}
