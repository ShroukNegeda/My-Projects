'use client';
import '@/lip/apiFetchTrack';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogout } from '../lip/api';

const safeLS = typeof window !== 'undefined' ? localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};


const AppContext = createContext(null);

const load = (key, def) => {
  if (typeof window === 'undefined') return def;
  try {
    const v = safeLS.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch { return def; }
};
const save = (key, val) => {
  if (typeof window === 'undefined') return;
  safeLS.setItem(key, JSON.stringify(val));
};

const isNumericId = (id) => {
  if (id == null) return false;
  if (typeof id === 'number') return true;
  const s = String(id).trim();
  return /^\\d+$/.test(s);
};

const cleanupLocalEventStorage = (email) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = safeLS.getItem('eh_events');
    if (!raw) return;
    const events = JSON.parse(raw);
    if (!Array.isArray(events)) return;
    const numericEvents = events.filter((ev) => isNumericId(ev.id));
    if (numericEvents.length !== events.length) {
      safeLS.setItem('eh_events', JSON.stringify(numericEvents));
    }
    if (email) {
      const ownedKey = `eh_organizer_event_ids_v1_${String(email).trim().toLowerCase()}`;
      const owned = load(ownedKey, []);
      if (Array.isArray(owned)) {
        const cleaned = owned.filter((id) => isNumericId(id));
        if (cleaned.length !== owned.length) {
          safeLS.setItem(ownedKey, JSON.stringify(cleaned));
        }
      }
    }
  } catch (e) {
    // ignore storage cleanup failures
  }
};

export function AppProvider({ children }) {
  const [token,         setTokenRaw]         = useState(null);
  const [userName,      setUserNameRaw]      = useState(null);
  const [userEmail,     setUserEmailRaw]     = useState(null);
  const [userRole,      setUserRoleRaw]      = useState(null);
  const [favorites,     setFavoritesRaw]     = useState([]);
  const [bookedTickets, setBookedTicketsRaw] = useState([]);
  const [selectedEvent, setSelectedEventRaw] = useState(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const name  = load('eh_userName', null);
    const email = load('eh_userEmail', null);
    cleanupLocalEventStorage(email);
    const role  = (() => { const r = load('eh_userRole', null); return r === 'Attendee' ? 'User' : r; })();
    const event = (() => { try { return JSON.parse(safeLS.getItem('eh_active_event_id') || 'null'); } catch { return null; } })();
    // Always set these so pages that depend on them re-render correctly
    const tokRaw = safeLS.getItem('eh_token');
    const tok = (() => {
      if (!tokRaw) return null;
      const s = String(tokRaw).trim();
      if (!s) return null;
      // Handle accidental JSON-stringified tokens like "\"abc\""
      if (s.startsWith('"') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          if (typeof parsed === 'string') return parsed;
          if (parsed && typeof parsed === 'object')
            return parsed.token || parsed.access_token || parsed.accessToken || null;
        } catch {}
      }
      return s;
    })();
    if (tok) setTokenRaw(tok);
    setUserNameRaw(name);
    setUserEmailRaw(email);
    setUserRoleRaw(role);
    if (event) setSelectedEventRaw(event);
    // Load per-user data
    if (email) {
      setFavoritesRaw(load('eh_favorites_' + email, []));
      setBookedTicketsRaw(load('eh_tickets_' + email, []));
    }
  }, []);
  const [pendingBooking,    setPendingBooking]    = useState(null);
  const [redirectAfterSignup, setRedirectAfterSignup] = useState(null);

  // Per-user data — sync when userEmail changes after initial hydration
  useEffect(() => {
    if (userEmail) {
      setFavoritesRaw(load('eh_favorites_' + userEmail, []));
      setBookedTicketsRaw(load('eh_tickets_' + userEmail, []));
    }
  }, [userEmail]);

  const setToken = v => { setTokenRaw(v); if (v) safeLS.setItem('eh_token', v); else safeLS.removeItem('eh_token'); };
  const setUserName  = v => { setUserNameRaw(v);  save('eh_userName',  v); };
  const setUserEmail = v => { setUserEmailRaw(v); save('eh_userEmail', v); };
  const setUserRole  = v => {
    const r = v === 'Attendee' ? 'User' : v;
    setUserRoleRaw(r); save('eh_userRole', r);
  };
  
  // Save full profile data for speaker/sponsor auto-fill
  const setUserProfile = (profileData) => {
    if (!profileData || !profileData.email) return;
    const email = profileData.email.toLowerCase().trim();
    const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
    accounts[email] = {
      ...accounts[email],
      name: profileData.name || profileData.full_name || "",
      email: email,
      phone: profileData.phone || "",
      company: profileData.company || profileData.company_name || "",
      jobTitle: profileData.job_title || profileData.jobTitle || "",
      bio: profileData.bio || profileData.summary || "",
      website: profileData.website || "",
      linkedin: profileData.linkedin || "",
      industry: profileData.industry || profileData.specialty || "",
      role: profileData.role || ""
    };
    safeLS.setItem("eh_accounts", JSON.stringify(accounts));
    // Also save photo separately if provided
    if (profileData.photo || profileData.logo || profileData.image) {
      safeLS.setItem(`eh_photo_${email}`, profileData.photo || profileData.logo || profileData.image);
    }
  };
  const setFavorites = v => {
    const val = typeof v === 'function' ? v(favorites) : v;
    setFavoritesRaw(val);
    if (userEmail) save(`eh_favorites_${userEmail}`, val);
  };
  const setBookedTickets = v => {
    const val = typeof v === 'function' ? v(bookedTickets) : v;
    setBookedTicketsRaw(val);
    if (userEmail) save(`eh_tickets_${userEmail}`, val);
  };
  const setSelectedEvent = v => {
    setSelectedEventRaw(v);
    if (v) {
      try {
        // Strip large base64 photo before saving to avoid quota errors
        const toSave = { ...v };
        if (toSave.photo && toSave.photo.startsWith('data:')) delete toSave.photo;
        safeLS.setItem('eh_selectedEvent', JSON.stringify(toSave));
      } catch(e) {
        // If still too large, save only essential fields
        try {
          safeLS.setItem('eh_selectedEvent', JSON.stringify({ id: v.id, title: v.title, loc: v.loc, date: v.date, price: v.price, cat: v.cat }));
        } catch(e2) {
          safeLS.removeItem('eh_selectedEvent');
        }
      }
    } else {
      safeLS.removeItem('eh_selectedEvent');
    }
  };
  const logout = async () => {
    const tok = safeLS.getItem('eh_token');
    if (tok) {
      try {
        await apiLogout();
      } catch (e) {}
    }
    ['eh_userName','eh_userEmail','eh_userRole','eh_page','eh_photo','eh_photo_guest','eh_selectedEvent','eh_token','eh_userId']
      .forEach(k => safeLS.removeItem(k));
    try {
      for (let i = safeLS.length - 1; i >= 0; i--) {
        const k = safeLS.key(i);
        if (k && k.startsWith('eh_organizer_event_ids_v1_')) safeLS.removeItem(k);
      }
    } catch {}
    setUserNameRaw(null); setUserEmailRaw(null); setUserRoleRaw(null); setTokenRaw(null);
    setFavoritesRaw([]); setBookedTicketsRaw([]);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/landing';
  };

  return (
    <AppContext.Provider value={{
      token, setToken,
      userName, setUserName,
      userEmail, setUserEmail,
      userRole, setUserRole,
      setUserProfile,
      favorites, setFavorites,
      bookedTickets, setBookedTickets,
      selectedEvent, setSelectedEvent,
      pendingBooking, setPendingBooking,
      redirectAfterSignup, setRedirectAfterSignup,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
