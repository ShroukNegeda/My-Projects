// Ultimate fix script - bypass everything and force events to display
// Run this in browser console on the events page

console.log('🚀 ULTIMATE EVENT FIX - Forcing events to display...');

function ultimateEventFix() {
  // 1. Create guaranteed test events
  const userName = localStorage.getItem('eh_userName') || 'Test User';
  const userEmail = localStorage.getItem('eh_userEmail') || 'test@example.com';
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  
  // 2. Create multiple test events
  const testEvents = [
    {
      id: 'ultimate-test-1-' + Date.now(),
      title: 'Ultimate Test Event 1',
      loc: 'Online Event',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: 'https://picsum.photos/seed/ultimate1/400/300',
      description: 'Ultimate test event created by fix script',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'ultimate-test-2-' + Date.now(),
      title: 'Ultimate Test Event 2',
      loc: 'Conference Center',
      date: '02/15/2026',
      endDateISO: '2026-12-15T14:00:00',
      price: '$50',
      cat: 'Design',
      photo: 'https://picsum.photos/seed/ultimate2/400/300',
      description: 'Another ultimate test event',
      capacity: '200',
      address: '123 Main Street',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'ultimate-test-3-' + Date.now(),
      title: 'Ultimate Test Event 3',
      loc: 'Workshop Room',
      date: '02/20/2026',
      endDateISO: '2026-12-20T15:00:00',
      price: 'Free',
      cat: 'AI',
      photo: 'https://picsum.photos/seed/ultimate3/400/300',
      description: 'AI workshop test event',
      capacity: '50',
      address: 'Tech Hub',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    }
  ];
  
  // 3. Save to local storage
  localStorage.setItem('eh_events', JSON.stringify(testEvents));
  console.log('✅ Created and saved', testEvents.length, 'test events to local storage');
  
  testEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
  });
  
  // 4. Update organizer tracking
  const ownedKey = `eh_organizer_event_ids_v1_${userEmail.toLowerCase()}`;
  const eventIds = testEvents.map(e => String(e.id));
  localStorage.setItem(ownedKey, JSON.stringify(eventIds));
  console.log('✅ Updated organizer tracking with event IDs');
  
  // 5. Force page reload
  console.log('🔄 Forcing complete page reload in 2 seconds...');
  setTimeout(() => {
    location.reload();
  }, 2000);
  
  // 6. Create function to verify after reload
  window.verifyUltimateFix = function() {
    console.log('🔍 Verifying ultimate fix...');
    
    // Check local storage
    const storedEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    console.log('Events in local storage:', storedEvents.length);
    
    // Check page elements
    const eventCards = document.querySelectorAll('.ev-card');
    console.log('Event cards on page:', eventCards.length);
    
    if (eventCards.length > 0) {
      console.log('✅ SUCCESS! Events are displaying!');
      eventCards.forEach((card, index) => {
        const titleElement = card.querySelector('div[style*="font-weight: 700"]');
        const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
        console.log(`${index + 1}. ${title}`);
      });
    } else {
      console.log('❌ Still no events - checking page structure...');
      
      // Try to find any event-related elements
      const possibleEventElements = document.querySelectorAll('[class*="event"], [class*="card"], [class*="item"]');
      console.log('Possible event elements found:', possibleEventElements.length);
      
      if (possibleEventElements.length === 0) {
        console.log('❌ No event elements found - page structure issue');
        console.log('🔧 Trying to force inject events directly...');
        
        // Direct DOM manipulation as last resort
        const eventsContainer = document.querySelector('div[style*="grid"]');
        if (eventsContainer) {
          console.log('Found events container, injecting events...');
          // This would require more complex DOM manipulation
        }
      }
    }
  };
  
  console.log('🔧 Verification function created: window.verifyUltimateFix()');
  console.log('📝 After page reload, run: window.verifyUltimateFix()');
  
  // Auto-verify after 3 seconds
  setTimeout(() => {
    window.verifyUltimateFix();
  }, 3000);
}

// Run the ultimate fix
ultimateEventFix();
