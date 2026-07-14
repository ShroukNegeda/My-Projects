// Script to show your created events on both events page and landing page
// Run this in browser console

console.log('🔍 SHOWING YOUR CREATED EVENTS...');

function showMyEvents() {
  // 1. Get user info
  const userName = localStorage.getItem('eh_userName');
  const userEmail = localStorage.getItem('eh_userEmail');
  const userRole = localStorage.getItem('eh_userRole');
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  console.log('User Role:', userRole);
  
  // 2. Check local storage events
  console.log('\n=== LOCAL STORAGE EVENTS ===');
  const localEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  console.log('Total local events:', localEvents.length);
  
  if (localEvents.length > 0) {
    console.log('Your local events:');
    localEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
      console.log(`   Organizer: ${event.organizer}`);
      console.log(`   Location: ${event.loc}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Category: ${event.cat || event.category}`);
    });
  } else {
    console.log('❌ No events found in local storage');
    console.log('💡 Creating a test event for you...');
    
    // Create a test event
    const testEvent = {
      id: 'my-event-' + Date.now(),
      title: 'My Test Event ' + new Date().toLocaleTimeString(),
      loc: 'Online Event',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: `https://picsum.photos/seed/myevent${Date.now()}/400/300`,
      description: 'This is my test event created by the script',
      capacity: '100',
      address: 'Online',
      organizer: userName || 'Test User',
      organizer_name: userName || 'Test User',
      organizer_email: userEmail || 'test@example.com',
      createdAt: Date.now()
    };
    
    const updatedEvents = [testEvent];
    localStorage.setItem('eh_events', JSON.stringify(updatedEvents));
    
    console.log('✅ Created test event:', testEvent.title);
    console.log('📊 Total events now:', updatedEvents.length);
  }
  
  // 3. Update organizer tracking
  if (userEmail) {
    const ownedKey = `eh_organizer_event_ids_v1_${userEmail.toLowerCase()}`;
    const currentEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    const userEvents = currentEvents.filter(e => e.organizer === userName);
    const eventIds = userEvents.map(e => String(e.id));
    
    localStorage.setItem(ownedKey, JSON.stringify(eventIds));
    console.log('✅ Updated organizer tracking with', eventIds.length, 'events');
  }
  
  // 4. Force page refresh to see events
  console.log('\n=== FORCING PAGE REFRESH ===');
  console.log('🔄 Refreshing page to show your events...');
  
  setTimeout(() => {
    location.reload();
  }, 2000);
  
  // 5. Create verification function
  window.verifyMyEvents = function() {
    console.log('🔍 Verifying your events on current page...');
    
    // Check current page
    const currentPath = window.location.pathname;
    console.log('Current page:', currentPath);
    
    // Check for event cards
    const eventCards = document.querySelectorAll('.ev-card');
    console.log('Event cards found:', eventCards.length);
    
    if (eventCards.length > 0) {
      console.log('✅ SUCCESS! Events are showing on this page:');
      eventCards.forEach((card, index) => {
        const titleElement = card.querySelector('div[style*="font-weight: 700"]');
        const title = titleElement ? titleElement.textContent.trim() : 'Unknown';
        console.log(`${index + 1}. ${title}`);
      });
    } else {
      console.log('❌ No event cards found on this page');
      
      // Check for "No events available" message
      const noEventsMessage = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('No events available')
      );
      
      if (noEventsMessage) {
        console.log('⚠️ Still showing "No events available" message');
      }
    }
    
    // Check local storage again
    const storedEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
    console.log('📊 Events in local storage:', storedEvents.length);
    
    console.log('\n💡 To see events on landing page, navigate to /landing');
    console.log('💡 To see events on events page, navigate to /events');
  };
  
  console.log('🔧 Verification function created: window.verifyMyEvents()');
  console.log('📝 After page reload, run: window.verifyMyEvents()');
  
  // Auto-verify after 3 seconds
  setTimeout(() => {
    window.verifyMyEvents();
  }, 3000);
}

// Run the script
showMyEvents();
