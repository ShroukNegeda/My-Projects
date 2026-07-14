'use client';
import { apiGetEvent, apiCreateBooking, apiToggleFavorite } from "@/lip/api";
import { useState, useEffect } from "react";
import { C } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import AuthGuardModal from "../../components/AuthGuardModal";
import { useApp } from "@/context/AppContext";
import {
  FaMapMarkerAlt, FaClock, FaHeart, FaRegHeart,
  FaShareAlt, FaMicrophone, FaHandshake, FaCheck,
  FaPlus, FaMinus, FaUsers, FaCreditCard, FaMobileAlt,
  FaMoneyBillWave, FaCheckCircle, FaInfoCircle,
  FaEnvelope, FaPhone, FaBriefcase, FaBuilding, FaIndustry,
  FaGlobe, FaHome, FaLinkedin, FaFileAlt, FaEdit, FaArrowLeft
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null, 
  setItem: () => {}, 
  removeItem: () => {}, 
  clear: () => {},
};

const FALLBACK = {
  id: 0, title: "Event Title", loc: "Location",
  date: "Date & Time", endTime: "", price: "$20",
  cat: "Design", photo: "https://picsum.photos/seed/event0/400/300"
};

const getImageUrl = (image, name, email, id, type = 'speaker') => {
  const normalizedEmail = email?.toLowerCase()?.trim();
  const cached = normalizedEmail ? safeLS.getItem(`eh_photo_${normalizedEmail}`) : null;

  if (!image && !cached) return null;

  let photoStr = image || cached;
  if (image && typeof image === 'object') {
    photoStr = image.url || image.path || image.original_url || image.preview_url || image.thumb || image.image_url;
  }

  if (!photoStr || photoStr === "") return null;
  
  // If it's still not a string after object resolution, we can't use it
  if (typeof photoStr !== 'string' || photoStr === "null" || photoStr === "undefined") return null;
  
  if (photoStr.startsWith('__local__') || photoStr.startsWith('data:')) {
    return photoStr;
  }
  
  if (photoStr.startsWith('http')) {
    return photoStr;
  }
  
  // Handle relative paths from Laravel storage
  const baseUrl = 'https://eventhub.huma-volve.com';

  const cleanPath = photoStr.startsWith('/') ? photoStr.slice(1) : photoStr;
  
  if (cleanPath.startsWith('storage/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  return `${baseUrl}/storage/${cleanPath}`;
};

const getInitials = (name = "?") => {
  return (name.split(" ").map(w => w[0]).join("").toUpperCase()).slice(0, 2);
};

function splitDateTime(dateStr = "", endDateISO = "", endTimeStr = "") {
  if (!dateStr) return { date: "", time: "", endTime: "" };

  const d = new Date(dateStr);

  const dateOpts = { day: "numeric", month: "short", year: "numeric" };
  const timeOpts = { hour: "numeric", minute: "2-digit", hour12: true };

  let date = "";
  let time = "";

  if (!isNaN(d.getTime())) {
    date = d.toLocaleDateString("en-GB", dateOpts);
    time = d.toLocaleTimeString("en-US", timeOpts);
  } else {
    const parts = dateStr.split(",");
    date = parts[0] || "";
    time = parts[1]?.trim() || "";
  }

  let endTime = "";
  if (endDateISO) {
    const end = new Date(endDateISO);
    if (!isNaN(end.getTime())) {
      endTime = end.toLocaleTimeString("en-US", timeOpts);
    }
  } else if (endTimeStr) {
    endTime = endTimeStr;
  }

  return { date, time, endTime };
}

function parsePrice(p) {
  if (!p || p === "Free") return 0;
  const n = parseFloat(p.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function fmtPrice(amount) { 
  return amount === 0 ? "Free" : `$${amount}`; 
}

const resolveEventPhoto = (rawEv) => {
  if (!rawEv) return rawEv;
  // Support multiple field names for the event photo from various backend/cache sources
  const photo = rawEv.photo || rawEv.image || rawEv.image_url || rawEv.cover_image || rawEv.thumbnail;
  const ev = { ...rawEv, photo };

  if (!ev.photo || ev.photo.startsWith("__local__")) {
    const key = "eh_ephoto_" + String(rawEv.id);
    const stored = safeLS.getItem(key);
    if (stored) return { ...ev, photo: stored };
  }
  return ev;
};

const isValidBackendEvent = (e) => {
  if (!e || e.id == null) return false;
  const id = String(e.id).trim();
  return /^[0-9]+$/.test(id);
};

const getEventId = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const eventIdFromUrl = params.get('id') || params.get('eventId');
    if (eventIdFromUrl) {
      safeLS.setItem("eh_active_event_id", eventIdFromUrl);
      return eventIdFromUrl;
    }
    
    const hashEventId = window.location.hash.match(/event-(\d+)/)?.[1];
    if (hashEventId) {
      safeLS.setItem("eh_active_event_id", hashEventId);
      return hashEventId;
    }
  }
  
  return safeLS.getItem("eh_active_event_id") || null;
};

export default function EventDetailPage({
  setPage, userName, userEmail, userRole,
  setRedirectAfterSignup,
  favorites = [], setFavorites,
  bookedTickets = [], setBookedTickets, setPendingBooking,
  selectedEvent
}) {
  const [shareSuccess, setShared]     = useState(false);
  const [quantity, setQuantity]       = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [payAtVenue, setPayAtVenue]   = useState(false);
  const [authModal, setAuthModal]     = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [event, setEvent] = useState(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [initialEventId] = useState(() => getEventId());

  useEffect(() => {
    const eventId = getEventId();
    if (eventId) {
      safeLS.setItem("eh_active_event_id", eventId);
      
      const activeEventData = safeLS.getItem("eh_active_event_data");
      if (activeEventData) {
        try {
          const rawLS = JSON.parse(activeEventData);
          const eventFromLS = resolveEventPhoto(rawLS);
          if (eventFromLS?.id && String(eventFromLS.id) === eventId) {
            const extras = JSON.parse(safeLS.getItem(`eh_extras_${eventId}`) || "{}");
            setEvent({
              ...eventFromLS,
              speakers: extras.speakers || eventFromLS.speakers || [],
              sponsors: extras.sponsors || eventFromLS.sponsors || [],
              tickets: eventFromLS.tickets || []
            });
            setCurrentEventId(eventId);
            setIsLoading(false);
            console.log('Loaded event from EventsPage cache');
            return;
          }
        } catch (e) {
          console.warn("Failed to parse active_event_data:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const eventId = getEventId();
    setCurrentEventId(eventId);
    
    if (eventId) {
      setIsLoading(true);
      apiGetEvent(eventId).then(data => {
        const apiRes = data?.data?.event || data?.data || data?.message?.data || data;
        
        if (!apiRes || typeof apiRes !== 'object' || !apiRes?.id) {
          setEvent(FALLBACK);
          setIsLoading(false);
          return;
        }

        const ehEvents = JSON.parse(safeLS.getItem("eh_events") || "[]");
        const eventFromEh = ehEvents.find(e => String(e.id) === String(eventId));
        const extras = JSON.parse(safeLS.getItem(`eh_extras_${eventId}`) || "{}");

        // Use resolveEventPhoto to check for images stored in localStorage
        const ev = resolveEventPhoto(apiRes);

        // Extract speakers and sponsors, merging API data with local "extras" or "eh_events" cache
        const speakers = (ev.speakers && ev.speakers.length) ? ev.speakers : 
                        (data?.data?.speakers && data?.data?.speakers.length) ? data?.data?.speakers :
                        (extras.speakers && extras.speakers.length) ? extras.speakers :
                        (eventFromEh?.speakers || []);

        const sponsors = (ev.sponsors && ev.sponsors.length) ? ev.sponsors : 
                        (data?.data?.sponsors && data?.data?.sponsors.length) ? data?.data?.sponsors :
                        (extras.sponsors && extras.sponsors.length) ? extras.sponsors :
                        (eventFromEh?.sponsors || []);
        
        const eventData = {
          id: ev.id,
          title: ev.title || eventFromEh?.title || FALLBACK.title,
          loc: ev.location || ev.venue_name || eventFromEh?.loc || FALLBACK.loc,
          date: ev.start_time || eventFromEh?.date || FALLBACK.date,
          endDateISO: ev.end_time || eventFromEh?.endDateISO || FALLBACK.endTime,
          price: ev.price_type === "free" ? "Free" : (ev.price ? "$"+ev.price : (eventFromEh?.price || FALLBACK.price)),
          cat: ev.category || eventFromEh?.cat || FALLBACK.cat,
          photo: ev.photo || eventFromEh?.photo || null,
          description: ev.description || eventFromEh?.description || "",
          capacity: ev.capacity || "Unlimited",
          tickets: ev.tickets || [],
          speakers: speakers,
          sponsors: sponsors,
        };
        
        setEvent(eventData);
        setIsLoading(false);
      }).catch(err => {
        console.warn("apiGetEvent error:", err.message);
        setEvent(FALLBACK);
        setIsLoading(false);
      });
    }
  }, [initialEventId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scrollTo = safeLS.getItem("eh_scroll_to_section") || 
                     (safeLS.getItem("eh_scroll_to_community") === "1" ? "speakers-section" : null);
    if (!scrollTo) return;
    
    safeLS.removeItem("eh_scroll_to_section");
    safeLS.removeItem("eh_scroll_to_community");

    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 200);
      }
    };
    setTimeout(tryScroll, 500);
  }, []);

  const isGuest    = !userName;
  const priceEach  = parsePrice(event.price);
  const isFree     = priceEach === 0;
  const total      = priceEach * quantity;
  const isFav      = favorites.some(e => e.id === event.id);
  const isBooked   = bookedTickets.some(t => t.id === event.id);

  const toggleFav = () => {
    if (isGuest) { setAuthModal(true); return; }
    apiToggleFavorite(event.id).then(() => {
      isFav
        ? setFavorites(p => p.filter(e => e.id !== event.id))
        : setFavorites(p => [...p, event]);
    }).catch(console.error);
  };

  const buildTickets = () =>
    Array.from({ length: quantity }, (_, i) => ({
      id:        i === 0 ? event.id : event.id + i * 0.01,
      title:     event.title,
      date:      event.date?.split(",")[0] || event.date || "",
      time:      event.date?.split(",")[1]?.trim() || "",
      endTime:   event.endTime || "",
      loc:       event.loc,
      type:      "General",
      bookingId: `${164699852 + event.id * 1337 + i}`,
      section:   `${10 + event.id}`,
      row:       `${10 + event.id}`,
      seats:     1,
      photo:     event.photo,
      past:      false,
    }));

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?id=${event.id}`;
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleBookNow = () => {
    if (isGuest) { setAuthModal(true); return; }
    if (isFree) {
      if (!isBooked) {
        const tickets = buildTickets();
        setBookedTickets(p => [...p, ...tickets]);
        const eventIdInt = parseInt(String(event.id), 10);
        if (!isNaN(eventIdInt)) {
          apiCreateBooking(eventIdInt, tickets.length).catch(console.error);
        }
      }
      setPage("my-tickets");
    } else {
      setShowPayment(true);
      setPayAtVenue(false);
    }
  };

  const handlePayAtVenue = () => {
    if (!isBooked) {
      const tickets = buildTickets().map(t => ({ ...t, paymentMethod: "venue", type: "Reserved" }));
      setBookedTickets(p => [...p, ...tickets]);
      const eventIdInt = parseInt(String(event.id), 10);
      if (!isNaN(eventIdInt)) {
        apiCreateBooking(eventIdInt, tickets.length).catch(console.error);
      }
    }
    setPayAtVenue(true);
  };

  const handleJoinSpeaker = () => {
    if (event?.id) {
      safeLS.setItem("eh_active_event_id", String(event.id));
      const eventData = {
        id: event.id,
        title: event.title,
        photo: event.photo,
        loc: event.loc,
        date: event.date
      };
      safeLS.setItem("eh_active_event_data", JSON.stringify(eventData));
    }
    if (userRole === "Speaker") setPage("join-as-speaker");
    else { setRedirectAfterSignup("join-as-speaker"); setPage("speaker-signup-1"); }
  };

  const handleJoinSponsor = () => {
    const eventId = String(event.id);
    safeLS.setItem("eh_active_event_id", eventId);
    
    const extrasKey = `eh_extras_${eventId}`;
    const extras = JSON.parse(safeLS.getItem(extrasKey) || "{}");
    extras.eventData = {
      id: event.id,
      title: event.title || event.name,
      photo: event.photo || event.image || `https://picsum.photos/seed/event${event.id}/400/300`,
      loc: event.loc || event.location,
      date: event.date
    };
    safeLS.setItem(extrasKey, JSON.stringify(extras));
    
    if (userRole === "Sponsor") {
      setPage("sponsorship-tiers");
    } else {
      setRedirectAfterSignup("sponsorship-tiers");
      setPage("sponsor-signup-1");
    }
  };

  const { date, time, endTime: endTimeDisplay } = splitDateTime(event.date, event.endDateISO, event.endTime);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #f3f4f6", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: C.gray, fontSize: 14 }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .book-btn{transition:background .2s,transform .15s}.book-btn:hover{background:#ea6c00!important;transform:scale(1.03)}
        .speaker-card{transition:transform .2s,box-shadow .2s}.speaker-card:hover{transform:translateY(-3px);box-shadow:0 6px 24px rgba(0,31,84,0.12)!important}
        .sponsor-card{transition:transform .2s,box-shadow .2s}.sponsor-card:hover{transform:translateY(-3px);box-shadow:0 6px 24px rgba(0,31,84,0.12)!important}
        .hero-icon-btn{transition:transform .2s,background .2s;border:none;cursor:pointer}.hero-icon-btn:hover{transform:scale(1.12);background:rgba(255,255,255,0.35)!important}
        .join-link{transition:color .15s}.join-link:hover{color:#F97316!important}
        .qty-btn{transition:background .15s}.qty-btn:hover{background:#e5e7eb!important}
        .pay-opt{transition:all .2s;cursor:pointer;border:none}.pay-opt:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.18)!important}
        .venue-btn{transition:all .2s;cursor:pointer;border:none}.venue-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(34,197,94,0.25)!important}
        
        /* Responsive Comfort Overrides */
        @media (max-width: 1024px) {
          .event-main-container { padding: 24px 30px 40px !important; }
          .event-content-flex { flex-direction: column !important; align-items: stretch !important; }
          .booking-side-card { min-width: 0 !important; width: 100% !important; margin-top: 20px; }
          .hero-section { height: 280px !important; }
          .speaker-row, .sponsor-row { justify-content: center; }
          .speaker-card, .sponsor-card { flex: 1 1 280px !important; max-width: 360px; }
        }

        @media (max-width: 640px) {
          .event-main-container { padding: 20px 16px 40px !important; }
          .hero-section { height: 220px !important; }
          .hero-text-overlay { left: 20px !important; bottom: 16px !important; }
          .event-title { font-size: 22px !important; line-height: 1.3 !important; }
          .speaker-card, .sponsor-card { flex: 0 0 100% !important; }
          .booking-side-card { padding: 16px 20px !important; }
        }
        .full-photo {
          width: 100% !important; height: 100% !important;
          object-fit: cover !important; position: absolute !important;
          top: 0 !important; left: 0 !important;
        }
      `}</style>

      <NavBar page="events" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      {/* Hero Section */}
      <div className="hero-section" style={{ height: 360, position: "relative", overflow: "hidden" }}>
        <img src={event.photo || `https://picsum.photos/seed/ev${event.id || currentEventId || 0}/1400/500`} alt={event.title}
          className="full-photo"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/ev${event.id || currentEventId || 0}/1400/500`; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.52))" }} />
        
        <button onClick={() => {
          safeLS.removeItem("eh_scroll_to_section");
          safeLS.removeItem("eh_scroll_to_community");
          window.history.back();
        }}
          style={{ 
            position: "absolute", top: 20, left: 24, width: 40, height: 40, borderRadius: "50%", 
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", border: "none", 
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 16, fontWeight: 700
          }}>
          <FaArrowLeft />
        </button>

        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 10 }}>
          <button className="hero-icon-btn" onClick={toggleFav}
            style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isFav ? <FaHeart color="#F97316" size={17} /> : <FaRegHeart color="#fff" size={17} />}
          </button>
          <button className="hero-icon-btn" onClick={handleShare}
            style={{ width: 40, height: 40, borderRadius: "50%", background: shareSuccess ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {shareSuccess ? <FaCheck color="#fff" size={15} /> : <FaShareAlt color="#fff" size={16} />}
          </button>
        </div>
        
        <div className="hero-text-overlay" style={{ position: "absolute", bottom: 24, left: 60 }}>
          <span style={{ fontSize: 12, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", padding: "5px 16px", borderRadius: 20, fontWeight: 600, color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
            {event.cat || "Design"}
          </span>
        </div>
      </div>

      <div className="event-main-container" style={{ padding: "28px 60px 60px" }}>
        <div className="event-content-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 className="event-title" style={{ fontSize: 28, fontWeight: 800, marginTop: 8, marginBottom: 10, color: C.navy }}>{event.title}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: C.gray }}>
                <FaMapMarkerAlt color={C.orange} size={13} /> {event.loc}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: C.gray }}>
                <FaClock color={C.orange} size={13} />
                {date}{time ? `, ${time}` : ""}{endTimeDisplay ? ` – ${endTimeDisplay}` : ""}
              </div>
            </div>
          </div>

          <div className="booking-side-card" style={{ background: C.white, borderRadius: 14, padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,31,84,0.10)", border: `1px solid ${C.border}`, minWidth: 320 }}>
            <div style={{ marginBottom: 14 }}>
              {event.tickets && event.tickets.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, color: C.gray, fontWeight: 500, marginBottom: 8 }}>Ticket Types</div>
                  {event.tickets.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{t.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.orange }}>{t.price ? `$${t.price}` : "Free"}{t.quantity ? ` · ${t.quantity} seats` : ""}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: C.gray, fontWeight: 500, marginBottom: 2 }}>Price per ticket</div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{event.price}</span>
                </>
              )}
            </div>

            {!isBooked && !payAtVenue && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaUsers color={C.orange} size={11} /> Number of Tickets
                </div>
                <div style={{ display: "flex", alignItems: "center", background: "#f8f9fb", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", width: "fit-content" }}>
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaMinus size={10} color={C.navy} />
                  </button>
                  <input 
                    type="number" 
                    min={1} 
                    value={quantity} 
                    onChange={(e) => { 
                      const val = Number(e.target.value); 
                      if (!isNaN(val) && val >= 1) setQuantity(val); 
                    }}
                    style={{ width: 60, textAlign: "center", fontSize: 15, fontWeight: 700, color: C.navy, border: "none", outline: "none", background: "transparent"}}
                  />
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaPlus size={10} color={C.navy} />
                  </button>
                </div>
                {!isFree && quantity > 1 && (
                  <div style={{ fontSize: 12, color: C.gray, marginTop: 6 }}>
                    {quantity} × {event.price} = <strong style={{ color: C.navy }}>{fmtPrice(total)}</strong>
                  </div>
                )}
              </div>
            )}

            {payAtVenue ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <FaCheckCircle color="#10b981" size={24} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>Spot Reserved!</div>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 14, lineHeight: 1.6 }}>
                  Your {quantity} spot{quantity > 1 ? "s are" : " is"} reserved.<br />
                  Please pay <strong style={{ color: C.navy }}>{fmtPrice(total)}</strong> at the venue entrance.
                </div>
                <button onClick={() => setPage("my-tickets")}
                  style={{ width: "100%", padding: "10px 0", background: C.orange, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                  View My Tickets
                </button>
              </div>
            ) : isBooked ? (
              <button className="book-btn"
                style={{ background: "#10b981", color: C.white, border: "none", borderRadius: 10, padding: "12px 0", width: "100%", fontWeight: 700, fontSize: 14, cursor: "default", fontFamily: "Poppins, sans-serif" }}>
                ✓ Booked
              </button>
            ) : showPayment && !isFree ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Choose Payment Method</div>
                <button className="pay-opt" onClick={() => {}}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: C.navy, color: "#fff", borderRadius: 10, padding: "11px 16px", fontWeight: 700, fontSize: 13, fontFamily: "Poppins, sans-serif", marginBottom: 8, boxShadow: "0 4px 12px rgba(0,31,84,0.2)", opacity: 0.7, cursor: "not-allowed" }}>
                  <FaCreditCard size={14} /> Credit / Debit Card
                  <span style={{ fontSize: 10, marginLeft: "auto", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10 }}>Soon</span>
                </button>
                <button className="venue-btn" onClick={handlePayAtVenue}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", color: "#065f46", border: "1.5px solid #86efac", borderRadius: 10, padding: "11px 16px", fontWeight: 700, fontSize: 13, fontFamily: "Poppins, sans-serif", marginBottom: 10 }}>
                  <FaMoneyBillWave size={15} color="#22c55e" /> Pay at the Event
                </button>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, background: "#fffbeb", borderRadius: 8, padding: "8px 10px", border: "1px solid #fde68a" }}>
                  <FaInfoCircle color="#f59e0b" size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
                    Your spot will be reserved. Pay <strong>{fmtPrice(total)}</strong> in cash at the entrance.
                  </span>
                </div>
                <button onClick={() => setShowPayment(false)}
                  style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: C.gray, fontSize: 12, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="book-btn" onClick={handleBookNow}
                style={{ background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "12px 0", width: "100%", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                {isFree ? "Book Now — Free" : `Book Now — ${fmtPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: C.navy }}>About Event</h2>
        <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.8, marginBottom: 36, maxWidth: 720 }}>
          {event.description || "Everything you need to know about this event. Join us for an exciting experience filled with learning, networking, and inspiration."}
        </p>

        {/* Speakers Section */}
        <div id="speakers-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
            Speakers ({event.speakers?.length || 0})
          </h2>
        </div>
        <div className="speaker-row" style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 36 }}>
          {(event.speakers || []).map((rawS, i) => {
            const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");

            // Sync speaker data with their global account profile if it exists
            const email = (
              rawS.email || 
              rawS.speaker_email || 
              rawS.user?.email || 
              rawS.contact_email || 
              (rawS.name === userName ? userEmail : null) ||
              Object.values(accounts).find(acc => (acc.name || acc.full_name) === rawS.name)?.email
            )?.toLowerCase().trim();
            
            const profile = email ? accounts[email] : null;
            
            const s = {
              ...rawS,
              email: email || rawS.email || rawS.speaker_email || rawS.contact_email,
              name: profile?.name || rawS.name || rawS.full_name || rawS.user?.name,
              title: profile?.jobTitle || profile?.title || rawS.title || rawS.session_title || rawS.job_title || rawS.user?.title || rawS.user?.job_title,
              company: profile?.company || rawS.company || rawS.company_name || rawS.user?.company || rawS.user?.company_name,
              bio: profile?.bio || rawS.bio || rawS.summary || rawS.description || rawS.user?.bio || rawS.user?.description || "No bio available.",
              photo: (email && safeLS.getItem(`eh_photo_${email}`)) || 
                     rawS.photo ||
                     profile?.photo || 
                     rawS.user?.profile_photo_url || 
                     rawS.user?.avatar_url || 
                     rawS.user?.profile_image || 
                     rawS.user?.profile_photo_url || 
                     rawS.user?.avatar || 
                     rawS.user?.image || 
                     rawS.user?.photo || 
                     rawS.profile_photo_url || 
                     rawS.profile_photo_path || 
                     rawS.avatar || 
                     rawS.photo?.url || 
                     rawS.image?.url || 
                     rawS.speaker_photo || 
                     rawS.speaker_image || 
                     rawS.photo_url ||
                     rawS.photo || 
                     rawS.image || 
                     rawS.image_url
            };

            const spPhoto = getImageUrl(s.photo, s.name, s.email, s.id || i, 'speaker');
            const spInitials = getInitials(s.name);

            return (
              <div key={i} onClick={() => setSelectedSpeaker(s)}
                className="speaker-card"
                style={{ 
                  flex: "0 0 280px", /* Adjusted flex-basis for better distribution */
                  minHeight: 250, /* Changed height to minHeight */
                  borderRadius: 16, 
                  overflow: "hidden", 
                  boxShadow: "0 2px 12px rgba(0,31,84,0.09)", 
                  border: `1px solid ${C.border}`, 
                  cursor: "pointer", 
                  display: "flex", 
                  flexDirection: "column" 
                }}>
                <div className="card-img-wrap" style={{ 
                  width: "100%",
                  height: 170, /* Fixed height for image container */
                  overflow: "hidden", 
                  position: "relative",
                  background: "#f0f2f5"
                }}>
                  {spPhoto ? (
                    <img 
                      src={spPhoto} 
                      alt={s.name} 
                      className="full-photo"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, transition: "opacity 0.3s ease", background: "#f0f2f5" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    background: "linear-gradient(135deg, #1a1f5e, #3b4fd4)", 
                    display: spPhoto ? "none" : "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}>
                    <span style={{ 
                      fontSize: 48, 
                      fontWeight: 800, 
                      color: "rgba(255,255,255,0.9)" 
                    }}>{spInitials}</span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: C.white, flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>
                    {s.name || "Speaker"}
                  </div>
                  {s.session_title && (
                    <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginBottom: 4 }}>
                      📌 {s.session_title}
                    </div>
                  )}
                  {s.summary && (
                    <div style={{ fontSize: 11, color: C.gray, lineHeight: 1.4 }}>
                      {s.summary}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div onClick={handleJoinSpeaker}
            style={{ 
              flex: "0 0 260px", 
              borderRadius: 16, 
              border: `2px dashed ${C.border}`, 
              background: "#fafbff", 
              cursor: "pointer", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 12, 
              height: 220 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.orange;
              e.currentTarget.style.background = "#fff7ed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.background = "#fafbff";
            }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: "50%", 
              background: "#f1f5f9", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <FaPlus color={C.gray} size={20} />
            </div>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: C.gray, 
              textAlign: "center", 
              lineHeight: 1.4 
            }}>
              Join as<br/>Speaker
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div id="sponsors-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
              Sponsors ({event.sponsors?.length || 0})
            </h2>
          </div>

          <div className="sponsor-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(event.sponsors || []).map((rawSp, i) => {
              // Sync sponsor data with global account profile
              const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
              const email = (
                rawSp.email || 
                rawSp.contact_email || 
                rawSp.user?.email || 
                rawSp.sponsor_email ||
                Object.values(accounts).find(acc => (acc.name || acc.companyName) === (rawSp.name || rawSp.company_name))?.email
              )?.toLowerCase().trim();
              const profile = email ? accounts[email] : null;

              const sp = {
                ...rawSp,
                email: email || rawSp.email || rawSp.contact_email || rawSp.sponsor_email || rawSp.user?.email,
                name: profile?.companyName || profile?.name || rawSp.name || rawSp.company_name || rawSp.user?.name,
                website: profile?.website || rawSp.website || rawSp.url,
                logo: (email && safeLS.getItem(`eh_photo_${email}`)) || profile?.photo || profile?.image || profile?.image_url || 
                      rawSp.user?.profile_photo_url || rawSp.user?.avatar || rawSp.user?.image || rawSp.user?.photo || 
                      rawSp.logo?.url || rawSp.image?.url || rawSp.logo_url || rawSp.logo || rawSp.photo || rawSp.image || rawSp.image_url || rawSp.profile_photo_url || rawSp.avatar,
                tier: rawSp.tier || rawSp.level || profile?.tier || rawSp.user?.tier || "Sponsor"
              };

              const tierColor = { 
                Platinum: "#475569", 
                Gold: "#b45309", 
                Silver: "#6b7280", 
                Bronze: "#92400e" 
              }[sp.tier] || C.navy;
              const spPhoto = getImageUrl(sp.logo, sp.name, sp.email, sp.id || i, 'sponsor');
              const spInitials = getInitials(sp.name);
              
              return (
                <div 
                  key={`${sp.name || 'sponsor'}-${i}`}
                  className="sponsor-card"
                  style={{ 
                    flex: "0 0 280px", /* Adjusted flex-basis for better distribution */
                    minHeight: 250, /* Changed height to minHeight */
                    borderRadius: 16, 
                    overflow: "hidden", 
                    boxShadow: "0 2px 12px rgba(0,31,84,0.09)", 
                    border: `1px solid ${C.border}`, 
                    cursor: "pointer", 
                    display: "flex", 
                    flexDirection: "column"
                  }}
                  onClick={() => setSelectedSponsor(sp)}
                >
                  <div className="card-img-wrap" style={{ 
                    width: "100%",
                    height: 170, /* Fixed height for image container */
                    overflow: "hidden", 
                  position: "relative",
                  background: "#fff"
                  }}>
                    {spPhoto ? (
                      <img 
                        src={spPhoto} 
                        alt={sp.name} 
                      className="full-photo"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, transition: "opacity 0.3s ease", background: "#fff" }}
                        onError={(e) => {
                        e.target.onerror = null;
                          e.target.style.display = "none";
                          if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = "flex";
                        }}
                        loading="lazy"
                      />
                    ) : null}
                    <div style={{ 
                      width: "100%", 
                      height: "100%", 
                      background: "linear-gradient(135deg, #f59e0b, #d97706)", 
                      display: spPhoto ? "none" : "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      position: "absolute",
                      top: 0,
                      left: 0
                    }}>
                      <span style={{ 
                        fontSize: 48, 
                        fontWeight: 800, 
                        color: "rgba(255,255,255,0.9)" 
                      }}>{spInitials}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: "14px 16px", 
                    background: "#fef3c7", 
                    flexShrink: 0 
                  }}>
                    <div style={{ 
                      fontWeight: 800, 
                      fontSize: 14, 
                      color: tierColor, 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis" 
                    }}>
                      {sp.name || "Sponsor"}
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: tierColor, 
                      opacity: 0.8, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.5px" 
                    }}>
                      {sp.tier || sp.level || "Sponsor"}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div onClick={handleJoinSponsor}
              style={{ 
                flex: "0 0 260px", 
                borderRadius: 16, 
                border: `2px dashed ${C.border}`, 
                background: "#fafbff", 
                cursor: "pointer", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 12, 
                height: 220 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.orange;
                e.currentTarget.style.background = "#fff7ed";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "#fafbff";
              }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: "50%", 
                background: "#f1f5f9", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <FaPlus color={C.gray} size={20} />
              </div>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: C.gray, 
                textAlign: "center", 
                lineHeight: 1.4 
              }}>
                Join as<br/>Sponsor
              </div>
            </div>
          </div>
        </div>

        {authModal && (
          <AuthGuardModal
            onClose={() => setAuthModal(false)}
            onLogin={() => { setAuthModal(false); setPage("login"); }}
            onSignup={() => { setAuthModal(false); setPage("signup"); }}
          />
        )}

        {/* Speaker Modal */}
        {selectedSpeaker && (() => {
          const spEmail = selectedSpeaker.email?.toLowerCase().trim();
          const spPhoto = getImageUrl(selectedSpeaker.photo, selectedSpeaker.name, selectedSpeaker.email, selectedSpeaker.id, 'speaker');
          const initials = getInitials(selectedSpeaker.name);

          return (
            <div onClick={() => setSelectedSpeaker(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()}
                style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div style={{ background: "linear-gradient(135deg,#1a1f5e,#3b4fd4)", padding: "24px 24px 20px", flexShrink: 0, position: "relative" }}>
                  <button onClick={() => setSelectedSpeaker(null)}
                    style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                    ✕
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.2)", border: "2.5px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: 'relative' }}>
                      {spPhoto ? (
                        <img src={spPhoto} alt="speaker" style={{ width: "100%", height: "100%", objectFit: "cover", position: 'absolute', inset: 0, background: "rgba(255,255,255,0.1)" }} 
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                        />
                      ) : (
                        null
                      )}
                      <div style={{ display: spPhoto ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{initials}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Speaker</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{selectedSpeaker.name}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "20px 20px 24px", overflowY: "auto", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {selectedSpeaker.title && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Title / Role</div>
                        <div style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{selectedSpeaker.title}</div>
                      </div>
                    )}
                    {selectedSpeaker.company && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Company</div>
                        <div style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{selectedSpeaker.company}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>About Speaker</div>
                      <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{selectedSpeaker.bio || selectedSpeaker.summary || "No bio provided."}</div>
                    </div>
                    {selectedSpeaker.linkedin && (
                      <a href={selectedSpeaker.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "#0077b5", fontSize: 13, fontWeight: 600, textDecoration: "none", marginTop: 8 }}>
                        <FaLinkedin /> LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Sponsor Modal */}
        {selectedSponsor && (() => {
          const photo = getImageUrl(selectedSponsor.logo, selectedSponsor.name, selectedSponsor.email, selectedSponsor.id, 'sponsor');
          const initials = getInitials(selectedSponsor.name);
          return (
            <div onClick={() => setSelectedSponsor(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div onClick={e => e.stopPropagation()}
                style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div style={{ background: "linear-gradient(135deg,#1a1f5e,#3b4fd4)", padding: "24px 24px 20px", flexShrink: 0, position: "relative" }}>
                  <button onClick={() => setSelectedSponsor(null)}
                    style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.2)", border: "2.5px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: 'relative' }}>
                      {photo ? (
                        <img src={photo} alt="sponsor" style={{ width: "100%", height: "100%", objectFit: "contain", position: 'absolute', inset: 0, background: "rgba(255,255,255,0.1)" }} 
                          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div style={{ display: photo ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{initials}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Sponsor</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{selectedSponsor.name}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "20px 20px 24px", overflowY: "auto", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Sponsorship Tier</div>
                      <span style={{ fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "4px 12px", borderRadius: 20 }}>
                        {selectedSponsor.tier || selectedSponsor.level || "Sponsor"}
                      </span>
                    </div>
                    {selectedSponsor.email && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Contact Email</div>
                        <div style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{selectedSponsor.email}</div>
                      </div>
                    )}
                    {selectedSponsor.website && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Website</div>
                        <a href={selectedSponsor.website} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: "#2563eb", fontWeight: 600, textDecoration: "underline" }}>
                          {selectedSponsor.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}