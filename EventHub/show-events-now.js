// Quick script to immediately show your events on the events page
// Run this in browser console on the events page

console.log('🚀 SHOWING YOUR EVENTS NOW...');

// 1. Get user info
const userName = localStorage.getItem('eh_userName');
const userEmail = localStorage.getItem('eh_userEmail');

console.log('User:', userName, userEmail);

// 2. Create your event if none exists
const existingEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');

if (existingEvents.length === 0) {
  const myEvent = {
    id: 'my-event-' + Date.now(),
    title: 'My Created Event ' + new Date().toLocaleTimeString(),
    loc: 'Online',
    date: '02/12/2026',
    endDateISO: '2026-12-02T13:00:00',
    price: 'Free',
    cat: 'Tech',
    photo: `https://picsum.photos/seed/myevent${Date.now()}/400/300`,
    description: 'This is my event',
    capacity: '100',
    address: 'Online',
    organizer: userName || 'Me',
    organizer_name: userName || 'Me',
    organizer_email: userEmail || 'me@example.com',
    createdAt: Date.now()
  };
  
  localStorage.setItem('eh_events', JSON.stringify([myEvent]));
  console.log('✅ Created your event:', myEvent.title);
} else {
  console.log('✅ Found your events:', existingEvents.length);
  existingEvents.forEach((e, i) => console.log(`${i+1}. ${e.title}`));
}

// 3. Force page reload to see events
console.log('🔄 Reloading page to show your events...');
setTimeout(() => location.reload(), 1000);
