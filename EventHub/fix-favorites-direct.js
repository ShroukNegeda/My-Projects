// Direct favorites fix script
// Run this in browser console on the events page

console.log('🔧 Direct favorites fix starting...');

function fixFavoritesDirectly() {
  // 1. Get current user info
  const userEmail = localStorage.getItem('eh_userEmail');
  const userName = localStorage.getItem('eh_userName');
  console.log('User info:', { userEmail, userName });
  
  if (!userEmail) {
    console.error('❌ No user email found - please log in first');
    return;
  }
  
  // 2. Check both storage locations
  const oldKey = 'eh_favorites';
  const newKey = `eh_favorites_${userEmail}`;
  
  const oldFavorites = JSON.parse(localStorage.getItem(oldKey) || '[]');
  const newFavorites = JSON.parse(localStorage.getItem(newKey) || '[]');
  
  console.log('Old storage:', oldKey, oldFavorites.length, 'items');
  console.log('New storage:', newKey, newFavorites.length, 'items');
  
  // 3. If there are favorites in old location, move them to new location
  if (oldFavorites.length > 0 && newFavorites.length === 0) {
    console.log('🔄 Moving favorites from old to new location...');
    localStorage.setItem(newKey, JSON.stringify(oldFavorites));
    console.log('✅ Moved', oldFavorites.length, 'favorites to new location');
    
    // Clear old location to avoid confusion
    localStorage.removeItem(oldKey);
    console.log('🧹 Cleared old location');
  }
  
  // 4. Get current events from the page to test with
  const eventCards = document.querySelectorAll('.ev-card');
  console.log('📋 Found', eventCards.length, 'event cards on page');
  
  if (eventCards.length === 0) {
    console.log('⚠️ No event cards found - make sure you\'re on the events page');
    return;
  }
  
  // 5. Extract first event for testing
  const firstCard = eventCards[0];
  const titleElement = firstCard.querySelector('div[style*="font-weight: 700"]');
  const eventTitle = titleElement ? titleElement.textContent.trim() : 'Unknown Event';
  
  console.log('🎯 Found event for testing:', eventTitle);
  
  // 6. Create a test favorite event
  const testEvent = {
    id: 'test-fav-' + Date.now(),
    title: eventTitle,
    loc: 'Test Location',
    date: '2026-05-02',
    price: 'Free',
    cat: 'Tech',
    photo: 'https://picsum.photos/seed/test/400/300'
  };
  
  // 7. Add test favorite to the correct location
  const currentFavorites = JSON.parse(localStorage.getItem(newKey) || '[]');
  const updatedFavorites = [...currentFavorites, testEvent];
  localStorage.setItem(newKey, JSON.stringify(updatedFavorites));
  
  console.log('✅ Added test favorite to:', newKey);
  console.log('📊 Total favorites now:', updatedFavorites.length);
  
  // 8. Verify it was saved
  const verification = JSON.parse(localStorage.getItem(newKey) || '[]');
  console.log('🔍 Verification - favorites in storage:', verification.length);
  
  // 9. Create a function to manually refresh favorites page
  window.refreshFavorites = function() {
    console.log('🔄 Refreshing favorites...');
    
    // Trigger a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
      detail: { favorites: verification }
    }));
    
    // Also try to reload if needed
    if (window.location.pathname.includes('/favorites')) {
      console.log('📄 On favorites page, reloading...');
      location.reload();
    } else {
      console.log('📄 Navigate to favorites page to see results');
    }
  };
  
  console.log('✅ Fix complete!');
  console.log('🔧 Test function created: window.refreshFavorites()');
  console.log('📝 Go to favorites page and run: window.refreshFavorites()');
  
  return {
    oldFavorites: oldFavorites.length,
    newFavorites: newFavorites.length,
    testAdded: true,
    storageKey: newKey
  };
}

// Run the fix
const result = fixFavoritesDirectly();
console.log('🎯 Fix result:', result);
