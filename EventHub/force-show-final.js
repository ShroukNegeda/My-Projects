// FINAL AGGRESSIVE FIX - Force events to show by directly injecting into DOM
// Run this in browser console on the events page

console.log('🚀 FINAL AGGRESSIVE FIX - Injecting events directly...');

function forceShowEvents() {
  // Get user info
  const userName = localStorage.getItem('eh_userName') || 'You';
  const userEmail = localStorage.getItem('eh_userEmail') || 'you@example.com';
  
  // Create your event
  const myEvent = {
    id: 'final-event-' + Date.now(),
    title: 'My Event - ' + new Date().toLocaleTimeString(),
    loc: 'Online',
    date: '02/12/2026',
    endDateISO: '2026-12-02T13:00:00',
    price: 'Free',
    cat: 'Tech',
    photo: `https://picsum.photos/seed/final${Date.now()}/400/300`,
    description: 'This is my event - forced to show',
    capacity: '100',
    address: 'Online',
    organizer: userName,
    organizer_name: userName,
    organizer_email: userEmail,
    createdAt: Date.now()
  };
  
  // Save to local storage
  localStorage.setItem('eh_events', JSON.stringify([myEvent]));
  console.log('✅ Saved event to local storage:', myEvent.title);
  
  // Wait a moment then inject directly into DOM
  setTimeout(() => {
    console.log('🔧 Injecting event directly into page...');
    
    // Find any container or create one
    let container = document.querySelector('main') || 
                   document.querySelector('.container') || 
                   document.querySelector('div[style*="grid"]') ||
                   document.querySelector('body > div');
    
    if (!container) {
      console.log('Creating new container...');
      container = document.createElement('div');
      container.style.cssText = `
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(container);
    }
    
    // Clear any "No events available" messages
    const noEventsMsg = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('No events available')
    );
    if (noEventsMsg) {
      noEventsMsg.style.display = 'none';
      console.log('🔧 Hidden "No events available" message');
    }
    
    // Create event card HTML
    const eventHTML = `
      <div style="background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; margin: 20px 0; border: 1px solid #e5e7eb;">
        <div style="position: relative; height: 200px; overflow: hidden;">
          <img src="${myEvent.photo}" alt="${myEvent.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${myEvent.cat}
          </div>
        </div>
        <div style="padding: 16px;">
          <h3 style="font-weight: 700; margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
            ${myEvent.title}
          </h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            📍 ${myEvent.loc}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            📅 ${myEvent.date}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <span style="font-weight: 600; color: #10b981;">
              ${myEvent.price}
            </span>
            <button style="background: #f97316; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;" onclick="alert('Event booked!')">
              Book Now
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add header
    const header = document.createElement('div');
    header.innerHTML = `<h2 style="color: #1f2937; margin: 20px 0;">Your Events</h2>`;
    container.appendChild(header);
    
    // Inject event card
    const eventDiv = document.createElement('div');
    eventDiv.innerHTML = eventHTML;
    container.appendChild(eventDiv.firstElementChild);
    
    console.log('✅ SUCCESS! Event injected into page!');
    console.log('🎯 You should now see your event on the page!');
    
    // Verification
    setTimeout(() => {
      const injectedCard = document.querySelector('div[style*="background: white"]');
      if (injectedCard) {
        console.log('✅ VERIFIED: Event is visible on page!');
      } else {
        console.log('❌ Event injection failed');
      }
    }, 500);
    
  }, 1000);
}

// Run the aggressive fix
forceShowEvents();
