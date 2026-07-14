// Script to delete specific backend events: erwer, anything, trrt
// Run this in browser console on the events page

console.log('🗑️ Deleting specific backend events: erwer, anything, trrt...');

async function deleteSpecificBackendEvents() {
  const targetTitles = ['erwer', 'anything', 'trrt'];
  let deletedCount = 0;
  
  try {
    // Get all events from backend
    console.log('📡 Fetching events from backend...');
    const response = await fetch('https://eventhub.huma-volve.com/api/v1/events', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('eh_token') || '')
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const events = data.data || data.message?.data || [];
    
    console.log(`📋 Found ${events.length} events total`);
    
    // Find target events
    const targetEvents = events.filter(event => 
      event.title && targetTitles.some(title => 
        event.title.toLowerCase().includes(title.toLowerCase())
      )
    );
    
    console.log(`🎯 Found ${targetEvents.length} target events to delete:`);
    targetEvents.forEach(event => {
      console.log(`  - ${event.title} (ID: ${event.id})`);
    });
    
    if (targetEvents.length === 0) {
      console.log('❌ No target events found in backend');
      return;
    }
    
    // Delete each target event
    for (const event of targetEvents) {
      console.log(`🗑️ Deleting: ${event.title} (ID: ${event.id})`);
      
      try {
        const deleteResponse = await fetch(`https://eventhub.huma-volve.com/api/v1/events/${event.id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('eh_token') || '')
          }
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Successfully deleted: ${event.title}`);
          deletedCount++;
        } else {
          console.log(`⚠️ Failed to delete ${event.title}: ${deleteResponse.status} ${deleteResponse.statusText}`);
        }
      } catch (err) {
        console.log(`❌ Error deleting ${event.title}: ${err.message}`);
      }
    }
    
    console.log(`📊 Deletion complete. Successfully deleted: ${deletedCount}/${targetEvents.length} events`);
    
    // Also clear any local storage remnants
    console.log('🧹 Clearing local storage remnants...');
    localStorage.removeItem('eh_events');
    
    const keys = Object.keys(localStorage).filter(key => key.startsWith('eh_organizer_event_ids_v1_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Local storage cleared');
    console.log('🔄 Refreshing page in 2 seconds...');
    
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error during deletion:', error.message);
    
    // Fallback - just clear local storage
    console.log('💡 Running fallback cleanup...');
    localStorage.removeItem('eh_events');
    
    const keys = Object.keys(localStorage).filter(key => key.startsWith('eh_organizer_event_ids_v1_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Fallback cleanup complete! Refreshing...');
    setTimeout(() => location.reload(), 1000);
  }
}

// Run the deletion
deleteSpecificBackendEvents();
