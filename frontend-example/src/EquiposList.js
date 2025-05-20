import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EquiposList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [loadingMiembros, setLoadingMiembros] = useState(false);

  useEffect(() => {
    async function fetchEquipos() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.post('http://localhost:3001/saveAirtable', {
          table: 'equipos',
          action: 'list'
        });
        setEquipos(res.data.records || []);
      } catch (err) {
        setError('No se pudieron cargar los equipos');
      }
      setLoading(false);
    }
    fetchEquipos();
  }, []);

  if (loading) return <p>Cargando equipos...</p>;
  if (error) return <p>{error}</p>;
  if (!equipos.length) return <p>No hay equipos registrados.</p>;

  return (
    <div style={{ backgroundColor: '#181b24', minHeight: '100vh' }}>
      <h2 style={{textAlign:'center',marginTop:30, color:'#0033A0', textShadow:'0 1px 8px #FFDD00'}}>Lista de Equipos</h2>
      {equipos.length === 0 ? (
        <p>No hay equipos registrados.</p>
      ) : (
        <div style={{display:'flex',flexWrap:'wrap',gap:24,justifyContent:'center'}}>
          {equipos.map((eq) => (
            <div key={eq.id} style={{
              border:'2.5px solid #0033A0',
              borderRadius:20,
              padding:20,
              margin:'8px 0',
              background:'linear-gradient(135deg, #181b24 75%, #23272f 100%)',
              minWidth:270,
              maxWidth:340,
              boxShadow:'0 4px 24px 0 #0033A055',
              transition:'box-shadow 0.2s, border 0.2s',
              fontFamily:'Orbitron, Montserrat, Arial, sans-serif',
              position:'relative',
              overflow:'hidden',
              cursor: 'pointer'
            }} onClick={async () => {
              setEquipoActivo(eq);
              setLoadingMiembros(true);
              try {
                const res = await axios.post('http://localhost:3001/saveAirtable', {
                  table: 'miembros',
                  action: 'list'
                });
                // Filtra miembros que tengan equipo_id que incluya el id del equipo activo
                const miembrosEquipo = (res.data.records || []).filter(mb => Array.isArray(mb.fields?.equipo_id) && mb.fields.equipo_id.includes(eq.id));
                setMiembros(miembrosEquipo);
              } catch (err) {
                setMiembros([]);
              }
              setLoadingMiembros(false);
            }}>
              <div style={{position:'absolute',top:0,left:0,width:'100%',height:5,background:'linear-gradient(90deg,#FFDD00 0%,#0033A0 60%,#EF3340 100%)'}}></div>
              <div style={{display:'flex',alignItems:'center',gap:18}}>
                {eq.fields?.logo_url && (
                  <div style={{background:'#fff',border:'2px solid #EF3340',padding:6,borderRadius:12,minWidth:70,minHeight:70,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 10px #EF334055'}}>
                    <img 
                      src={Array.isArray(eq.fields.logo_url) ? (eq.fields.logo_url[0]?.url || '') : eq.fields.logo_url}
                      alt="logo"
                      style={{maxWidth:56,maxHeight:56,objectFit:'contain',borderRadius:8,cursor:'zoom-in'}}
                      onClick={()=>setAmpliarImg(Array.isArray(eq.fields.logo_url) ? eq.fields.logo_url[0]?.url || eq.fields.logo_url[0] : eq.fields.logo_url)}
                    />
                  </div>
                )}
                <div>
                  <div style={{fontWeight:900,fontSize:20,color:'#FFDD00',textShadow:'0 1px 8px #0033A0'}}>{eq.fields?.nombre_equipo}</div>
                  <div style={{fontSize:15,margin:'2px 0 7px 0',color:'#fff',opacity:0.92}}>{eq.fields?.descripcion}</div>
                  <div style={{fontSize:13,color:'#EF3340'}}><b>Institución:</b> {eq.fields?.institucion}</div>
                  <div style={{fontSize:13,color:'#FFDD00'}}><b>Ciudad:</b> {eq.fields?.ciudad} <b>País:</b> {eq.fields?.pais}</div>
                  <div style={{fontSize:13,color:'#0033A0'}}><b>Categoría:</b> {eq.fields?.categoria}</div>
                  <div style={{fontSize:13,color:'#FFDD00'}}><b>Estado:</b> {eq.fields?.estado_aprobacion}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {equipoActivo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#181b24', padding: 20, borderRadius: 20, width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 6px 32px #0033A0cc' }}>
            <h2 style={{ color: '#FFDD00', textAlign: 'center', marginBottom: 12 }}>{equipoActivo.fields?.nombre_equipo}</h2>
            <div style={{ color: '#fff', marginBottom: 18 }}>
              <b>Institución:</b> {equipoActivo.fields?.institucion}<br/>
              <b>Ciudad:</b> {equipoActivo.fields?.ciudad} <b>País:</b> {equipoActivo.fields?.pais}<br/>
              <b>Categoría:</b> {equipoActivo.fields?.categoria}<br/>
              <b>Estado:</b> {equipoActivo.fields?.estado_aprobacion}<br/>
              <b>Descripción:</b> {equipoActivo.fields?.descripcion}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 16 }}>
              {loadingMiembros ? (
                <div style={{ color: '#FFDD00', fontWeight: 700 }}>Cargando miembros...</div>
              ) : miembros.length === 0 ? (
                <div style={{ color: '#EF3340', fontWeight: 700 }}>No hay miembros registrados para este equipo.</div>
              ) : miembros.map((miembro) => (
                <div key={miembro.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#23272f', borderRadius: 14, padding: 12, minWidth: 120, boxShadow: '0 2px 12px #0033A055' }}>
                  {miembro.fields?.foto_url && (
                    <img
                      src={Array.isArray(miembro.fields.foto_url) ? miembro.fields.foto_url[0]?.url || miembro.fields.foto_url[0] : miembro.fields.foto_url}
                      alt="foto"
                      style={{ width: 80, height: 80, borderRadius: 50, objectFit: 'cover', border: '2px solid #FFDD00', marginBottom: 8, cursor: 'zoom-in' }}
                      onClick={() => setAmpliarImg(Array.isArray(miembro.fields.foto_url) ? miembro.fields.foto_url[0]?.url || miembro.fields.foto_url[0] : miembro.fields.foto_url)}
                    />
                  )}
                  <div style={{ fontSize: 16, color: '#FFDD00', fontWeight: 700 }}>{miembro.fields?.nombre}</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{miembro.fields?.rol}</div>
                </div>
              ))}
            </div>
            <button style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#EF3340', color: '#fff', border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px #EF334055' }} onClick={() => setEquipoActivo(null)}>Cerrar</button>
          </div>
        </div>
      )}
      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div onClick={() => setAmpliarImg(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={ampliarImg} alt="ampliada" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 18, boxShadow: '0 4px 32px #FFDD00' }} />
          <button onClick={(e) => { e.stopPropagation(); setAmpliarImg(null); }} style={{ position: 'fixed', top: 30, right: 30, fontSize: 30, background: 'rgba(0, 0, 0, 0.5)', color: '#fff', border: 'none', borderRadius: 40, width: 50, height: 50, cursor: 'pointer' }}>✖</button>
        </div>
      )}
    </div>
  );
}
