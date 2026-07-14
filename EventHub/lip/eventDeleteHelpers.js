import {
  apiDeleteEvent,
  getToken,
  loadOrganizerOwnedEventIds,
  removeOrganizerOwnedEventId,
} from './api';

const safeLS =
  typeof window !== 'undefined'
    ? localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export function normName(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function eventOwnedByUser(ev, userName, userEmail) {
  if (!userName) return false;
  const meName = normName(userName);
  const meEmail = String(userEmail || '').toLowerCase().trim();
  const ownedSet = new Set(loadOrganizerOwnedEventIds(userEmail));
  if (ownedSet.size && ownedSet.has(String(ev.id))) return true;

  const orgName = normName(
    ev.organizer_name ||
      ev.organizer?.name ||
      ev.organizerName ||
      ev.created_by_name ||
      ev.user?.name,
  );
  const orgEmail = String(
    ev.organizer_email ||
      ev.organizer?.email ||
      ev.organizerEmail ||
      ev.created_by_email ||
      ev.user?.email ||
      '',
  )
    .toLowerCase()
    .trim();
  const uid =
    ev.user_id ??
    ev.organizer_id ??
    ev.created_by ??
    ev.creator_id ??
    ev.owner_id ??
    ev.owner_user_id;
  const meUid = safeLS.getItem('eh_userId');
  if (meUid && uid != null && String(uid) === String(meUid)) return true;
  return (
    (orgName && meName && orgName === meName) ||
    (orgEmail && meEmail && orgEmail === meEmail) ||
    (!!ev.organizer && normName(ev.organizer) === meName)
  );
}

export function looksLikeServerNumericId(id) {
  const idNum = Number(id);
  return Number.isFinite(idNum) && idNum > 0 && idNum <= 2147483647;
}

function isLocalEvent(ev) {
  if (typeof window === 'undefined') return false;
  try {
    const existingEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    return Array.isArray(existingEvents) && existingEvents.some((x) => String(x.id) === String(ev?.id));
  } catch {
    return false;
  }
}

/** Show delete control: Organizer can delete owned events; Admin can delete owned backend events or local events. */
export function canUserDeleteEvent(ev, userRole, userName, userEmail) {
  if (!userName) return false;
  const role = String(userRole || '');
  const owned = eventOwnedByUser(ev, userName, userEmail);
  const localEvent = isLocalEvent(ev);
  const hasToken = !!getToken();

  if (role === 'Admin') {
    console.log('[canUserDeleteEvent] Admin:', { owned, localEvent, hasToken });
    return !!hasToken;
  }

  if (role !== 'Organizer') return false;
  if (!owned) {
    console.log('[canUserDeleteEvent] Not event owner');
    return false;
  }
  if (localEvent) {
    console.log('[canUserDeleteEvent] Local event, can delete without token');
    return true;
  }
  console.log('[canUserDeleteEvent] Server event, hasToken:', hasToken);
  return hasToken;
}

export async function deleteEventWithSync(ev, userEmail, userRole, userName) {
  const tok = getToken();
  const isAdmin = String(userRole || '') === 'Admin';
  const localEvent = isLocalEvent(ev);
  const serverEvent = !localEvent && ev?.id != null;
  
  console.log('[deleteEventWithSync] Starting delete:', {
    eventId: ev.id,
    localEvent,
    serverEvent,
    isAdmin,
    userRole,
    userName,
    userEmail,
    hasToken: !!tok,
    tokenLength: tok ? tok.length : 0,
    eventOwner: ev.organizer_name || ev.organizer || ev.created_by_name,
    eventEmail: ev.organizer_email || ev.organizer?.email || ev.created_by_email,
  });
  
  // Validate user owns this backend event unless Admin.
  if (!isLocalEvent(ev) && !eventOwnedByUser(ev, userName || '', userEmail) && !isAdmin) {
    console.error('[deleteEventWithSync] Ownership check failed for backend event');
    throw new Error('You do not own this event and cannot delete it.');
  }

  console.log('[deleteEventWithSync] Ownership check passed');

  if (isAdmin || serverEvent) {
    if (!tok) throw new Error('Please log in to delete this event.');
    try {
      await apiDeleteEvent(ev.id);
    } catch (err) {
      const errorMsg = err?.message || String(err);
      
      // If token-related 401, suggest re-login and clear the invalid token
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Unauthenticated') || errorMsg.includes('401')) {
        console.error('[deleteEventWithSync] Auth error detected, clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('eh_token');
          localStorage.removeItem('eh_userId');
        }
        throw new Error('Your session expired or authentication failed. Please log in again to delete this event.');
      }
      // If user is forbidden, keep token but allow Admins to still delete locally.
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('permission')) {
        if (isAdmin) {
          console.warn('[deleteEventWithSync] Permission denied on backend, but Admin will proceed with local deletion');
          // Continue with local deletion instead of throwing
        } else {
          console.warn('[deleteEventWithSync] Permission denied, keeping token');
          throw new Error('You do not have permission to delete this event.');
        }
      }
      
      // For server errors (500), continue with local deletion
      else if (errorMsg.includes('Server error occurred') || errorMsg.includes('500')) {
        console.warn('[deleteEventWithSync] Server error, proceeding with local deletion only');
      } else if (!isAdmin) {
        // For other errors, still fail for non-admin users
        console.error('[deleteEventWithSync] Delete failed:', errorMsg);
        throw err;
      } else {
        // Admin hitting other error - still allow local deletion
        console.warn('[deleteEventWithSync] Delete failed but Admin will proceed with local deletion:', errorMsg);
      }
    }
  }

  if (userEmail) {
    console.log('[deleteEventWithSync] Removing from organizer owned events');
    removeOrganizerOwnedEventId(userEmail, ev.id);
  }
  
  try {
    const existingEvents = JSON.parse(safeLS.getItem('eh_events') || '[]');
    console.log('[deleteEventWithSync] Current events in storage:', existingEvents.length);
    console.log('[deleteEventWithSync] Looking for event ID to delete:', String(ev.id));
    
    const evs = existingEvents.filter(
      (x) => String(x.id) !== String(ev.id),
    );
    
    console.log('[deleteEventWithSync] Events after filter:', evs.length);
    console.log('[deleteEventWithSync] Event was removed:', existingEvents.length !== evs.length);
    
    safeLS.setItem('eh_events', JSON.stringify(evs));
    console.log('[deleteEventWithSync] Local storage updated');
  } catch (err) {
    console.error('[deleteEventWithSync] Local storage error:', err);
  }

  if (typeof window !== 'undefined') {
    console.log('[deleteEventWithSync] Dispatching eventsUpdated event');
    window.dispatchEvent(new Event('eventsUpdated'));
    
    // Track deleted events for landing page sync
    try {
      const deletedEvents = JSON.parse(localStorage.getItem('eh_deleted_events') || '[]');
      if (!deletedEvents.includes(String(ev.id))) {
        deletedEvents.push(String(ev.id));
        localStorage.setItem('eh_deleted_events', JSON.stringify(deletedEvents));
        console.log('[deleteEventWithSync] Added to deleted events tracking:', ev.id);
      }
    } catch (err) {
      console.error('[deleteEventWithSync] Error tracking deleted event:', err);
    }
  }
}
