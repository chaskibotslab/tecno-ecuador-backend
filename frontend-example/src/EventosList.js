import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EventosList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [tab, setTab] = useState('todos');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroClasificacion, setFiltroClasificacion] = useState('');

  useEffect(() => {
    async function fetchEventos() {
      setLoading(true);
      setError('');
      try {
        // Cambia estos valores según tu estructura de Airtable
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'eventos',
          action: 'list'
        });
        setEventos(res.data.records || []);
      } catch (err) {
        setError('No se pudieron cargar los eventos');
      }
      setLoading(false);
    }
    fetchEventos();
  }, []);

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p>{error}</p>;
  if (!eventos.length) return <p>No hay eventos registrados.</p>;

  // Filtros y búsqueda
  const eventosFiltrados = eventos.filter(ev => {
    const f = ev.fields || {};
    // Búsqueda general
    const texto = (
      (f.nombre_evento || '') + ' ' +
      (f.descripcion || '') + ' ' +
      (f.ubicacion || '') + ' ' +
      (f.tipo_evento || '') + ' ' +
      (f.organizador || '') + ' ' +
      (f.pais || '')
    ).toLowerCase();
    if (busqueda && !texto.includes(busqueda.toLowerCase())) return false;
    // Filtro por año
    if (filtroAnio) {
      const anio = (f.fecha || '').slice(0,4);
      if (anio !== filtroAnio) return false;
    }
    // Filtro por clasificación
    if (filtroClasificacion && f.clasificacion !== filtroClasificacion) return false;
    return true;
  });

  const eventosEcuatorianos = eventos.filter(ev => (ev.fields?.clasificacion || '').toLowerCase().includes('ecuatoriano'));
  const eventosInternacionales = eventos.filter(ev => (ev.fields?.clasificacion || '').toLowerCase().includes('internacional'));

  // Años únicos para filtro
  const anios = Array.from(new Set(eventos.map(ev => (ev.fields?.fecha || '').slice(0,4)).filter(a=>a))).sort();
  // Clasificaciones únicas
  const clasificaciones = Array.from(new Set(eventos.map(ev => ev.fields?.clasificacion).filter(c=>c)));

  function renderTable(eventos, titulo) {
    return (
      <>
        <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:30}}>
          <button onClick={() => setTab('todos')} style={{background:tab==='todos'?'#FFDD00':'#23272f',color:tab==='todos'?'#23272f':'#FFDD00',fontWeight:900,border:'none',borderRadius:8,padding:'12px 28px',fontSize:18,boxShadow:tab==='todos'?'0 2px 8px #0033A0':'none',cursor:'pointer'}}>Todos</button>
          <button onClick={() => setTab('ecuatorianos')} style={{background:tab==='ecuatorianos'?'#0033A0':'#23272f',color:tab==='ecuatorianos'?'#FFDD00':'#0033A0',fontWeight:900,border:'none',borderRadius:8,padding:'12px 28px',fontSize:18,boxShadow:tab==='ecuatorianos'?'0 2px 8px #FFDD00':'none',cursor:'pointer'}}>Ecuatorianos</button>
          <button onClick={() => setTab('internacionales')} style={{background:tab==='internacionales'?'#EF3340':'#23272f',color:tab==='internacionales'?'#FFDD00':'#EF3340',fontWeight:900,border:'none',borderRadius:8,padding:'12px 28px',fontSize:18,boxShadow:tab==='internacionales'?'0 2px 8px #FFDD00':'none',cursor:'pointer'}}>Internacionales</button>
        </div>
        <div style={{marginBottom:40}}>
          <h3 style={{color:'#FFDD00', textAlign:'center', fontWeight:900, textShadow:'0 2px 8px #0033A0', marginTop:30}}>{titulo}</h3>
          {eventos.length === 0 ? (
            <p style={{textAlign:'center',color:'#aaa',fontWeight:600}}>No hay eventos registrados en esta categoría.</p>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse', background:'#23272f', color:'#FFDD00', border:'2px solid #0033A0', borderRadius:10, boxShadow:'0 2px 12px #0033A055'}}>
              <thead>
                <tr style={{background:'#0033A0',color:'#FFDD00'}}>
                  <th style={{padding:8}}>Nombre</th>
                  <th style={{padding:8}}>Descripción</th>
                  <th style={{padding:8}}>Fecha</th>
                  <th style={{padding:8}}>Ubicación</th>
                  <th style={{padding:8}}>Tipo</th>
                  <th style={{padding:8}}>Clasificación</th>
                  <th style={{padding:8}}>Afiche</th>
                  <th style={{padding:8}}>Organizador</th>
                  <th style={{padding:8}}>País</th>
                  <th style={{padding:8}}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(ev => (
                  <tr key={ev.id} style={{background:'#23272f',color:'#fff',borderBottom:'1px solid #0033A0'}}>
                    <td style={{padding:8, color:'#FFDD00', fontWeight:'bold'}}>{ev.fields?.nombre_evento || 'Sin nombre'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.descripcion || 'Sin descripción'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.fecha || 'Sin fecha'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.ubicacion || 'Sin ubicación'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.tipo_evento || 'Sin tipo'}</td>
                    <td style={{padding:8, color:'#FFDD00', fontWeight:'bold'}}>{ev.fields?.clasificacion || 'Sin clasificación'}</td>
                    <td style={{padding:8}}>
                      {ev.fields?.afiche_url && (Array.isArray(ev.fields.afiche_url)
                        ? (ev.fields.afiche_url[0]?.url
                          ? <img src={ev.fields.afiche_url[0].url} alt="afiche" style={{maxWidth:70,maxHeight:70,objectFit:'contain',borderRadius:8,cursor:'zoom-in'}} onClick={()=>setAmpliarImg(ev.fields.afiche_url[0].url)} />
                          : 'Sin afiche')
                        : <img src={ev.fields.afiche_url} alt="afiche" style={{maxWidth:70,maxHeight:70,objectFit:'contain',borderRadius:8,cursor:'zoom-in'}} onClick={()=>setAmpliarImg(ev.fields.afiche_url)} />)
                      || 'Sin afiche'}
                    </td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.organizador || 'Sin organizador'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.pais || 'Sin país'}</td>
                    <td style={{padding:8, color:'#fff'}}>{ev.fields?.estado_aprobacion || 'Sin estado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  return (
    <div style={{maxWidth: '98vw', margin:'2rem auto', overflowX:'auto'}}>
      {tab === 'todos' && renderTable(eventos, 'Todos los Eventos')}
      {tab === 'ecuatorianos' && renderTable(eventosEcuatorianos, 'Eventos Ecuatorianos')}
      {tab === 'internacionales' && renderTable(eventosInternacionales, 'Eventos Internacionales')}
      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div onClick={()=>setAmpliarImg(null)} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={ampliarImg} alt="afiche ampliado" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:18,boxShadow:'0 4px 32px #FFDD00'}} />
          <button onClick={e=>{e.stopPropagation();setAmpliarImg(null);}} style={{position:'fixed',top:30,right:30,fontSize:30,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:40,width:50,height:50,cursor:'pointer'}}>✖</button>
        </div>
      )}
    </div>
  );
}
