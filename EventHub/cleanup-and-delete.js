// Combined script to fix favorite errors and delete specific events
// Run this in browser console on the events page

console.log('🔧 Starting cleanup and deletion process...');

async function cleanupAndDelete() {
  try {
    // 1. First, clear any problematic favorite states
    console.log('🧹 Clearing favorite states...');
    const favorites = JSON.parse(localStorage.getItem('eh_favorites') || '[]');
    console.log(`📋 Found ${favorites.length} favorites, clearing...`);
    localStorage.removeItem('eh_favorites');
    
    // 2. Find and delete specific events
    console.log('🔍 Searching for "anything" and "trrt" events...');
    
    const response = await fetch('https://eventhub.huma-volve.com/api/v1/events', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('eh_token') || '')
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const events = data.data || data.message?.data || [];
      
      const targetEvents = events.filter(event => 
        event.title && (
          event.title.toLowerCase().includes('anything') || 
          event.title.toLowerCase().includes('trrt')
        )
      );
      
      console.log(`🎯 Found ${targetEvents.length} target events:`, targetEvents.map(e => `${e.title} (ID: ${e.id})`));
      
      for (const event of targetEvents) {
        console.log(`🗑️ Deleting: ${event.title}`);
        
        try {
          const deleteResponse = await fetch(`https://eventhub.huma-volve.com/api/v1/events/${event.id}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + (localStorage.getItem('eh_token') || '')
            }
          });
          
          if (deleteResponse.ok) {
            console.log(`✅ Deleted: ${event.title}`);
          } else {
            console.log(`⚠️ Backend delete failed for ${event.title}, will clear locally`);
          }
        } catch (err) {
          console.log(`❌ Error deleting ${event.title}: ${err.message}`);
        }
      }
    } else {
      console.log('⚠️ Could not fetch events from backend, will clear local storage only');
    }
    
    // 3. Clear local storage completely
    console.log('🧹 Clearing all local storage...');
    localStorage.removeItem('eh_events');
    localStorage.removeItem('eh_favorites');
    
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('eh_organizer_event_ids_v1_') || 
      key.startsWith('eh_favorites_')
    );
    keys.forEach(key => localStorage.removeItem(key));
    
    // 4. Clear any auth issues
    if (!localStorage.getItem('eh_token')) {
      console.log('🔐 No auth token found, clearing user data');
      localStorage.removeItem('eh_userId');
    }
    
    console.log('✅ Cleanup complete!');
    console.log('🔄 Refreshing page in 2 seconds...');
    
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    
    // Fallback - just clear local storage
    console.log('💡 Running fallback cleanup...');
    localStorage.removeItem('eh_events');
    localStorage.removeItem('eh_favorites');
    
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('eh_organizer_event_ids_v1_') || 
      key.startsWith('eh_favorites_')
    );
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Fallback cleanup complete! Refreshing...');
    setTimeout(() => location.reload(), 1000);
  }
}

// Run the cleanup
cleanupAndDelete();
