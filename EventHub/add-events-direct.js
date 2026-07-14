// Direct script to add events to local storage and force them to appear
// Run this in browser console on the events page

console.log('🔧 Adding events directly to local storage...');

function addEventsDirectly() {
  // Get user info
  const userName = localStorage.getItem('eh_userName');
  const userEmail = localStorage.getItem('eh_userEmail');
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  
  // Create events with exact format expected by the events page
  const directEvents = [
    {
      id: 'direct-event-1-' + Date.now(),
      title: 'Direct Test Event 1',
      loc: 'Online',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: 'https://picsum.photos/seed/direct1/400/300',
      description: 'Direct test event',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'direct-event-2-' + Date.now(),
      title: 'Direct Test Event 2',
      loc: 'Conference Hall',
      date: '02/15/2026',
      endDateISO: '2026-12-15T14:00:00',
      price: '$50',
      cat: 'Design',
      photo: 'https://picsum.photos/seed/direct2/400/300',
      description: 'Another direct test event',
      capacity: '200',
      address: '123 Main Street',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    }
  ];
  
  // Save to local storage
  localStorage.setItem('eh_events', JSON.stringify(directEvents));
  console.log('✅ Saved', directEvents.length, 'events to local storage');
  
  // Verify they were saved
  const savedEvents = JSON.parse(localStorage.getItem('eh_events') || '[]');
  console.log('🔍 Verification - events in storage:', savedEvents.length);
  
  savedEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title} (ID: ${event.id})`);
    console.log(`   Organizer: ${event.organizer}`);
  });
  
  // Update organizer tracking
  if (userEmail) {
    const ownedKey = `eh_organizer_event_ids_v1_${userEmail.toLowerCase()}`;
    const eventIds = savedEvents.map(e => String(e.id));
    localStorage.setItem(ownedKey, JSON.stringify(eventIds));
    console.log('✅ Updated organizer tracking');
  }
  
  // Force page reload to trigger the direct override
  console.log('🔄 Reloading page to trigger direct override...');
  setTimeout(() => {
    location.reload();
  }, 1000);
}

// Run the direct event addition
addEventsDirectly();
