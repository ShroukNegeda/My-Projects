// Force show events script - directly adds test events and forces page reload
// Run this in browser console on the events page

console.log('🔧 Forcing events to show...');

function forceShowEvents() {
  // Get user info
  const userName = localStorage.getItem('eh_userName');
  const userEmail = localStorage.getItem('eh_userEmail');
  const userRole = localStorage.getItem('eh_userRole');
  
  console.log('User:', { userName, userEmail, userRole });
  
  if (!userName || userRole !== 'Organizer') {
    console.error('❌ You must be logged in as an organizer');
    return;
  }
  
  // Create multiple test events
  const testEvents = [
    {
      id: 'force-test-1-' + Date.now(),
      title: 'My Test Event 1',
      loc: 'Online',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: 'https://picsum.photos/seed/force1/400/300',
      description: 'This is a test event created by force script',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      createdAt: Date.now()
    },
    {
      id: 'force-test-2-' + Date.now(),
      title: 'My Test Event 2',
      loc: 'Conference Hall',
      date: '02/15/2026',
      endDateISO: '2026-12-15T14:00:00',
      price: '$50',
      cat: 'Design',
      photo: 'https://picsum.photos/seed/force2/400/300',
      description: 'Another test event for testing purposes',
      capacity: '200',
      address: '123 Main St',
      organizer: userName,
      createdAt: Date.now()
    }
  ];
  
  // Get existing events
  const existingEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  
  // Add test events
  const allEvents = [...existingEvents, ...testEvents];
  
  // Save to local storage
  localStorage.setItem('eh_events', JSON.stringify(allEvents));
  
  console.log('✅ Added', testEvents.length, 'test events to local storage');
  console.log('📊 Total events in storage:', allEvents.length);
  
  // Verify they were saved
  const verifyEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  const userEvents = verifyEvents.filter(e => e.organizer === userName);
  
  console.log('🔍 User events after adding:', userEvents.length);
  userEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
  });
  
  // Force page reload
  console.log('🔄 Forcing page reload in 2 seconds...');
  setTimeout(() => {
    location.reload();
  }, 2000);
}

// Also create a function to check what's happening on the page
window.checkEventsPage = function() {
  console.log('🔍 Checking events page state...');
  
  // Check what's in the EVENTS state (if accessible)
  const eventCards = document.querySelectorAll('.ev-card');
  console.log('Event cards found:', eventCards.length);
  
  eventCards.forEach((card, index) => {
    const titleElement = card.querySelector('div[style*="font-weight: 700"]');
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
    console.log(`${index + 1}. ${title}`);
  });
  
  // Check local storage
  const localEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  const userName = localStorage.getItem('eh_userName');
  const userEvents = localEvents.filter(e => e.organizer === userName);
  
  console.log('Local storage events for user:', userEvents.length);
  userEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
  });
  
  console.log('💡 If local events exist but don\'t show on page, there\'s a filtering issue');
};

// Run the force show
forceShowEvents();

console.log('🔧 Test function created: window.checkEvents()');
console.log('📝 After page reload, run: window.checkEvents() to verify');
