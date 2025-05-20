import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NoticiasList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNoticias() {
      setLoading(true);
      setError('');
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'noticias',
          action: 'list'
        });
        setNoticias(res.data.records || []);
      } catch (err) {
        setError('No se pudieron cargar las noticias');
      }
      setLoading(false);
    }
    fetchNoticias();
  }, []);

  if (loading) return <div style={{color:'#FFDD00',textAlign:'center',marginTop:40}}>Cargando noticias...</div>;
  if (error) return <div style={{color:'#EF3340',textAlign:'center',marginTop:40}}>{error}</div>;
  if (!noticias.length) return <div style={{color:'#FFDD00',textAlign:'center',marginTop:40}}>No hay noticias registradas.</div>;

  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'#23272f',borderRadius:18,boxShadow:'0 4px 32px #0007',padding:'24px 0 32px 0'}}>
      <h2 style={{color:'#FFDD00',textAlign:'center',marginBottom:24}}>Noticias</h2>
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:28}}>
        {noticias.map(noticia => (
          <div key={noticia.id} style={{background:'#181b24',borderRadius:16,padding:20,minWidth:260,maxWidth:340,boxShadow:'0 2px 12px #0033A055',marginBottom:18,position:'relative'}}>
            {noticia.fields?.imagen_url && (
              <img 
                src={Array.isArray(noticia.fields.imagen_url) ? noticia.fields.imagen_url[0]?.url || noticia.fields.imagen_url[0] : noticia.fields.imagen_url}
                alt="imagen"
                style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:12,marginBottom:12,background:'#fff',boxShadow:'0 2px 12px #0033A055',cursor:'zoom-in'}}
                onClick={()=>setAmpliarImg(Array.isArray(noticia.fields.imagen_url) ? noticia.fields.imagen_url[0]?.url || noticia.fields.imagen_url[0] : noticia.fields.imagen_url)}
              />
            )}
            <h3 style={{color:'#FFDD00',marginBottom:6, fontSize:20}}>{noticia.fields?.titulo || 'Sin título'}</h3>
            <div style={{color:'#fff',marginBottom:8}}>{noticia.fields?.descripcion || 'Sin descripción'}</div>
            <div style={{color:'#FFDD00',fontWeight:700, fontSize:15}}>{noticia.fields?.fecha || ''}</div>
            {noticia.fields?.fuente && (
              <div style={{marginTop:8}}>
                <a href={noticia.fields.fuente} target="_blank" rel="noopener noreferrer" style={{color:'#0099ff',fontWeight:700,fontSize:16,textDecoration:'underline'}}>
                  Fuente
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div onClick={()=>setAmpliarImg(null)} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={ampliarImg} alt="ampliada" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:18,boxShadow:'0 4px 32px #FFDD00'}} />
          <button onClick={e=>{e.stopPropagation();setAmpliarImg(null);}} style={{position:'fixed',top:30,right:30,fontSize:30,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:40,width:50,height:50,cursor:'pointer'}}>✖</button>
        </div>
      )}
    </div>
  );
}
