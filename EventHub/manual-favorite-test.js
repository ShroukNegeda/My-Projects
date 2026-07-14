// Manual favorite test - add any event to favorites
// Run this in browser console

console.log('🧪 Manual favorite test...');

// 1. Get user info
const userEmail = localStorage.getItem('eh_userEmail');
if (!userEmail) {
  console.error('❌ Please log in first');
} else {
  console.log('✅ User logged in:', userEmail);
}

// 2. Create a simple test event
const testEvent = {
  id: 'manual-test-' + Date.now(),
  title: 'Manual Test Event',
  loc: 'Test Location',
  date: '2026-05-02',
  price: 'Free',
  cat: 'Tech',
  photo: 'https://picsum.photos/seed/manual/400/300'
};

// 3. Add to correct storage location
const favKey = `eh_favorites_${userEmail}`;
const currentFavorites = JSON.parse(localStorage.getItem(favKey) || '[]');
const newFavorites = [...currentFavorites, testEvent];

localStorage.setItem(favKey, JSON.stringify(newFavorites));

console.log('✅ Added test event to favorites');
console.log('📊 Total favorites:', newFavorites.length);
console.log('🔑 Storage key:', favKey);

// 4. Verify
const verify = JSON.parse(localStorage.getItem(favKey) || '[]');
console.log('🔍 Verification - favorites in storage:', verify.length);

// 5. Show what should appear on favorites page
console.log('📋 Events that should appear on favorites page:');
verify.forEach((fav, index) => {
  console.log(`${index + 1}. ${fav.title} (${fav.id})`);
});

console.log('💡 Now go to the favorites page to see if this event appears');
