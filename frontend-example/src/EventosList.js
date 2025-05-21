import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Paleta de colores moderna y profesional
const theme = {
  primary: '#2563EB',       // Azul principal
  secondary: '#10B981',     // Verde/turquesa 
  accent: '#F97316',        // Naranja 
  background: '#F8FAFC',    // Fondo claro
  darkBg: '#1E293B',        // Fondo oscuro
  text: '#0F172A',          // Texto oscuro
  textLight: '#F1F5F9',     // Texto claro
  border: '#E2E8F0',        // Bordes sutiles
  success: '#10B981',       // Verde para éxito
  danger: '#EF4444',        // Rojo para errores
  warning: '#F59E0B'        // Amarillo para advertencias
};

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
        // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local en lugar de Railway
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'eventos',
          action: 'list'
        });
        setEventos(res.data.records || []);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setError('No se pudieron cargar los eventos. Por favor, intenta de nuevo más tarde.');
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

  // Componente de tarjeta de evento
  const EventCard = ({ evento }) => {
    const fields = evento.fields || {};
    const aficheUrl = fields.afiche_url && (Array.isArray(fields.afiche_url)
      ? fields.afiche_url[0]?.url
      : fields.afiche_url);
      
    return (
      <div style={{
        background: theme.darkBg,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative',
        border: `1px solid ${theme.border}`,
      }} onClick={() => {if(aficheUrl) setAmpliarImg(aficheUrl)}}>
        {/* Badge de estado */}
        {fields.estado_aprobacion && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: fields.estado_aprobacion === 'aprobado' ? theme.success : 
                      fields.estado_aprobacion === 'pendiente' ? theme.warning : theme.danger,
            color: 'white',
            zIndex: 2,
          }}>
            {fields.estado_aprobacion}
          </div>
        )}
        
        {/* Imagen del evento */}
        <div style={{
          height: 160,
          background: aficheUrl 
            ? `url(${aficheUrl}) center/cover no-repeat` 
            : `linear-gradient(135deg, ${theme.primary}22, ${theme.accent}22)`,
          position: 'relative',
        }}>
          {!aficheUrl && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 36,
            }}>
              🏆
            </div>
          )}
          {/* Overlay con gradiente para mejorar legibilidad */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }} />
        </div>
        
        {/* Contenido principal */}
        <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Nombre del evento */}
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 18,
            fontWeight: 700,
            color: theme.primary,
            lineHeight: 1.3,
          }}>
            {fields.nombre_evento || 'Evento sin título'}
          </h3>
          
          {/* Fecha y lugar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            color: theme.textLight,
            marginBottom: 10,
            fontSize: 14,
          }}>
            <span style={{ opacity: 0.8 }}>📅</span> 
            <span>{fields.fecha || 'Fecha no especificada'}</span>
            {fields.ubicacion && (
              <>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ opacity: 0.8 }}>📍</span> 
                <span>{fields.ubicacion}</span>
              </>
            )}
          </div>
          
          {/* Descripción */}
          <p style={{ 
            margin: '0 0 12px',
            color: theme.textLight,
            opacity: 0.9,
            fontSize: 14,
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {fields.descripcion || 'No hay descripción disponible para este evento.'}
          </p>
          
          {/* Pie de tarjeta */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 'auto', 
            paddingTop: 10,
            borderTop: `1px solid ${theme.border}`,
          }}>
            {/* Tipo de evento */}
            <div style={{
              padding: '4px 10px',
              background: theme.primary + '22',
              color: theme.primary,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              display: 'inline-block',
            }}>
              {fields.tipo_evento || 'Sin tipo'}
            </div>
            
            {/* Clasificación */}
            <div style={{
              padding: '4px 10px',
              background: (fields.clasificacion?.toLowerCase().includes('ecuatoriano') ? theme.secondary : theme.accent) + '22',
              color: fields.clasificacion?.toLowerCase().includes('ecuatoriano') ? theme.secondary : theme.accent,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              display: 'inline-block',
            }}>
              {fields.clasificacion || 'Sin clasificación'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  function renderList(eventos, titulo) {
    return (
      <>
        {/* Tabs de navegación */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
          padding: '0 16px',
        }}>
          <TabButton 
            label="Todos" 
            active={tab === 'todos'} 
            onClick={() => setTab('todos')} 
          />
          <TabButton 
            label="Ecuatorianos" 
            active={tab === 'ecuatorianos'} 
            onClick={() => setTab('ecuatorianos')} 
            color={theme.secondary}
          />
          <TabButton 
            label="Internacionales" 
            active={tab === 'internacionales'} 
            onClick={() => setTab('internacionales')} 
            color={theme.accent}
          />
        </div>
        
        {/* Buscador y filtros */}
        <div style={{
          marginBottom: 24, 
          background: theme.darkBg, 
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Input de búsqueda */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <input 
              type="text" 
              placeholder="Buscar eventos..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.darkBg,
                color: theme.textLight,
                fontSize: 15,
              }}
            />
          </div>
          
          {/* Filtros */}
          <div style={{ 
            display: 'flex', 
            gap: 8,
            flex: 1,
            minWidth: 200,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}>
            <select 
              value={filtroAnio} 
              onChange={e => setFiltroAnio(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.darkBg,
                color: theme.textLight,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              <option value="">Año</option>
              {anios.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
            
            <select 
              value={filtroClasificacion} 
              onChange={e => setFiltroClasificacion(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.darkBg,
                color: theme.textLight,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              <option value="">Clasificación</option>
              {clasificaciones.map(clasificacion => (
                <option key={clasificacion} value={clasificacion}>{clasificacion}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Título de la sección */}
        <h2 style={{
          margin: '0 0 16px 0',
          color: theme.textLight,
          fontWeight: 600,
          textAlign: 'center',
          fontSize: 24,
        }}>
          {titulo}
        </h2>
        
        {/* Mensaje si no hay eventos */}
        {eventos.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: theme.darkBg,
            borderRadius: 12,
            color: theme.textLight,
            opacity: 0.7,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <h4 style={{ margin: 0, marginBottom: 8 }}>No hay eventos disponibles</h4>
            <p style={{ margin: 0 }}>No se encontraron eventos que coincidan con los criterios.</p>
          </div>
        ) : (
          /* Grid de tarjetas de eventos */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
            padding: '0 0 40px 0',
          }}>
            {eventos.map(evento => (
              <EventCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </>
    );
  }
  
  // Componente para los botones de navegación por tabs
  const TabButton = ({ label, active, onClick, color = theme.primary }) => (
    <button 
      onClick={onClick} 
      style={{
        background: active ? color : theme.darkBg,
        color: active ? theme.background : theme.textLight,
        padding: '10px 20px',
        borderRadius: 8,
        border: 'none',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: 15,
        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{maxWidth: '98vw', margin:'2rem auto', overflowX:'auto'}}>
      {tab === 'todos' && renderList(eventos, 'Todos los Eventos')}
      {tab === 'ecuatorianos' && renderList(eventosEcuatorianos, 'Eventos Ecuatorianos')}
      {tab === 'internacionales' && renderList(eventosInternacionales, 'Eventos Internacionales')}
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
