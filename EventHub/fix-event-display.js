// Comprehensive script to fix event display issues
// Run this in browser console on the events page

console.log('🔧 Fixing event display issues...');

function fixEventDisplay() {
  // 1. Check user info and role
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
      console.log(`   Category: ${event.cat || event.category}`);
      console.log(`   Date: ${event.date}`);
    });
  } else {
    console.log('❌ No events found in local storage');
  }
  
  // 3. Create a guaranteed test event if none exist
  if (localEvents.length === 0 && userName && userRole === 'Organizer') {
    console.log('\n=== CREATING TEST EVENT ===');
    const testEvent = {
      id: 'test-event-' + Date.now(),
      title: 'Test Event ' + new Date().toLocaleTimeString(),
      loc: 'Online',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: `https://picsum.photos/seed/test${Date.now()}/400/300`,
      description: 'Test event created by fix script',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    };
    
    const updatedEvents = [testEvent];
    localStorage.setItem('eh_events', JSON.stringify(updatedEvents));
    
    console.log('✅ Created test event:', testEvent.title);
    console.log('📊 Total events now:', updatedEvents.length);
  }
  
  // 4. Check organizer owned events tracking
  console.log('\n=== ORGANIZER OWNED EVENTS ===');
  if (userEmail) {
    const ownedKey = `eh_organizer_event_ids_v1_${userEmail.toLowerCase()}`;
    const ownedEvents = JSON.parse(localStorage.getItem(ownedKey) || '[]');
    console.log('Owned event IDs:', ownedEvents);
    
    // Add current events to owned tracking if missing
    const currentEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    const userEvents = currentEvents.filter(e => e.organizer === userName);
    const currentEventIds = userEvents.map(e => String(e.id));
    const updatedOwnedIds = [...new Set([...ownedEvents, ...currentEventIds])];
    
    if (updatedOwnedIds.length !== ownedEvents.length) {
      localStorage.setItem(ownedKey, JSON.stringify(updatedOwnedIds));
      console.log('✅ Updated owned events tracking:', updatedOwnedIds);
    }
  }
  
  // 5. Force refresh events page state
  console.log('\n=== FORCING PAGE REFRESH ===');
  console.log('🔄 Dispatching eventsUpdated event...');
  window.dispatchEvent(new Event('eventsUpdated'));
  
  // 6. Create a function to check if events appear
  window.checkIfEventsAppear = function() {
    console.log('🔍 Checking if events appear on page...');
    
    const eventCards = document.querySelectorAll('.ev-card');
    console.log('Event cards found:', eventCards.length);
    
    eventCards.forEach((card, index) => {
      const titleElement = card.querySelector('div[style*="font-weight: 700"]');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
      console.log(`${index + 1}. ${title}`);
    });
    
    if (eventCards.length === 0) {
      console.log('❌ No events found on page - forcing reload...');
      setTimeout(() => location.reload(), 1000);
    } else {
      console.log('✅ Events are showing on page!');
    }
  };
  
  console.log('\n=== FIX COMPLETE ===');
  console.log('🔧 Test function created: window.checkIfEventsAppear()');
  console.log('📝 Run: window.checkIfEventsAppear() to verify events appear');
  console.log('🔄 Page will auto-check in 3 seconds...');
  
  // Auto-check after 3 seconds
  setTimeout(() => {
    window.checkIfEventsAppear();
  }, 3000);
}

// Run the fix
fixEventDisplay();
