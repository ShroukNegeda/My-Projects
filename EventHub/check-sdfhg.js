const BASE = 'https://eventhub.huma-volve.com/api/v1';

fetch(BASE + '/events')
  .then(r => r.json())
  .then(data => {
    console.log('Total events from backend:');
    let events = [];
    if (Array.isArray(data)) events = data;
    else if (data.data && Array.isArray(data.data)) events = data.data;
    else if (data.events && Array.isArray(data.events)) events = data.events;
    else if (data.message && Array.isArray(data.message)) events = data.message;
    
    console.log('Found', events.length, 'events');
    
    const sdfhg = events.find(e => 
      String(e.title || e.name || '').toLowerCase().includes('sdfhg')
    );
    
    if (sdfhg) {
      console.log('✓ FOUND event named sdfhg:');
      console.log(JSON.stringify(sdfhg, null, 2));
    } else {
      console.log('✗ Event named sdfhg NOT found in backend');
      console.log('\nSample events:');
      events.slice(0, 5).forEach(e => {
        console.log('  -', e.id, ':', e.title || e.name);
      });
    }
  })
  .catch(err => { console.error('Error:', err.message); process.exit(1); });
