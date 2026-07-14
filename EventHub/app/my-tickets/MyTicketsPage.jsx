'use client';
import { useEffect } from "react";
import { apiGetMyTickets, apiCancelBooking } from "@/lip/api";
import { useState, useRef, useCallback, useMemo } from "react";
import { C } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import {
  FaMapMarkerAlt, FaQrcode, FaDownload,
  FaCalendarAlt, FaHashtag, FaTicketAlt, FaCopy, FaCheck,
  FaUsers, FaChevronLeft, FaChevronRight, FaTrash
} from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const HISTORY_TICKETS = [
  { id: 10, title: "Cairo Jazz Festival",  date: "Jan 14", time: "8:00 PM",  endTime: "11:00 PM", loc: "Cairo",     type: "General", bookingId: "298441100", section: "5", row: "3", seats: 2, photo: "https://picsum.photos/seed/history0/300/200", past: true },
  { id: 11, title: "Startup Grind 2025",   date: "Feb 3",  time: "11:00 AM", endTime: "2:00 PM",  loc: "Giza",     type: "VIP",     bookingId: "298443313", section: "6", row: "4", seats: 1, photo: "https://picsum.photos/seed/history1/300/200", past: true },
  { id: 12, title: "Art Dubai 2025",       date: "Feb 20", time: "10:00 AM", endTime: "1:00 PM",  loc: "Alexandria",type:"General", bookingId: "298445526", section: "7", row: "5", seats: 3, photo: "https://picsum.photos/seed/history2/300/200", past: true },
  { id: 13, title: "Design Arabia",        date: "Mar 5",  time: "3:00 PM",  endTime: "6:00 PM",  loc: "New Cairo", type: "Premium",bookingId: "298447739", section: "8", row: "6", seats: 1, photo: "https://picsum.photos/seed/history3/300/200", past: true },
  { id: 14, title: "Cloud World 2025",     date: "Mar 18", time: "9:00 AM",  endTime: "12:00 PM", loc: "Cairo",    type: "VIP",     bookingId: "298449952", section: "9", row: "7", seats: 2, photo: "https://picsum.photos/seed/history4/300/200", past: true },
  { id: 15, title: "AI Egypt Summit",      date: "Mar 28", time: "2:00 PM",  endTime: "5:00 PM",  loc: "Dahab",    type: "General", bookingId: "298452165", section: "10","row": "8",seats: 1, photo: "https://picsum.photos/seed/history5/300/200", past: true },
];

// Group a flat list of tickets into event groups
function groupTickets(tickets) {
  const map = new Map();
  tickets.forEach(t => {
    const key = t.title;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  });
  return Array.from(map.values());
}

// Unique QR per bookingId
function getQRPattern(bookingId) {
  const seed = String(bookingId).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return Array.from({ length: 81 }, (_, i) => {
    const r = Math.floor(i / 9), c = i % 9;
    return { r, c, on: ((seed * (r + 1) * 3 + c * 7 + (r ^ c) * seed) % 3 !== 0) };
  });
}

function QRCode({ bookingId, svgRef }) {
  const pattern = useMemo(() => getQRPattern(bookingId), [bookingId]);
  
  return (
    <svg ref={svgRef} width="130" height="130" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
      <rect width="130" height="130" fill="white" />
      {pattern.map(({ r, c, on }) => on
        ? <rect key={`${r}-${c}`} x={c * 14 + 2} y={r * 14 + 2} width="13" height="13" rx="1" fill="#111827" />
        : null)}
      {[[2, 2], [88, 2], [2, 88]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="40" height="40" rx="4" fill="#111827" />
          <rect x={x+5} y={y+5} width="30" height="30" rx="2" fill="white" />
          <rect x={x+10} y={y+10} width="20" height="20" rx="1" fill="#111827" />
        </g>
      ))}
    </svg>
  );
}

function QRModal({ group, onClose }) {
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const svgRefs = useRef([]);
  
  const ticket = group[current];
  const total = group.length;

  if (svgRefs.current.length !== total) {
    svgRefs.current = Array(total).fill().map(() => ({ current: null }));
  }

  const handleDownloadAll = useCallback(async () => {
  const zip = new JSZip();

  for (let i = 0; i < group.length; i++) {
    const svg = svgRefs.current[i]?.current;
    if (!svg) continue;

    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 300, 300);

    const img = new Image();

    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 35, 35, 230, 230);

        const png = canvas.toDataURL("image/png").split(",")[1];
        zip.file(`ticket-${group[i].bookingId}.png`, png, { base64: true });

        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "all-qr-codes.zip");
}, [group]);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(ticket.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [ticket.bookingId]);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    const svg = svgRefs.current[current]?.current;
    if (!svg) { 
      console.error('SVG ref not found');
      setDownloading(false); 
      return; 
    }
    
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = 300; canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);
      
      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        ctx.drawImage(img, 35, 35, 230, 230);
        URL.revokeObjectURL(url);
        const link = document.createElement("a");
        link.download = `ticket-${ticket.bookingId}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
      };
      
      img.onerror = () => {
        console.error('Failed to load SVG for download');
        URL.revokeObjectURL(url);
        setDownloading(false);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Download error:', error);
      setDownloading(false);
    }
  }, [current, ticket.bookingId]);

  const handlePrev = useCallback(() => {
    setCurrent(c => Math.max(0, c - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrent(c => Math.min(total - 1, c + 1));
  }, [total]);

  const setSvgRef = useCallback((index, el) => {
    if (svgRefs.current[index]) {
      svgRefs.current[index].current = el;
    }
  }, []);

  return (
    <div onClick={onClose} style={{ 
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      zIndex: 200 
    }}>
      <div onClick={e => e.stopPropagation()}
        style={{ 
          background: "#fff", borderRadius: 16, padding: 32, width: 440, 
          maxWidth: "94vw", fontFamily: "Poppins, sans-serif", 
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)", maxHeight: "92vh", 
          overflowY: "auto" 
        }}>

        <div onClick={onClose} style={{ 
          cursor: "pointer", marginBottom: 20, color: C.navy, 
          display: "inline-flex", fontSize: 18, fontWeight: 600 
        }}>
          <HiOutlineArrowLeft size={24} />
        </div>

        {/* Photo + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <img src={ticket.photo} alt={ticket.title}
            style={{ width: 90, height: 70, borderRadius: 10, objectFit: "cover", flexShrink: 0, filter: ticket.past ? "grayscale(60%)" : "none" }} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>{ticket.title}</h2>
            <div style={{ fontSize: 12, color: C.gray }}>{ticket.date} · {ticket.time}{ticket.endTime ? ` – ${ticket.endTime}` : ""}</div>
            <div style={{ fontSize: 12, color: C.gray }}>{ticket.loc}</div>
          </div>
        </div>

        {/* Ticket navigator — only show if >1 ticket */}
        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f9fb", borderRadius: 10, padding: "10px 16px", marginBottom: 18, border: `1px solid ${C.border}` }}>
            <button onClick={handlePrev} disabled={current === 0}
              style={{ background: "none", border: "none", cursor: current === 0 ? "default" : "pointer", opacity: current === 0 ? 0.3 : 1, color: C.navy, display: "flex", alignItems: "center" }}>
              <FaChevronLeft size={14} />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Ticket {current + 1} of {total}</div>
              <div style={{ fontSize: 11, color: C.gray }}>Each ticket has a unique QR code</div>
            </div>
            <button onClick={handleNext} disabled={current === total - 1}
              style={{ background: "none", border: "none", cursor: current === total - 1 ? "default" : "pointer", opacity: current === total - 1 ? 0.3 : 1, color: C.navy, display: "flex", alignItems: "center" }}>
              <FaChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["Venue:", ticket.loc], ["Section:", ticket.section], ["Row:", ticket.row], ["Type:", ticket.type]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Booking ID */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
            Booking ID
            <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {copied ? <FaCheck color="#10b981" size={12} /> : <FaCopy color={C.gray} size={12} />}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#374151", fontFamily: "monospace", background: "#f8f9fb", padding: "6px 10px", borderRadius: 8 }}>{ticket.bookingId}</div>
        </div>

        <div style={{ borderTop: "2px dashed #d1d5db", margin: "16px 0" }} />

        {/* QR Code — unique per ticket */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
          <QRCode 
            key={`${ticket.bookingId}-${current}`} 
            bookingId={ticket.bookingId} 
            svgRef={el => setSvgRef(current, el)}
          />
          <div style={{ fontSize: 11, color: C.gray, marginTop: 8 }}>
            {total > 1 ? `QR ${current + 1} of ${total} — scan individually at entrance` : "Scan at venue entrance"}
          </div>
        </div>

        {/* Download dots indicator for multiple tickets */}
        {total > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {group.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrent(i)} 
                style={{ 
                  width: i === current ? 20 : 8, height: 8, borderRadius: 4, 
                  background: i === current ? C.orange : "#d1d5db", 
                  cursor: "pointer", transition: "all .2s" 
                }} 
              />
            ))}
          </div>
        )}

        <button 
          onClick={handleDownload} 
          disabled={downloading}
          style={{ 
            width: "100%", height: 48, 
            background: downloading ? "#9ca3af" : C.orange, 
            border: "none", borderRadius: 30, color: "#fff", 
            fontSize: 15, fontWeight: 600, 
            cursor: downloading ? "wait" : "pointer", 
            fontFamily: "Poppins, sans-serif", 
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, 
            transition: "background .2s" 
          }}>
          <FaDownload size={14} /> 
          {downloading ? "Downloading…" : `Download QR ${total > 1 ? `(Ticket ${current + 1})` : ""}`}
        </button>
        {total > 1 && (
          <button onClick={handleDownloadAll} style={{ width: "100%", height: 48, marginTop: 10, background: "rgb(245, 130, 31)", border: "none", borderRadius: 30, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8}}>
            Download All QR Codes
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyTicketsPage({ setPage, userName, userEmail, userRole, bookedTickets = [], setBookedTickets }) {
  const [tab, setTab] = useState("upcoming");
  const [activeGroup, setActiveGroup] = useState(null);
  const [localTickets, setLocalTickets] = useState(bookedTickets);
  const [deleteModal, setDeleteModal] = useState({ show: false, group: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLocalTickets(bookedTickets);
  }, [bookedTickets]);

  // Open delete confirmation modal
  const handleDeleteClick = useCallback((group) => {
    setDeleteModal({ show: true, group });
  }, []);

  // Confirm and execute delete
  const confirmDelete = useCallback(async () => {
    const groupToDelete = deleteModal.group;
    if (!groupToDelete) return;
    
    setDeleting(true);

    const bookingIds = groupToDelete
      .map((t) => String(t.bookingId || t.id || ''))
      .filter((id) => id);

    // Cancel API bookings first
    if (bookingIds.length > 0) {
      await Promise.all(
        bookingIds.map((id) =>
          apiCancelBooking(id).catch((err) => {
            console.warn(`[MyTicketsPage] Failed to cancel booking ${id}:`, err?.message || err);
          })
        )
      );
    }

    // Remove from local state
    const titlesToRemove = new Set(groupToDelete.map((t) => t.title));
    const updated = localTickets.filter((t) => !titlesToRemove.has(t.title));
    
    setLocalTickets(updated);
    
    // Sync with parent context and localStorage
    if (typeof setBookedTickets === 'function') {
      setBookedTickets(updated);
    }
    
    // Also update localStorage directly for safety
    const safeLS = typeof window !== 'undefined' ? localStorage : { setItem: () => {} };
    if (userEmail) {
      safeLS.setItem(`eh_tickets_${userEmail}`, JSON.stringify(updated));
    }
    
    setDeleting(false);
    setDeleteModal({ show: false, group: null });
  }, [deleteModal, localTickets, setBookedTickets, userEmail]);

  const upcomingGroups = groupTickets(localTickets);
  const historyGroups = groupTickets(HISTORY_TICKETS);
  const groups = tab === "upcoming" ? upcomingGroups : historyGroups;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        .tk-card { transition: transform .25s ease, box-shadow .25s ease; }
        .tk-card:hover { transform: translateY(-4px); box-shadow: 0 8px 40px rgba(0,31,84,0.15) !important; }
        .qr-btn { transition: background .2s, transform .15s; }
        .qr-btn:hover { background: #ea6c00 !important; transform: scale(1.03); }
        .tab-btn { transition: all .2s ease; }

        @media (max-width: 1024px) {
          .tickets-container { padding: 30px 24px !important; }
          .tickets-grid { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)) !important; }
        }

        @media (max-width: 640px) {
          .tk-card { 
            grid-template-columns: 1fr !important;
            grid-template-rows: 180px auto !important;
            min-height: auto !important;
          }
          .tk-img-container { 
            width: 100% !important; 
            height: 180px !important; 
            min-height: 180px !important;
          }
          .tk-img-container img {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .tickets-grid { grid-template-columns: 1fr !important; }
          .tab-btn { padding: 10px 20px !important; font-size: 13px !important; }
          .tk-details { padding: 14px !important; }
        }
      `}</style>

      <NavBar page="my-tickets" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />

      <div className="tickets-container" style={{ padding: "40px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: C.navy }}>My Tickets</h1>
        <p style={{ color: C.gray, fontSize: 14, marginBottom: 24 }}>View your upcoming and past event tickets</p>

        {/* Tabs */}
        <div style={{ background: C.white, borderRadius: 30, padding: 4, display: "inline-flex", marginBottom: 32, boxShadow: "0 2px 12px rgba(0,31,84,0.07)" }}>
          {[{ key: "upcoming", label: "Coming Soon" }, { key: "history", label: "History" }].map(t => (
            <button 
              key={t.key} 
              className="tab-btn" 
              onClick={() => setTab(t.key)}
              style={{ 
                padding: "10px 40px", borderRadius: 26, border: "none", 
                background: tab === t.key ? C.navy : "transparent", 
                color: tab === t.key ? C.white : C.gray, 
                fontWeight: 600, cursor: "pointer", fontSize: 14, 
                fontFamily: "Poppins, sans-serif", 
                boxShadow: tab === t.key ? "0 4px 14px rgba(0,31,84,0.2)" : "none" 
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {groups.length === 0 && tab === "upcoming" ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.gray }}>
            <FaTicketAlt size={48} color="#e5e7eb" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: C.navy }}>No tickets yet</p>
            <p style={{ fontSize: 14 }}>Book an event and your ticket will appear here.</p>
            <button onClick={() => setPage("events")}
              style={{ marginTop: 20, background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
              Browse Events
            </button>
          </div>
        ) : (
          <div className="tickets-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "20px 24px" }}>
            {groups.map((group, gi) => {
              const ticket = group[0]; // representative ticket for card display
              const count  = group.length;
              const isPast = ticket.past;
              return (
                <div key={`${ticket.title}-${gi}`} className="tk-card"
                  style={{ display: "grid", gridTemplateColumns: "180px 1fr", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,31,84,0.08)", border: `1px solid ${C.border}`, opacity: isPast ? 0.82 : 1, minHeight: 180 }}>

                  {/* Photo side */}
                  <div className="tk-img-container" style={{ position: "relative", overflow: "hidden", background: "#f0f2f5", minHeight: "100%", width: "100%" }}>
                    <img src={ticket.photo} alt={ticket.title}
                      style={{ width: "100%", height: "100%", minWidth: "100%", minHeight: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0, filter: isPast ? "grayscale(60%)" : "none" }} />
                    {/* Ticket count badge */}
                    <div style={{ position: "absolute", bottom: 8, left: 8, background: isPast ? "rgba(107,114,128,0.85)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaTicketAlt size={9} /> {count} ticket{count > 1 ? "s" : ""}
                    </div>
                    {isPast && (
                      <div style={{ position: "absolute", top: 8, left: 8, background: "#6b7280", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: "#fff" }}>Attended</div>
                    )}
                  </div>

                  {/* Info side */}
                  <div className="tk-details" style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: C.navy }}>{ticket.title}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                          <FaCalendarAlt color={isPast ? C.gray : C.orange} size={11} />
                          {ticket.date} · {ticket.time}{ticket.endTime ? ` – ${ticket.endTime}` : ""}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                          <FaMapMarkerAlt color={isPast ? C.gray : C.orange} size={11} /> {ticket.loc}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray }}>
                          <FaTicketAlt color={isPast ? C.gray : C.orange} size={11} /> {ticket.type}
                        </div>
                        {count > 1 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.orange, fontWeight: 600 }}>
                            <FaUsers color={C.orange} size={11} /> {count} attendees · {count} QR codes
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.gray }}>
                          <FaHashtag color={isPast ? C.gray : C.orange} size={10} />
                          <span style={{ fontFamily: "monospace" }}>{ticket.bookingId}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button className="qr-btn" onClick={() => setActiveGroup(group)}
                        style={{ background: isPast ? C.gray : C.orange, color: C.white, border: "none", borderRadius: 8, padding: "8px 0", flex: 1, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                        <FaQrcode size={14} />
                        {count > 1 ? `View ${count} QR Codes` : "View QR Code"}
                      </button>
                      {!isPast && (
                        <button onClick={() => handleDeleteClick(group)}
                          style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeGroup && <QRModal group={activeGroup} onClose={() => setActiveGroup(null)} />}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div onClick={() => setDeleteModal({ show: false, group: null })} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 300, backdropFilter: "blur(4px)"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "32px 28px", width: 420,
            maxWidth: "90vw", fontFamily: "Poppins, sans-serif",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center"
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <FaTrash size={28} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>
              Delete Tickets?
            </h3>
            <p style={{ fontSize: 14, color: C.gray, margin: "0 0 24px", lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteModal.group?.[0]?.title}</strong>?<br/>
              This will cancel {deleteModal.group?.length} ticket{deleteModal.group?.length > 1 ? 's' : ''}.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteModal({ show: false, group: null })} disabled={deleting}
                style={{
                  background: "#f3f4f6", color: "#374151", border: "none",
                  borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 14,
                  cursor: deleting ? "default" : "pointer", fontFamily: "Poppins, sans-serif",
                  opacity: deleting ? 0.6 : 1
                }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{
                  background: "#ef4444", color: "#fff", border: "none",
                  borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 14,
                  cursor: deleting ? "default" : "pointer", fontFamily: "Poppins, sans-serif",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: deleting ? 0.6 : 1
                }}>
                {deleting ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Deleting...
                  </>
                ) : (
                  <><FaTrash size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
