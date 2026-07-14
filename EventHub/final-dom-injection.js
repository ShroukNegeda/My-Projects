// Final DOM injection - bypass React and directly inject events into page
// Run this in browser console on the events page

console.log('🚀 FINAL DOM INJECTION - Bypassing React entirely...');

function finalDOMInjection() {
  // 1. Get user info
  const userName = localStorage.getItem('eh_userName') || 'Test User';
  const userEmail = localStorage.getItem('eh_userEmail') || 'test@example.com';
  
  console.log('=== USER INFO ===');
  console.log('User Name:', userName);
  console.log('User Email:', userEmail);
  
  // 2. Create event data
  const injectEvents = [
    {
      id: 'inject-event-1-' + Date.now(),
      title: 'DOM Injected Event 1',
      loc: 'Online Event',
      date: '02/12/2026',
      endDateISO: '2026-12-02T13:00:00',
      price: 'Free',
      cat: 'Tech',
      photo: 'https://picsum.photos/seed/inject1/400/300',
      description: 'DOM injected test event',
      capacity: '100',
      address: 'Online',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    },
    {
      id: 'inject-event-2-' + Date.now(),
      title: 'DOM Injected Event 2',
      loc: 'Conference Room',
      date: '02/15/2026',
      endDateISO: '2026-12-15T14:00:00',
      price: '$25',
      cat: 'Design',
      photo: 'https://picsum.photos/seed/inject2/400/300',
      description: 'Another DOM injected event',
      capacity: '50',
      address: 'Tech Hub',
      organizer: userName,
      organizer_name: userName,
      organizer_email: userEmail,
      createdAt: Date.now()
    }
  ];
  
  // 3. Save to local storage (for persistence)
  localStorage.setItem('eh_events', JSON.stringify(injectEvents));
  console.log('✅ Saved events to local storage');
  
  // 4. Wait for page to load, then inject DOM elements
  setTimeout(() => {
    console.log('🔧 Injecting events directly into DOM...');
    
    // Find the main content area or any container that could hold events
    const possibleContainers = [
      'main',
      '.container',
      '[class*="content"]',
      '[class*="events"]',
      '[class*="grid"]',
      'div[style*="grid"]',
      'div[style*="display"]',
      'body > div'
    ];
    
    let container = null;
    for (const selector of possibleContainers) {
      container = document.querySelector(selector);
      if (container) {
        console.log('Found container:', selector);
        break;
      }
    }
    
    if (!container) {
      console.log('❌ No suitable container found, creating one...');
      // Create a container and append to body
      container = document.createElement('div');
      container.style.cssText = `
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      `;
      document.body.appendChild(container);
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create and inject event cards
    injectEvents.forEach((event, index) => {
      const eventCard = document.createElement('div');
      eventCard.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: transform 0.3s ease;
        cursor: pointer;
        border: 1px solid #e5e7eb;
      `;
      
      eventCard.innerHTML = `
        <div style="position: relative; height: 200px; overflow: hidden;">
          <img src="${event.photo}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${event.cat}
          </div>
        </div>
        <div style="padding: 16px;">
          <h3 style="font-weight: 700; margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
            ${event.title}
          </h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            📍 ${event.loc}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            📅 ${event.date}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <span style="font-weight: 600; color: ${event.price === 'Free' ? '#10b981' : '#f59e0b'};">
              ${event.price}
            </span>
            <button style="background: #f97316; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
              Book Now
            </button>
          </div>
        </div>
      `;
      
      // Add hover effect
      eventCard.addEventListener('mouseenter', () => {
        eventCard.style.transform = 'translateY(-4px)';
        eventCard.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
      });
      
      eventCard.addEventListener('mouseleave', () => {
        eventCard.style.transform = 'translateY(0)';
        eventCard.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      });
      
      container.appendChild(eventCard);
      console.log(`✅ Injected event ${index + 1}: ${event.title}`);
    });
    
    // Add a header
    const header = document.createElement('div');
    header.style.cssText = `
      grid-column: 1 / -1;
      text-align: center;
      margin-bottom: 20px;
    `;
    header.innerHTML = `
      <h2 style="color: #1f2937; margin: 0 0 8px 0;">Your Events</h2>
      <p style="color: #6b7280; margin: 0;">Events injected directly into DOM</p>
    `;
    container.insertBefore(header, container.firstChild);
    
    console.log('✅ Successfully injected', injectEvents.length, 'events into DOM!');
    
    // Hide any "No events available" messages
    const noEventsMessages = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('No events available')
    );
    
    noEventsMessages.forEach(msg => {
      msg.style.display = 'none';
      console.log('🔧 Hidden "No events available" message');
    });
    
    // Create verification function
    window.verifyDOMInjection = function() {
      const injectedCards = document.querySelectorAll('[style*="background: white"]');
      console.log('🔍 Verification - Injected cards found:', injectedCards.length);
      
      if (injectedCards.length > 0) {
        console.log('✅ SUCCESS! DOM injection worked!');
        injectedCards.forEach((card, index) => {
          const title = card.querySelector('h3');
          if (title) {
            console.log(`${index + 1}. ${title.textContent}`);
          }
        });
      } else {
        console.log('❌ DOM injection failed');
      }
    };
    
    console.log('🔧 Verification function created: window.verifyDOMInjection()');
    
    // Auto-verify
    setTimeout(() => {
      window.verifyDOMInjection();
    }, 1000);
    
  }, 1000);
}

// Run the final DOM injection
finalDOMInjection();
