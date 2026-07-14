// Simple script to clear specific events from local storage
// Run this in browser console on the events page

console.log('Clearing specific events...');

// Clear all events from local storage
localStorage.removeItem('eh_events');

// Clear organizer owned events for all possible email variations
const keys = Object.keys(localStorage).filter(key => key.startsWith('eh_organizer_event_ids_v1_'));
keys.forEach(key => localStorage.removeItem(key));

// Clear any other event-related storage
localStorage.removeItem('eh_userId');
localStorage.removeItem('eh_token');

console.log('Events cleared! Refreshing page...');
location.reload();
