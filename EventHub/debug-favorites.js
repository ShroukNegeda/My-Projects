// Comprehensive favorites debugging script
// Run this in browser console on the events page

console.log('🔍 Starting favorites debugging...');

function debugFavorites() {
  // 1. Check current favorites state
  console.log('=== CURRENT STATE ===');
  console.log('Current favorites from context:', window.appContext?.favorites || 'No context found');
  
  // 2. Check local storage (both old and new keys)
  console.log('=== LOCAL STORAGE ===');
  const userEmail = localStorage.getItem('eh_userEmail');
  console.log('Current user email:', userEmail);
  
  const oldKeyFavorites = JSON.parse(localStorage.getItem('eh_favorites') || '[]');
  const newKeyFavorites = JSON.parse(localStorage.getItem(userEmail ? `eh_favorites_${userEmail}` : 'eh_favorites') || '[]');
  
  console.log('Old key (eh_favorites) favorites:', oldKeyFavorites);
  console.log('New key (per-user) favorites:', newKeyFavorites);
  console.log('Old key count:', oldKeyFavorites.length);
  console.log('New key count:', newKeyFavorites.length);
  
  // 3. Check all localStorage keys
  console.log('=== ALL LOCAL STORAGE KEYS ===');
  const allKeys = Object.keys(localStorage);
  const favKeys = allKeys.filter(key => key.includes('fav'));
  console.log('Favorite-related keys:', favKeys);
  
  // 4. Test manual favorite toggle
  console.log('=== TEST MANUAL FAVORITE ===');
  const testEvent = {
    id: 'test-' + Date.now(),
    title: 'Test Event',
    loc: 'Test Location',
    date: '2026-05-02',
    price: 'Free',
    cat: 'Tech',
    photo: 'https://picsum.photos/seed/test/400/300'
  };
  
  // Add test favorite to local storage (use correct per-user key)
  const favKey = userEmail ? `eh_favorites_${userEmail}` : 'eh_favorites';
  const currentFavorites = JSON.parse(localStorage.getItem(favKey) || '[]');
  const updatedFavorites = [...currentFavorites, testEvent];
  localStorage.setItem(favKey, JSON.stringify(updatedFavorites));
  console.log('Added test favorite to local storage with key:', favKey);
  
  // 5. Verify it was saved
  const verifyFavorites = JSON.parse(localStorage.getItem(favKey) || '[]');
  console.log('Verification - favorites after adding test:', verifyFavorites);
  
  // 6. Check if favorites page would see this
  console.log('=== FAVORITES PAGE SIMULATION ===');
  console.log('Favorites page would see:', verifyFavorites.length, 'favorites');
  
  // 7. Clean up test event
  const cleanedFavorites = verifyFavorites.filter(f => f.id !== testEvent.id);
  localStorage.setItem(favKey, JSON.stringify(cleanedFavorites));
  console.log('Cleaned up test event');
  
  // 8. Check for any React state issues
  console.log('=== REACT STATE CHECK ===');
  console.log('Window location:', window.location.href);
  console.log('User logged in:', !!localStorage.getItem('eh_token'));
  
  console.log('=== DEBUGGING COMPLETE ===');
  console.log('💡 If you see favorites in local storage but not on the favorites page,');
  console.log('   the issue is likely in the favorites page component.');
  console.log('💡 If you see no favorites in local storage, the issue is in the events page.');
}

// Run debug
debugFavorites();

// Also create a manual test function
window.testFavorite = function(event) {
  console.log('🧪 Testing favorite toggle for:', event);
  
  const userEmail = localStorage.getItem('eh_userEmail');
  const favKey = userEmail ? `eh_favorites_${userEmail}` : 'eh_favorites';
  const currentFavorites = JSON.parse(localStorage.getItem(favKey) || '[]');
  const isFav = currentFavorites.some(f => f.id === event.id);
  
  let newFavorites;
  if (isFav) {
    newFavorites = currentFavorites.filter(f => f.id !== event.id);
    console.log('❤️ Removed from favorites');
  } else {
    newFavorites = [...currentFavorites, event];
    console.log('💕 Added to favorites');
  }
  
  localStorage.setItem(favKey, JSON.stringify(newFavorites));
  console.log('✅ Updated local storage with key:', favKey);
  console.log('📊 Total favorites:', newFavorites.length);
  
  return newFavorites;
};

console.log('🔧 Test function created: window.testFavorite(event)');
console.log('📝 Usage: window.testFavorite(yourEventObject)');
