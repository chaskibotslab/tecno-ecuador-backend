import React, { useState } from 'react';
import axios from 'axios';
import useEquipos from './hooks/useEquipos';

export default function FormMiembro({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('');
  const [equipo, setEquipo] = useState('');
  const { equipos, loading: loadingEquipos } = useEquipos();
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      let fotoUrl = '';
      if (foto) {
        const formData = new FormData();
        formData.append('imagen', foto);
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fotoUrl = res.data.url;
      }
      // Detectar si foto_url debe ir como array de objetos (Attachment) o string
      let fotoPayload;
      // Si es un enlace de Google Drive, conviértelo a formato directo
      function toDirectDriveUrl(url) {
        if (!url) return url;
        const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
        if (match) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
      }
      if (Array.isArray(fotoUrl)) {
        fotoPayload = fotoUrl.map(obj => ({ url: toDirectDriveUrl(obj.url) }));
      } else if (fotoUrl && fotoUrl.startsWith('http')) {
        fotoPayload = [{ url: toDirectDriveUrl(fotoUrl) }]; // Attachment
      } else {
        fotoPayload = fotoUrl || '';
      }
      await axios.post(`${API_URL}/saveAirtable`, {
        table: 'miembros',
        data: {
          nombre,
          rol,
          equipo_id: [equipo], // Relación real, Airtable espera un array con el ID
          categoria,
          descripcion,
          foto_url: fotoPayload
        }
      });
      setMensaje('¡Miembro registrado exitosamente!');
      setNombre('');
      setRol('');
      setEquipo('');
      setCategoria('');
      setDescripcion('');
      setFoto(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setMensaje('Error al registrar el miembro');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 460, margin: '2rem auto', padding: 32, border: '2.5px solid #0033A0', borderRadius: 22, background: 'linear-gradient(135deg, #181b24 80%, #23272f 100%)', boxShadow:'0 6px 32px rgba(0,0,0,0.23)', fontFamily:'Orbitron, Montserrat, Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color:'#FFDD00', fontWeight:900, textShadow:'0 2px 8px #0033A0'}}>Registrar Miembro</h2>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Nombre:</label><br/>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required style={{background:'#23272f',color:'#fff',border:'1.5px solid #0033A0',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Rol:</label><br/>
        <input value={rol} onChange={e => setRol(e.target.value)} required style={{background:'#23272f',color:'#fff',border:'1.5px solid #EF3340',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Equipo:</label><br/>
        <select value={equipo} onChange={e => setEquipo(e.target.value)} required style={{background:'#23272f',color:'#FFDD00',border:'1.5px solid #FFDD00',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}}>
          <option value="">Selecciona un equipo</option>
          {loadingEquipos ? (
            <option disabled>Cargando equipos...</option>
          ) : (
            equipos.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.fields?.nombre_equipo || eq.id}
              </option>
            ))
          )}
        </select>
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Categoría:</label><br/>
        <input value={categoria} onChange={e => setCategoria(e.target.value)} style={{background:'#23272f',color:'#fff',border:'1.5px solid #FFDD00',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Descripción:</label><br/>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{background:'#23272f',color:'#fff',border:'1.5px solid #EF3340',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Foto (imagen):</label><br/>
        <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} style={{background:'#23272f',color:'#fff',border:'1.5px solid #0033A0',borderRadius:8,padding:'7px 12px',marginBottom:7,fontFamily:'inherit'}} />
      </div>
      <button type="submit" disabled={loading} style={{marginTop:18,background:'linear-gradient(90deg,#FFDD00 0%,#0033A0 60%,#EF3340 100%)',color:'#23272f',fontWeight:900,border:'none',borderRadius:10,padding:'12px 0',width:'100%',fontSize:18,boxShadow:'0 2px 8px #0033A0'}}>Registrar miembro</button>
      {mensaje && <p style={{marginTop:13,color:'#FFDD00',textAlign:'center',fontWeight:700,textShadow:'0 1px 4px #0033A0'}}>{mensaje}</p>}
    </form>
  );
}
