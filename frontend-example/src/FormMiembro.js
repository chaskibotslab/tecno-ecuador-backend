import React, { useState } from 'react';
import axios from 'axios';
import useEquipos from './hooks/useEquipos';

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

export default function FormMiembro({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('');
  const [equipo, setEquipo] = useState('');
  const { equipos, loading: loadingEquipos } = useEquipos();
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  
  const [mensaje, setMensaje] = useState('');
  const [mensajeType, setMensajeType] = useState(''); // 'success', 'warning' o 'error'
  const [loading, setLoading] = useState(false);
  
  // Manejar la vista previa de la foto al seleccionarla
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFoto(null);
      setFotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setMensajeType('');
    setLoading(true);
    
    // Validación básica
    if (!nombre.trim()) {
      setMensaje('El nombre del miembro es obligatorio');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    if (!equipo) {
      setMensaje('Debes seleccionar un equipo');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    try {
      // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
      let fotoUrl = '';
      
      // Subir foto si existe
      if (foto) {
        try {
          const formData = new FormData();
          formData.append('imagen', foto);
          const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          fotoUrl = res.data.url;
        } catch (uploadError) {
          console.error('Error al subir la foto:', uploadError);
          setMensaje('Error al subir la foto. El miembro se registrará sin imagen.');
          setMensajeType('warning');
        }
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
      
      // Enviar datos a Airtable
      await axios.post(`${API_URL}/saveAirtable`, {
        table: 'miembros',
        data: {
          nombre,
          rol,
          equipo_id: equipo ? [equipo] : [], // Relación real, Airtable espera un array con el ID
          categoria,
          descripcion,
          foto_url: fotoPayload
        }
      });
      
      // Reiniciar formulario
      setNombre('');
      setRol('');
      setEquipo('');
      setCategoria('');
      setDescripcion('');
      setFoto(null);
      setFotoPreview(null);
      
      // Mensaje de éxito
      setMensaje('¡Miembro registrado exitosamente!');
      setMensajeType('success');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al registrar miembro:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al registrar el miembro';
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
            <span style={{ fontSize: 24 }}>👨‍💻</span> 
            Registrar Miembro
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
            <label style={labelStyle}>Nombre del miembro *</label>
            <input 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              style={inputStyle}
              placeholder="Nombre completo"
              required 
            />
          </div>
          
          {/* Equipo y Rol */}
          <div style={{ 
            marginBottom: 20,
            background: `${theme.darkBg}`,
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            padding: 20
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: theme.secondary,
              fontSize: 16,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8 
            }}>
              <span>👥</span> Información del Equipo
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Equipo *</label>
              <select 
                value={equipo} 
                onChange={e => setEquipo(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  color: equipo ? theme.textLight : 'rgba(241, 245, 249, 0.5)'
                }}
              >
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
              <label style={labelStyle}>Rol en el equipo *</label>
              <input 
                value={rol} 
                onChange={e => setRol(e.target.value)}
                placeholder="Ej: Programador, Diseñador, Capitán"
                required 
                style={inputStyle}
              />
            </div>
          </div>
          
          {/* Foto con vista previa */}
          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>Foto del miembro</label>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 15
            }}>
              {/* Vista previa de la imagen */}
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: fotoPreview ? `center/cover no-repeat url(${fotoPreview})` : '#1a2234',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: `1px solid ${theme.border}`,
                flexShrink: 0
              }}>
                {!fotoPreview && (
                  <span style={{ fontSize: 30, color: '#475569' }}>👤</span>
                )}
              </div>
              
              {/* Selección de archivo */}
              <div style={{ flex: 1 }}>
                <label 
                  htmlFor="foto-upload"
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
                  <span>{foto ? foto.name : 'Subir foto'}</span>
                </label>
                <input 
                  id="foto-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFotoChange}
                  style={{ display: 'none' }} 
                />
                <div style={{ fontSize: 12, marginTop: 5, opacity: 0.7 }}>Formatos: JPG, PNG, GIF. Máx. 5MB</div>
              </div>
            </div>
          </div>
          
          {/* Categoría y Descripción */}
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Categoría</label>
            <input 
              value={categoria} 
              onChange={e => setCategoria(e.target.value)} 
              placeholder="Categoría del miembro"
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              style={{...inputStyle, minHeight: 100, resize: 'vertical'}}
              placeholder="Experiencia, habilidades, logros..."
            />
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
              {loading ? 'Registrando...' : 'Registrar Miembro'}
              
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
