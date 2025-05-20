import React, { useState } from 'react';
import axios from 'axios';

export default function FormEmpresa({ onSuccess }) {
  const [nombre_empresa, setNombreEmpresa] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [logo, setLogo] = useState(null);
  const [contacto, setContacto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [web, setWeb] = useState('');
  const [telefono, setTelefono] = useState('');

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
        table: 'empresas',
        data: {
          nombre_empresa,
          descripcion,
          ciudad,
          pais,
          logo_url: logoPayload,
          contacto,
          whatsapp,
          web,
          telefono,
        }
      });
      setMensaje('¡Empresa registrada exitosamente!');
      setNombreEmpresa('');
      setDescripcion('');
      setCiudad('');
      setPais('');
      setLogo(null);
      setContacto('');
      setWhatsapp('');
      setWeb('');
      setTelefono('');

      if (onSuccess) onSuccess();
    } catch (err) {
      setMensaje('Error al registrar la empresa');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:500,margin:'2rem auto',padding:24,border:'2.5px solid #0033A0',borderRadius:18,background:'#181b24',color:'#fff'}}>
      <h2 style={{textAlign:'center',color:'#FFDD00',fontWeight:900,textShadow:'0 2px 8px #0033A0'}}>Registrar Empresa</h2>
      <div>
        <label>Nombre de la empresa:</label><br/>
        <input value={nombre_empresa} onChange={e => setNombreEmpresa(e.target.value)} required />
      </div>
      <div>
        <label>Descripción:</label><br/>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      </div>
      <div>
        <label>Ciudad:</label><br/>
        <input value={ciudad} onChange={e => setCiudad(e.target.value)} />
      </div>
      <div>
        <label>País:</label><br/>
        <input value={pais} onChange={e => setPais(e.target.value)} />
      </div>
      <div>
        <label>Logo (imagen):</label><br/>
        <input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} />
      </div>
      <div>
        <label>Contacto (email):</label><br/>
        <input value={contacto} onChange={e => setContacto(e.target.value)} />
      </div>
      <div>
        <label>WhatsApp:</label><br/>
        <input type="tel" placeholder="+593999999999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
      </div>
      <div>
        <label>Página web:</label><br/>
        <input type="url" placeholder="https://" value={web} onChange={e => setWeb(e.target.value)} />
      </div>
      <div>
        <label>Teléfono:</label><br/>
        <input type="tel" placeholder="0999999999" value={telefono} onChange={e => setTelefono(e.target.value)} />
      </div>

      <button type="submit" disabled={loading} style={{marginTop:16}}>Registrar empresa</button>
      {mensaje && <p style={{marginTop:10}}>{mensaje}</p>}
    </form>
  );
}
