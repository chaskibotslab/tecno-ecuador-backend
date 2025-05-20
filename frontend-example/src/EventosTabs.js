import React, { useState } from 'react';
import EventosList from './EventosList';

export default function EventosTabs() {
  const [tab, setTab] = useState('todos');
  return (
    <div style={{maxWidth: 900, margin: '0 auto', background:'#23272f', borderRadius:18, boxShadow:'0 4px 32px #0007', padding: '24px 0 32px 0'}}>
      
      <EventosList tipo={tab} />
    </div>
  );
}
