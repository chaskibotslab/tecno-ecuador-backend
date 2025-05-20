import React, { useState } from 'react';
import axios from 'axios';

export default function FormNoticia({ onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [fuente, setFuente] = useState('');
  const [imagen, setImagen] = useState(null);
  const [estado_aprobacion, setEstadoAprobacion] = useState('pendiente');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      let imagenUrl = '';
      if (imagen) {
        const formData = new FormData();
        formData.append('imagen', imagen);
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagenUrl = res.data.url;
      }
      // Detectar si imagen_url debe ir como array de objetos (Attachment) o string
      let imagenPayload;
      // Si es un enlace de Google Drive, conviértelo a formato directo
      function toDirectDriveUrl(url) {
        if (!url) return url;
        const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
        if (match) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
      }
      if (Array.isArray(imagenUrl)) {
        imagenPayload = imagenUrl.map(obj => ({ url: toDirectDriveUrl(obj.url) }));
      } else if (imagenUrl && imagenUrl.startsWith('http')) {
        imagenPayload = [{ url: toDirectDriveUrl(imagenUrl) }]; // Attachment
      } else {
        imagenPayload = imagenUrl || '';
      }
      await axios.post(`${API_URL}/saveAirtable`, {
        table: 'noticias',
        data: {
          titulo,
          descripcion,
          fecha,
          fuente,
          imagen_url: imagenPayload,
          estado_aprobacion
        }
      });
      setMensaje('¡Noticia registrada exitosamente!');
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setFuente('');
      setImagen(null);
      setEstadoAprobacion('pendiente');
      if (onSuccess) onSuccess();
    } catch (err) {
      setMensaje('Error al registrar la noticia');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:500,margin:'2rem auto',padding:24,border:'2.5px solid #0033A0',borderRadius:18,background:'#181b24',color:'#fff'}}>
      <h2 style={{textAlign:'center',color:'#FFDD00',fontWeight:900,textShadow:'0 2px 8px #0033A0'}}>Registrar Noticia</h2>
      <div>
        <label>Título:</label><br/>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} required />
      </div>
      <div>
        <label>Descripción:</label><br/>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      </div>
      <div>
        <label>Fecha:</label><br/>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
      </div>
      <div>
        <label>Fuente:</label><br/>
        <input value={fuente} onChange={e => setFuente(e.target.value)} />
      </div>
      <div>
        <label>Imagen (url):</label><br/>
        <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />
      </div>
      <div>
        <label>Estado de aprobación:</label><br/>
        <select value={estado_aprobacion} onChange={e => setEstadoAprobacion(e.target.value)}>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <button type="submit" disabled={loading} style={{marginTop:16}}>Registrar noticia</button>
      {mensaje && <p style={{marginTop:10}}>{mensaje}</p>}
    </form>
  );
}
