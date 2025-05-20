import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FormEvento({ onSuccess }) {
  const [nombre_evento, setNombreEvento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipo_evento, setTipoEvento] = useState('');
  const [afiche, setAfiche] = useState(null);
  const [organizador, setOrganizador] = useState('');
  const [pais, setPais] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [clasificacionOptions, setClasificacionOptions] = useState(['Ecuatoriano', 'Internacional']);
  const [clasificacionWarning, setClasificacionWarning] = useState('');
  const [estado_aprobacion, setEstadoAprobacion] = useState('pendiente');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Al montar el formulario, obtener opciones de clasificación desde Airtable
  useEffect(() => {
    async function fetchOptions() {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'eventos',
          action: 'list'
        });
        // Buscar las opciones del primer registro que tenga el campo clasificacion
        const records = res.data.records || [];
        let optionsSet = new Set();
        for (const rec of records) {
          if (rec.fields && rec.fields.clasificacion) {
            optionsSet.add(rec.fields.clasificacion);
          }
        }
        // Si hay opciones encontradas, úsalas
        let opts = Array.from(optionsSet);
        if (!opts.includes('Ecuatoriano')) opts.push('Ecuatoriano');
        if (!opts.includes('Internacional')) opts.push('Internacional');
        setClasificacionOptions(opts);
        if (opts.length === 0) {
          setClasificacionWarning('No se pudieron detectar las opciones de clasificación desde Airtable.');
        }
      } catch (e) {
        setClasificacionWarning('No se pudieron cargar las opciones de clasificación desde Airtable. Puedes escribir manualmente.');
      }
    }
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    // Validación de campos obligatorios
    if (!nombre_evento || !descripcion || !fecha || !ubicacion || !tipo_evento || !afiche || !organizador || !pais || !clasificacion || !estado_aprobacion) {
      setError('Por favor, completa todos los campos, selecciona la clasificación y adjunta una imagen.');
      return;
    }
    setLoading(true);
    try {
      let aficheUrl = '';
      if (afiche) {
        const formData = new FormData();
        formData.append('imagen', afiche);
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        aficheUrl = res.data.url;
        if (!aficheUrl) {
          setError('Error al subir la imagen del afiche. Intenta nuevamente.');
          setLoading(false);
          return;
        }
      }
      // Detectar si afiche_url debe ir como array de objetos (Attachment) o string
      let afichePayload;
      // Si es un enlace de Google Drive, conviértelo a formato directo
      function toDirectDriveUrl(url) {
        if (!url) return url;
        const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
        if (match) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
      }
      if (Array.isArray(aficheUrl)) {
        afichePayload = aficheUrl.map(obj => ({ url: toDirectDriveUrl(obj.url) }));
      } else if (aficheUrl && aficheUrl.startsWith('http')) {
        afichePayload = [{ url: toDirectDriveUrl(aficheUrl) }]; // Attachment
      } else {
        afichePayload = aficheUrl || '';
      }
      await axios.post('http://localhost:3001/saveAirtable', {
        table: 'eventos',
        data: {
          nombre_evento,
          descripcion,
          fecha,
          ubicacion,
          tipo_evento,
          afiche_url: afichePayload,
          organizador,
          pais,
          clasificacion,
          estado_aprobacion
        }
      });
      setMensaje('¡Evento registrado exitosamente!');
      setError('');
      setNombreEvento('');
      setDescripcion('');
      setFecha('');
      setUbicacion('');
      setTipoEvento('');
      setAfiche(null);
      setOrganizador('');
      setPais('');
      setClasificacion('');
      setEstadoAprobacion('pendiente');
      if (onSuccess) onSuccess();
    } catch (err) {
      setMensaje('');
      let errorMsg = 'Error al registrar el evento';
      if (err.response && err.response.data && err.response.data.details) {
        if (typeof err.response.data.details === 'string') {
          errorMsg += ': ' + err.response.data.details;
        } else if (typeof err.response.data.details === 'object') {
          if (err.response.data.details.error && err.response.data.details.error.message) {
            errorMsg += ': ' + err.response.data.details.error.message;
          } else {
            errorMsg += ': ' + JSON.stringify(err.response.data.details);
          }
        }
      }
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:500,margin:'2rem auto',padding:24,border:'2.5px solid #0033A0',borderRadius:18,background:'#181b24',color:'#fff'}}>
      <h2 style={{textAlign:'center',color:'#FFDD00',fontWeight:900,textShadow:'0 2px 8px #0033A0'}}>Registrar Evento</h2>
      <div>
        <label>Nombre del evento:</label><br/>
        <input value={nombre_evento} onChange={e => setNombreEvento(e.target.value)} required style={{borderColor:!nombre_evento && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Descripción:</label><br/>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={{borderColor:!descripcion && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Fecha:</label><br/>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{borderColor:!fecha && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Ubicación:</label><br/>
        <input value={ubicacion} onChange={e => setUbicacion(e.target.value)} required style={{borderColor:!ubicacion && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Tipo de evento:</label><br/>
        <input value={tipo_evento} onChange={e => setTipoEvento(e.target.value)} required style={{borderColor:!tipo_evento && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Clasificación:</label><br/>
        <select value={clasificacion} onChange={e => setClasificacion(e.target.value)} required style={{borderColor:!clasificacion && error ? '#EF3340' : '#0033A0'}}>
          <option value="">Selecciona una opción</option>
          {clasificacionOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {clasificacionWarning && <div style={{color:'#FFDD00',marginTop:4,fontSize:13}}>{clasificacionWarning}</div>}
      </div>
      <div>
        <label>Afiche (imagen):</label><br/>
        <input type="file" accept="image/*" onChange={e => setAfiche(e.target.files[0])} required style={{borderColor:!afiche && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Organizador:</label><br/>
        <input value={organizador} onChange={e => setOrganizador(e.target.value)} required style={{borderColor:!organizador && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>País:</label><br/>
        <input value={pais} onChange={e => setPais(e.target.value)} required style={{borderColor:!pais && error ? '#EF3340' : '#0033A0'}} />
      </div>
      <div>
        <label>Estado de aprobación:</label><br/>
        <select value={estado_aprobacion} onChange={e => setEstadoAprobacion(e.target.value)} required style={{borderColor:!estado_aprobacion && error ? '#EF3340' : '#0033A0'}}>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <button type="submit" disabled={loading} style={{marginTop:16}}>Registrar evento</button>
      {error && <p style={{marginTop:10,color:'#EF3340',fontWeight:700}}>{error}</p>}
      {mensaje && <p style={{marginTop:10,color:'#FFDD00',fontWeight:700}}>{mensaje}</p>}
    </form>
  );
}
