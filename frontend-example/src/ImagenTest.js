import React, { useState } from 'react';
import axios from 'axios';

export default function ImagenTest() {
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultadoUrl, setResultadoUrl] = useState('');

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Imagen seleccionada:', file.name, file.type, file.size);
      setImagen(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagen(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imagen) {
      setMensaje('Por favor selecciona una imagen primero');
      return;
    }
    
    setCargando(true);
    setMensaje('Subiendo imagen...');
    
    try {
      // 1. SUBIR DIRECTO A DRIVE
      const formData = new FormData();
      formData.append('imagen', imagen);
      
      console.log('Formdata creado con:', imagen.name);
      
      // Usar fetch en lugar de axios como alternativa
      const respuesta = await fetch('https://api-tecno-ecuador.up.railway.app/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      
      const datos = await respuesta.json();
      console.log('Respuesta completa del servidor:', datos);
      
      if (datos.url) {
        console.log('URL de la imagen:', datos.url);
        setResultadoUrl(datos.url);
        setMensaje('¡Imagen subida correctamente!');
        
        // 2. GUARDAR EN AIRTABLE CON LA URL
        const payload = [{ url: datos.url }];
        console.log('Enviando a Airtable payload:', JSON.stringify(payload));
        
        const airtableResp = await fetch('https://api-tecno-ecuador.up.railway.app/saveAirtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'empresas',
            data: {
              nombre_empresa: 'Test de imagen ' + new Date().toLocaleTimeString(),
              logo_url: payload
            }
          })
        });
        
        const airtableData = await airtableResp.json();
        console.log('Respuesta de Airtable:', airtableData);
        setMensaje('¡Imagen subida y guardada en Airtable!');
      } else {
        throw new Error('No se recibió URL de la imagen');
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMensaje(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2>Test de Subida de Imagen</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Selecciona una imagen:
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImagenChange}
            style={{ width: '100%' }}
          />
        </div>
        
        {previewUrl && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p>Vista previa:</p>
            <img 
              src={previewUrl} 
              alt="Vista previa" 
              style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ccc' }}
            />
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={cargando || !imagen}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: cargando ? 'wait' : 'pointer',
            opacity: cargando || !imagen ? 0.7 : 1
          }}
        >
          {cargando ? 'Subiendo...' : 'Subir Imagen'}
        </button>
      </form>
      
      {mensaje && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: mensaje.includes('Error') ? '#ffebee' : '#e8f5e9',
          border: `1px solid ${mensaje.includes('Error') ? '#ffcdd2' : '#c8e6c9'}`,
          borderRadius: '4px'
        }}>
          {mensaje}
        </div>
      )}
      
      {resultadoUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>URL de la imagen subida:</p>
          <input 
            type="text" 
            value={resultadoUrl} 
            readOnly 
            style={{ width: '100%', padding: '8px' }}
          />
          <div style={{ marginTop: '10px' }}>
            <img 
              src={resultadoUrl} 
              alt="Imagen subida" 
              style={{ maxWidth: '100%', border: '1px solid #ccc' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
