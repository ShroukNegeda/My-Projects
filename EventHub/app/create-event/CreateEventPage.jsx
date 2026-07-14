'use client';
import {
  apiCreateEvent,
  apiUpdateEvent,
  apiGetEvent,
  addOrganizerOwnedEventId,
  extractEventIdFromSaveResponse,
} from "@/lip/api";
import { useState, useEffect } from "react";
import { C, S } from "../../constants/styles";
import SidebarLayout from "../../components/SidebarLayout";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaImage, FaInfoCircle, FaUsers, FaTag,
  FaAlignLeft, FaUpload, FaCheckCircle, FaArrowRight, FaExclamationCircle,
  FaDollarSign, FaTicketAlt, FaMicrophone, FaHandshake, FaPlus, FaTrash,
  FaEdit, FaGlobe, FaBriefcase, FaEnvelope, FaBuilding
} from "react-icons/fa";

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

/** API/local event objects may use numeric `capacity`; form + `.trim()` need strings. */
const capacityToFormStr = (v) => (v == null || v === "" ? "" : String(v));

const SECTION = ({ icon, title, subtitle, children }) => (
  <div style={{ background: C.white, borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,31,84,0.06)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff0e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{title}</div>
        <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
    {children}
  </div>
);

const FieldError = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 11, color: "#ef4444", fontFamily: "Poppins, sans-serif" }}>
    <FaExclamationCircle size={10} /> {text}
  </div>
);

const inputStyle = (hasErr, extra = {}) => ({
  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
  fontFamily: "Poppins, sans-serif", outline: "none",
  border: `1.5px solid ${hasErr ? "#ef4444" : C.border}`,
  background: "#fff", color: C.navy, boxSizing: "border-box",
  transition: "border-color 0.2s",
  ...extra
});

const labelStyle = { fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 };

// Parse a stored date back into form fields for editing
const parseDateForForm = (dateStr = "") => {
  if (!dateStr) return { date: "", time: "", ampm: "" };
  // Try ISO format: "2026-04-10T14:00:00"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (isoMatch) {
    const [, yr, mo, dy, hr24, mn] = isoMatch;
    const h = parseInt(hr24);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return {
      date: `${dy}/${mo}/${yr}`,
      time: `${String(h12).padStart(2,"0")}:${mn}`,
      ampm,
    };
  }
  return { date: "", time: "", ampm: "" };
};

const parseTimeDisplay = (timeStr = "") => {
  if (!timeStr) return { time: "", ampm: "" };
  const m = timeStr.match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
  if (m) return { time: m[1].padStart(5,"0"), ampm: m[2].toUpperCase() };
  return { time: timeStr, ampm: "" };
};

const eventDateTimeToFormParts = (raw) => {
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return { date: "", time: "", ampm: "" };
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{1,2}):(\d{2})/);
  if (m) {
    const [, yr, mo, dy, hStr, mn] = m;
    const h24 = parseInt(hStr, 10);
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return {
      date: `${dy}/${mo}/${yr}`,
      time: `${String(h12).padStart(2, "0")}:${mn}`,
      ampm,
    };
  }
  const iso = parseDateForForm(s);
  return { date: iso.date, time: iso.time, ampm: iso.ampm };
};

const locTypeFromApiType = (t) => {
  const x = String(t || "").toLowerCase();
  if (x === "online") return "online";
  return "in-person";
};

export default function CreateEventPage({ setPage, userName, userEmail, userRole, logout, selectedEvent, setSelectedEvent }) {
  const [photo, setPhotoState] = useState(() => userEmail ? safeLS.getItem(`eh_photo_${userEmail.toLowerCase()}`) : null);
  useEffect(() => { setPhotoState(userEmail ? safeLS.getItem(`eh_photo_${userEmail.toLowerCase()}`) : null); }, [userEmail]);

  // Detect if editing an existing event
  const editingEvent = selectedEvent?.isEditing ? selectedEvent : null;

  const [locType,      setLocType]      = useState(editingEvent?.locType || "in-person");
  const [dragOver,     setDragOver]     = useState(false);
  const [fileName,     setFileName]     = useState(editingEvent?.fileName || null);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    const p = editingEvent?.photo;
    if (!p) return null;
    if (p.startsWith("__local__")) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem("eh_ephoto_" + String(editingEvent.id)) : null;
      return stored || null;
    }
    return p;
  });
  const [submitted,    setSubmitted]    = useState(false);

  // Ticket tiers
  const [tickets, setTickets] = useState(editingEvent?.tickets || [
    { id: 1, name: "General", price: "", quantity: "" }
  ]);

  // Speakers list
  const [speakers, setSpeakers] = useState(editingEvent?.speakers || [
    { id: 1, email: "", name: "", title: "", company: "", bio: "", photo: "", country: "", city: "" }
  ]);

  // Sponsors list
  const [sponsors, setSponsors] = useState(editingEvent?.sponsors || [
    { id: 1, email: "", name: "", tier: "Gold", website: "", logo: "" }
  ]);

  const [form, setForm] = useState({
    title:       editingEvent?.title       || "",
    description: editingEvent?.description || "",
    category:    editingEvent?.cat         || "",
    capacity:    capacityToFormStr(editingEvent?.capacity),
    startDate:   editingEvent?.startDate   || parseDateForForm(editingEvent?.date).date,
    startTime:   (() => { if (editingEvent?.startTime) return parseTimeDisplay(editingEvent.startTime).time; return parseDateForForm(editingEvent?.date).time; })(),
    startAmPm:   (() => { if (editingEvent?.startTime) return parseTimeDisplay(editingEvent.startTime).ampm; return parseDateForForm(editingEvent?.date).ampm; })(),
    endDate:     editingEvent?.endDate     || parseDateForForm(editingEvent?.endDateISO).date,
    endTime:     (() => { if (editingEvent?.endTime) return parseTimeDisplay(editingEvent.endTime).time; return parseDateForForm(editingEvent?.endDateISO).time; })(),
    endAmPm:     (() => { if (editingEvent?.endTime) return parseTimeDisplay(editingEvent.endTime).ampm; return parseDateForForm(editingEvent?.endDateISO).ampm; })(),
    venue:       editingEvent?.loc         || "",
    address:     editingEvent?.address     || "",
  });

  const MAX_IMAGE_BYTES = 2048 * 1024;

  const readFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const compressImageFile = async (file) => {
    if (!file || file.size <= MAX_IMAGE_BYTES || typeof document === 'undefined') return file;
    try {
      const img = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        image.src = url;
      });
      const maxDimension = 1400;
      const ratio = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let quality = 0.92;
      let blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.35) {
        quality -= 0.1;
        blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      }
      if (!blob) return file;
      if (blob.size > MAX_IMAGE_BYTES) return file;
      const fileName = String(file.name || 'event-image').replace(/\.[^/.]+$/, '') + '.jpg';
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (err) {
      console.warn('Image compression failed, using original file', err);
      return file;
    }
  };

  const removeImage = () => { setFileName(null); setImagePreview(null); setImageFile(null); };
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const formatDate = (value) => {
   const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatTime = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

  // Ticket helpers
  const addTicket    = () => setTickets(t => [...t, { id: Date.now(), name: "", price: "", quantity: "" }]);
  const removeTicket = (id) => setTickets(t => t.filter(x => x.id !== id));
  const setTicket    = (id, key, val) => setTickets(t => t.map(x => x.id === id ? { ...x, [key]: val } : x));

  const fetchProfileByEmail = (email) => {
    if (!email) return null;
    const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
    const normalizedEmail = email.toLowerCase().trim();
    // Check if this email is registered in our accounts
    const account = accounts[normalizedEmail];
    if (account) {
      return {
        name: account.name || account.full_name || "",
        title: account.jobTitle || account.job_title || "",
        company: account.company || account.company_name || "",
        bio: account.bio || account.summary || "",
        photo: safeLS.getItem(`eh_photo_${normalizedEmail}`) || "",
        phone: account.phone || "",
        website: account.website || "",
        linkedin: account.linkedin || "",
        industry: account.industry || account.specialty || "",
        country: account.country || "",
        city: account.city || ""
      };
    }
    return null;
  };

  // Speaker helpers
  const addSpeaker    = () => setSpeakers(s => [...s, { id: Date.now(), email: "", name: "", title: "", company: "", bio: "", photo: "", country: "", city: "" }]);
  const removeSpeaker = (id) => setSpeakers(s => s.filter(x => x.id !== id));
  const setSpeaker    = (id, key, val) => {
    setSpeakers(s => s.map(x => {
      if (x.id !== id) return x;
      const updated = { ...x, [key]: val };
      // Auto-fill from profile when email is entered
      if (key === "email" && val) {
        const profile = fetchProfileByEmail(val);
        if (profile) {
          updated.name = profile.name || x.name;
          updated.title = profile.title || x.title;
          updated.company = profile.company || x.company;
          updated.bio = profile.bio || x.bio;
          updated.photo = profile.photo || x.photo;
          updated.phone = profile.phone || x.phone;
          updated.linkedin = profile.linkedin || x.linkedin;
          updated.country = profile.country || x.country;
          updated.city = profile.city || x.city;
        }
      }
      return updated;
    }));
  };

  // Speaker photo upload
  const handleSpeakerPhoto = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSpeaker(id, "photo", e.target.result);
    reader.readAsDataURL(file);
  };
  const removeSpeakerPhoto = (id) => setSpeaker(id, "photo", "");

  // Sponsor helpers
  const addSponsor    = () => setSponsors(s => [...s, { id: Date.now(), email: "", name: "", tier: "Gold", website: "", logo: "" }]);
  const removeSponsor = (id) => setSponsors(s => s.filter(x => x.id !== id));
  const setSponsor    = (id, key, val) => {
    setSponsors(s => s.map(x => {
      if (x.id !== id) return x;
      const updated = { ...x, [key]: val };
      // Auto-fill from profile when email is entered
      if (key === "email" && val) {
        const profile = fetchProfileByEmail(val);
        if (profile) {
          updated.name = profile.company || profile.name || x.name;
          updated.website = profile.website || x.website;
          updated.logo = profile.photo || x.logo;
        }
      }
      return updated;
    }));
  };

  // Sponsor logo upload
  const handleSponsorLogo = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSponsor(id, "logo", e.target.result);
    reader.readAsDataURL(file);
  };
  const removeSponsorLogo = (id) => setSponsor(id, "logo", "");

  // Date validation helper
  const isEndDateValid = () => {
    if (!form.startDate.trim() || !form.endDate.trim()) return false;
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.startDate) || !/^\d{2}\/\d{2}\/\d{4}$/.test(form.endDate)) return false;
    
    const [startDay, startMonth, startYear] = form.startDate.split("/").map(Number);
    const [endDay, endMonth, endYear] = form.endDate.split("/").map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    return endDate >= startDate;
  };

  const errors = {
    title:       !form.title.trim() || form.title.trim().length < 3,
    description: !form.description.trim() || form.description.trim().length < 10,
    category:    !form.category || form.category === "",
    capacity:    !String(form.capacity ?? "").trim() || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0,
    startDate:   !form.startDate.trim() || !/^\d{2}\/\d{2}\/\d{4}$/.test(form.startDate),
    startTime:   !form.startTime.trim() || !/^\d{2}:\d{2}$/.test(form.startTime),
    startAmPm:   !form.startAmPm || !["AM","PM"].includes(form.startAmPm),
    endDate:     !form.endDate.trim() || !/^\d{2}\/\d{2}\/\d{4}$/.test(form.endDate) || !isEndDateValid(),
    endTime:     !form.endTime.trim() || !/^\d{2}:\d{2}$/.test(form.endTime),
    endAmPm:     !form.endAmPm || !["AM","PM"].includes(form.endAmPm),
    venue:       locType === "in-person" && (!form.venue.trim() || form.venue.trim().length < 3),
    address:     locType === "in-person" && (!form.address.trim() || form.address.trim().length < 5),
    image:
      !imagePreview && !(selectedEvent?.isEditing && selectedEvent?.id),
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (key) => submitted && errors[key];

  const CATEGORY_ID_BY_LABEL = {
    Arts: 1,
    Education: 2,
    Sport: 3,
    Fashion: 4,
    Business: 5,
    Gaming: 6,
  };
  const CATEGORY_LABEL_BY_ID = Object.fromEntries(
    Object.entries(CATEGORY_ID_BY_LABEL).map(([label, id]) => [id, label]),
  );

  useEffect(() => {
    if (!editingEvent?.isEditing || !editingEvent?.id) return;
    let cancelled = false;

    const applyRow = (row, speakersIn, sponsorsIn, fallback, fromApi) => {
      if (!row || cancelled) return;
      const fb = fallback || {};
      const startFromFields =
        fb.startDate &&
        String(fb.startTime || "").length &&
        fb.startAmPm
          ? {
              date: fb.startDate,
              time: fb.startTime,
              ampm: fb.startAmPm,
            }
          : null;
      const endFromFields =
        fb.endDate &&
        String(fb.endTime || "").length &&
        fb.endAmPm
          ? {
              date: fb.endDate,
              time: fb.endTime,
              ampm: fb.endAmPm,
            }
          : null;
      const startParts =
        startFromFields ||
        eventDateTimeToFormParts(
          row.start_time || row.date || fb.date || "",
        );
      const endParts =
        endFromFields ||
        eventDateTimeToFormParts(
          row.end_time || row.endDateISO || fb.endDateISO || "",
        );
      const cid = row.category_id ?? fb.category_id;
      const cat =
        fb.cat ||
        (typeof row.category === "object" && row.category?.name) ||
        row.category ||
        CATEGORY_LABEL_BY_ID[cid] ||
        CATEGORY_LABEL_BY_ID[String(cid)] ||
        "";
      const priceRaw =
        row.price_type === "free" ? "" : row.price != null ? String(row.price) : "";
      const priceClean = priceRaw.replace(/[^\d.]/g, "");

      setLocType(fb.locType || locTypeFromApiType(row.type || fb.type));
      setForm({
        title: row.title || fb.title || "",
        description: String(row.description ?? fb.description ?? ""),
        category: cat,
        capacity: capacityToFormStr(row.capacity ?? fb.capacity),
        startDate: startParts.date,
        startTime: startParts.time,
        startAmPm: startParts.ampm,
        endDate: endParts.date,
        endTime: endParts.time,
        endAmPm: endParts.ampm,
        venue: row.venue_name || row.location || fb.loc || "",
        address: row.address || fb.address || "",
      });

      const img =
        row.image_url || row.image || row.photo || fb.photo || null;
      if (img) setImagePreview(img);

      const extrasKey = `eh_extras_${row.id || fb.id}`;
      const extras = JSON.parse(safeLS.getItem(extrasKey) || "{}");
      
      const spBase = Array.isArray(speakersIn) && speakersIn.length ? speakersIn : 
                     (Array.isArray(fb.speakers) && fb.speakers.length ? fb.speakers : 
                     (extras.speakers || []));
      if (spBase.length) {
        setSpeakers(
          spBase.map((s, i) => {
            let photo = s.photo || s.image_url || s.image || "";
            // Restore photo from local extras if missing in API response
            if (!photo && s.email && extras.speakers) {
              const match = extras.speakers.find(ls => ls.email && ls.email.toLowerCase() === s.email.toLowerCase());
              if (match?.photo) photo = match.photo;
            }
            return {
              id: s.id ?? Date.now() + i,
              email: s.email || "",
              name: s.name || s.full_name || "",
              title: s.title || s.job_title || "",
              company: s.company || s.company_name || "",
              bio: s.bio || s.summary || "",
              photo: photo,
              country: s.country || "",
              city: s.city || "",
            };
          }),
        );
      } else {
        setSpeakers([{ id: 1, email: "", name: "", title: "", company: "", bio: "", photo: "", country: "", city: "" }]);
      }

      const soBase = Array.isArray(sponsorsIn) && sponsorsIn.length ? sponsorsIn :
                     (Array.isArray(fb.sponsors) && fb.sponsors.length ? fb.sponsors :
                     (extras.sponsors || []));
      if (soBase.length) {
        setSponsors(
          soBase.map((s, i) => {
            let logo = s.logo || s.image_url || s.image || "";
            // Restore logo from local extras if missing in API response
            if (!logo && s.email && extras.sponsors) {
              const match = extras.sponsors.find(ls => ls.email && ls.email.toLowerCase() === s.email.toLowerCase());
              if (match?.logo) logo = match.logo;
            }
            return {
              id: s.id ?? Date.now() + i,
              email: s.email || "",
              name: s.name || s.company_name || "",
              tier: s.tier || "Gold",
              website: s.website || s.url || "",
              logo: logo,
            };
          }),
        );
      } else {
        setSponsors([{ id: 1, email: "", name: "", tier: "Gold", website: "", logo: "" }]);
      }

      setTickets(
        fromApi || !fb.tickets?.length
          ? [
              {
                id: 1,
                name: "General",
                price: priceClean,
                quantity: "",
              },
            ]
          : fb.tickets,
      );
    };

    apiGetEvent(editingEvent.id)
      .then((res) => {
        const root = res?.data ?? res?.message ?? res;
        const row = root?.event ?? root;
        if (!row || cancelled) return;
        applyRow(row, root?.speakers, root?.sponsors, editingEvent, true);
      })
      .catch(() => {
        if (cancelled) return;
        applyRow(
          editingEvent,
          editingEvent.speakers,
          editingEvent.sponsors,
          editingEvent,
          false,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [editingEvent]);

  const toSqlDateTime = (dateStr, timeStr, ampm) => {
    const [day, month, year] = String(dateStr || "").split("/");
    const [hourRaw, minuteRaw] = String(timeStr || "").split(":");
    let hour = parseInt(hourRaw, 10);
    const minute = String(minuteRaw || "00").padStart(2, "0");
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${year}-${month}-${day} ${String(hour).padStart(2, "0")}:${minute}:00`;
  };

const handleSubmit = async () => {
  setSubmitted(true);
  if (!hasErrors) {
    let existing = JSON.parse(safeLS.getItem("eh_events") || "[]");
    
    const [day, month, year] = form.startDate.split("/");
    const [endDay, endMonth, endYear] = form.endDate.split("/");

    let hour = parseInt(form.startTime.split(":")[0], 10);
    const minute = form.startTime.split(":")[1];
    if (form.startAmPm === "PM" && hour !== 12) hour += 12;
    if (form.startAmPm === "AM" && hour === 12) hour = 0;

    let endHour = parseInt(form.endTime.split(":")[0], 10);
    const endMinute = form.endTime.split(":")[1];
    if (form.endAmPm === "PM" && endHour !== 12) endHour += 12;
    if (form.endAmPm === "AM" && endHour === 12) endHour = 0;

    const startIso = `${year}-${month}-${day}T${String(hour).padStart(2,"0")}:${minute}:00`;
    const endIso = `${endYear}-${endMonth}-${endDay}T${String(endHour).padStart(2,"0")}:${endMinute}:00`;
    const firstTicketPrice = String(tickets[0]?.price || "").trim();
    const isPaid = firstTicketPrice !== "" && Number(firstTicketPrice) > 0;

    const resolvedServerId = editingEvent?.id || null;
    const eventId = String(resolvedServerId ?? Date.now());

    const slimEventData = {
      id:          resolvedServerId ?? editingEvent?.id ?? Date.now(),
      title:       form.title.trim(),
      loc:         locType === "in-person" ? form.venue.trim() : "Online",
      date:        startIso,
      startTime:   form.startTime,
      startDate:   form.startDate,
      startAmPm:   form.startAmPm,
      endDate:     form.endDate,
      endAmPm:     form.endAmPm,
      endDateISO:  endIso,
      endTime:     form.endTime,
      price:       isPaid ? `$${firstTicketPrice}` : "Free",
      cat:         form.category,
      photo:       imagePreview || `https://picsum.photos/seed/${Date.now()}/400/300`,
      description: form.description.trim().slice(0, 500),
      address:     locType === "in-person" ? form.address.trim() : "Online",
      capacity:    String(form.capacity ?? "").trim(),
      locType,
      organizer:   userName,
      organizerEmail: userEmail || "",
      organizerId: safeLS.getItem("eh_userId") || "",
      tickets:     tickets.filter(t => t.name.trim()),
      speakers:    speakers.filter(s => s.name.trim()).map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        title: s.title || s.session_title,
        company: s.company,
        bio: (s.bio || s.summary || "").slice(0, 200),
        country: s.country,
        city: s.city
      })),
      sponsors:    sponsors.filter(s => s.name.trim()).map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        tier: s.tier || s.level,
        website: s.website
      })),
      createdAt:   editingEvent?.createdAt || Date.now(),
    };

    const fullEventData = {
      ...slimEventData,
      speakers: speakers.filter(s => s.name.trim()).map(s => ({
        ...slimEventData.speakers.find(sp => sp.id === s.id),
        photo: s.photo
      })),
      sponsors: sponsors.filter(s => s.name.trim()).map(s => ({
        ...slimEventData.sponsors.find(sp => sp.id === s.id),
        logo: s.logo
      }))
    };

    try {
      existing = existing.slice(0, 20);
      
      if (editingEvent) {
        const idx = existing.findIndex(e => String(e.id) === eventId);
        if (idx !== -1) existing[idx] = slimEventData;
        else existing.unshift(slimEventData);
      } else {
        existing.unshift(slimEventData);
      }
      
      safeLS.setItem("eh_events", JSON.stringify(existing));
      console.log('✅ Saved to eh_events:', { count: existing.length, id: eventId });
    } catch (e) {
      console.warn('⚠️ eh_events quota exceeded, cleaning more...');
      const minimalEvents = existing.slice(0, 10).map(({ photo, description, speakers, sponsors, ...rest }) => ({
        ...rest,
        photo: photo?.startsWith("data:") ? `https://picsum.photos/seed/ev${rest.id}/400/300` : photo,
        description: (description || "").slice(0, 100),
        speakers: [], sponsors: []
      }));
      safeLS.setItem("eh_events", JSON.stringify(minimalEvents));
    }

    try {
      safeLS.setItem("eh_active_event_data", JSON.stringify(slimEventData));
    } catch (e) {
      // Fallback: save slim version
      safeLS.setItem("eh_active_event_data", JSON.stringify(slimEventData));
    }

    const extrasKey = `eh_extras_${eventId}`;
    const extrasData = {
      speakers: speakers.filter(s => s.name.trim()),
      sponsors: sponsors.filter(s => s.name.trim()),
      fullEventData
    };
    
    try {
      safeLS.setItem(extrasKey, JSON.stringify(extrasData));
      console.log('Saved extras:', {
        id: eventId,
        speakersCount: extrasData.speakers.length,
        sponsorsCount: extrasData.sponsors.length
      });
    } catch (e) {
      // Strip images from extras as last resort
      const slimExtras = {
        ...extrasData,
        speakers: extrasData.speakers.map(s => ({ ...s, photo: "" })),
        sponsors: extrasData.sponsors.map(s => ({ ...s, logo: "" }))
      };
      safeLS.setItem(extrasKey, JSON.stringify(slimExtras));
    }

    const eventPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      capacity: String(form.capacity).trim(),
      type: locType === "online" ? "online" : "in-person",
      start_time: toSqlDateTime(form.startDate, form.startTime, form.startAmPm),
      end_time: toSqlDateTime(form.endDate, form.endTime, form.endAmPm),
      venue_name: locType === "in-person" ? form.venue.trim() : "Online",
      location: locType === "in-person" ? form.venue.trim() : "Online",
      address: locType === "in-person" ? form.address.trim() : "Online",
      price_type: isPaid ? "paid" : "free",
      price: isPaid ? String(firstTicketPrice) : "0",
    };
    
    if (locType === "in-person") {
      eventPayload.latitude = 30.0444;
      eventPayload.longitude = 31.2357;
    }
    eventPayload.category_id = 1;

    let saveRes;
    let apiFailed = false;
    try {
      let submitImageFile = imageFile;
      if (submitImageFile) {
        submitImageFile = await compressImageFile(submitImageFile);
        if (submitImageFile.size > MAX_IMAGE_BYTES) {
          alert('Image is too large. Please choose a smaller image under 2MB.');
          return;
        }
      }

      if (editingEvent?.id) {
        if (submitImageFile) {
          const fd = new FormData();
          Object.entries(eventPayload).forEach(([k, v]) => fd.append(k, v));
          fd.append("image", submitImageFile);
          fd.append("photo", submitImageFile);
          saveRes = await apiUpdateEvent(editingEvent.id, fd);
        } else {
          saveRes = await apiUpdateEvent(editingEvent.id, eventPayload);
        }
      } else {
        const body = new FormData();
        Object.entries(eventPayload).forEach(([k, v]) => body.append(k, v));
        if (submitImageFile) {
          body.append("image", submitImageFile);
          body.append("photo", submitImageFile);
        }
        saveRes = await apiCreateEvent(body);
      }
    } catch (e) {
      console.error("API Error:", e);
      apiFailed = true;
    }

    if (!apiFailed && userEmail) {
      const serverId = extractEventIdFromSaveResponse(saveRes) ?? editingEvent?.id ?? null;
      if (serverId) addOrganizerOwnedEventId(userEmail, serverId);
    }

    window.dispatchEvent(new Event("eventsUpdated"));
    
    if (setSelectedEvent) setSelectedEvent(null);
    setPage("organizer-dashboard");
  }
};

  if (userRole !== "Organizer") return null;

  return (
    <div style={S.page}>
      <style>{`
        .create-btn:hover { background: #ea6c00 !important; transform: scale(1.02); box-shadow: 0 8px 24px rgba(249,115,22,0.4) !important; }
        .upload-area:hover { border-color: ${C.orange} !important; background: #fff8f3 !important; }
        .add-row-btn:hover { background: #fff0e6 !important; border-color: ${C.orange} !important; color: ${C.orange} !important; }
        .remove-row-btn:hover { background: #fef2f2 !important; border-color: #ef4444 !important; color: #ef4444 !important; }
        
        @media (max-width: 992px) {
          .sidebar-container, [class*="sidebar-container"], aside {
            display: none !important;
          }
          .sidebar-container + div {
             margin-left: 0 !important;
             padding: 20px 16px !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
          .date-time-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .date-time-grid > div { width: 100% !important; }
          .form-item-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .ticket-grid { grid-template-columns: 1fr 1fr !important; }
          .ticket-grid > div:first-child { grid-column: span 2; }
        }
      `}</style>

      <SidebarLayout active="create-event" setPage={setPage} userName={userName} userEmail={userEmail} userRole={userRole} logout={logout}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: C.orange, borderRadius: 4 }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, margin: 0 }}>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h1>
          </div>
          <p style={{ color: C.gray, fontSize: 14, margin: 0, paddingLeft: 12 }}>
            {editingEvent ? "Update your event details below" : "Fill out the details below to publish your event"}
          </p>
        </div>

        {/* ── Event Details ── */}
        <SECTION icon={<FaInfoCircle color={C.orange} size={16}/>} title="Event Details" subtitle="Basic information about your event">
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}><FaTag color={C.orange} size={11}/> Event Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Tech Summit 2026" style={inputStyle(err("title"))} />
            {err("title") && <FieldError text={form.title.trim().length < 3 ? "Title must be at least 3 characters" : "Event title is required"} />}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}><FaAlignLeft color={C.orange} size={11}/> Description *</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Describe your event..." rows={4}
              style={{ ...inputStyle(err("description")), resize: "vertical" }} />
            {err("description") && <FieldError text={form.description.trim().length < 10 ? "Description must be at least 10 characters" : "Description is required"} />}
          </div>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}><FaTag color={C.orange} size={11}/> Category *</label>
              <select value={form.category} onChange={set("category")} style={inputStyle(err("category"))}>
                <option value="">Select category</option>
                {["Arts","Education","Sport","Fashion","Business","Gaming"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {err("category") && <FieldError text="Please select a category" />}
            </div>
            <div>
              <label style={labelStyle}><FaUsers color={C.orange} size={11}/> Total Capacity *</label>
              <input value={form.capacity} onChange={set("capacity")} placeholder="e.g. 500" style={inputStyle(err("capacity"))} />
              {err("capacity") && <FieldError text={isNaN(Number(form.capacity)) ? "Capacity must be a number" : Number(form.capacity) <= 0 ? "Capacity must be greater than 0" : "Capacity is required"} />}
            </div>
          </div>
        </SECTION>

        <style>{`
          @media (max-width: 600px) {
            .responsive-detail-grid, div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* ── Date & Time ── */}
        <SECTION icon={<FaCalendarAlt color={C.orange} size={16}/>} title="Date & Time" subtitle="When will the event take place?">
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {["in-person","online"].map(type => (
              <div key={type} onClick={() => setLocType(type)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${locType===type?C.orange:C.border}`, background:locType===type?"#fff7ed":C.white, fontSize:13, fontWeight:600, color:locType===type?C.orange:C.gray, transition:"all .15s" }}>
                <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${locType===type?C.orange:C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {locType===type && <div style={{ width:8, height:8, borderRadius:"50%", background:C.orange }}/>}
                </div>
                {type==="in-person"?"In-person":"Online"}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>Start</div>
            <div className="date-time-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 120px", gap:12 }}>
              <div><input type="text" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: formatDate(e.target.value) }))} placeholder="dd/mm/yyyy" style={inputStyle(err("startDate"))}/>{err("startDate")&&<FieldError text="Required"/>}</div>
              <div><input value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: formatTime(e.target.value) }))} placeholder="00:00" style={inputStyle(err("startTime"))}/></div>
              <div><select value={form.startAmPm} onChange={set("startAmPm")} style={inputStyle(err("startAmPm"))}><option value="">AM/PM</option><option>AM</option><option>PM</option></select>{err("startAmPm")&&<FieldError text="Required"/>}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>End</div>
            <div className="date-time-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 120px", gap:12 }}>
              <div><input type="text" value={form.endDate} onChange={(e) =>setForm(f => ({ ...f, endDate: formatDate(e.target.value) }))} placeholder="dd/mm/yyyy" style={inputStyle(err("endDate"))}/>{err("endDate")&&<FieldError text={!isEndDateValid() ? "End date must be on or after start date" : "Required"}/>}</div>
              <div><input value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: formatTime(e.target.value) }))} placeholder="00:00" style={inputStyle(err("endTime"))}/>{err("endTime")&&<FieldError text="Required"/>}</div>
              <div><select value={form.endAmPm} onChange={set("endAmPm")} style={inputStyle(err("endAmPm"))}><option value="">AM/PM</option><option>AM</option><option>PM</option></select>{err("endAmPm")&&<FieldError text="Required"/>}</div>
            </div>
          </div>
        </SECTION>

        {/* ── Location ── */}
        {locType === "in-person" && (
          <SECTION icon={<FaMapMarkerAlt color={C.orange} size={16}/>} title="Location" subtitle="Where will the event be held?">
            <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}><FaMapMarkerAlt color={C.orange} size={11}/> Event Name *</label>
            <input value={form.venue} onChange={set("venue")} placeholder="e.g. Cairo International Conference Center" style={inputStyle(err("venue"))}/>
            {err("venue") && <FieldError text="Venue name is required" />}
          </div>
          <div>
            <label style={labelStyle}><FaMapMarkerAlt color={C.orange} size={11}/> Full Address *</label>
            <input value={form.address} onChange={set("address")} placeholder="Street, City, Country" style={inputStyle(err("address"))}/>
            {err("address") && <FieldError text="Address is required" />}
          </div>
        </SECTION>
      )}

        {/* ── Tickets & Pricing ── */}
        <SECTION icon={<FaTicketAlt color={C.orange} size={16}/>} title="Tickets & Pricing" subtitle="Define ticket types and prices (leave price empty for free tickets)">
          {tickets.map((t, i) => (
            <div key={t.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px 40px", gap:12, marginBottom:12, alignItems:"end" }}>
              <div>
                {i===0 && <label style={labelStyle}><FaTicketAlt color={C.orange} size={11}/> Ticket Name</label>}
                <input value={t.name} onChange={e=>setTicket(t.id,"name",e.target.value)} placeholder="e.g. General Admission" style={inputStyle(false)}/>
              </div>
              <div>
                {i===0 && <label style={labelStyle}><FaDollarSign color={C.orange} size={11}/> Price ($)</label>}
                <input value={t.price} onChange={e=>setTicket(t.id,"price",e.target.value)} placeholder="0 = Free" style={inputStyle(false)}/>
              </div>
              <div style={{ paddingBottom: 1 }}>
                {tickets.length > 1 && (
                  <button className="remove-row-btn" onClick={()=>removeTicket(t.id)}
                    style={{ width:36, height:38, borderRadius:8, background:"#fff", border:`1.5px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                    <FaTrash size={12} color="#94a3b8"/>
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="add-row-btn" onClick={addTicket}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#f8fafc", border:`1.5px dashed ${C.border}`, cursor:"pointer", fontSize:13, fontWeight:600, color:C.gray, fontFamily:"Poppins, sans-serif", transition:"all 0.15s", marginTop:4 }}>
            <FaPlus size={11}/> Add Ticket Type
          </button>
        </SECTION>

        {/* ── Speakers ── */}
        <SECTION icon={<FaMicrophone color={C.orange} size={16}/>} title="Speakers" subtitle="Add speakers or presenters for your event (optional)">
          {speakers.map((s, i) => (
            <div key={s.id} style={{ background:"#fafbff", borderRadius:12, padding:"16px 20px", marginBottom:12, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>Speaker {i+1}</span>
                {speakers.length > 1 && (
                  <button className="remove-row-btn" onClick={()=>removeSpeaker(s.id)}
                    style={{ padding:"4px 10px", borderRadius:6, background:"#fff", border:`1px solid ${C.border}`, cursor:"pointer", fontSize:12, color:"#94a3b8", fontFamily:"Poppins, sans-serif", transition:"all 0.15s" }}>
                    Remove
                  </button>
                )}
              </div>
              <div className="form-item-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}><FaEnvelope color={C.orange} size={11}/> Email (Auto-fills from profile)</label>
                  <input value={s.email||""} onChange={e=>setSpeaker(s.id,"email",e.target.value)} placeholder="speaker@example.com" style={inputStyle(false)}/>
                </div>
                <div>
                  <label style={labelStyle}><FaUsers color={C.orange} size={11}/> Full Name</label>
                  <input value={s.name} onChange={e=>setSpeaker(s.id,"name",e.target.value)} placeholder="e.g. Dr. Sarah Ahmed" style={inputStyle(false)}/>
                </div>
              </div>
              <div className="form-item-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}><FaBriefcase color={C.orange} size={11}/> Title / Role</label>
                  <input value={s.title} onChange={e=>setSpeaker(s.id,"title",e.target.value)} placeholder="e.g. AI Researcher at Google" style={inputStyle(false)}/>
                </div>
                <div>
                  <label style={labelStyle}><FaBuilding color={C.orange} size={11}/> Company</label>
                  <input value={s.company||""} onChange={e=>setSpeaker(s.id,"company",e.target.value)} placeholder="e.g. Google" style={inputStyle(false)}/>
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={labelStyle}><FaAlignLeft color={C.orange} size={11}/> Short Bio</label>
                <textarea value={s.bio} onChange={e=>setSpeaker(s.id,"bio",e.target.value)} placeholder="Brief introduction..." rows={2}
                  style={{ ...inputStyle(false), resize:"vertical" }}/>
              </div>

              {/* Speaker Photo Upload */}
              <div>
                <label style={labelStyle}><FaImage color={C.orange} size={11}/> Photo</label>
                {s.photo ? (
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <img src={s.photo} alt="Speaker" style={{ width:60, height:60, borderRadius:30, objectFit:"cover", border:`2px solid ${C.border}` }}/>
                    <button onClick={()=>removeSpeakerPhoto(s.id)} type="button"
                      style={{ padding:"6px 12px", borderRadius:6, background:"#fff", border:`1px solid ${C.border}`, cursor:"pointer", fontSize:12, color:"#94a3b8", fontFamily:"Poppins, sans-serif" }}>
                      <FaTrash size={10}/> Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <label style={{ flex:1, padding:"10px 14px", borderRadius:8, border:`1.5px dashed ${C.border}`, background:"#fafafa", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.gray }}>
                      <FaUpload size={12}/> Upload photo
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleSpeakerPhoto(s.id, e.target.files[0])}/>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="add-row-btn" onClick={addSpeaker}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#f8fafc", border:`1.5px dashed ${C.border}`, cursor:"pointer", fontSize:13, fontWeight:600, color:C.gray, fontFamily:"Poppins, sans-serif", transition:"all 0.15s" }}>
            <FaPlus size={11}/> Add Speaker
          </button>
        </SECTION>

        {/* ── Sponsors ── */}
        <SECTION icon={<FaHandshake color={C.orange} size={16}/>} title="Sponsors" subtitle="Add sponsors supporting your event (optional)">
          {sponsors.map((s, i) => (
            <div key={s.id} style={{ background:"#fafbff", borderRadius:12, padding:"16px 20px", marginBottom:12, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>Sponsor {i+1}</span>
                {sponsors.length > 1 && (
                  <button className="remove-row-btn" onClick={()=>removeSponsor(s.id)}
                    style={{ padding:"4px 10px", borderRadius:6, background:"#fff", border:`1px solid ${C.border}`, cursor:"pointer", fontSize:12, color:"#94a3b8", fontFamily:"Poppins, sans-serif", transition:"all 0.15s" }}>
                    Remove
                  </button>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10 }}>
                <div>
                  <label style={labelStyle}><FaEnvelope color={C.orange} size={11}/> Email (Auto-fills from profile)</label>
                  <input value={s.email||""} onChange={e=>setSponsor(s.id,"email",e.target.value)} placeholder="sponsor@company.com" style={inputStyle(false)}/>
                </div>
                <div>
                  <label style={labelStyle}><FaHandshake color={C.orange} size={11}/> Sponsor Name</label>
                  <input value={s.name} onChange={e=>setSponsor(s.id,"name",e.target.value)} placeholder="e.g. TechCorp" style={inputStyle(false)}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 1fr", gap:12, marginBottom:10 }}>
                <div>
                  <label style={labelStyle}><FaTag color={C.orange} size={11}/> Tier</label>
                  <select value={s.tier} onChange={e=>setSponsor(s.id,"tier",e.target.value)} style={inputStyle(false)}>
                    {["Platinum","Gold","Silver","Bronze"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaGlobe color={C.orange} size={11}/> Website</label>
                  <input value={s.website} onChange={e=>setSponsor(s.id,"website",e.target.value)} placeholder="https://..." style={inputStyle(false)}/>
                </div>
              </div>
              {/* Sponsor Logo Upload */}
              <div>
                <label style={labelStyle}><FaImage color={C.orange} size={11}/> Logo</label>
                {s.logo ? (
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <img src={s.logo} alt="Sponsor Logo" style={{ width:60, height:60, borderRadius:8, objectFit:"contain", border:`2px solid ${C.border}`, background:"#fff" }}/>
                    <button onClick={()=>removeSponsorLogo(s.id)} type="button"
                      style={{ padding:"6px 12px", borderRadius:6, background:"#fff", border:`1px solid ${C.border}`, cursor:"pointer", fontSize:12, color:"#94a3b8", fontFamily:"Poppins, sans-serif" }}>
                      <FaTrash size={10}/> Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <label style={{ flex:1, maxWidth:200, padding:"10px 14px", borderRadius:8, border:`1.5px dashed ${C.border}`, background:"#fafafa", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.gray }}>
                      <FaUpload size={12}/> Upload logo
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleSponsorLogo(s.id, e.target.files[0])}/>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="add-row-btn" onClick={addSponsor}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#f8fafc", border:`1.5px dashed ${C.border}`, cursor:"pointer", fontSize:13, fontWeight:600, color:C.gray, fontFamily:"Poppins, sans-serif", transition:"all 0.15s", marginTop:4 }}>
            <FaPlus size={11}/> Add Sponsor
          </button>
        </SECTION>

        {/* ── Event Image ── */}
        <SECTION icon={<FaImage color={C.orange} size={16}/>} title="Event Cover Image" subtitle="Upload a cover image — recommended 1200×630px">
          <div className="upload-area"
            onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);readFile(e.dataTransfer.files[0]);}}
            style={{ border:`2px dashed ${imagePreview?"transparent":dragOver?C.orange:"#d1d5db"}`, borderRadius:14, textAlign:"center", background:dragOver&&!imagePreview?"#fff8f3":"#fafafa", cursor:imagePreview?"default":"pointer", overflow:"hidden", padding:imagePreview?0:"44px 24px", position: 'relative' }}>
            {imagePreview ? (
              <div style={{ position:"relative" }}>
                <img src={imagePreview} alt="Preview" style={{ width:"100%", height:260, objectFit:"cover", display:"block", borderRadius:12, minWidth: "100%" }}/>
                <button onClick={removeImage} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Poppins, sans-serif" }}
                  onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,0.85)"} onMouseOut={e=>e.currentTarget.style.background="rgba(0,0,0,0.6)"}>
                  ✕ Remove
                </button>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", padding:"8px 14px", borderRadius:"0 0 12px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <FaCheckCircle color="#10b981" size={13}/>
                  <span style={{ fontSize:12, color:"#fff", fontWeight:500 }}>{fileName || "Image uploaded"}</span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ width:56, height:56, borderRadius:16, background:"#fff0e6", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <FaUpload color={C.orange} size={22}/>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:6 }}>Drag & drop your image here</div>
                <div style={{ fontSize:12, color:C.gray, marginBottom:20 }}>Supports JPG, PNG, GIF · Max 10MB</div>
                <label>
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>readFile(e.target.files[0])}/>
                  <span style={{ background:C.orange, color:C.white, borderRadius:8, padding:"9px 24px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Poppins, sans-serif", display:"inline-block" }}>
                    Choose File
                  </span>
                </label>
              </>
            )}
          </div>
          {err("image") && <div style={{ marginTop:12 }}><FieldError text="Please upload an event cover image" /></div>}
        </SECTION>

        {/* Validation summary */}
        {submitted && hasErrors && (
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"14px 20px", marginBottom:20 }}>
            <FaExclamationCircle color="#ef4444" size={18}/>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#ef4444" }}>Please fill in all required fields</div>
              <div style={{ fontSize:12, color:"#b91c1c", marginTop:2 }}>Scroll up to review the highlighted fields.</div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"flex-end", paddingBottom:40 }}>
          <button className="create-btn" onClick={handleSubmit}
            style={{ background:submitted&&hasErrors?"#d1d5db":C.orange, color:C.white, border:"none", borderRadius:12, padding:"14px 36px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"Poppins, sans-serif", display:"flex", alignItems:"center", gap:8, boxShadow:submitted&&hasErrors?"none":"0 4px 16px rgba(249,115,22,0.35)", transition:"background .2s" }}>
            {editingEvent ? <><FaEdit size={14}/> Save Changes</> : <>Publish Event <FaArrowRight size={14}/></>}
          </button>
        </div>

      </SidebarLayout>
    </div>
  );
}