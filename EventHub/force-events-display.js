// Force events to display - bypass all logic and inject directly
// Run this in browser console on the events page

console.log('🚀 FORCE EVENTS DISPLAY - Bypassing all logic...');

function forceEventsDisplay() {
  // 1. Get user info
  const userName = localStorage.getItem('eh_userName') || 'Test User';
  const userEmail = localStorage.getItem('eh_userEmail') || 'test@example.com';
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  
  // 2. Create guaranteed events
  const forceEvents = [
    {
      id: 'force-event-1-' + Date.now(),
      title: 'Force Display Event 1',
      loc: 'Online Event',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: 'https://picsum.photos/seed/force1/400/300',
      description: 'Force display test event',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'force-event-2-' + Date.now(),
      title: 'Force Display Event 2',
      loc: 'Conference Room',
      date: '02/15/2026',
      endDateISO: '2026-12-15T14:00:00',
      price: '$25',
      cat: 'Design',
      photo: 'https://picsum.photos/seed/force2/400/300',
      description: 'Another force display event',
      capacity: '50',
      address: 'Tech Hub',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'force-event-3-' + Date.now(),
      title: 'Force Display Event 3',
      loc: 'Workshop Space',
      date: '02/20/2026',
      endDateISO: '2026-12-20T15:00:00',
      price: 'Free',
      cat: 'AI',
      photo: 'https://picsum.photos/seed/force3/400/300',
      description: 'AI workshop force display',
      capacity: '30',
      address: 'AI Center',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    }
  ];
  
  // 3. Save to local storage multiple times to ensure it works
  localStorage.setItem('eh_events', JSON.stringify(forceEvents));
  console.log('✅ Saved', forceEvents.length, 'events to local storage');
  
  // Double-check they were saved
  const checkEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  console.log('🔍 Verification - events in storage:', checkEvents.length);
  
  checkEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
  });
  
  // 4. Update organizer tracking
  if (userEmail) {
    const ownedKey = `eh_organizer_event_ids_v1_${userEmail.toLowerCase()}`;
    const eventIds = forceEvents.map(e => String(e.id));
    localStorage.setItem(ownedKey, JSON.stringify(eventIds));
    console.log('✅ Updated organizer tracking');
  }
  
  // 5. Try to find and manipulate React state directly
  console.log('🔍 Looking for React components...');
  
  // Try to find any React state or force update
  setTimeout(() => {
    // Look for any event-related elements
    const eventElements = document.querySelectorAll('[class*="event"], [class*="card"], [class*="item"]');
    console.log('Found event-related elements:', eventElements.length);
    
    // Try to trigger React re-render
    const reactRoot = document.querySelector('#root');
    if (reactRoot) {
      console.log('Found React root, attempting to trigger update...');
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('force-events-update', { 
        detail: { events: forceEvents }
      }));
    }
    
    // Force page reload as last resort
    console.log('🔄 Forcing page reload as final attempt...');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }, 2000);
  
  // 6. Create verification function
  window.verifyForceDisplay = function() {
    console.log('🔍 Verifying force display...');
    
    // Check local storage
    const storedEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    console.log('Events in local storage:', storedEvents.length);
    
    // Check for "No events available" message
    const noEventsMessage = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('No events available')
    );
    
    if (noEventsMessage) {
      console.log('❌ Still showing "No events available" message');
      console.log('🔧 Attempting to remove message...');
      noEventsMessage.style.display = 'none';
      noEventsMessage.remove();
    }
    
    // Check for event cards
    const eventCards = document.querySelectorAll('.ev-card');
    console.log('Event cards found:', eventCards.length);
    
    if (eventCards.length > 0) {
      console.log('✅ SUCCESS! Events are displaying!');
    } else {
      console.log('❌ Still no events - trying direct DOM injection...');
      
      // Find the main content area
      const mainContent = document.querySelector('main, .container, [class*="content"]');
      if (mainContent) {
        console.log('Found main content area');
        // This would require more complex DOM manipulation
      }
    }
  };
  
  console.log('🔧 Verification function created: window.verifyForceDisplay()');
  
  // Auto-verify after 4 seconds
  setTimeout(() => {
    window.verifyForceDisplay();
  }, 4000);
}

// Run the force display
forceEventsDisplay();
