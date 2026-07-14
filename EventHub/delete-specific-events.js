// Script to find and delete specific events from backend
// Run this in browser console on the events page

async function deleteSpecificEvents() {
  console.log('🔍 Searching for "anything" and "trrt" events...');
  
  try {
    // Get all events from API
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
    
    // Find the specific events
    const targetEvents = events.filter(event => 
      event.title && (
        event.title.toLowerCase().includes('anything') || 
        event.title.toLowerCase().includes('trrt')
      )
    );
    
    console.log(`🎯 Found ${targetEvents.length} target events:`, targetEvents);
    
    if (targetEvents.length === 0) {
      console.log('❌ No "anything" or "trrt" events found in backend');
      return;
    }
    
    // Delete each target event
    for (const event of targetEvents) {
      console.log(`🗑️ Deleting event: ${event.title} (ID: ${event.id})`);
      
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
        } else {
          console.log(`⚠️ Failed to delete ${event.title}: ${deleteResponse.status}`);
        }
      } catch (err) {
        console.log(`❌ Error deleting ${event.title}:`, err.message);
      }
    }
    
    // Also clear from local storage
    console.log('🧹 Clearing local storage...');
    localStorage.removeItem('eh_events');
    
    const keys = Object.keys(localStorage).filter(key => key.startsWith('eh_organizer_event_ids_v1_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Cleanup complete! Refreshing page...');
    setTimeout(() => location.reload(), 2000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Trying local storage cleanup only...');
    
    localStorage.removeItem('eh_events');
    const keys = Object.keys(localStorage).filter(key => key.startsWith('eh_organizer_event_ids_v1_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Local storage cleared! Refreshing...');
    setTimeout(() => location.reload(), 1000);
  }
}

// Run the function
deleteSpecificEvents();
