'use client';
import { useState, useEffect } from "react";
import { apiSpeakerApply, apiGetEvent } from "@/lip/api";
import { C, S } from "../../constants/styles";
import NavBar from "../../components/NavBar";
import { FaMicrophone, FaClock, FaListAlt, FaAlignLeft, FaPaperPlane, FaBullseye, FaUsers, FaBroadcastTower, FaCheckCircle } from "react-icons/fa";

// Enhanced safe localStorage with quota management
const safeLS = typeof window !== 'undefined' ? {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Auto-cleanup strategy: remove oldest items
        cleanupOldestItems();
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch {}
  }
} : {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
};

// Cleanup function - removes oldest eh_extras_* items
function cleanupOldestItems() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('eh_extras_'));
    if (keys.length <= 10) return; // Keep max 10 events
    
    // Sort by creation time (approximate via access time)
    const sortedKeys = keys
      .map(key => ({ key, time: localStorage.getItem(key) ? 0 : Date.now() })) // Newer items have content
      .sort((a, b) => a.time - b.time)
      .slice(0, keys.length - 10) // Keep latest 10
      .map(item => item.key);
    
    sortedKeys.forEach(key => localStorage.removeItem(key));
    console.log(`[STORAGE] Cleaned ${sortedKeys.length} old event extras`);
  } catch (e) {
    console.warn('[STORAGE] Cleanup failed:', e);
  }
}

export default function JoinAsSpeakerPage({ setPage, userName, userEmail, userRole, selectedEvent = null }) {
  const [form, setForm] = useState({ title: "", abstract: "", duration: "", format: "" });
  const [eventId, setEventId] = useState(() => safeLS.getItem("eh_active_event_id") || "");
  
  const [speakerPhoto, setSpeakerPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Use static default photo for consistency across all events
  const defaultSpeakerPhoto = 'https://picsum.photos/seed/speaker-default/200/200';
  
  // Reset form when event changes
  useEffect(() => {
    const currentEventId = safeLS.getItem("eh_active_event_id") || "";
    if (currentEventId !== eventId) {
      setEventId(currentEventId);
      setSuccess(false);
      setSubmitted(false);
      setForm({ title: "", abstract: "", duration: "", format: "" });
    }
  }, [eventId]);

  // Load global speaker profile on mount
  useEffect(() => {
    const globalProfile = JSON.parse(safeLS.getItem('eh_speaker_profile') || '{}');
    setSpeakerPhoto(defaultSpeakerPhoto);
    setPhotoPreview(defaultSpeakerPhoto);
    setSuccess(false);
    setSubmitted(false);
  }, []);

  // Load active event - try saved data first, then API, then fallback
  useEffect(() => {
    const eid = safeLS.getItem("eh_active_event_id") || "";
    if (!eid) {
      if (selectedEvent) {
        setActiveEvent(selectedEvent);
      }
      return;
    }

    const savedEventData = safeLS.getItem("eh_active_event_data");
    if (savedEventData) {
      try {
        const parsed = JSON.parse(savedEventData);
        if (String(parsed.id) === eid && parsed.photo) {
          setActiveEvent(parsed);
          return;
        }
      } catch (err) {}
    }
    
    if (selectedEvent && String(selectedEvent.id) === eid) {
      setActiveEvent(selectedEvent);
      return;
    }

    apiGetEvent(eid).then(data => {
      const ev = data?.data?.event || data?.data || data;
      if (ev && ev.id) {
        setActiveEvent({
          id: ev.id,
          title: ev.title || "Event",
          photo: ev.image || ev.photo || ev.image_url || ev.cover_image || ev.thumbnail || `https://picsum.photos/seed/ev${ev.id}/400/300`,
          loc: ev.location || ev.venue_name || "",
          date: ev.start_time || ev.date || "",
        });
        return;
      }
      throw new Error('No event from API');
    }).catch(() => {
      const custom = JSON.parse(safeLS.getItem("eh_events") || "[]");
      const BASE_TITLES = ["Tech Summit 2026","AI Horizons","Design Week","Startup Night","Art Basel Cairo","Cloud Expo","UX Masters","Business Forum"];
      const base = Array.from({length:8}, function(_, i) {
        return {id: i, photo: "https://picsum.photos/seed/ev" + i + "/400/300", title: BASE_TITLES[i]};
      });
      const event = [...custom,...base].find(e => String(e.id) === eid);
      if (event) setActiveEvent(event);
    });
  }, [selectedEvent]);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const saveSpeakerProposalLocally = (eid, entry, eventData) => {
    try {
      // Limit data size before saving
      const compactEntry = {
        name: entry.name?.slice(0, 50) || "",
        email: entry.email,
        title: entry.title?.slice(0, 100) || "",
        abstract: entry.abstract?.slice(0, 500) || "",
        duration: entry.duration,
        format: entry.format,
        bio: entry.abstract?.slice(0, 200) || "",
        photo: entry.photo,
        job_title: entry.job_title?.slice(0, 50) || "",
        company: entry.company?.slice(0, 50) || "",
        phone: entry.phone?.slice(0, 20) || "",
        linkedin: entry.linkedin?.slice(0, 100) || "",
        timestamp: Date.now()
      };

      const extrasKey = `eh_extras_${eid}`;
      
      // Load existing data with size limit
      let extras = {};
      const existing = safeLS.getItem(extrasKey);
      if (existing) {
        try {
          extras = JSON.parse(existing);
          // Limit speakers array to 50 max
          if (extras.speakers && extras.speakers.length > 50) {
            extras.speakers = extras.speakers.slice(-50);
          }
        } catch {
          extras = {};
        }
      }

      if (!extras.speakers) extras.speakers = [];
      
      // Update or add speaker
      const ei = extras.speakers.findIndex(s => s.email && s.email.toLowerCase() === entry.email?.toLowerCase());
      if (ei !== -1) {
        extras.speakers[ei] = compactEntry;
      } else {
        extras.speakers.push(compactEntry);
      }

      // Compact event data
      if (eventData && eventData.id) {
        extras.eventData = {
          id: eventData.id,
          title: eventData.title?.slice(0, 100) || "",
          loc: (eventData.loc || eventData.location || "")?.slice(0, 100) || "",
          date: eventData.date?.slice(0, 50) || "",
          photo: eventData.photo?.slice(0, 200) || ""
        };
      }

      // Save with quota safety
      const success = safeLS.setItem(extrasKey, JSON.stringify(extras));
      if (!success) {
        console.warn('[STORAGE] Failed to save extras after cleanup');
        return false;
      }

      // Update eh_events (limit size)
      const events = JSON.parse(safeLS.getItem("eh_events") || "[]");
      const idx = events.findIndex(e => String(e.id) === String(eid));
      if (idx !== -1) {
        if (!events[idx].speakers) events[idx].speakers = [];
        const si = events[idx].speakers.findIndex(s => s.email && s.email.toLowerCase() === entry.email?.toLowerCase());
        if (si !== -1) {
          events[idx].speakers[si] = compactEntry;
        } else if (events[idx].speakers.length < 20) { // Limit per event
          events[idx].speakers.push(compactEntry);
        }
        safeLS.setItem("eh_events", JSON.stringify(events));
      }

      window.dispatchEvent(new Event("storage"));
      return true;
    } catch (e) {
      console.error('[STORAGE] Save failed:', e);
      return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setSaving(true);
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Session title is required";
    if (!form.abstract.trim()) newErrors.abstract = "Abstract is required";
    if (!form.duration) newErrors.duration = "Please select a duration";
    if (!form.format) newErrors.format = "Please select a format";
    
    const eid = parseInt(String(activeEvent?.id || "").trim(), 10);
    if (!eid || Number.isNaN(eid)) {
      newErrors.event = "Apply from an event's detail page (Join as Speaker) so the proposal is linked to that event.";
    }
    
    const token = safeLS.getItem("eh_token");
    if (!token) {
      newErrors.auth = "Please login first to apply as a speaker.";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('event_id', eid);
      formData.append('session_title', form.title.trim());
      formData.append('summary', form.abstract.trim());
      formData.append('duration', form.duration);
      formData.append('session_format', form.format);
      
      await apiSpeakerApply(formData);
    } catch (e) {
      if (e.message?.includes('401') || e.message?.includes('Unauthenticated')) {
        setErrors({ api: "Please login first to apply as a speaker." });
      } else {
        setErrors({ api: e.message || "Could not submit proposal. Try again." });
      }
      setSaving(false);
      return;
    }

    // Save locally (non-blocking)
    const userProfile = JSON.parse(safeLS.getItem("eh_user_profile") || "null") || {};
    const userPhoto = safeLS.getItem(`eh_photo_${userEmail?.toLowerCase()}`) || userProfile.photo || null;
    
    const entry = {
      name: userName || userEmail, 
      email: userEmail?.toLowerCase(),
      title: form.title.trim(), 
      abstract: form.abstract.trim(),
      duration: form.duration, 
      format: form.format, 
      bio: form.abstract.trim(),
      photo: userPhoto,
      job_title: userProfile.job_title || userProfile.jobTitle || "",
      company: userProfile.company || "",
      phone: userProfile.phone || "",
      linkedin: userProfile.linkedin || "",
    };

    const eventData = JSON.parse(safeLS.getItem("eh_active_event_data") || "null");
    const localSaveSuccess = saveSpeakerProposalLocally(eid, entry, eventData);
    
    // Always clear active event data regardless of local save
    safeLS.removeItem("eh_active_event_id");
    safeLS.removeItem("eh_active_event_data");

    setSuccess(true);
    console.log('[SPEAKER] Proposal submitted', { eid, localSave: localSaveSuccess });
  };

  const inputStyle = (hasErr) => ({
    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
    fontFamily: "Poppins, sans-serif", outline: "none", boxSizing: "border-box",
    border: `1.5px solid ${hasErr ? "#ef4444" : C.border}`, background: "#fff", color: C.navy,
  });
  const labelStyle = { fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 };

  return (
    <div style={S.page}>
      <style>{`
        .send-btn { transition: background .2s, transform .15s, box-shadow .15s; }
        .send-btn:hover { background: #ea6c00 !important; transform: scale(1.03); box-shadow: 0 6px 20px rgba(249,115,22,0.4) !important; }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        @media (max-width: 992px) {
          .content-side { padding: 40px 24px !important; }
          .header-flex { grid-template-columns: 1fr !important; gap: 20px !important; }
          .hero-img-box { display: none !important; }
          .illustration-container { 
            position: absolute !important; 
            top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
            width: 100% !important; 
            height: 100% !important; 
            z-index: 1 !important; 
            opacity: 0.1 !important; 
            pointer-events: none !important; 
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .title-responsive { 
            font-size: 24px !important; 
            text-align: center !important; 
          }
          .desc-responsive { 
            text-align: center !important; 
            font-size: 13px !important;
          }
          .perks-responsive { align-items: center !important; }
          .form-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <NavBar page="events" setPage={setPage} userName={userName} userRole={userRole} userEmail={userEmail} />
            <div style={{ padding: "40px 60px 60px" }}>
        {/* Header - unchanged */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "flex-start", marginBottom: 32 }}>
          <div style={{ paddingTop: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff0e6", borderRadius: 20, padding: "6px 14px", marginBottom: 16 }}>
              <FaMicrophone color={C.orange} size={13} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>Call for Speakers</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, color: C.navy, lineHeight: 1.25 }}>
              Share your expertise<br />with the world
            </h1>
            <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>
              Inspire our community with your unique insights, connect with like-minded professionals, and leave a lasting impact on your audience.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {[[<FaBullseye color={C.orange} size={14}/>, "Reach a curated professional audience"],
                [<FaUsers color={C.orange} size={14}/>, "Network with industry leaders"],
                [<FaBroadcastTower color={C.orange} size={14}/>, "Build your personal brand"]
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.gray }}>{icon} {text}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 260, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,31,84,0.14)" }}>
            <img src={activeEvent?.photo || "https://picsum.photos/seed/speaker-hero/700/400"} alt="Speaker" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
          </div>
        </div>

        {/* Form or Success */}
        {success ? (
          <div style={{ background: C.white, borderRadius: 16, padding: "48px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,31,84,0.08)", border: `1px solid ${C.border}` }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <FaCheckCircle color="#10b981" size={28}/>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Proposal Submitted!</h2>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 24, lineHeight: 1.6 }}>
              Your session proposal has been added to the event.<br/>The organizer will review it shortly.
            </p>
            <button onClick={() => setPage("speaker-dashboard")}
              style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,31,84,0.08)", border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <FaAlignLeft color={C.orange} size={15}/> Session Proposal
            </h2>

            {(submitted && errors.event) || errors.api ? (
              <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
                {errors.api || errors.event}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}><FaMicrophone color={C.orange} size={11}/> Session Title *</label>
                  <input value={form.title} onChange={e => set("title")(e.target.value)} placeholder="e.g. The Future of AI in Healthcare"
                    style={inputStyle(submitted && errors.title)}/>
                  {submitted && errors.title && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.title}</div>}
                </div>
                <div>
                  <label style={labelStyle}><FaAlignLeft color={C.orange} size={11}/> Abstract / Summary *</label>
                  <textarea value={form.abstract} onChange={e => set("abstract")(e.target.value)}
                    placeholder="Describe what your session will cover..."
                    rows={5} style={{ ...inputStyle(submitted && errors.abstract), resize: "vertical" }}/>
                  {submitted && errors.abstract && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.abstract}</div>}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}><FaClock color={C.orange} size={11}/> Preferred Duration *</label>
                  <select value={form.duration} onChange={e => set("duration")(e.target.value)} style={inputStyle(submitted && errors.duration)}>
                    <option value="">Select duration</option>
                    {["20 minutes","30 minutes","45 minutes","60 minutes"].map(o => <option key={o}>{o}</option>)}
                  </select>
                  {submitted && errors.duration && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.duration}</div>}
                </div>
                <div>
                  <label style={labelStyle}><FaListAlt color={C.orange} size={11}/> Session Format *</label>
                  <select value={form.format} onChange={e => set("format")(e.target.value)} style={inputStyle(submitted && errors.format)}>
                    <option value="">Select format</option>
                    {["Presentation","Discussion panel","Workshop","Keynote"].map(o => <option key={o}>{o}</option>)}
                  </select>
                  {submitted && errors.format && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.format}</div>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button type="button" className="send-btn" onClick={handleSubmit} disabled={saving}
                style={{ 
                  background: saving ? "#f59e0b" : C.orange, 
                  color: C.white, 
                  border: "none", 
                  borderRadius: 10, 
                  padding: "12px 32px", 
                  fontWeight: 700, 
                  fontSize: 14, 
                  cursor: saving ? "not-allowed" : "pointer", 
                  fontFamily: "Poppins, sans-serif", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  boxShadow: "0 4px 16px rgba(249,115,22,0.3)" 
                }}>
                <FaPaperPlane size={13}/> {saving ? "Sending..." : "Send Proposal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}