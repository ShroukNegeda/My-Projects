'use client';
import { useState, useMemo } from "react";
import { C } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { 
  FaMapMarkerAlt, FaClock, FaHeart, FaTicketAlt, 
  FaTh, FaSpinner, FaChevronRight 
} from "react-icons/fa";

export default function FavoritesPage({ 
  setPage, userName, userEmail, userRole, 
  favorites = [], setFavorites,
  bookedTickets = [], setBookedTickets,
  setSelectedEvent
}) {
  const isBooked = (eventId) => bookedTickets.some(t => t.id == eventId);

  const handleBookNow = (ev, event) => {
    ev.stopPropagation();
    if (isBooked(event.id)) return;
    
    // Simulate booking for local state
    const newTicket = {
        id: event.id,
        title: event.title,
        date: event.date,
        loc: event.loc,
        photo: event.photo,
        past: false
    };
    setBookedTickets(prev => [...prev, newTicket]);
    setPage("my-tickets");
  };

  const removeFavorite = (ev, id) => {
    ev.stopPropagation();
    setFavorites(prev => prev.filter(e => e.id !== id));
  };

  const handleCardClick = (event) => {
    if (setSelectedEvent) setSelectedEvent(event);
    localStorage.setItem("eh_active_event_id", String(event.id));
    localStorage.setItem("eh_active_event_data", JSON.stringify(event));
    window.location.href = `/event-detail?id=${event.id}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        .fav-card { transition: transform .25s, box-shadow .25s; }
        .fav-card:hover { transform: translateY(-4px); box-shadow: 0 8px 40px rgba(0,31,84,0.15); }
        .book-btn { transition: background .2s, transform .15s; }
        .book-btn:hover { background: #ea6c00 !important; transform: scale(1.03); }
        
        @media (max-width: 1024px) {
          .main-container { padding: 30px 24px !important; }
          .fav-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px 20px !important; }
        }

        @media (max-width: 820px) {
          .fav-grid { grid-template-columns: 1fr !important; }
          .fav-card { 
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
            border-radius: 12px !important;
          }
          .fav-img-container { 
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>

      <NavBar page="favorites" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      <div className="main-container" style={{ padding: "40px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div onClick={() => setPage("events")} style={{ cursor: "pointer", color: C.navy, display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 500 }}>
             <HiOutlineArrowLeft size={18} /> Back to Events
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: C.navy }}>Saved Events</h1>
        <p style={{ color: C.gray, fontSize: 14, marginBottom: 32 }}>
          {favorites.length} {favorites.length === 1 ? "event" : "events"} found
        </p>

        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.gray }}>
            <FaHeart size={48} color="#e5e7eb" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: C.navy }}>No saved events</p>
            <p style={{ fontSize: 14 }}>Explore events and click the heart icon to save them here.</p>
            <button onClick={() => setPage("events")}
              style={{ marginTop: 20, background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
              Explore Events
            </button>
          </div>
        ) : (
          <div className="fav-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "12px 24px" }}>
            {favorites.map((e) => (
              <div key={e.id} className="fav-card" onClick={() => handleCardClick(e)}
                style={{ 
                  display: "grid", gridTemplateColumns: "180px 1fr", background: "#fff", borderRadius: 16, overflow: "hidden", 
                  boxShadow: "0 2px 12px rgba(0,31,84,0.08)", cursor: "pointer", border: `1px solid ${C.border}`,
                  height: "fit-content"
                }}
              >
                <div className="fav-img-container" style={{ position: "relative", overflow: "hidden", background: "#f0f2f5", minHeight: "100%", width: "100%" }}>
                  <img 
                    src={e.photo} 
                    alt={e.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: 'block', position: 'absolute', inset: 0, minWidth: "100%", minHeight: "100%" }} 
                  />
                </div>
                
                <div className="fav-details" style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ 
                        fontSize: 11, background: "#f1f5f9", color: C.navy, padding: "3px 10px", borderRadius: 20, fontWeight: 600 
                      }}>
                        {e.cat}
                      </span>
                      <button onClick={(ev) => removeFavorite(ev, e.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <FaHeart color={C.orange} size={18} />
                      </button>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, margin: "2px 0 6px", color: C.navy, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {e.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                        <FaMapMarkerAlt color={C.orange} size={11} /> {e.loc}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                        <FaClock color={C.orange} size={11} /> {e.date}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="book-btn" 
                    onClick={(ev) => handleBookNow(ev, e)}
                    disabled={isBooked(e.id)}
                    style={{ 
                      background: isBooked(e.id) ? "#10b981" : C.orange, color: C.white, 
                      border: "none", borderRadius: 10, padding: "9px 0", width: "100%", 
                      fontWeight: 700, fontSize: 13, cursor: isBooked(e.id) ? "default" : "pointer", 
                      marginTop: 14 
                    }}
                  >
                    {isBooked(e.id) ? "✓ Booked" : "Book Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}