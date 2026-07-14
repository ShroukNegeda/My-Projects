"use client";
import { apiGetEvents, apiToggleFavorite, apiGetMyTickets, apiCreateBooking, loadOrganizerOwnedEventIds} from "@/lip/api";
import {
  canUserDeleteEvent,
  deleteEventWithSync,
  normName,
} from "@/lip/eventDeleteHelpers";
import { useState, useEffect, useCallback, useMemo } from "react";
import { C } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import AuthGuardModal from "../../components/AuthGuardModal";
import { 
  FaMapMarkerAlt, FaClock, FaHeart, FaRegHeart, FaSearch, 
  FaSlidersH, FaMicrochip, FaPalette, FaBriefcase, FaStar, 
  FaTicketAlt, FaTh, FaSpinner, FaTrash, FaRunning, FaGraduationCap, 
  FaTshirt, FaGamepad
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
    getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

// Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatEventDate = (dateStr = "", endDateISO = "") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const datePart = d.toLocaleDateString("en-US", { 
    month: "short", day: "numeric", year: "numeric" 
  });
  const startTime = d.toLocaleTimeString("en-US", { 
    hour: "numeric", minute: "2-digit", hour12: true 
  });
  
  if (endDateISO) {
    const endD = new Date(endDateISO);
    const endTime = endD.toLocaleTimeString("en-US", { 
      hour: "numeric", minute: "2-digit", hour12: true 
    });
    return `${datePart}, ${startTime} – ${endTime}`;
  }
  return `${datePart}, ${startTime}`;
};

const isValidBackendEvent = (e) => {
  if (!e || e.id == null) {
    console.log('[DEBUG] Event invalid: no id', e);
    return false;
  }
  const id = String(e.id).trim();
  if (!/^[0-9]+$/.test(id)) {
    console.log('[DEBUG] Event invalid: non-numeric id', e.id, e.title);
    return false;
  }

  const title = String(e.title || e.name || "").toLowerCase();
  const blockedTitles = ["erwer", "anything", "trrt"];
  if (blockedTitles.some((bad) => title.includes(bad))) {
    console.log('[DEBUG] Event invalid: blocked title', e.id, e.title);
    return false;
  }

  const deletedFlags = [
    e.deleted_at,
    e.deletedAt,
    e.is_deleted,
    e.deleted,
    e.archived,
    e.is_archived,
    e.isDeleted,
  ];
  if (deletedFlags.some((flag) => flag === true || flag === "1" || flag === 1 || flag === "yes" || flag === "true")) {
    console.log('[DEBUG] Event invalid: deleted/archived flag', e.id, e.title, {deleted_at: e.deleted_at, status: e.status});
    return false;
  }

  const status = String(e.status ?? e.event_status ?? e.state ?? "").toLowerCase();
  if (["deleted", "inactive", "archived", "cancelled", "canceled", "0", "false"].includes(status)) {
    console.log('[DEBUG] Event invalid: bad status', e.id, e.title, status);
    return false;
  }

  return true;
};

const CATEGORIES = [
  { label: "All", icon: <FaTh size={11} /> },
  { label: "Arts", icon: <FaPalette size={11} /> },
  { label: "Education", icon: <FaGraduationCap size={11} /> },
  { label: "Sport", icon: <FaRunning size={11} /> },
  { label: "Fashion", icon: <FaTshirt size={11} /> },
  { label: "Business", icon: <FaBriefcase size={11} /> },
  { label: "Gaming", icon: <FaGamepad size={11} /> },
];

const CATEGORY_SLUG = {
  Arts: "arts",
  Education: "education",
  Sport: "sport",
  Fashion: "fashion",
  Business: "business",
  Gaming: "gaming",
};

const catIcons = {
  Arts: <FaPalette size={11} />,
  Education: <FaGraduationCap size={11} />,
  Sport: <FaRunning size={11} />,
  Fashion: <FaTshirt size={11} />,
  Business: <FaBriefcase size={11} />,
  Gaming: <FaGamepad size={11} />,
};

export default function EventsPage({page, setPage, userName, userEmail, userRole, favorites = [], setFavorites, bookedTickets = [], setBookedTickets, setSelectedEvent}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(() => safeLS.getItem("eh_search_query") || "");
  const [authModal, setAuthModal] = useState(false);
  const [EVENTS, setEVENTS] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [deletedEventsCount, setDeletedEventsCount] = useState(0);

  // Load deleted events count only on client side to avoid hydration mismatch
  useEffect(() => {
    const count = JSON.parse(safeLS.getItem('eh_deleted_events') || '[]').length;
    setDeletedEventsCount(count);
  }, []);

  useEffect(() => {
    safeLS.removeItem("eh_search_query");
  }, []);

  const debouncedSearch = useDebounce(search, 500);
  const isGuest = !userName;

  // Load Events
  const loadEvents = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      
      // Keep local events - they will be merged with backend events
      
      const deletedIds = new Set(
        (JSON.parse(safeLS.getItem('eh_deleted_events') || '[]') || []).map(String)
      );
      
      const response = await apiGetEvents(params);
      console.log('[DEBUG] Raw API response:', response);
      let eventsArray = [];
      
      if (Array.isArray(response?.message?.data)) {
        eventsArray = response.message.data;
        console.log('[DEBUG] Got events from response.message.data:', eventsArray.length);
      } else if (Array.isArray(response?.data)) {
        eventsArray = response.data;
        console.log('[DEBUG] Got events from response.data:', eventsArray.length);
      } else if (Array.isArray(response)) {
        eventsArray = response;
        console.log('[DEBUG] Got events from response directly:', eventsArray.length);
      } else {
        console.log('[DEBUG] No events array found in response', response);
      }

      console.log('[DEBUG] Before filtering:', eventsArray.length, 'events');
      const validEvents = eventsArray.filter((e) => isValidBackendEvent(e));
      console.log('[DEBUG] After isValidBackendEvent filter:', validEvents.length, 'events');
      const notDeletedEvents = validEvents.filter((e) => !deletedIds.has(String(e.id)));
      console.log('[DEBUG] After deletedIds filter:', notDeletedEvents.length, 'events');
      console.log('[DEBUG] Deleted IDs:', [...deletedIds]);
      
      // Log raw event types to see what backend uses
      console.log('[DEBUG] Raw backend event types:', notDeletedEvents.map(e => ({ id: e.id, type: e.type, event_type: e.event_type, event_mode: e.event_mode })));
      
      const apiEvents = notDeletedEvents.map(e => ({
          id: e.id,
          title: e.title || "Untitled",
          loc: e.location || e.venue_name || e.address || "TBD",
          date: e.start_time,
          endDateISO: e.end_time,
          price: e.price_type === "free" ? "Free" : `$${e.price || 0}`,
          type: e.type,
          cat:
            (typeof e.category === "object" && e.category?.name) ||
            e.category ||
            e.category_name ||
            "Tech",
          photo:
            e.image ||
            e.photo ||
            e.image_url ||
            e.cover_image ||
            e.thumbnail ||
            `https://picsum.photos/seed/ev${e.id}/400/300`,
          description: e.description || "",
          capacity: e.capacity || "Unlimited",
          address: e.address || "",
          is_favorite: e.is_favorite || false,
          organizer_name:
            e.organizer_name ||
            e.organizer?.name ||
            e.organizerName ||
            e.created_by_name ||
            e.user?.name,
          organizer_email:
            e.organizer_email ||
            e.organizer?.email ||
            e.organizerEmail ||
            e.created_by_email ||
            e.user?.email,
          user_id:
            e.user_id ??
            e.organizer_id ??
            e.created_by ??
            e.creator_id ??
            e.owner_id,
        }));

      // Show backend events (API is working correctly) and add user's local events
      const unwantedTitles = ['erwer', 'anything', 'trrt'];
      
      console.log('🔧 Loading events - API working with', apiEvents.length, 'backend events');
      
      // Filter out unwanted backend events
      const filteredBackendEvents = apiEvents.filter(event => 
        !event.title || !unwantedTitles.some(unwanted => 
          event.title.toLowerCase().includes(unwanted.toLowerCase())
        )
      );
      
      console.log(`� Backend events after filtering: ${filteredBackendEvents.length}`);
      
      // Merge backend events with local events
      const rawLocalEvents = JSON.parse(safeLS.getItem("eh_events") || "[]");
      console.log('[DEBUG] Raw local events from eh_events:', rawLocalEvents.length, rawLocalEvents.map(e => ({ id: e.id, title: e.title })));
      
      const localEvents = rawLocalEvents.map(ev => ({
        id: ev.id,
        title: ev.title || "Untitled",
        loc: ev.loc || "TBD",
        date: ev.date,
        endDateISO: ev.endDateISO,
        price: ev.price || "Free",
        cat: ev.cat || "Tech",
        photo: ev.photo || `https://picsum.photos/seed/ev${ev.id}/400/300`,
        description: ev.description || "",
        capacity: ev.capacity || "Unlimited",
        address: ev.address || "",
        is_favorite: false,
        organizer_name: ev.organizer,
        organizer_email: ev.organizerEmail,
        user_id: null,
      }));
      
      // Merge events, avoiding duplicates by ID
      const seenIds = new Set(filteredBackendEvents.map(e => String(e.id)));
      const filteredLocalEvents = localEvents.filter(e => {
        const isDup = seenIds.has(String(e.id));
        if (isDup) console.log('[DEBUG] Filtering out duplicate local event:', e.id, e.title);
        return !isDup;
      });
      console.log('[DEBUG] Local events after dedup:', filteredLocalEvents.length);
      
      const allEvents = [
        ...filteredBackendEvents,
        ...filteredLocalEvents
      ];
      console.log(`📋 Total events (backend + local): ${allEvents.length}`);
      const catDebug = allEvents.map(e => ({ id: e.id, title: e.title, cat: e.cat }));
      console.log('[DEBUG] All event categories:', catDebug);
      
      // Check specifically for Arts category
      const artsEvents = allEvents.filter(e => String(e.cat).toLowerCase().includes('art'));
      console.log('[DEBUG] Events matching "art":', artsEvents.map(e => ({ id: e.id, title: e.title, cat: e.cat })));
      
      setEVENTS(allEvents);
    } catch (error) {
      console.error("Events error:", error);
      
      // Fallback to local events when API fails
      const rawLocalEvents = JSON.parse(safeLS.getItem("eh_events") || "[]");
      console.log('[DEBUG] API failed, using local fallback:', rawLocalEvents.length, 'events');
      
      const localEvents = rawLocalEvents.map(ev => ({
        id: ev.id,
        title: ev.title || "Untitled",
        loc: ev.loc || "TBD",
        date: ev.date,
        endDateISO: ev.endDateISO,
        price: ev.price || "Free",
        cat: ev.cat || "Tech",
        photo: ev.photo || `https://picsum.photos/seed/ev${ev.id}/400/300`,
        description: ev.description || "",
        capacity: ev.capacity || "Unlimited",
        address: ev.address || "",
        is_favorite: false,
        organizer_name: ev.organizer,
        organizer_email: ev.organizerEmail,
        user_id: null,
      }));
      
      setEVENTS(localEvents);
      setError("Backend unavailable. Showing local events only. Please log in to see all events.");
    } finally {
      setLoading(false);
    }
  }, [userName, userRole, userEmail]);

  // *** LOAD EVENTS ON MOUNT AND FILTER CHANGES ***
  // First load: get all events without category filter
  useEffect(() => {
    loadEvents({
      per_page: 100,
    });
  }, [loadEvents]);
  
  // Filter changes: apply frontend filtering only (backend may not support new category slugs)
  useEffect(() => {
    if (activeCategory !== "All" || debouncedSearch) {
      // Frontend filtering only - backend already returned all events
      console.log('[DEBUG] Frontend filtering by:', activeCategory, debouncedSearch);
    }
  }, [activeCategory, debouncedSearch]);

  const loadMyTickets = async () => {
    try {
      const tickets = await apiGetMyTickets();
      setMyTickets(tickets?.data || tickets || []);
    } catch (e) {
      if (e.message?.includes('Unauthenticated')) {
        setMyTickets([]); 
      } else {
        console.error("Tickets error:", e);
      }
    }
  };

  const isFav = (id) => favorites.some(e => e.id == id) || EVENTS.find(e => e.id == id)?.is_favorite;
  const isBooked = (eventId) => myTickets.some(t => t.event_id == eventId);

  
  const guard = (fn) => (...args) => {
    if (isGuest) {
      setAuthModal(true);
      return;
    }
    fn(...args);
  };

  const toggleFavorite = guard(async (ev, event) => {
    ev.stopPropagation();
    
    // Since the API endpoint doesn't exist (404 error), work locally only
    const newFavorites = isFav(event.id)
      ? favorites.filter(e => e.id !== event.id)
      : [...favorites, event];
    
    setFavorites(newFavorites);
    
    // Sync to local storage (use per-user key like AppContext)
    try {
      const favKey = userEmail ? `eh_favorites_${userEmail}` : 'eh_favorites';
      localStorage.setItem(favKey, JSON.stringify(newFavorites));
      console.log('Favorite updated locally:', event.title);
    } catch (err) {
      console.warn('Failed to save favorites to local storage:', err);
    }
  });

  const handleBookNow = guard(async (ev, event) => {
    ev.stopPropagation();
    try {
      await apiCreateBooking(event.id, 1);
      loadMyTickets();
      // Booked successfully
    } catch (e) {
      console.error("Booking error:", e.message || "Booking failed");
    }
  });

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    safeLS.setItem("eh_active_event_id", String(event.id));
    // Save full event data with speakers and sponsors to localStorage
    safeLS.setItem("eh_active_event_data", JSON.stringify(event));
    window.location.href = `/event-detail?id=${event.id}`;
  };

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch = e.title.toLowerCase().includes(q) ||
          String(e.loc || "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      
      // Category filter - match by category OR event title contains category name
      if (activeCategory !== "All") {
        const catLower = activeCategory.toLowerCase();
        const eventCat = String(e.cat || "").toLowerCase();
        const eventTitle = String(e.title || "").toLowerCase();
        
        // For Gaming, also match 'game' in title
        const searchTerms = activeCategory === "Gaming" ? [catLower, "game"] : [catLower];
        
        // Match if: category matches OR event title contains any search term
        const matchesCategory = searchTerms.some(term => 
          eventCat === term || 
          eventCat.includes(term) ||
          eventTitle.includes(term)
        );
        
        console.log('[DEBUG] Category filter:', { activeCategory, catLower, eventCat, eventTitle, matchesCategory });
        
        if (!matchesCategory) return false;
      }
      
      return true;
    });
  }, [EVENTS, search, activeCategory]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        .ev-card{transition:transform .25s,box-shadow .25s}
        .ev-card:hover{transform:translateY(-4px);box-shadow:0 8px 40px rgba(0,31,84,0.15)}
        .book-btn{transition:background .2s,transform .15s}
        .book-btn:hover{background:#ea6c00!important;transform:scale(1.03)}
        .cat-btn{transition:all .2s}
        .cat-btn:hover{transform:translateY(-1px)}
        .heart-btn{background:none;border:none;cursor:pointer;padding:4px;transition:transform .2s}
        .heart-btn:hover{transform:scale(1.3)}
        .s-input{transition:box-shadow .2s}
        .s-input:focus{outline:none;box-shadow:0 0 0 3px rgba(249,115,22,.18)}
        @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
        }
     `}</style>

      <NavBar page="events" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      <div className="main-container" style={{ padding: "40px 60px" }}>
        <div className="header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6, color: C.navy }}>Discover Events</h1>
            <p style={{ color: C.gray, fontSize: 14, margin: 0 }}>
              {EVENTS.length} {EVENTS.length === 1 ? "event" : "events"} found
            </p>
            <button
              onClick={() => {
                const deleted = JSON.parse(safeLS.getItem('eh_deleted_events') || '[]');
                if (deleted.length > 0 && confirm(`Restore ${deleted.length} hidden events?`)) {
                  safeLS.removeItem('eh_deleted_events');
                  setDeletedEventsCount(0);
                  loadEvents({ per_page: 100 });
                }
              }}
              style={{ fontSize: 11, color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
            >
              {deletedEventsCount > 0
                ? `🔄 ${deletedEventsCount} events hidden - click to restore`
                : ''}
            </button>
                      </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray, fontSize: 13 }} />
              <input 
                className="s-input" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search events..."
                style={{ 
                  padding: "10px 42px 10px 38px", borderRadius: 30, border: `1.5px solid ${C.border}`, 
                  background: C.white, fontSize: 13, fontFamily: "Poppins", color: C.navy, width: 220 
                }} 
              />
            </div>
          </div>
        </div>

        <div className="category-scroll" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {CATEGORIES.map(({ label, icon }) => {
            const active = activeCategory === label;
            return (
              <button 
                key={label} 
                className="cat-btn" 
                onClick={() => setActiveCategory(label)}
                style={{ 
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", 
                  borderRadius: 20, border: `1px solid ${active ? C.navy : C.border}`, 
                  background: active ? C.navy : C.white, color: active ? C.white : C.navy, 
                  fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Poppins", 
                  boxShadow: active ? "0 4px 12px rgba(0,31,84,0.18)" : "none" 
                }}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>
        
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <FaSpinner size={40} color={C.orange} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 15, fontSize: 15, color: C.gray, fontWeight: 500 }}>
              Loading events...
            </p>
          </div>
        )}
        
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "50px 30px", background: "#fff", borderRadius: 16, maxWidth: 500, margin: "40px auto",boxShadow: "0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#dc2626", marginBottom: 10 }}>
            Something went wrong
          </p>
          <p style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>
            {error}
          </p>
          <button onClick={() => loadEvents({ per_page: 100 })} style={{background: C.orange, color: "#fff",border: "none",borderRadius: 10,padding: "10px 20px",cursor: "pointer",fontWeight: 600}}>
            Try Again
          </button>
          <button 
            onClick={() => {
              safeLS.removeItem('eh_deleted_events');
              alert('Deleted events restored! Refreshing...');
              loadEvents({ per_page: 100 });
            }} 
            style={{background: "#22c55e", color: "#fff",border: "none",borderRadius: 10,padding: "10px 20px",cursor: "pointer",fontWeight: 600, marginLeft: 10}}
          >
            Restore Deleted Events
          </button>
          </div>
        )}
        
        {filtered.length === 0 && !loading && !error && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.gray }}>
            {search || activeCategory !== "All" ? "No matching events" : "No events available"}
          </div>
        )}

        <div className="events-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "12px 24px" }}>
          {filtered.map((e) => (
            <div key={e.id} className="ev-card" onClick={() => handleCardClick(e)}
              style={{ 
                display: "grid", gridTemplateColumns: "160px 1fr", background: "#fff", borderRadius: 16, overflow: "hidden", 
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)", cursor: "pointer", border: `1px solid ${C.border}`,
                height: "fit-content"
              }}
            >
              <div className="ev-img-container" style={{ position: "relative", overflow: "hidden", height: "100%", width: "100%", background: "#f0f0f0", minHeight: "100%" }}>
                <img 
                  src={e.photo} 
                  alt={e.title}
                  onError={(img) => img.target.src = `https://picsum.photos/seed/ev${e.id}/400/300`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: 'block', position: 'absolute', top: 0, left: 0, minWidth: "100%", minHeight: "100%" }} 
                />
                <div style={{ 
                  position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.7)", 
                  backdropFilter: "blur(4px)", borderRadius: 20, padding: "2px 9px", 
                  fontSize: 11, fontWeight: 700, color: "#fff" 
                }}>
                  {e.price}
                </div>
              </div>
              
              <div className="ev-details" style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ 
                      display: "flex", alignItems: "center", gap: 5, fontSize: 11, 
                      background: C.bg, color: C.navy, padding: "3px 10px", borderRadius: 20, fontWeight: 600 
                    }}>
                      {catIcons[e.cat] || <FaTh size={11} />} {e.cat}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {canUserDeleteEvent(e, userRole, userName, userEmail) && (
                        <button
                          type="button"
                          className="heart-btn"
                          title="Delete event"
                          onClick={async (evClick) => {
                            evClick.stopPropagation();
                            if (!window.confirm("Delete this event?")) return;
                            try {
                              await deleteEventWithSync(e, userEmail, userRole, userName);
                              // Reload events after delete
                              loadEvents({
                                category: activeCategory === "All" ? undefined : CATEGORY_SLUG[activeCategory],
                                search: debouncedSearch,
                                per_page: 100,
                              });
                              // Event deleted successfully
                            } catch (err) {
                              const errorMsg = err?.message || "Could not delete";
                              console.error("Delete error:", errorMsg);
                            }
                          }}
                        >
                          <FaTrash color="#ef4444" size={15} />
                        </button>
                      )}
                      <button className="heart-btn" onClick={(ev) => toggleFavorite(ev, e)}>
                        {isFav(e.id) ? <FaHeart color={C.orange} size={16} /> : <FaRegHeart color={C.gray} size={16} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, margin: "2px 0 4px", color: C.navy, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {e.title}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                      <FaMapMarkerAlt color={C.orange} size={11} /> {e.loc}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                      <FaClock color={C.orange} size={11} />
                      {formatEventDate(e.date, e.endDateISO)}
                    </div>
                  </div>
                </div>
                <button 
                  className="book-btn" 
                  onClick={(ev) => handleBookNow(ev, e)}
                  disabled={isBooked(e.id)}
                  style={{ 
                    background: isBooked(e.id) ? "#10b981" : C.orange, color: C.white, 
                    border: "none", borderRadius: 8, padding: "8px 0", width: "100%", 
                    fontWeight: 600, fontSize: 13, cursor: isBooked(e.id) ? "default" : "pointer", 
                    marginTop: 12, marginBottom: 0
                  }}
                >
                  {isBooked(e.id) ? "✓ Booked" : "Book Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .main-container { padding: 20px !important; }
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .header-flex {
            flex-direction: column !important;
            align-items: stretch !important; 
            gap: 15px !important;
          }
          .s-input { 
            width: 100% !important; 
            max-width: none !important; 
            box-sizing: border-box !important;
          }
          div[style*="position: relative"] { 
            width: 100% !important; 
          }
          .category-scroll { 
            flex-wrap: nowrap !important; 
            overflow-x: auto !important; 
            padding-bottom: 10px !important;
          }
          .cat-btn { white-space: nowrap !important; }
        }

        @media (max-width: 768px) { /* Adjusted breakpoint for better tablet experience */
          .events-grid { grid-template-columns: 1fr !important; }
          .ev-card { 
            grid-template-columns: 1fr !important;
            grid-template-rows: 220px auto !important;
            min-height: auto !important;
          }
          .ev-img-container { 
            height: 220px !important;
          }
          .ev-img-container img { /* Ensured full photo fill on mobile */
             position: absolute !important;
             inset: 0 !important;
             width: 100% !important;
             height: 100% !important;
          }
        }
      `}</style>
      {authModal && (
        <AuthGuardModal
          onClose={() => setAuthModal(false)}
          onLogin={() => { setAuthModal(false); setPage("login"); }}
          onSignup={() => { setAuthModal(false); setPage("signup"); }}
        />
      )}
    </div>
  );
}