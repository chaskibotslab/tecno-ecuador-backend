import React, { useState } from 'react';
import axios from 'axios';

export default function FormEquipo({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estadoAprobacion, setEstadoAprobacion] = useState('pendiente');
  const [logo, setLogo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      let logoUrl = '';
      if (logo) {
        const formData = new FormData();
        formData.append('imagen', logo);
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        logoUrl = res.data.url;
      }
      // Detectar si logo_url debe ir como array de objetos (Attachment) o string
      let logoPayload;
      // Si es un enlace de Google Drive, conviértelo a formato directo
      function toDirectDriveUrl(url) {
        if (!url) return url;
        const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
        if (match) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
      }
      if (Array.isArray(logoUrl)) {
        logoPayload = logoUrl.map(obj => ({ url: toDirectDriveUrl(obj.url) }));
      } else if (logoUrl && logoUrl.startsWith('http')) {
        logoPayload = [{ url: toDirectDriveUrl(logoUrl) }]; // Attachment
      } else {
        logoPayload = logoUrl || '';
      }
      await axios.post(`${API_URL}/saveAirtable`, {
        table: 'equipos',
        data: {
          nombre_equipo: nombre,
          institucion,
          ciudad,
          pais,
          categoria,
          descripcion,
          estado_aprobacion: estadoAprobacion,
          logo_url: logoPayload
        }
      });
      setMensaje('¡Equipo registrado exitosamente!');
      setNombre('');
      setInstitucion('');
      setCiudad('');
      setPais('');
      setCategoria('');
      setDescripcion('');
      setEstadoAprobacion('pendiente');
      setLogo(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setMensaje('Error al registrar el equipo');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:400,margin:'2rem auto',padding:20,border:'1px solid #ccc',borderRadius:10}}>
      <h3>Registrar Equipo</h3>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Nombre del equipo:</label><br/>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Institución:</label><br/>
        <input value={institucion} onChange={e => setInstitucion(e.target.value)} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Ciudad:</label><br/>
        <input value={ciudad} onChange={e => setCiudad(e.target.value)} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>País:</label><br/>
        <input value={pais} onChange={e => setPais(e.target.value)} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Categoría:</label><br/>
        <input value={categoria} onChange={e => setCategoria(e.target.value)} />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Descripción:</label><br/>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Estado de aprobación:</label><br/>
        <select value={estadoAprobacion} onChange={e => setEstadoAprobacion(e.target.value)}>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <div>
        <label style={{ color: '#fff', fontWeight: 600 }}>Logo (imagen):</label><br/>
        <input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} />
      </div>
      <button type="submit" disabled={loading} style={{marginTop:10}}>Registrar equipo</button>
      {mensaje && <p style={{marginTop:10}}>{mensaje}</p>}
    </form>
  );
}
