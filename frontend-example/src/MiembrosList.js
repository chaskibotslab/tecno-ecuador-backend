import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MiembrosList() {
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ampliarImg, setAmpliarImg] = useState(null);

  useEffect(() => {
    async function fetchMiembros() {
      setLoading(true);
      setError('');
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'miembros',
          action: 'list'
        });
        setMiembros(res.data.records || []);
      } catch (err) {
        setError('No se pudieron cargar los miembros');
      }
      setLoading(false);
    }
    fetchMiembros();
  }, []);

  if (loading) return <p>Cargando miembros...</p>;
  if (error) return <p>{error}</p>;
  if (!miembros.length) return <p>No hay miembros registrados.</p>;

  return (
    <div style={{maxWidth:600,margin:'2rem auto'}}>
      <h3>Lista de Miembros</h3>
      <ul style={{listStyle:'none',padding:0}}>
        {miembros.map(mb => (
          <li key={mb.id} style={{border:'1px solid #ccc',borderRadius:8,marginBottom:12,padding:12}}>
            <strong>{mb.fields?.nombre || 'Sin nombre'}</strong><br/>
            <span>{mb.fields?.rol || 'Sin rol'}</span><br/>
            <span>{mb.fields?.equipo || 'Sin equipo'}</span><br/>
            {mb.fields?.foto_url && (
              <img
                src={Array.isArray(mb.fields.foto_url) ? mb.fields.foto_url[0]?.url || mb.fields.foto_url[0] : mb.fields.foto_url}
                alt="foto"
                style={{maxWidth:90,maxHeight:90,marginTop:8,borderRadius:'50%',boxShadow:'0 2px 8px #0033A077',cursor:'zoom-in'}}
                onClick={()=>setAmpliarImg(Array.isArray(mb.fields.foto_url) ? mb.fields.foto_url[0]?.url || mb.fields.foto_url[0] : mb.fields.foto_url)}
              />
            )}
            {/* Modal de imagen ampliada */}
            {ampliarImg && (
              <div onClick={()=>setAmpliarImg(null)} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={ampliarImg} alt="ampliada" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:18,boxShadow:'0 4px 32px #FFDD00'}} />
                <button onClick={e=>{e.stopPropagation();setAmpliarImg(null);}} style={{position:'fixed',top:30,right:30,fontSize:30,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:40,width:50,height:50,cursor:'pointer'}}>✖</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
