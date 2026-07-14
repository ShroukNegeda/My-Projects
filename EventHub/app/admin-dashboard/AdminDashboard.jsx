'use client';
import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import {
  apiGetPendingUsers,
  apiUpdateUserStatus,
  getToken,
} from "../../lip/api";
import {
  FaCheck,
  FaTimes,
  FaUserShield,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaClock,
  FaSpinner,
  FaSearch,
  FaUsers,
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaMicrophone,
  FaTrophy,
} from "react-icons/fa";
import Link from "next/link";
import NavBar from "../../components/NavBar";

const NAVY = '#1a1f5e';
const BLUE = '#2563eb';

function normalizeRole(role) {
  if (role == null || role === '') return '';
  if (typeof role === 'object' && role !== null) {
    if (typeof role.name === 'string') return normalizeRole(role.name);
    if (typeof role.slug === 'string') return normalizeRole(role.slug.replace(/-/g, ' '));
    return '';
  }
  if (typeof role !== 'string') return '';
  const r = role.trim().toLowerCase().replace(/\s+/g, ' ');
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/** Pull pending records from assorted Laravel wrappers. */
function extractPendingUsersList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const tryArr = [
    payload.data,
    payload.users,
    payload.pending_users,
    payload.requests,
    payload.message,
    payload.message?.data,
    payload.message?.users,
    payload.message?.pending_users,
    payload.data?.users,
    payload.data?.pending_users,
    payload.data?.data,
  ];
  for (const c of tryArr) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

/** Walk nested JSON strings for role-ish words (handles nested `{ role: { slug } }`). */
function walkJsonStringsCollectRoles(obj, visitor, depth = 0, keyTrail = '') {
  if (obj == null || depth > 8) return;
  if (typeof obj === 'string') {
    const trail = keyTrail.toLowerCase();
    if (/password|token|secret|authorization|bear/.test(trail)) return;
    if (obj.length > 400) return;
    visitor(obj, keyTrail || '');
    return;
  }
  if (typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      walkJsonStringsCollectRoles(obj[i], visitor, depth + 1, keyTrail + '[]');
    }
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    walkJsonStringsCollectRoles(v, visitor, depth + 1, keyTrail ? `${keyTrail}.${k}` : k);
  }
}

function addDeepKeywordRoleHints(out, user) {
  walkJsonStringsCollectRoles(user, (s, trail) => {
    const kt = trail.toLowerCase().replace(/\[\]/g, '');
    if (/password|token|secret|authorization|bear|bearer/i.test(kt)) return;

    const leaves = kt.split(/[.[\]]+/).filter(Boolean);
    const last = leaves[leaves.length - 1] || '';
    /** Only inspect likely role payloads; ignore job titles, bios, company names, addresses. */
    if (
      /^(job_title|title|bio|description|about|company_name|address|full_mailing_address|street|latitude|longitude|phone|email|name)$/i.test(
        last,
      )
    ) {
      return;
    }

    const dotted = '.' + kt + '.';
    const roleLikePath =
      /(^|\.)(roles?)(\[\d*\])?$/i.test(kt) ||
      /\.roles?(\[\d+\])?\./i.test(dotted) ||
      /(^|\.)(slug|guard_name|permission|requested_role|registration_role|user_type|account_type)$/i.test(
        kt,
      );

    const t = String(s).trim();
    if (!t || (!roleLikePath && t.length > 72)) return;

    const low = t.toLowerCase();
    if (/\borgani[sz]ers?\b/i.test(low) || /^organizer$/i.test(t.trim())) {
      addRoleTokens(out, 'organizer');
    }
    if (/\bspeakers?\b/i.test(low) || /^speaker$/i.test(t.trim())) {
      addRoleTokens(out, 'speaker');
    }
    if (/\bsponser\b|\bsponsors?\b/i.test(low) || /^sponsor$/i.test(t.trim())) {
      addRoleTokens(out, 'sponsor');
    }
  });
}

/**
 * Last resort: match our Organizer / Speaker / Sponsor signup field shapes when API omits `role`.
 * Speaker: bio/CV · Sponsor: logo fields · Organizer: strong company/geo/specialty + job_title.
 */
function addSignupShapeRoleHints(out, user) {
  const hasOSS = [...out].some((t) =>
    ['organizer', 'speaker', 'sponsor', 'sponser'].includes(t),
  );
  if (hasOSS) return;

  const pu =
    typeof user.profile === 'object' && user.profile ? user.profile : {};
  const dt =
    typeof user.details === 'object' && user.details ? user.details : {};
  const f = { ...dt, ...pu, ...user };

  const g = (...keys) =>
    keys.some(
      (k) => f[k] != null && String(f[k]).trim() !== '',
    );

  const speakerSignals = g('bio', 'cv', 'resume', 'biography');
  const sponsorSignals = g(
    'logo',
    'logo_url',
    'company_logo',
    'sponsor_logo',
    'brand_logo',
  );

  const organizerSignals =
    g(
      'company_name',
      'company_number',
      'specialty',
      'country',
      'city',
      'job_title',
    ) && g('full_mailing_address', 'address');

  if (speakerSignals && !sponsorSignals) {
    addRoleTokens(out, 'speaker');
    return;
  }
  if (sponsorSignals) {
    addRoleTokens(out, 'sponsor');
    return;
  }
  if (organizerSignals) {
    addRoleTokens(out, 'organizer');
  }
}

/** Lowercase tokens for matching (organizer | speaker | sponsor | …). */
function addRoleTokens(out, raw) {
  if (raw == null) return;
  if (typeof raw === 'number') raw = String(raw);
  if (typeof raw === 'object' && raw !== null) {
    addRoleTokens(out, raw.name);
    addRoleTokens(out, raw.slug);
    return;
  }
  if (typeof raw !== 'string') return;
  const t = raw.trim().toLowerCase();
  if (!t) return;
  out.add(t.replace(/[\s_-]+/g, ' ').trim());
  t.split(/[\s,_/-]+/).forEach((chunk) => {
    const p = chunk.replace(/[^\w]/g, '');
    if (!p || p === 'role' || p === 'user') return;
    out.add(p);
    if (p.endsWith('s') && p.length > 3) out.add(p.slice(0, -1));
    if (p === 'organisers') out.add('organizer');
    if (p === 'sponser') out.add('sponsor');
  });
}

function collectRoleStrings(user) {
  const out = new Set();
  if (!user || typeof user !== 'object') return out;
  addRoleTokens(out, user.role);
  addRoleTokens(out, user.role_name);
  addRoleTokens(out, user.user_type);
  addRoleTokens(out, user.type);
  addRoleTokens(out, user.account_type);
  addRoleTokens(out, user.registration_role);
  addRoleTokens(out, user.requested_role);
  addRoleTokens(out, user.request_role);
  addRoleTokens(out, user.member_type);
  addRoleTokens(out, user.applicant_role);
  addRoleTokens(out, user.pending_role);
  addRoleTokens(out, user.role_slug);
  addRoleTokens(out, user.role_type);
  if (typeof user.profile === 'object' && user.profile) {
    addRoleTokens(out, user.profile.role);
    addRoleTokens(out, user.profile.role_name);
    addRoleTokens(out, user.profile.user_type);
    addRoleTokens(out, user.profile.type);
  }
  if (typeof user.details === 'object' && user.details) {
    addRoleTokens(out, user.details.role);
    addRoleTokens(out, user.details.role_name);
    addRoleTokens(out, user.details.type);
    addRoleTokens(out, user.details.user_type);
  }
  if (Array.isArray(user.roles)) {
    for (const r of user.roles) addRoleTokens(out, r);
  }
  if (
    typeof user.user === 'object' &&
    user.user &&
    !Array.isArray(user.user)
  ) {
    addRoleTokens(out, user.user.role);
    addRoleTokens(out, user.user.role_name);
  }
  addDeepKeywordRoleHints(out, user);
  addSignupShapeRoleHints(out, user);
  return out;
}

function displayRoleLabel(user) {
  const tokens = collectRoleStrings(user);
  const has = (k) =>
    tokens.has(k) || [...tokens].some((t) => t === k || t.endsWith(k));
  if (has('organizer')) return 'Organizer';
  if (has('speaker')) return 'Speaker';
  if (has('sponsor') || has('sponser')) return 'Sponsor';
  if (has('attendee')) return 'Attendee';
  const first = [...tokens].find((t) => t.length > 1);
  if (first) return normalizeRole(first);
  return 'User';
}

/** Clear copy for “who is this signup for?” in list + modal. */
function registrationRoleHeading(user) {
  const label = displayRoleLabel(user);
  const lower = label.toLowerCase();
  if (['organizer', 'speaker', 'sponsor', 'attendee'].includes(lower))
    return label === 'Attendee'
      ? { label: 'Attendee signup', subtitle: `${label}`, accent: NAVY }
      : { label: `${label} registration`, subtitle: label, accent: NAVY };
  if (lower === 'user' || lower === '')
    return {
      label: 'Registration type unclear',
      subtitle: 'Could not detect organizer/speaker/sponsor from payload',
      accent: '#94a3b8',
    };
  return { label: `${label} registration`, subtitle: label, accent: NAVY };
}

function matchesRoleFilter(user, filter) {
  if (filter !== 'Organizer' && filter !== 'Speaker' && filter !== 'Sponsor')
    return false;
  const want =
    filter === 'Organizer'
      ? 'organizer'
      : filter === 'Speaker'
        ? 'speaker'
        : 'sponsor';
  const tokens = collectRoleStrings(user);
  const list = [...tokens];
  if (want === 'sponsor')
    return list.some((s) => s === 'sponsor' || s === 'sponser');
  return list.some(
    (s) =>
      s === want ||
      s.replace(/_/g, '') === want ||
      s.endsWith(want) ||
      s.includes(want),
  );
}

/** Pending endpoint drops users once processed; persist decisions so Approved/Rejected tabs still work */
const ADMIN_DECISION_STORE_KEY = 'eh_admin_registration_decisions_v1';

function userRowId(user) {
  const id = user?.id ?? user?.user_id;
  return id != null && String(id).trim() !== '' ? String(id) : '';
}

function loadArchivedAdminDecisions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_DECISION_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArchivedAdminDecisions(rows) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ADMIN_DECISION_STORE_KEY,
      JSON.stringify(rows),
    );
  } catch {
    /* ignore quota */
  }
}

function upsertArchivedAdminDecision(row) {
  const id = userRowId(row);
  if (!id) return;
  const next = loadArchivedAdminDecisions().filter(
    (u) => userRowId(u) !== id,
  );
  next.push(row);
  saveArchivedAdminDecisions(next);
}

function mergePendingWithArchived(apiRows, archivedRows) {
  const apiIds = new Set(apiRows.map(userRowId).filter(Boolean));
  const tail = archivedRows.filter(
    (a) => userRowId(a) && !apiIds.has(userRowId(a)),
  );
  return [...apiRows, ...tail];
}

function archiveApprovedSnapshot(user) {
  return {
    ...user,
    _adminDecision: 'approved',
    status: 1,
    is_approved: true,
    is_rejected: false,
    approved_at: new Date().toISOString(),
    rejected_at: null,
    denied_at: null,
  };
}

function archiveRejectedSnapshot(user) {
  return {
    ...user,
    _adminDecision: 'rejected',
    status: 2,
    is_rejected: true,
    is_approved: false,
    rejected_at: new Date().toISOString(),
    approved_at: null,
    denied_at: new Date().toISOString(),
  };
}

function userStatus(user) {
  if (!user || typeof user !== 'object') return 'pending';

  if (user._adminDecision === 'approved') return 'approved';
  if (user._adminDecision === 'rejected') return 'rejected';

  const raw =
    user.status ??
    user.approval_status ??
    user.account_status ??
    user.verification_status;

  if ('is_approved' in user && user.is_approved === true) return 'approved';
  if ('is_rejected' in user && user.is_rejected === true) return 'rejected';

  if (raw === undefined || raw === null || raw === '') {
    if (user.rejected_at || user.denied_at) return 'rejected';
    if (user.approved_at) return 'approved';
    return 'pending';
  }

  if (typeof raw === 'string') {
    const t = raw.trim().toLowerCase();
    if (t === 'approved' || t === 'approve' || t === 'active') return 'approved';
    if (t === 'rejected' || t === 'reject' || t === 'denied' || t === 'declined')
      return 'rejected';
    if (t === 'pending' || t === 'waiting' || t === 'inactive') return 'pending';
    if (t === '1' || t === 'true') return 'approved';
    if (t === '2' || t === '-1') return 'rejected';
    if (t === '0' || t === 'false') return 'pending';
  }

  if (raw === true) return 'approved';
  if (raw === false) return 'pending';

  const n = Number(raw);
  if (!Number.isNaN(n)) {
    if (n === 1) return 'approved';
    if (n === 2 || n === 3 || n === -1) return 'rejected';
    if (n === 0) return 'pending';
  }

  return 'pending';
}

function roleBadgeStyle(role) {
  const r = normalizeRole(role).toLowerCase();
  if (r === 'organizer')
    return { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' };
  if (r === 'sponsor')
    return { bg: '#faf5ff', color: '#7c3aed', border: '#d8b4fe' };
  if (r === 'speaker')
    return { bg: '#f0fdf4', color: '#15803d', border: '#86efac' };
  return { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' };
}

function RoleIcon({ role, size = 14 }) {
  const r = normalizeRole(role).toLowerCase();
  if (r === 'organizer')
    return <FaBriefcase size={size} aria-hidden />;
  if (r === 'sponsor') return <FaTrophy size={size} aria-hidden />;
  if (r === 'speaker')
    return <FaMicrophone size={size} aria-hidden />;
  return <FaUser size={size} aria-hidden />;
}

function displayUsername(user) {
  const u = user.username ?? user.user_name ?? user.slug;
  if (u != null && String(u).trim()) return String(u).trim();
  const em = user.email;
  if (em && typeof em === 'string' && em.includes('@'))
    return em.split('@')[0];
  return '—';
}

function detailRowsFromUser(user) {
  const u = {
    ...(user &&
    typeof user.profile === 'object' &&
    user.profile !== null
      ? user.profile
      : {}),
    ...(user &&
    typeof user.details === 'object' &&
    user.details !== null
      ? user.details
      : {}),
    ...user,
  };

  const rows = [];
  const push = (label, val) => {
    if (val == null || val === '') return;
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val).trim();
    if (!s) return;
    rows.push({ label, value: s });
  };

  push('Full Name', u.full_name || u.name);
  push('Email', u.email);
  push('Job Title', u.job_title);
  push('Country', u.country);
  push('City', u.city);
  push('Bio', u.bio ?? u.biography ?? u.about ?? u.summary);
  push(
    'LinkedIn',
    u.linkedin ?? u.linkedin_url ?? u.linked_in ?? u.linkedin_profile,
  );
  push('Phone', u.phone);
  push('Company', u.company_name);
  push(
    'Address',
    u.full_mailing_address ?? u.address ?? u.mailing_address,
  );
  push('Specialty', u.specialty ?? u.industry);
  push('Username', u.username ?? u.user_name);
  push('Tax / company no.', u.company_number ?? u.tax_number);

  const signupKind = displayRoleLabel(user);
  push(
    'Registration type',
    signupKind === 'Organizer' ||
      signupKind === 'Speaker' ||
      signupKind === 'Sponsor' ||
      signupKind === 'Attendee'
      ? signupKind
      : registrationRoleHeading(user).label,
  );

  const used = new Set([
    'full_name',
    'name',
    'email',
    'job_title',
    'country',
    'city',
    'bio',
    'biography',
    'about',
    'summary',
    'linkedin',
    'linkedin_url',
    'linked_in',
    'linkedin_profile',
    'phone',
    'company_name',
    'full_mailing_address',
    'address',
    'mailing_address',
    'specialty',
    'industry',
    'username',
    'user_name',
    'slug',
    'company_number',
    'tax_number',
    'profile',
    'details',
    'role',
    'role_name',
    'status',
    'id',
    'user_id',
    'password',
    'password_confirmation',
    'remember_token',
    'email_verified_at',
    'created_at',
    'updated_at',
    'token',
    '_adminDecision',
    'denied_at',
  ]);

  for (const [k, v] of Object.entries(u)) {
    if (used.has(k)) continue;
    if (v == null || typeof v === 'object') continue;
    const s = String(v).trim();
    if (!s) continue;
    const label = k
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (rows.some((r) => r.label === label)) continue;
    rows.push({ label, value: s });
  }

  return rows;
}

export default function AdminDashboard({ 
  setPage, 
  userName = '', 
  userEmail = '', 
  userRole = '', 
  logout = () => {
    localStorage.removeItem('eh_token');
    window.location.href = '/login';
  }
}) {
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    organizers: 0,
    speakers: 0,
    sponsors: 0,
    totalEvents: 0
  });
  const [detailUser, setDetailUser] = useState(null);

      // Toast handler
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

    // Load all data
  const loadData = useCallback(async () => {
    if (!mounted || !token) {
      console.log('❌ No token, skipping load');
      return;
    }

    console.log('🌐 Loading admin data...');
    setLoading(true);
    setApiError("");

    try {
      // Get pending users
      const usersResponse = await apiGetPendingUsers();
      console.log('Users response:', usersResponse);
      
      let users = extractPendingUsersList(usersResponse);
      if (
        users.length === 0 &&
        usersResponse &&
        typeof usersResponse === 'object' &&
        !Array.isArray(usersResponse)
      ) {
        console.warn(
          'Admin pending-users: no array found — raw keys:',
          Object.keys(usersResponse),
        );
      }

      let archivedStored = loadArchivedAdminDecisions();
      const pendingIds = new Set(users.map(userRowId).filter(Boolean));
      if (pendingIds.size) {
        archivedStored = archivedStored.filter(
          (a) => !pendingIds.has(userRowId(a)),
        );
        saveArchivedAdminDecisions(archivedStored);
      }

      const merged = mergePendingWithArchived(users, archivedStored);
      setRequests(merged);

      const pendingCount = merged.filter((u) => userStatus(u) === 'pending').length;
      const approvedCount = merged.filter((u) => userStatus(u) === 'approved').length;
      const rejectedCount = merged.filter((u) => userStatus(u) === 'rejected').length;

      const organizersCt = merged.filter((u) => matchesRoleFilter(u, 'Organizer')).length;
      const speakersCt = merged.filter((u) => matchesRoleFilter(u, 'Speaker')).length;
      const sponsorsCt = merged.filter((u) => matchesRoleFilter(u, 'Sponsor')).length;

      setStats({
        totalUsers: merged.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        organizers: organizersCt,
        speakers: speakersCt,
        sponsors: sponsorsCt,
        totalEvents: 0
      });

      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Handle 404 - admin endpoint not implemented
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.warn('Admin endpoint /admin/pending-users not found on backend, using localStorage fallback');
        // Load from localStorage fallback
        const localUsers = JSON.parse(safeLS.getItem('eh_admin_pending_users') || '[]');
        if (localUsers.length > 0) {
          setRequests(localUsers);
          setStats({
            totalUsers: localUsers.length,
            pending: localUsers.filter(u => userStatus(u) === 'pending').length,
            approved: localUsers.filter(u => userStatus(u) === 'approved').length,
            rejected: localUsers.filter(u => userStatus(u) === 'rejected').length,
            organizers: localUsers.filter(u => matchesRoleFilter(u, 'Organizer')).length,
            speakers: localUsers.filter(u => matchesRoleFilter(u, 'Speaker')).length,
            sponsors: localUsers.filter(u => matchesRoleFilter(u, 'Sponsor')).length,
            totalEvents: 0
          });
          setApiError('');
          showToast('Using local data (API not available)', 'info');
        } else {
          setApiError('Admin API not available. No local data found.');
          showToast('Admin API endpoint not found (404)', 'error');
        }
        return;
      }
      
      // Handle authentication errors
      if (error.message?.includes('401')) {
        console.log("Unauthorized - check token");
        showToast('Session expired, please login again', 'error');
        return;
      }
      
      setApiError(error.message || 'Failed to load data');
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [mounted, token, showToast]);

   // Approve user (pass full row so we can keep them in Approved after they leave pending-users)
  const approveUser = useCallback(
    async (userId, userRow) => {
      if (loading) return;
      if (!userRow || !userRowId(userRow)) {
        showToast('Could not approve: missing user data.', 'error');
        return;
      }

      try {
        setLoading(true);
        await apiUpdateUserStatus(userId, 1);
        upsertArchivedAdminDecision(archiveApprovedSnapshot(userRow));
        showToast('User approved successfully!', 'success');
        await loadData();
      } catch (error) {
        showToast('Failed to approve user: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [loadData, loading, showToast],
  );

  // Reject user
  const rejectUser = useCallback(
    async (userId, userRow) => {
      if (loading) return;
      if (!userRow || !userRowId(userRow)) {
        showToast('Could not reject: missing user data.', 'error');
        return;
      }

      try {
        setLoading(true);
        let lastErr;
        for (const code of [0, 2]) {
          try {
            await apiUpdateUserStatus(userId, code);
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (lastErr) throw lastErr;

        upsertArchivedAdminDecision(archiveRejectedSnapshot(userRow));
        showToast('User marked as rejected.', 'success');
        await loadData();
      } catch (error) {
        showToast('Failed to reject user: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [loadData, loading, showToast],
  );

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((user) => {
      const st = userStatus(user);
      const matchFilter =
        filter === 'All' ||
        (filter === 'Pending' && st === 'pending') ||
        (filter === 'Approved' && st === 'approved') ||
        (filter === 'Rejected' && st === 'rejected') ||
        matchesRoleFilter(user, filter);

      const profile =
        typeof user.profile === 'object' && user.profile ? user.profile : {};
      const detail =
        typeof user.details === 'object' && user.details ? user.details : {};
      const nameHaystack = [
        user.name,
        user.full_name,
        profile.name,
        profile.full_name,
        detail.name,
        user.email,
        profile.email,
        detail.email,
        user.phone,
        profile.phone,
        user.company_name,
        profile.company_name,
        user.job_title,
        profile.job_title,
        user.username,
        user.user_name,
        displayUsername(user),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch =
        !q ||
        nameHaystack.includes(q) ||
        [...q.split(/\s+/)].every((tok) => tok && nameHaystack.includes(tok));

      return matchFilter && matchSearch;
    });
  }, [requests, filter, search]);

  useLayoutEffect(() => {
    const authToken = getToken();

    if (authToken) {
      setToken(authToken);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setToken(null);
    }
    setMounted(true);
  }, []);

useEffect(() => {
  if (mounted && token) {
    loadData();
  }
}, [mounted, token, loadData]);

  useEffect(() => {
    setDetailUser((prev) => {
      if (!prev) return prev;
      const id = prev.id ?? prev.user_id;
      const updated = requests.find((u) => (u.id ?? u.user_id) === id);
      return updated ?? null;
    });
  }, [requests]);

  useEffect(() => {
    if (!detailUser) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailUser(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailUser]);

  useEffect(() => {
    if (!mounted || !detailUser) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailUser, mounted]);

  if (!mounted) {
    return null;
  }

  // Not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <FaUserShield size={80} color="#3b82f6" style={{ marginBottom: 24 }} />
          <h2 style={styles.authTitle}>Admin Access Required</h2>
          <p style={styles.authSubtitle}>
            Please login with admin credentials to access the dashboard
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button 
              onClick={() => window.location.href = '/login'}
              style={styles.primaryBtn}
            >
              Login as Admin
            </button>
            <Link href="/">
              <button style={styles.secondaryBtn}>Go Home</button>
            </Link>
          </div>
          <p style={{ marginTop: 24, color: '#64748b', fontSize: 14 }}>
            Admin: admin@gmail.com / password123
          </p>
        </div>
      </div>
    );
  }



  const filterTabs = [
    'All',
    'Pending',
    'Approved',
    'Rejected',
    'Organizer',
    'Speaker',
    'Sponsor',
  ];

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .request-card {
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        @media (max-width: 1024px) {
          .request-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .request-aside {
            margin-left: 0 !important;
            width: auto !important;
            align-items: flex-start !important;
            border-top: 1px solid #f1f5f9 !important;
            padding-top: 12px !important;
          }
        }
      `}</style>

      {setPage ? (
        <NavBar
          page="admin"
          setPage={setPage}
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
        />
      ) : null}

      <div style={styles.content}>
        {/* Header — Admin Panel */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <FaUser size={24} color="#fff" />
            </div>
            <div>
              <h1 style={styles.title}>Admin Panel</h1>
              <p style={styles.subtitle}>
                Organizer, speaker, and sponsor registration requests.
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button type="button" onClick={logout} style={styles.logoutBtn}>
              <FaSignOutAlt size={15} /> Log Out
            </button>
          </div>
        </div>

        {toast.show && (
          <div
            style={{
              ...styles.toast,
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            {toast.message}
          </div>
        )}

        {/* Stats — status + registration role */}
        <div style={styles.statsGrid}>
          {[
            {
              label: 'Total',
              value: stats.totalUsers,
              valueColor: '#0f172a',
            },
            {
              label: 'Pending',
              value: stats.pending,
              valueColor: '#ea580c',
            },
            {
              label: 'Approved',
              value: stats.approved,
              valueColor: '#16a34a',
            },
            {
              label: 'Rejected',
              value: stats.rejected,
              valueColor: '#dc2626',
            },
          ].map((row) => (
            <div key={row.label} style={styles.statCard}>
              <div style={styles.statLabel}>{row.label}</div>
              <div style={{ ...styles.statValue, color: row.valueColor }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', margin: '14px 0 8px' }}>
          Requests by registration type
        </p>
        <div style={styles.roleStatsRow}>
          <div style={styles.roleStatCard}>
            <FaBriefcase size={18} style={{ color: '#c2410c', opacity: 0.9 }} />
            <div>
              <div style={styles.roleStatLabel}>Organizer</div>
              <div style={styles.roleStatValue}>{stats.organizers}</div>
            </div>
          </div>
          <div style={styles.roleStatCard}>
            <FaMicrophone size={18} style={{ color: '#15803d', opacity: 0.9 }} />
            <div>
              <div style={styles.roleStatLabel}>Speaker</div>
              <div style={styles.roleStatValue}>{stats.speakers}</div>
            </div>
          </div>
          <div style={styles.roleStatCard}>
            <FaTrophy size={18} style={{ color: '#7c3aed', opacity: 0.9 }} />
            <div>
              <div style={styles.roleStatLabel}>Sponsor</div>
              <div style={styles.roleStatValue}>{stats.sponsors}</div>
            </div>
          </div>
        </div>

        {/* Filters + search */}
        <div style={styles.filtersBar}>
          <div style={styles.filterPills}>
            {filterTabs.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterPill,
                  ...(filter === f ? styles.filterPillActive : styles.filterPillIdle),
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={styles.searchWrap}>
            <FaSearch size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {apiError && (
          <div style={styles.errorAlert}>
            <FaExclamationTriangle size={18} style={{ marginRight: 12 }} />
            {apiError}
            <button
              type="button"
              onClick={() => setApiError('')}
              style={styles.dismissError}
            >
              ×
            </button>
          </div>
        )}

        {/* Request cards */}
        <div style={styles.cardList}>
          {loading ? (
            <div
              style={styles.loadingContent}
              role="status"
              aria-live="polite"
              aria-label="Loading requests"
            >
              <FaSpinner
                size={40}
                color="#f97316"
                style={{ animation: 'spin 1s linear infinite' }}
                aria-hidden
              />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <FaUsers size={52} style={{ opacity: 0.35, marginBottom: 14 }} />
              <h3 style={styles.emptyTitle}>No requests found</h3>
              <p style={styles.emptySub}>
                {search.trim()
                  ? `No entries match "${search.trim()}"`
                  : 'No role requests to show for this filter.'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const id = user.id ?? user.user_id;
              const pu =
                typeof user.profile === 'object' && user.profile ? user.profile : {};
              const displayName =
                user.name ||
                user.full_name ||
                pu.name ||
                pu.full_name ||
                user.email ||
                'Unknown';
              const initial = displayName.trim().charAt(0).toUpperCase() || '?';
              // Get photo from localStorage if available
              const normalizedEmail = (user.email || pu.email || '').toLowerCase().trim();
              const userPhoto = normalizedEmail ? localStorage.getItem(`eh_photo_${normalizedEmail}`) : null;
              const roleLabel = displayRoleLabel(user);
              const regRole = registrationRoleHeading(user);
              const rb = roleBadgeStyle(roleLabel);
              const st = userStatus(user);
              const job =
                user.job_title ||
                pu.job_title ||
                user.company_name ||
                pu.company_name ||
                user.position ||
                pu.position ||
                '';
              const uname = displayUsername(user);

              const rowBtnStyle = (loading) => ({
                opacity: loading ? 0.55 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              });

              return (
                <div
                  key={id}
                  className="request-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailUser(user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setDetailUser(user);
                  }}
                  style={styles.requestCard}
                >
                  <div style={styles.avatarCircle}>
                    {userPhoto ? (
                      <img src={userPhoto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", flexShrink: 0, borderRadius: "50%", background: "#f1f5f9" }} />
                    ) : (
                      initial
                    )}
                  </div>
                  <div style={{...styles.requestBody, overflow: 'hidden'}}> {/* Added overflow hidden here */}
                    <div style={styles.requestTop}>
                      <span style={styles.requestName}>{displayName}</span>
                      <span
                        style={{
                          ...styles.roleTag,
                          background: rb.bg,
                          color: rb.color,
                          border: `1px solid ${rb.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <RoleIcon role={roleLabel} size={11} />
                        {roleLabel || 'User'}
                      </span>
                    </div>
                    <div style={styles.requestRegistrationLine}>
                      <RoleIcon role={roleLabel} size={11} aria-hidden />
                      <span style={{ marginLeft: 6 }}>
                        <span style={styles.requestRegistrationKey}>
                          Registration ·
                        </span>{' '}
                        <strong style={{ color: NAVY }}>
                          {['Organizer', 'Speaker', 'Sponsor'].includes(
                            roleLabel,
                          )
                            ? roleLabel
                            : roleLabel === 'Attendee'
                              ? 'Attendee'
                              : regRole.label}
                        </strong>
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailItem}>
                        <FaEnvelope size={12} style={styles.detailIcon} />
                        {user.email || '—'}
                      </span>
                      <span style={styles.detailItem}>
                        <FaBriefcase size={12} style={styles.detailIcon} />
                        {job || '—'}
                      </span>
                      <span style={styles.detailItem}>
                        <FaUser size={12} style={styles.detailIcon} />
                        {uname}
                      </span>
                    </div>
                  </div>

                  <div className="request-aside" style={styles.requestAside}>
                    <div
                      style={{
                        ...styles.statusPill,
                        ...(st === 'approved'
                          ? styles.statusApproved
                          : st === 'rejected'
                            ? styles.statusRejected
                            : styles.statusPending),
                      }}
                    >
                      {st === 'approved' ? (
                        <>
                          <FaCheck size={12} /> Approved
                        </>
                      ) : st === 'rejected' ? (
                        <>
                          <FaTimes size={12} /> Rejected
                        </>
                      ) : (
                        <>
                          <FaClock size={12} /> Pending
                        </>
                      )}
                    </div>
                    <div style={styles.actionRow}>
                      {(st === 'pending' || st === 'rejected') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveUser(id, user);
                          }}
                          disabled={loading}
                          style={{
                            ...styles.btnApprove,
                            ...rowBtnStyle(loading),
                          }}
                        >
                          <FaCheck size={12} /> Approve
                        </button>
                      )}
                      {(st === 'pending' || st === 'approved') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectUser(id, user);
                          }}
                          disabled={loading}
                          style={{
                            ...styles.btnReject,
                            ...rowBtnStyle(loading),
                          }}
                        >
                          <FaTimes size={12} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail modal */}
        {detailUser ? (
          <div
            role="presentation"
            style={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setDetailUser(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              style={styles.modalBox}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                style={styles.modalClose}
                onClick={() => setDetailUser(null)}
              >
                <FaTimes size={18} />
              </button>

              <div style={styles.modalHeader}>
                {(() => {
                  const detailEmail = (detailUser.email || '').toLowerCase().trim();
                  const detailPhoto = detailEmail ? localStorage.getItem(`eh_photo_${detailEmail}`) : null;
                  const detailInitial = (detailUser.name || detailUser.full_name || detailUser.email || '?').trim().charAt(0).toUpperCase().slice(0,2);
                  return (
                    <div style={styles.modalAvatar}>
                      {detailPhoto ? ( /* Added flexShrink: 0 to the image */
                        <img src={detailPhoto} alt={detailUser.name || "User"} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", flexShrink: 0, borderRadius: "50%", background: "#f1f5f9" }} />
                      ) : (
                        detailInitial
                      )}
                    </div>
                  );
                })()}
                <div style={styles.modalHeaderText}>
                  <h2 style={styles.modalTitle}>
                    {detailUser.name ||
                      detailUser.full_name ||
                      detailUser.email ||
                      'Unknown'}
                  </h2>
                  <p style={styles.modalEmail}>{detailUser.email || '—'}</p>
                </div>
                {(() => {
                  const rL = displayRoleLabel(detailUser);
                  const rb = roleBadgeStyle(rL);
                  return (
                    <span
                      style={{
                        ...styles.modalRoleBadge,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: rb.bg,
                        color: rb.color,
                        border: `1px solid ${rb.border}`,
                      }}
                    >
                      <span style={{ display: 'flex', color: rb.color }}>
                        <RoleIcon role={rL} size={14} />
                      </span>
                      {rL}
                    </span>
                  );
                })()}
              </div>

              <div style={styles.modalRequestBanner}>
                <div style={styles.modalRequestBannerEyebrow}>
                  Organizer · Speaker · Sponsor request
                </div>
                <div style={styles.modalRequestBannerTitle}>
                  {['Organizer', 'Speaker', 'Sponsor'].includes(
                    displayRoleLabel(detailUser),
                  )
                    ? `${displayRoleLabel(detailUser)} signup`
                    : registrationRoleHeading(detailUser).label}
                </div>
                <p style={styles.modalRequestBannerHint}>
                  Approve only if they should get this dashboard role after
                  login.
                </p>
              </div>

              <div style={styles.modalBody}>
                {detailRowsFromUser(detailUser).map((row, idx) => (
                  <div key={`${row.label}-${idx}`} style={styles.modalField}>
                    <div style={styles.modalFieldLabel}>{row.label}</div>
                    <div style={styles.modalFieldValue}>
                      {row.label === 'LinkedIn' &&
                      /^https?:\/\//i.test(row.value) ? (
                        <a
                          href={row.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.modalLink}
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.modalStatusWrap}>
                <span
                  style={{
                    ...styles.statusPill,
                    ...(userStatus(detailUser) === 'approved'
                      ? styles.statusApproved
                      : userStatus(detailUser) === 'rejected'
                        ? styles.statusRejected
                        : styles.statusPending),
                  }}
                >
                  {userStatus(detailUser) === 'approved' ? (
                    <>
                      <FaCheck size={12} /> Approved
                    </>
                  ) : userStatus(detailUser) === 'rejected' ? (
                    <>
                      <FaTimes size={12} /> Rejected
                    </>
                  ) : (
                    <>
                      <FaClock size={12} /> Pending
                    </>
                  )}
                </span>
              </div>

              <div style={styles.modalFooter}>
                {(userStatus(detailUser) === 'pending' ||
                  userStatus(detailUser) === 'rejected') && (
                  <button
                    type="button"
                    disabled={loading}
                    style={{
                      ...styles.modalBtnApprove,
                      opacity: loading ? 0.55 : 1,
                    }}
                    onClick={() =>
                      approveUser(
                        detailUser.id ?? detailUser.user_id,
                        detailUser,
                      )
                    }
                  >
                    <FaCheck size={14} /> Approve
                  </button>
                )}
                {(userStatus(detailUser) === 'pending' ||
                  userStatus(detailUser) === 'approved') && (
                  <button
                    type="button"
                    disabled={loading}
                    style={{
                      ...styles.modalBtnReject,
                      opacity: loading ? 0.55 : 1,
                    }}
                    onClick={() =>
                      rejectUser(
                        detailUser.id ?? detailUser.user_id,
                        detailUser,
                      )
                    }
                  >
                    <FaTimes size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fb',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: '#f8fafc'
  },
  authCard: {
    background: 'white',
    padding: 48,
    borderRadius: 24,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    textAlign: 'center',
    maxWidth: 480,
    width: '100%'
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 16
  },
  authSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 1.6
  },
  primaryBtn: {
    flex: 1,
    padding: '16px 32px',
    borderRadius: 12,
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  secondaryBtn: {
    padding: '16px 32px',
    borderRadius: 12,
    background: 'white',
    color: '#3b82f6',
    border: '2px solid #3b82f6',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  content: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '36px 28px 56px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 16,
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: `linear-gradient(145deg, ${BLUE}, #1d4ed8)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.28)',
    flexShrink: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: NAVY,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '6px 0 0',
    fontWeight: 400,
  },
  headerRight: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '10px 18px',
    borderRadius: 12,
    background: '#fff',
    color: NAVY,
    border: '1px solid #e5e7eb',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
  },
  toast: {
    position: 'fixed',
    top: 24,
    right: 24,
    padding: '16px 24px',
    borderRadius: 12,
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    zIndex: 10000,
    maxWidth: 400
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    background: '#fff',
    padding: '20px 18px',
    borderRadius: 14,
    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.06)',
    textAlign: 'center',
    border: '1px solid #eef2f7',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  statLabel: {
    marginBottom: 8,
    marginTop: 0,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  roleStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  roleStatCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#fff',
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid #eef2f7',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
  },
  roleStatLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  roleStatValue: {
    fontSize: 22,
    fontWeight: 800,
    color: NAVY,
    lineHeight: 1.1,
  },
  requestRegistrationLine: {
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: 12,
    color: '#475569',
  },
  requestRegistrationKey: {
    fontWeight: 600,
    color: '#94a3b8',
    fontSize: 11,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  modalRequestBanner: {
    margin: '-4px 0 16px',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
  },
  modalRequestBannerEyebrow: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  modalRequestBannerTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: NAVY,
    marginTop: 4,
  },
  modalRequestBannerHint: {
    margin: '8px 0 0',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.45,
  },
  filtersBar: {
    background: '#fff',
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid #eef2f7',
    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  filterPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  },
  filterPillActive: {
    background: NAVY,
    color: '#fff',
    borderColor: NAVY,
  },
  filterPillIdle: {
    background: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: NAVY,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#f8fafc',
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid #e5e7eb',
    minWidth: 220,
    flex: '1 1 220px',
    maxWidth: 320,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    flex: 1,
    fontFamily: 'inherit',
    color: NAVY,
  },
  errorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '14px 18px',
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    color: '#b91c1c',
    fontWeight: 500,
    fontSize: 14,
  },
  dismissError: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: BLUE,
    cursor: 'pointer',
    fontSize: 22,
    lineHeight: 1,
    padding: '0 4px',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  loadingContent: {
    padding: '48px 24px',
    textAlign: 'center',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #eef2f7',
    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  emptyState: {
    padding: 64,
    textAlign: 'center',
    background: '#fff',
    borderRadius: 14,
    border: '1px dashed #e5e7eb',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#475569',
    margin: '0 0 8px',
  },
  emptySub: {
    margin: 0,
    fontSize: 14,
    color: '#94a3b8',
  },
  requestCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 20px',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #eef2f7',
    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
    outline: 'none',
  },
  detailRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 22px',
    marginTop: 8,
    alignItems: 'center',
  },
  detailItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#64748b',
    maxWidth: '100%',
  },
  detailIcon: {
    color: '#94a3b8',
    flexShrink: 0,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${NAVY}, #3b4fd4)`,
    color: '#fff',
    fontWeight: 800,
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  requestBody: {
    flex: 1,
    minWidth: 200,
  },
  requestTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 700,
    color: NAVY,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
    textTransform: 'capitalize',
  },
  requestEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  requestAside: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  statusApproved: {
    background: '#ecfdf5',
    color: '#15803d',
    border: '1px solid #86efac',
  },
  statusRejected: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  },
  statusPending: {
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fcd34d',
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  btnApprove: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '2px solid #22c55e',
    background: '#fff',
    color: '#15803d',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  btnReject: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '2px solid #ef4444',
    background: '#fff',
    color: '#dc2626',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.48)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflowY: 'auto',
  },
  modalBox: {
    position: 'relative',
    background: '#fff',
    borderRadius: 20,
    maxWidth: 520,
    width: '100%',
    maxHeight: 'min(90vh, 720px)',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
    border: '1px solid #eef2f7',
    padding: '28px 24px 22px',
  },
  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 12,
    border: 'none',
    background: '#f1f5f9',
    color: NAVY,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 16,
    paddingRight: 44,
    marginBottom: 22,
    paddingBottom: 18,
    borderBottom: '1px solid #f1f5f9',
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: `linear-gradient(145deg, ${BLUE}, #1d4ed8)`,
    color: '#fff',
    fontWeight: 800,
    fontSize: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  modalHeaderText: {
    flex: '1 1 180px',
    minWidth: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: NAVY,
    lineHeight: 1.25,
  },
  modalEmail: {
    margin: '6px 0 0',
    fontSize: 14,
    color: '#64748b',
    wordBreak: 'break-word',
  },
  modalRoleBadge: {
    fontSize: 13,
    fontWeight: 700,
    padding: '8px 14px',
    borderRadius: 999,
    textTransform: 'capitalize',
    marginLeft: 'auto',
    alignSelf: 'flex-start',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 18,
  },
  modalField: {},
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 4,
  },
  modalFieldValue: {
    fontSize: 15,
    color: NAVY,
    fontWeight: 500,
    lineHeight: 1.55,
    wordBreak: 'break-word',
  },
  modalLink: {
    color: BLUE,
    fontWeight: 600,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  modalStatusWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalFooter: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
  },
  modalBtnApprove: {
    padding: '12px 28px',
    borderRadius: 999,
    border: '2px solid #22c55e',
    background: '#fff',
    color: '#15803d',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  modalBtnReject: {
    padding: '12px 28px',
    borderRadius: 999,
    border: '2px solid #ef4444',
    background: '#fff',
    color: '#dc2626',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
};