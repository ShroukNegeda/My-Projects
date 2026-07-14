const BASE = 'https://eventhub.huma-volve.com/api/v1';

fetch(BASE + '/events')
  .then(async (r) => {
    const data = await r.json();
    const events = Array.isArray(data)
      ? data
      : data.data && Array.isArray(data.data)
      ? data.data
      : data.events && Array.isArray(data.events)
      ? data.events
      : [];

    console.log('count', events.length);
    const types = [...new Set(events.map((e) => String(e.type || e.event_type || '').trim()).filter(Boolean))];
    console.log('types', types);
    events.slice(0, 20).forEach((e, i) => {
      console.log(i, e.id, e.title || e.name, 'type=', e.type || e.event_type, 'loc=', e.location || e.venue_name);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
