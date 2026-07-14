const BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) ||
  'https://eventhub.huma-volve.com/api/v1';

const safeLS =
  typeof window !== 'undefined'
    ? localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Helper to save user profile data to localStorage for auto-fill
const saveUserProfile = (profileData) => {
  if (!profileData || !profileData.email) return;
  const email = profileData.email.toLowerCase().trim();
  const accounts = JSON.parse(safeLS.getItem("eh_accounts") || "{}");
  
  // Only save photo if it's base64, not a backend file path
  const photoValue = profileData.photo || profileData.logo || profileData.image;
  const isPhotoString = typeof photoValue === 'string';
  
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
    country: profileData.country || "",
    city: profileData.city || "",
    role: profileData.role || "",
    photo: isPhotoString ? photoValue : (accounts[email]?.photo || null)
  };
  safeLS.setItem("eh_accounts", JSON.stringify(accounts));
  // Also save photo/logo separately for easy lookup by email
  if (isPhotoString) safeLS.setItem(`eh_photo_${email}`, photoValue);
};

export const getToken = () =>
  typeof window !== 'undefined'
    ? (() => {
        const raw = localStorage.getItem('eh_token');
        if (!raw) return null;
        let t = String(raw).trim();
        if (!t) return null;

        // Handle accidental JSON-encoded tokens like "\"abc\"" or {"token":"abc"}.
        if (t.startsWith('"') || t.startsWith('{')) {
          try {
            const parsed = JSON.parse(t);
            if (typeof parsed === 'string') t = parsed.trim();
            else if (parsed && typeof parsed === 'object')
              t = String(
                parsed.token || parsed.access_token || parsed.accessToken || '',
              ).trim();
          } catch {}
        }

        if (!t) return null;
        return t.toLowerCase().startsWith('bearer ') ? t.slice(7).trim() : t;
      })()
    : null;

const H = (json = true) => {
  const token = getToken();
  if (typeof Headers !== 'undefined') {
    const h = new Headers();
    h.set('Accept', 'application/json');
    if (json) h.set('Content-Type', 'application/json');
    if (token) h.set('Authorization', 'Bearer ' + token);
    return h;
  }
  const h = { Accept: 'application/json' };
  if (json) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
};

const handle = async (res) => {
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    data = {};
  }
  
  console.log("API Response:", res.status, {
    success: data.success,
    message: data.message,
    errors: data.errors,
    data: data.data,
    url: res.url
  });
  
  if (!res.ok) {
    if (res.status === 422 && data.errors) {
      console.error("[API 422] Validation errors:", JSON.stringify(data.errors, null, 2));
      const errorMessages = Object.values(data.errors).flat();
      const fullMessage = errorMessages.join("\n") || data.message || `Validation Error: ${res.status}`;
      throw new Error(fullMessage);
    }
    if (res.status === 500) {
      throw new Error('Server error occurred. Please try again later or contact support if the issue persists.');
    }
    if (res.status === 401) {
      console.warn('Authentication required, clearing invalid token');
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('eh_token');
        localStorage.removeItem('eh_userId');
      }
      // Return a special error that can be handled gracefully
      throw new Error('AUTH_REQUIRED');
    }
    if (res.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    if (res.status === 404) {
      throw new Error(`404: ${res.url} - The requested resource was not found.`);
    }
    throw new Error(data?.message || data?.error || `Error ${res.status}: ${res.statusText}`);
  }

  // Many Laravel endpoints return `{ message: "..." }` on success without a `success` flag.
  // Only treat an explicit falsey success as failure (not "missing success").
  if (data.success === false) {
    const msg = data.message || data.error || 'Request failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  return data;
};

// ================= AUTH =================
export const apiLogin = (email, password) =>
  fetch(BASE + '/auth/login', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ email, password }) 
  }).then(handle).then(data => {
    // Save user profile data from login response
    if (data?.data?.user) {
      const user = data.data.user;
      const photoFromApi = user.photo || user.logo || user.image;
      // Only save to localStorage if it's base64, not a backend file path
      const isBase64 = typeof photoFromApi === 'string' && photoFromApi.startsWith('data:image');
      saveUserProfile({
        email: user.email || email,
        name: user.name || user.full_name,
        phone: user.phone,
        city: user.city,
        role: user.role,
        photo: isBase64 ? photoFromApi : null
      });
    }
    return data;
  });

export const apiRegisterAttendee = (name, email, password) =>
  fetch(BASE + '/auth/register', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ 
      name, email, password, 
      password_confirmation: password, 
      role: 'attendee' 
    }) 
  }).then(handle);

export const apiRegisterOrganizer = (f) =>
  fetch(BASE + '/auth/register', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ 
      ...f, 
      role: 'organizer', 
      password_confirmation: f.password 
    }) 
  }).then(handle);

export const apiRegisterSpeaker = (f) =>
  fetch(BASE + '/auth/register', { 
    method: 'POST', 
    headers: H(false),
    body: createFormData({
      ...f,
      role: 'speaker', 
      password_confirmation: f.password 
    }) 
  }).then(handle).then(data => {
    // Save speaker profile to localStorage for auto-fill
    // The photo might be a File object or base64 string - handle both
    let photoData = f.photo || f.image;
    // If photo is a File object, we can't store it directly
    // The profile page should fetch from API or use a default
    saveUserProfile({
      ...f,
      role: 'speaker',
      photo: typeof photoData === 'string' ? photoData : null
    });
    // Also try to save photo separately if it's a base64 string
    if (typeof photoData === 'string' && photoData.startsWith('data:')) {
      safeLS.setItem(`eh_photo_${f.email.toLowerCase().trim()}`, photoData);
    }
    return data;
  });

export const apiRegisterSponsor = (f) =>
  fetch(BASE + '/auth/register', { 
    method: 'POST', 
    headers: H(false),
    body: createFormData({
      ...f,
      role: 'sponsor', 
      password_confirmation: f.password 
    }) 
  }).then(handle).then(data => {
    // Save sponsor profile to localStorage for auto-fill
    // f.photo contains base64, f.logo contains File object
    let photoData = f.photo || f.image;
    saveUserProfile({
      ...f,
      role: 'sponsor',
      photo: typeof photoData === 'string' ? photoData : null
    });
    // Also try to save photo separately if it's a base64 string
    if (typeof photoData === 'string' && photoData.startsWith('data:')) {
      safeLS.setItem(`eh_photo_${f.email.toLowerCase().trim()}`, photoData);
      console.log('[DEBUG] Saved sponsor photo to localStorage, length:', photoData.length);
    } else {
      console.log('[DEBUG] No base64 photo to save. photo type:', typeof photoData, 'starts with data:?', photoData?.startsWith('data:'));
    }
    return data;
  });

export const apiLogout = () =>
  fetch(BASE + '/auth/logout', { method: 'POST', headers: H() })
    .then(handle)
    .catch(() => {});

// ================= ADMIN =================
export const apiGetPendingUsers = () =>
  fetch(BASE + '/admin/pending-users', { headers: H() }).then(handle);

/** Postman uses string `"1"` for approve — many Laravel APIs expect strings for enums. */
export const apiUpdateUserStatus = (userId, status) =>
  fetch(BASE + '/admin/users/' + userId + '/status', {
    method: 'POST',
    headers: H(),
    body: JSON.stringify({
      status: status === '' || status == null ? status : String(status),
    }),
  }).then(handle);

export const apiForgotPassword = (email) =>
  fetch(BASE + '/auth/forgot-password', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ email }) 
  }).then(handle);

export const apiVerifyOtp = (email, code) =>
  fetch(BASE + '/auth/verify-otp', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ 
      email: email.trim(), 
      code: code.trim() 
    }) 
  }).then(handle);

export const apiResetPassword = (email, code, password) =>
  fetch(BASE + '/auth/reset-password', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ 
      email: email.trim(),
      code: code.trim(),
      password: password.trim(),
      password_confirmation: password.trim()
    }) 
  }).then(handle);

// ================= EVENTS =================
export const apiGetEvents = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(BASE + '/events' + (q ? '?' + q : ''), { headers: H() }).then(handle);
};

export const apiGetHome = () => 
  fetch(BASE + '/web/home', { headers: H() }).then(handle);

/** Postman: categories&upcoming&nearby — authenticated app home (optional for web). */
export const apiGetAppHome = () =>
  fetch(BASE + '/app/home', { headers: H() }).then(handle);

export const apiGetEvent = (id) => 
  fetch(BASE + '/events/' + id, { headers: H() }).then(handle);

export const apiCreateEvent = (body) =>
  fetch(BASE + '/events', { 
    method: 'POST', 
    headers: H(false),
    body: body 
  }).then(handle);

export const apiUpdateEvent = (id, body) => {
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  // Laravel APIs often fail to parse multipart on raw PUT.
  // Use POST + _method=PUT when uploading files; otherwise regular JSON PUT.
  if (isFormData) {
    if (!body.has('_method')) body.append('_method', 'PUT');
    return fetch(BASE + '/events/' + id, {
      method: 'POST',
      headers: H(false),
      body,
    }).then(handle);
  }

  return fetch(BASE + '/events/' + id, {
    method: 'PUT',
    headers: H(),
    body: JSON.stringify(body || {}),
  }).then(handle);
};

export const apiDeleteEvent = (id) => {
  const url = BASE + '/events/' + encodeURIComponent(id);
  const postMethodOverride = () => {
    const fd = new FormData();
    fd.append('_method', 'DELETE');
    return fetch(url, { method: 'POST', headers: H(false), body: fd }).then(handle);
  };
  return fetch(url, { method: 'DELETE', headers: H() })
    .then(handle)
    .catch(() => postMethodOverride());
};

// ================= BOOKINGS =================
export const apiCreateBooking = (event_id, tickets_count) =>
  fetch(BASE + '/bookings', { 
    method: 'POST', 
    headers: H(), 
    body: JSON.stringify({ event_id, tickets_count }) 
  }).then(handle);

export const apiGetMyTickets = () => 
  fetch(BASE + '/my-tickets', { headers: H() }).then(handle);

export const apiCancelBooking = (id) =>
  fetch(BASE + '/bookings/' + id + '/cancel', { 
    method: 'POST', 
    headers: H() 
  }).then(handle);

// ================= FAVORITES =================
export const apiGetFavorites = () => 
  fetch(BASE + '/favorites', { headers: H() }).then(handle).catch(err => {
    // Fallback to localStorage if API returns 404
    if (err.message && err.message.includes('404')) {
      console.warn('Favorites API not available, using localStorage fallback');
      const key = 'eh_favorites';
      const favorites = JSON.parse(localStorage.getItem(key) || '[]');
      return { success: true, data: favorites };
    }
    throw err;
  });

export const apiToggleFavorite = (eventId) =>
  fetch(BASE + '/favorites/toggle/' + eventId, { 
    method: 'POST', 
    headers: H() 
  }).then(handle).catch(err => {
    // Fallback to localStorage if API returns 404
    if (err.message && err.message.includes('404')) {
      console.warn('Favorites API not available, using localStorage fallback');
      const key = 'eh_favorites';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = current.findIndex(f => String(f.id) === String(eventId));
      let newFavorites;
      if (idx !== -1) {
        newFavorites = current.filter(f => String(f.id) !== String(eventId));
      } else {
        newFavorites = [...current, { id: eventId, created_at: new Date().toISOString() }];
      }
      localStorage.setItem(key, JSON.stringify(newFavorites));
      return { success: true, message: idx !== -1 ? 'Removed from favorites' : 'Added to favorites', data: { id: eventId, is_favorite: idx === -1 } };
    }
    throw err;
  });

/** Postman: POST /favorites/{id} — add favorite (alternative to toggle). */
export const apiAddFavorite = (eventId) =>
  fetch(BASE + '/favorites/' + eventId, { method: 'POST', headers: H() }).then(handle);

export const apiGetFavoritesCount = () =>
  fetch(BASE + '/favorites-count', { headers: H() }).then(handle);

// ================= PROFILE =================
export const apiUpdateProfile = (formData) =>
  fetch(BASE + '/profile/update', { 
    method: 'POST', 
    headers: H(false),
    body: formData
  }).then(handle).then(data => {
    // Update local cache after successful profile update
    const updatedUser = data?.data?.user || data?.user || data?.data;
    if (updatedUser && updatedUser.email) {
      saveUserProfile(updatedUser);
    }
    return data;
  });

// ================= SPEAKER =================
/** Postman body: event_id, session_title, summary, duration, session_format, speaker_photo */
export const apiSpeakerApply = (data) => {
  // Handle FormData (for photo uploads) or regular object
  const isFormData = data instanceof FormData;
  
  return fetch(BASE + '/speaker/apply', {
    method: 'POST',
    headers: H(!isFormData), // Don't set Content-Type for FormData
    body: isFormData ? data : JSON.stringify({
      event_id: data.event_id,
      session_title: data.session_title,
      summary: data.summary,
      duration: data.duration,
      session_format: data.session_format,
      speaker_photo: data.speaker_photo,
    }),
  }).then(handle);
};

// ================= SPONSOR =================
export const apiGetSponsorPackages = () => 
  fetch(BASE + '/sponsor/packages', { headers: H() }).then(handle);

export const apiSelectSponsorPackage = (package_id, event_id) =>
  fetch(BASE + '/sponsor/select', {
    method: 'POST',
    headers: H(),
    body: JSON.stringify({ package_id, event_id })
  }).then(handle);



// ================= NOTIFICATIONS =================
export const apiGetNotifications = () => 
  fetch(BASE + '/notifications', { headers: H() }).then(handle);

export const apiMarkNotificationRead = (id) =>
  fetch(BASE + `/notifications/${id}/read`, { 
    method: 'POST', 
    headers: H() 
  }).then(handle);

/** Matches `fetch(firstArg)` URLs that belong to this app’s backend API (for global loading UI). */
export function matchesTrackedBackendFetch(input) {
  if (typeof input === 'string') return urlMatchesTrackedApi(input);
  if (typeof Request !== 'undefined' && input instanceof Request)
    return urlMatchesTrackedApi(input.url);
  return false;
}

function urlMatchesTrackedApi(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const trimmedBase = BASE.replace(/\/$/, '');
  if (raw.startsWith(trimmedBase)) return true;
  if (raw.includes('eventhub.huma-volve.com') && raw.includes('/api'))
    return true;
  if (!/^https?:/i.test(raw) && raw.includes('/api/v1')) return true;
  return false;
}

// ================= UTILITY =================
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

/** Backend list/detail responses omit organizer — we persist IDs from create/update for “My events”. */
export const organizerOwnedEventIdsKey = (email) =>
  'eh_organizer_event_ids_v1_' + String(email || '').trim().toLowerCase();

export function loadOrganizerOwnedEventIds(email) {
  if (!email || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(organizerOwnedEventIdsKey(email));
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

export function addOrganizerOwnedEventId(email, id) {
  if (!email || id == null || id === '' || typeof window === 'undefined') return;
  const cur = new Set(loadOrganizerOwnedEventIds(email));
  cur.add(String(id));
  localStorage.setItem(
    organizerOwnedEventIdsKey(email),
    JSON.stringify([...cur]),
  );
}

export function removeOrganizerOwnedEventId(email, id) {
  if (!email || id == null || typeof window === 'undefined') return;
  const cur = loadOrganizerOwnedEventIds(email).filter((x) => String(x) !== String(id));
  localStorage.setItem(organizerOwnedEventIdsKey(email), JSON.stringify(cur));
}

/** Create returns `{ message: { id, ...fields } }`; update may use the same shape. */
export function extractEventIdFromSaveResponse(res) {
  if (!res || typeof res !== 'object') return null;
  const msg = res.message;
  if (msg && typeof msg === 'object' && !Array.isArray(msg) && msg.id != null)
    return msg.id;
  if (res.data && typeof res.data === 'object' && res.data.id != null)
    return res.data.id;
  return null;
}