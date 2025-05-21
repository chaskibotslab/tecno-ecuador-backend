import React, { useState } from 'react';
import axios from 'axios';

// Tema de colores y estilos
const theme = {
  primary: '#2563EB',       // Azul principal
  secondary: '#10B981',    // Verde secundario
  accent: '#F97316',       // Naranja acento
  bg: '#F8FAFC',           // Fondo claro
  darkBg: '#1E293B',       // Fondo oscuro
  text: '#0F172A',         // Texto oscuro
  textLight: '#F1F5F9',    // Texto claro
  border: '#334155',       // Color borde
  success: '#10B981',      // Verde éxito
  warning: '#F59E0B',      // Amarillo advertencia
  danger: '#EF4444',       // Rojo peligro
  futuristicGradient: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 50%, #3B82F6 100%)',
  glassEffect: 'rgba(255, 255, 255, 0.05)',
  cardShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  neonGlow: '0 0 15px rgba(37, 99, 235, 0.8), 0 0 30px rgba(37, 99, 235, 0.4)',
  holographicBg: 'linear-gradient(45deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))'
};

export default function FormNoticia({ onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [fuente, setFuente] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [estado_aprobacion, setEstadoAprobacion] = useState('pendiente');
  const [mensaje, setMensaje] = useState('');
  const [mensajeType, setMensajeType] = useState(''); // 'success' o 'error'
  const [loading, setLoading] = useState(false);
  
  // Manejar la vista previa de la imagen al seleccionarla
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagen(null);
      setImagenPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setMensajeType('');
    setLoading(true);
    
    // Validación básica
    if (!titulo.trim()) {
      setMensaje('El título de la noticia es obligatorio');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    if (!fecha) {
      setMensaje('La fecha es obligatoria');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    try {
      // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
      let imagenUrl = '';
      
      // Subir imagen si existe
      if (imagen) {
        try {
          const formData = new FormData();
          formData.append('imagen', imagen);
          const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          imagenUrl = res.data.url;
        } catch (uploadError) {
          console.error('Error al subir la imagen:', uploadError);
          setMensaje('Error al subir la imagen. La noticia se registrará sin imagen.');
          setMensajeType('warning');
        }
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
      
      // Enviar datos a Airtable
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
      
      // Reiniciar formulario
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setFuente('');
      setImagen(null);
      setImagenPreview(null);
      setEstadoAprobacion('pendiente');
      
      // Mensaje de éxito
      setMensaje('¡Noticia registrada exitosamente!');
      setMensajeType('success');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al registrar noticia:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al registrar la noticia';
      setMensaje(errorMsg);
      setMensajeType('error');
    }
    
    setLoading(false);
  };

  // Estilos base para inputs
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: 16,
    background: 'rgba(15, 23, 42, 0.6)',
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    color: theme.textLight,
    fontSize: 15,
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  // Estilo para etiquetas
  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    color: theme.textLight,
    fontWeight: 500,
    fontSize: 14
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center', 
      width: '100%',
      padding: '20px'
    }}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          background: theme.darkBg,
          color: theme.textLight,
          boxShadow: theme.cardShadow,
          border: `1px solid ${theme.border}`
        }}
      >
        {/* Encabezado con gradiente futurista */}
        <div style={{
          background: theme.futuristicGradient,
          padding: '22px 30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{
            margin: 0,
            color: '#fff',
            fontWeight: 600,
            fontSize: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ fontSize: 24 }}>📰</span> 
            Registrar Noticia
          </h2>
          
          {/* Efectos futuristas en el encabezado */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 70%)',
            opacity: 0.6,
            pointerEvents: 'none'
          }}></div>
          
          <svg 
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              opacity: 0.15,
              height: '100%',
              pointerEvents: 'none'
            }}
            width="100" 
            height="100"
            viewBox="0 0 100 100">
            <circle cx="75" cy="75" r="20" fill="none" stroke="#fff" strokeWidth="0.5"/>
            <circle cx="75" cy="75" r="15" fill="none" stroke="#fff" strokeWidth="0.5"/>
            <circle cx="75" cy="75" r="10" fill="none" stroke="#fff" strokeWidth="0.5"/>
          </svg>
        </div>
        
        {/* Contenido del formulario */}
        <div style={{ padding: '30px' }}>
          {/* Datos principales */}
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Título de la noticia *</label>
            <input 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              style={inputStyle}
              placeholder="Título de la noticia"
              required 
            />
          </div>
          
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              style={{...inputStyle, minHeight: 100, resize: 'vertical'}}
              placeholder="Contenido de la noticia"
            />
          </div>
          
          {/* Imagen con vista previa */}
          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>Imagen de la noticia</label>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 15
            }}>
              {/* Vista previa de la imagen */}
              <div style={{
                width: 100,
                height: 80,
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: imagenPreview ? `center/cover no-repeat url(${imagenPreview})` : '#1a2234',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: `1px solid ${theme.border}`,
                flexShrink: 0
              }}>
                {!imagenPreview && (
                  <span style={{ fontSize: 30, color: '#475569' }}>🖼️</span>
                )}
              </div>
              
              {/* Selección de archivo */}
              <div style={{ flex: 1 }}>
                <label 
                  htmlFor="imagen-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    background: `${theme.accent}10`,
                    border: `1px solid ${theme.accent}30`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    gap: 10,
                    color: theme.accent
                  }}
                >
                  <span style={{
                    fontSize: 16
                  }}>📷</span>
                  <span>{imagen ? imagen.name : 'Subir imagen'}</span>
                </label>
                <input 
                  id="imagen-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImagenChange}
                  style={{ display: 'none' }} 
                />
                <div style={{ fontSize: 12, marginTop: 5, opacity: 0.7 }}>Formatos: JPG, PNG, GIF. Máx. 5MB</div>
              </div>
            </div>
          </div>
          
          {/* Fecha y Fuente */}
          <div style={{ 
            marginBottom: 20,
            background: `${theme.darkBg}`,
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            padding: 20
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: theme.accent,
              fontSize: 16,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8 
            }}>
              <span>📅</span> Detalles adicionales
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Fecha de publicación *</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={e => setFecha(e.target.value)} 
                required
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>Fuente o enlace externo</label>
              <input 
                type="url"
                value={fuente} 
                onChange={e => setFuente(e.target.value)} 
                placeholder="https://ejemplo.com/noticia"
                style={inputStyle}
              />
            </div>
          </div>
          
          {/* Estado de aprobación */}
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Estado de aprobación</label>
            <select 
              value={estado_aprobacion} 
              onChange={e => setEstadoAprobacion(e.target.value)}
              style={{
                ...inputStyle,
                background: estado_aprobacion === 'aprobado' ? `${theme.success}15` :
                          estado_aprobacion === 'pendiente' ? `${theme.warning}15` :
                          `${theme.danger}15`,
                color: estado_aprobacion === 'aprobado' ? theme.success :
                      estado_aprobacion === 'pendiente' ? theme.warning :
                      theme.danger,
                fontWeight: 500
              }}
            >
              <option value="pendiente">Pendiente de revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          
          {/* Mensaje de estado */}
          {mensaje && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 20,
              background: mensajeType === 'success' ? `${theme.success}15` : 
                        mensajeType === 'warning' ? `${theme.warning}15` : 
                        `${theme.danger}15`,
              color: mensajeType === 'success' ? theme.success : 
                    mensajeType === 'warning' ? theme.warning : 
                    theme.danger,
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>
                {mensajeType === 'success' ? '✅' : 
                 mensajeType === 'warning' ? '⚠️' : 
                 '❌'}
              </span>
              {mensaje}
            </div>
          )}
          
          {/* Botón de envío */}
          <div style={{ textAlign: 'center' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                background: theme.futuristicGradient,
                color: '#fff',
                border: 'none',
                borderRadius: 30,
                padding: '14px 40px',
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: theme.neonGlow,
                opacity: loading ? 0.7 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {loading ? 'Registrando...' : 'Publicar Noticia'}
              
              {/* Efecto hover */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.2), transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                ':hover': {
                  opacity: 1
                }
              }}></div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
