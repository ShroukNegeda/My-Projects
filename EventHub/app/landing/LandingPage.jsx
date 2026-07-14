'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import { apiGetEvents, apiGetHome } from "@/lip/api";
import {
  canUserDeleteEvent,
  deleteEventWithSync,
} from "@/lip/eventDeleteHelpers";
import styles from "./Landing.module.css";
import NavBar from "../../components/NavBar";
import { 
  FaUsers, FaCalendarAlt, FaMicrophone, FaHandshake, FaMapMarkerAlt, FaClock,
  FaSearch, FaArrowRight, FaGlobe, FaSpinner, FaTrash,
  FaPalette, FaGraduationCap, FaRunning, FaTshirt, FaBriefcase, FaGamepad, FaTh
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

const SPEAKERS_DATA = {
  Arts: ["John Doe - Artist", "Jane Smith - Curator", "Mike Johnson - Painter"],
  Education: ["Dr. Ahmed Ali - AI Expert", "Prof. Sara Khan - Data Scientist", "Eng. Omar Hassan - Developer"],
  Sport: ["Coach Mohamed Salah", "Fitness Trainer Ali", "Sports Nutritionist Sara"],
  Fashion: ["Designer Rana", "Fashion Stylist Mona", "Model Agency Director"],
  Business: ["CEO Startup Founder", "Investor Angel", "Marketing Director"],
  Gaming: ["Game Developer Pro", "Esports Player", "VR Expert"]
};

const SPONSORS_DATA = ["RedBull", "Nike", "Google", "Microsoft", "CocaCola", "Adidas", "Amazon", "Eventbrite"];

const generateLandingDemoEvents = (count = 15) => {
  const categories = ["Arts", "Education", "Sport", "Fashion", "Business", "Gaming"];
  const events = [];
  
  for(let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const eventId = `landing_demo_${i}_${Date.now()}`;
    const speakers = SPEAKERS_DATA[category].sort(() => 0.5 - Math.random()).slice(0, 2);
    const sponsors = SPONSORS_DATA.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    events.push({
      id: eventId,
      title: `${category} Event ${i + 1}`,
      loc: `${category} Venue ${Math.floor(Math.random() * 50)}`,
      date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      endTime: new Date(Date.now() + 2*60*60*1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      price: Math.random() > 0.4 ? `$${Math.floor(Math.random() * 80) + 10}` : "Free",
      cat: category,
      photo: `https://picsum.photos/seed/landing${eventId}/400/300?random=${Math.random()}`,
      description: "Amazing event with great speakers and sponsors!",
      type: Math.random() > 0.7 ? "online" : "in-person",
      isOnline: Math.random() > 0.7,
      organizer_name: `Organizer ${category}`,
      speakers: speakers.map(name => ({ name, photo: `https://picsum.photos/seed/speaker${Math.random()}/60/60` })),
      sponsors: sponsors.map(name => ({
        name,
        logo: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`
      }))
    });
  }
  
  return events;
};

// CTA Cards
const CTA_CARDS = [
  { icon: <FaUsers size={28} />, title: "Want To Attend an Event?", desc: "Explore upcoming events and secure your spot.", btn: "Create Account", page: "signup" },
  { icon: <FaCalendarAlt size={28} />, title: "Want To Organize an Event?", desc: "Create and publish events easily.", btn: "Start Organizing", page: "organizer-signup-1" },
  { icon: <FaMicrophone size={28} />, title: "Want To Become a Speaker?", desc: "Share your experience at top events.", btn: "Submit Profile", page: "speaker-signup-1" },
  { icon: <FaHandshake size={28} />, title: "Want To Sponsor an Event?", desc: "Promote your brand to the right audience.", btn: "Explore Sponsorship", page: "sponsor-signup-1" },
];

const CITIES = ["Cairo", "Sharm Elsheikh", "Dahab", "Alexandria", "North Coast", "Luxor", "Aswan"];

const FILTERED_EVENT_TITLES = ["erwer", "anything", "trrt"];

const catIcons = {
  Arts: <FaPalette size={12} />,
  Education: <FaGraduationCap size={12} />,
  Sport: <FaRunning size={12} />,
  Fashion: <FaTshirt size={12} />,
  Business: <FaBriefcase size={12} />,
  Gaming: <FaGamepad size={12} />,
  Tech: <FaTh size={12} />,
};

const EventCard = ({ e, userRole, userName, userEmail, handleEventClick }) => (
  <div className={styles.card} style={{ display: 'flex', flexDirection: 'column' }} onClick={() => handleEventClick(e)}>
    <div style={{ width: '100%', height: 150, overflow: 'hidden', flexShrink: 0 }}>
      <img 
        className={styles.cardImage} 
        src={e.photo} 
        alt={e.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(img) => img.target.src = e.isOnline ? `https://picsum.photos/seed/online${e.id}/400/300` : `https://picsum.photos/seed/ev${e.id}/400/300`} 
      />
    </div>
    <div className={styles.cardBody}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ 
          display: "flex", alignItems: "center", gap: 4, fontSize: 12, 
          background: e.isOnline ? "#ecfdf5" : "#f0f9ff", color: "#f97316", padding: "2px 8px", 
          borderRadius: 12, fontWeight: 600 
        }}>
          {catIcons[e.cat] || <FaTh size={12} />} {e.cat}
        </span>
      </div>
      
      <div className={styles.cardTitle} style={{ margin: '0 0 2px 0' }}>{e.title}</div>
      <div className={styles.cardMeta} style={{ margin: '0 0 4px 0' }}>
        {e.isOnline ? <FaGlobe style={{ marginRight: 4 }} /> : <FaMapMarkerAlt style={{ marginRight: 4 }} />}
        {e.isOnline ? ' Online' : ` ${e.loc}`} | 
        <FaClock style={{ marginRight: 4, marginLeft: 8 }} /> {e.date ? `${e.date} · ` : ''}{e.time}
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 'auto' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>{e.price}</span>
        {canUserDeleteEvent(e, userRole, userName, userEmail) && (
          <button type="button" onClick={(ev) => {
            ev.stopPropagation();
            if (window.confirm("Delete this event?")) {
              deleteEventWithSync(e, userEmail, userRole, userName).catch(console.error);
            }
          }} style={{
            background: "none", border: "1px solid #fecaca", color: "#f97316",
            padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer"
          }}>
            <FaTrash size={12} />
          </button>
        )}
      </div>
      <button className={styles.cardBtn} style={{ marginTop: 8, marginBottom: 0 }}>
        Book Now
      </button>
    </div>
  </div>
);

const isValidBackendEvent = (e) => {
  if (!e || e.id == null) return false;
  const id = String(e.id).trim();
  if (!/^[0-9]+$/.test(id)) return false;

  const title = String(e.title || e.name || "").toLowerCase();
  if (FILTERED_EVENT_TITLES.some((bad) => title.includes(bad))) return false;

  const deletedFlags = [e.deleted_at, e.deletedAt, e.is_deleted, e.deleted, e.archived, e.is_archived, e.isDeleted];
  if (deletedFlags.some((flag) => flag === true || flag === "1" || flag === 1 || flag === "yes" || flag === "true")) return false;

  const status = String(e.status ?? e.event_status ?? e.state ?? "").toLowerCase();
  if (["deleted", "inactive", "archived", "cancelled", "canceled", "0", "false"].includes(status)) return false;

  return true;
};

const isEventFiltered = (event) => {
  const deletedEventIds = JSON.parse(safeLS.getItem('eh_deleted_events') || '[]');
  return deletedEventIds.includes(String(event.id));
};

const normalizeEvent = (ev) => {
  console.log("Raw event data:", ev);
  return {
    id: ev.id || Math.random(),
    title: ev.title || "Untitled Event",
    loc: ev.location || ev.venue_name || "Location TBD",
    date: ev.start_time ? new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "TBD",
    time: ev.start_time ? new Date(ev.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "",
    endTime: ev.end_time ? new Date(ev.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "",
    price: ev.price_type === "free" ? "Free" : (ev.price ? `$${ev.price}` : "Free"),
    cat: ev.category?.name || ev.category || "Tech",
    photo: ev.image || ev.photo || ev.image_url || ev.cover_image || ev.thumbnail || `https://picsum.photos/seed/ev${ev.id || Math.random()}/400/300`,
    description: ev.description || "",
    type: ev.type || "in-person",
    isOnline: ev.type === "online",
    organizer_name: ev.organizer_name || ev.organizer?.name || ev.organizerName || ev.created_by_name || ev.user?.name,
    organizer_email: ev.organizer_email || ev.organizer?.email || ev.organizerEmail || ev.created_by_email || ev.user?.email,
    user_id: ev.user_id ?? ev.organizer_id ?? ev.created_by ?? ev.creator_id ?? ev.owner_id,
    speakers: ev.speakers || [],
    sponsors: ev.sponsors || []
  };
};

function extractHomeSections(res) {
  const msg = res?.message;
  const root = typeof msg === "object" && msg !== null && !Array.isArray(msg) ? msg : res?.data && typeof res.data === "object" && !Array.isArray(res.data) ? res.data : res;
  const pick = (...keys) => {
    if (!root || typeof root !== "object") return [];
    for (const k of keys) {
      const v = root[k];
      if (Array.isArray(v)) return v;
      if (v?.data && Array.isArray(v.data)) return v.data;
    }
    return [];
  };
  return {
    trending: pick("trending_events", "trending", "trendings", "trendingEvents"),
    online: pick("online_events", "online", "onlineEvents"),
    cities: pick("cities", "city_events", "events_by_city"),
  };
}

function parseEventsArray(eventsRes) {
  let eventsArray = [];
  if (typeof eventsRes?.data === "string" && String(eventsRes.data).includes("Events retrieved")) {
    eventsArray = [];
  } else if (Array.isArray(eventsRes)) {
    eventsArray = eventsRes;
  } else if (eventsRes && Array.isArray(eventsRes.data)) {
    eventsArray = eventsRes.data;
  } else if (eventsRes && Array.isArray(eventsRes.events)) {
    eventsArray = eventsRes.events;
  } else if (eventsRes?.message?.data && Array.isArray(eventsRes.message.data)) {
    eventsArray = eventsRes.message.data;
  } else if (eventsRes?.data?.data && Array.isArray(eventsRes.data.data)) {
    eventsArray = eventsRes.data.data;
  }
  return eventsArray;
}

export default function LandingPage({ page, setPage, userName, userEmail, userRole }) {
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [onlineEvents, setOnlineEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [cityCards, setCityCards] = useState(() => CITIES.map((name, i) => ({ name, photo: `https://picsum.photos/seed/city${i}/400/300` })));
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [homeRes, eventsRes] = await Promise.all([
        apiGetHome().catch(() => null),
        apiGetEvents().catch(() => null),
      ]);

      const ex = homeRes ? extractHomeSections(homeRes) : { trending: [], online: [], cities: [] };
      const eventsArray = eventsRes ? parseEventsArray(eventsRes) : [];

      const numericEvents = eventsArray.filter(isValidBackendEvent);
      const filteredEventsArray = numericEvents.filter(e => !isEventFiltered(e));

      let trendingNorm = ex.trending.length
        ? ex.trending.filter(isValidBackendEvent).filter(e => !isEventFiltered(e)).map(normalizeEvent).slice(0, 8)
        : filteredEventsArray.filter((e) => (e.type || "").toLowerCase() !== "online").slice(0, 8).map(normalizeEvent);

      let onlineNorm = ex.online.length
        ? ex.online.filter(isValidBackendEvent).filter(e => !isEventFiltered(e)).map(normalizeEvent).slice(0, 8)
        : filteredEventsArray.filter((e) => (e.type || "").toLowerCase() === "online").slice(0, 8).map(normalizeEvent);

      if (trendingNorm.length < 8) {
        const demoEvents = generateLandingDemoEvents(8 - trendingNorm.length);
        trendingNorm = [...trendingNorm, ...demoEvents.filter(d => !trendingNorm.some(t => t.id === d.id))];
      }
      
      if (onlineNorm.length < 8) {
        const demoOnline = generateLandingDemoEvents(8 - onlineNorm.length).filter(d => d.isOnline);
        onlineNorm = [...onlineNorm, ...demoOnline.filter(d => !onlineNorm.some(o => o.id === d.id))];
      }

      const normalizedAll = filteredEventsArray.map(normalizeEvent);

      if (Array.isArray(ex.cities) && ex.cities.length) {
        setCityCards(ex.cities.map((c, i) => 
          typeof c === "string" 
            ? { name: c, photo: `https://picsum.photos/seed/city-${c}-${i}/400/300` }
            : { name: c.name || c.city || c.title || "City", photo: c.image || c.photo || `https://picsum.photos/seed/city${i}/400/300` }
        ));
      } else {
        setCityCards(CITIES.map((name, i) => ({ name, photo: `https://picsum.photos/seed/city${i}/400/300` })));
      }

      setAllEvents(normalizedAll.length ? normalizedAll : trendingNorm.concat(onlineNorm));
      setTrendingEvents(trendingNorm);
      setOnlineEvents(onlineNorm);
      
    } catch (error) {
      console.error("❌ Error loading events:", error);
      setError("Failed to connect to events server");
      
      const demoTrending = generateLandingDemoEvents(12).filter(e => !e.isOnline);
      const demoOnline = generateLandingDemoEvents(8).filter(e => e.isOnline);
      setTrendingEvents(demoTrending);
      setOnlineEvents(demoOnline);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onEventsUpdated = () => loadData();
    window.addEventListener("eventsUpdated", onEventsUpdated);
    return () => window.removeEventListener("eventsUpdated", onEventsUpdated);
  }, [loadData]);

  const createDragHandlers = () => {
    const rowRef = useRef(null);
    const handleMouseDown = (e) => {
      const slider = rowRef.current;
      if (!slider) return;
      slider.isDown = true;
      slider.startX = e.pageX - slider.offsetLeft;
      slider.scrollLeftStart = slider.scrollLeft;
    };
    const handleMouseLeave = () => { const slider = rowRef.current; if (slider) slider.isDown = false; };
    const handleMouseUp = () => { const slider = rowRef.current; if (slider) slider.isDown = false; };
    const handleMouseMove = (e) => {
      const slider = rowRef.current;
      if (!slider || !slider.isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.startX;
      const walk = (x - slider.startX) * 1.5;
      slider.scrollLeft = slider.scrollLeftStart - walk;
    };
    return { rowRef, handleMouseDown, handleMouseLeave, handleMouseUp, handleMouseMove };
  };

  const trendingDrag = createDragHandlers();
  const onlineDrag = createDragHandlers();
  const citiesDrag = createDragHandlers();

  if (loading) {
    return (
      <div className={styles.page}>
        <NavBar page="landing" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />
        <div style={{ textAlign: "center", padding: "100px 0", background: "#fff" }}>
          <FaSpinner size={40} color="#f97316" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 15, fontSize: 15, color: "#777", fontWeight: 500 }}>Loading events...</p>
        </div>
      </div>
    );
  }

  const handleEventClick = (e) => {
    safeLS.setItem("eh_active_event_id", String(e.id));
    safeLS.setItem("eh_active_event_data", JSON.stringify(e)); // 🔥 حفظ مع speakers + sponsors
    window.location.href = `/event-detail?id=${e.id}`;
  };

  const handleSearchTrigger = () => {
    safeLS.setItem("eh_search_query", searchTerm);
    setPage("events");
  };

  return (
    <div className={styles.page}>
      <NavBar page="landing" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />
      
      {/* ERROR BANNER */}
      {error && (
        <div style={{
          background: "#fff3cd", color: "#856404", padding: "12px 20px", margin: "20px",
          borderRadius: "8px", border: "1px solid #ffeaa7", textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <style>{`
        /* Global Card Compactness */
        .${styles.card} {
          height: 100% !important;
          min-height: 300px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .${styles.cardBody} {
          padding: 12px 12px 0 12px !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
        }
        .${styles.section} {
          padding-top: 40px !important;
          padding-bottom: 60px !important;
        }
        .${styles.sectionHeader}, .${styles.section} h2 {
          margin-top: 0 !important;
          margin-bottom: 4px !important;
        }
      `}</style>

      <style>{`
        /* Professional Responsive Overrides */
        @media (max-width: 1024px) {
          .${styles.hero} {
            height: auto !important;
            min-height: 450px;
            display: flex;
            flex-direction: column; /* Stacks image on top of content */
          }
          .${styles.heroImg} {
            position: relative !important;
            width: 100% !important;
            height: 320px !important; 
            object-fit: cover;
          }
          .${styles.heroContent} {
            position: relative !important;
            padding: 30px 20px !important;
            text-align: center !important;
            transform: none !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .${styles.heroContent} h1 {
            font-size: 28px !important;
            line-height: 1.2 !important;
          }
          .${styles.searchWrapper} {
            margin-top: 0 !important;
            padding: 20px !important;
            position: relative !important;
            z-index: 100 !important;
          }
          .${styles.searchBox} {
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            background: #fff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            max-width: 500px;
            margin: 0 auto;
          }
          .${styles.ctaGrid} {
            grid-template-columns: 1fr !important;
            padding: 20px !important;
            gap: 15px !important;
          }
          .${styles.ctaCard} {
            width: 100% !important;
            box-sizing: border-box;
          }
          .${styles.card}, .event-card-responsive {
            width: 100% !important;
            min-width: 100% !important;
            height: fit-content !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .${styles.cardImage}, .${styles.card} img, .card-image-full {
            width: 100% !important;
            height: 160px !important;
            object-fit: cover !important;
            display: block !important; /* Ensure image is block level */
            margin: 0 !important;
            padding: 0 !important;
            min-width: 100% !important;
          }
          .${styles.cardBody} {
            flex: none !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 12px 12px 0 12px !important;
          }
          .${styles.cardBtn} {
            margin-bottom: 0 !important;
          }
          .${styles.cityCard}, .city-card-responsive {
            min-width: 140px !important; /* Even smaller for more cities on tablet */
            height: 220px !important;
            flex-shrink: 0 !important;
            overflow: hidden !important;
            position: relative !important;
          }
          .${styles.cityCard} img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 12px !important;
            display: block !important; /* Ensure image is block level */
          }
          .${styles.section} {
            padding: 30px 20px !important;
          }
          .${styles.cardsRow} {
            gap: 15px !important;
          }
        }
      `}</style>

      {/* HERO SECTION */}
      <div className={styles.hero}>
        <img className={styles.heroImg} src="/img/Home.jpg" alt="EventHub Hero" 
             onError={(e) => { e.target.src = "https://picsum.photos/seed/eventhub-hero/1400/600"; }} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Your Gateway <br /> To Every <span className={styles.orange}>Event!</span></h1>
          <p>Discover amazing events around you and book in seconds.</p>
          <button onClick={() => setPage("introduce-yourself")} className={styles.primaryBtn}>Get Started</button>
        </div>
      </div>

      {/* SEARCH */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBox}>
          <input 
            placeholder="Find Event" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
          />
          <FaSearch style={{ marginLeft: 8, color: "#555", cursor: "pointer" }} onClick={handleSearchTrigger} />
        </div>
      </div>

      {/* 🔥 TRENDING EVENTS مع Speakers + Sponsors */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Trending Now ({trendingEvents.length} events)</h2>
          <span onClick={() => setPage("events")} style={{ color: "#f97316", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} className={styles.link}>
            Explore more events <FaArrowRight />
          </span>
        </div>
        {trendingEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No trending events available</div>
        ) : (
          <div ref={trendingDrag.rowRef} className={styles.cardsRow}
               onMouseDown={trendingDrag.handleMouseDown}
               onMouseLeave={trendingDrag.handleMouseLeave}
               onMouseUp={trendingDrag.handleMouseUp}
               onMouseMove={trendingDrag.handleMouseMove}>
            {trendingEvents.map((e) => (
              <EventCard key={e.id} e={e} userRole={userRole} userName={userName} userEmail={userEmail} handleEventClick={handleEventClick} />
            ))}
          </div>
        )}
      </div>

      {/* CITIES */}
      <div className={styles.section}>
        <h2>Events In Every City</h2>
        <div ref={citiesDrag.rowRef} className={styles.cardsRow}
             onMouseDown={citiesDrag.handleMouseDown}
             onMouseLeave={citiesDrag.handleMouseLeave}
             onMouseUp={citiesDrag.handleMouseUp}
             onMouseMove={citiesDrag.handleMouseMove}>
          {cityCards.map((city, i) => (
            <div key={city.name + i} className={styles.cityCard}>
              <img src={city.photo} alt={city.name} />
              <span>{city.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 ONLINE EVENTS مع Speakers + Sponsors */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Online Events ({onlineEvents.length} events)</h2>
          <span onClick={() => setPage("events")} style={{ color: "#f97316", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} className={styles.link}>
            Explore more events <FaArrowRight />
          </span>
        </div>
        {onlineEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No online events available</div>
        ) : (
          <div ref={onlineDrag.rowRef} className={styles.cardsRow}
               onMouseDown={onlineDrag.handleMouseDown}
               onMouseLeave={onlineDrag.handleMouseLeave}
               onMouseUp={onlineDrag.handleMouseUp}
               onMouseMove={onlineDrag.handleMouseMove}>
            {onlineEvents.map((e) => (
              <EventCard key={e.id} e={e} userRole={userRole} userName={userName} userEmail={userEmail} handleEventClick={handleEventClick} />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className={styles.ctaGrid}>
        {CTA_CARDS.map((c) => (
          <div key={c.title} className={styles.ctaCard}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{c.icon}</div>
            <h3 style={{ margin: "0 0 10px" }}>{c.title}</h3>
            <p style={{ margin: "0 0 18px" }}>{c.desc}</p>
            <button onClick={() => setPage(c.page)} className={styles.primaryBtn}>{c.btn}</button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div>
          <h4>Events</h4>
          <div>Browse Events</div>
          <div>Upcoming Events</div>
          <div>Past Events</div>
        </div>
        <div>
          <h4>About Us</h4>
          <div>Our Story</div>
          <div>FAQ</div>
          <div>Careers</div>
        </div>
        <div>
          <h4>Help & Support</h4>
          <div>Contact Us</div>
          <div>Terms of service</div>
        </div>
        <div className={styles.copyright}>© 2026 EventHub. All rights reserved</div>
      </div>
    </div>
  );
}