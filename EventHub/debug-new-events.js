// Debug script to check why new events aren't showing
// Run this in browser console on the events page

console.log('🔍 Debugging why new events aren\'t showing...');

function debugNewEvents() {
  // 1. Check user info
  const userName = localStorage.getItem('eh_userName');
  const userEmail = localStorage.getItem('eh_userEmail');
  const userRole = localStorage.getItem('eh_userRole');
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  console.log('User Role:', userRole);
  console.log('Is Organizer:', userRole === 'Organizer');
  
  // 2. Check local storage events
  console.log('\n=== LOCAL STORAGE EVENTS ===');
  const localEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  console.log('Total local events:', localEvents.length);
  
  if (localEvents.length > 0) {
    console.log('Local events:');
    localEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
      console.log(`   Organizer: ${event.organizer}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Category: ${event.cat}`);
    });
  } else {
    console.log('❌ No events found in local storage');
  }
  
  // 3. Check which events should belong to current user
  if (userName && userRole === 'Organizer') {
    console.log('\n=== USER\'S EVENTS ===');
    const userEvents = localEvents.filter(event => {
      const eventOrganizer = (event.organizer || '').toLowerCase().trim();
      const userNameLower = userName.toLowerCase().trim();
      return eventOrganizer === userNameLower;
    });
    
    console.log('Events that should belong to user:', userEvents.length);
    userEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
    });
    
    // 4. Check if events are being filtered out
    console.log('\n=== FILTERING CHECK ===');
    const unwantedTitles = ['erwer', 'anything', 'trrt'];
    const filteredUserEvents = userEvents.filter(event => 
      !unwantedTitles.some(unwanted => 
        event.title && event.title.toLowerCase().includes(unwanted.toLowerCase())
      )
    );
    
    console.log('User events after filtering:', filteredUserEvents.length);
    filteredUserEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
    });
    
    if (filteredUserEvents.length === 0 && userEvents.length > 0) {
      console.log('⚠️ All user events were filtered out by unwanted titles filter');
    }
  }
  
  // 5. Check current page events
  console.log('\n=== CURRENT PAGE EVENTS ===');
  const eventCards = document.querySelectorAll('.ev-card');
  console.log('Event cards on page:', eventCards.length);
  
  eventCards.forEach((card, index) => {
    const titleElement = card.querySelector('div[style*="font-weight: 700"]');
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
    console.log(`${index + 1}. ${title}`);
  });
  
  // 6. Create test event if needed
  if (localEvents.length === 0 && userName && userRole === 'Organizer') {
    console.log('\n=== CREATING TEST EVENT ===');
    const testEvent = {
      id: 'test-event-' + Date.now(),
      title: 'Test Event ' + new Date().toLocaleTimeString(),
      loc: 'Test Location',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: `https://picsum.photos/seed/test${Date.now()}/400/300`,
      description: 'Test event description',
      capacity: '100',
      address: 'Test Address',
      organizer: userName,
      createdAt: Date.now()
    };
    
    const updatedEvents = [...localEvents, testEvent];
    localStorage.setItem('eh_events', JSON.stringify(updatedEvents));
    
    console.log('✅ Created test event:', testEvent.title);
    console.log('📝 Refresh the page to see if it appears');
  }
  
  console.log('\n=== DEBUGGING COMPLETE ===');
  console.log('💡 If you see local events but they don\'t appear on the page,');
  console.log('   the issue is in the events page filtering logic.');
  console.log('💡 If you see no local events, the event creation didn\'t save properly.');
}

// Run debug
debugNewEvents();
