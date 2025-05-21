import React, { useState, useEffect } from 'react';
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

export default function FormEvento({ onSuccess }) {
  const [nombre_evento, setNombreEvento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipo_evento, setTipoEvento] = useState('');
  const [afiche, setAfiche] = useState(null);
  const [afichePreview, setAfichePreview] = useState(null);
  const [organizador, setOrganizador] = useState('');
  const [pais, setPais] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [clasificacionOptions, setClasificacionOptions] = useState(['Ecuatoriano', 'Internacional']);
  const [clasificacionWarning, setClasificacionWarning] = useState('');
  const [estado_aprobacion, setEstadoAprobacion] = useState('pendiente');
  
  const [mensaje, setMensaje] = useState('');
  const [mensajeType, setMensajeType] = useState(''); // 'success', 'warning' o 'error'
  const [loading, setLoading] = useState(false);
  
  // Manejar la vista previa del afiche al seleccionarlo
  const handleAficheChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfiche(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfichePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAfiche(null);
      setAfichePreview(null);
    }
  };

  // Al montar el formulario, obtener opciones de clasificación desde Airtable
  useEffect(() => {
    async function fetchOptions() {
      try {
        // const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
        const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
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
    setMensajeType('');
    setLoading(true);
    
    // Validación básica
    if (!nombre_evento.trim()) {
      setMensaje('El nombre del evento es obligatorio');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    if (!fecha) {
      setMensaje('La fecha del evento es obligatoria');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    if (!tipo_evento.trim()) {
      setMensaje('El tipo de evento es obligatorio');
      setMensajeType('error');
      setLoading(false);
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://api-tecno-ecuador.up.railway.app';
      let aficheUrl = '';
      
      // Aplicando la misma solución que funciona en FormEmpresa y ahora en FormEquipo
      if (afiche) {
        try {
          console.log('Subiendo afiche del evento...');
          const formData = new FormData();
          formData.append('imagen', afiche);
          
          // Usar fetch en lugar de axios como solución que sí funciona
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
            aficheUrl = datos.url;
            console.log('URL del afiche:', aficheUrl);
          } else {
            throw new Error('No se recibió URL de la imagen');
          }
        } catch (error) {
          console.error('Error completo al subir afiche:', error);
          setMensaje(`Error al subir el afiche: ${error.message}`);
          setMensajeType('warning');
          // Continuamos para guardar al menos los datos de texto
        }
      }
      
      // Formato simplificado del payload que FUNCIONA
      const afichePayload = aficheUrl ? [{ url: aficheUrl }] : '';
      // Usar directamente la URL local en lugar de API_URL para evitar problemas de CORS
      await axios.post('https://api-tecno-ecuador.up.railway.app/saveAirtable', {
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
      
      // Reiniciar formulario
      setNombreEvento('');
      setDescripcion('');
      setFecha('');
      setUbicacion('');
      setTipoEvento('');
      setAfiche(null);
      setAfichePreview(null);
      setOrganizador('');
      setPais('');
      setClasificacion('');
      setEstadoAprobacion('pendiente');
      
      // Mensaje de éxito
      setMensaje('¡Evento registrado exitosamente!');
      setMensajeType('success');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al registrar evento:', err);
      let errorMsg = 'Error al registrar el evento';
      
      // Manejar diferentes tipos de respuesta de error
      if (err.response?.data?.details) {
        if (typeof err.response.data.details === 'string') {
          errorMsg += ': ' + err.response.data.details;
        } else if (typeof err.response.data.details === 'object') {
          if (err.response.data.details.error?.message) {
            errorMsg += ': ' + err.response.data.details.error.message;
          } else {
            errorMsg += ': ' + JSON.stringify(err.response.data.details);
          }
        }
      } else if (err.message) {
        errorMsg += ': ' + err.message;
      }
      
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
            <span style={{ fontSize: 24 }}>🎉</span> 
            Registrar Evento
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
            <label style={labelStyle}>Nombre del evento *</label>
            <input 
              value={nombre_evento} 
              onChange={e => setNombreEvento(e.target.value)} 
              style={inputStyle}
              placeholder="Nombre del evento"
              required 
            />
          </div>
          
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              style={{...inputStyle, minHeight: 100, resize: 'vertical'}}
              placeholder="Descripción del evento"
            />
          </div>
          
          {/* Fecha y Ubicación */}
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
              <span>📅</span> Fecha y Ubicación
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={labelStyle}>Fecha del evento *</label>
                <input 
                  type="date" 
                  value={fecha} 
                  onChange={e => setFecha(e.target.value)} 
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Ubicación *</label>
                <input 
                  value={ubicacion} 
                  onChange={e => setUbicacion(e.target.value)}
                  placeholder="Lugar del evento"
                  required 
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
          
          {/* Afiche con vista previa */}
          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>Afiche del evento</label>
            
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
                background: afichePreview ? `center/cover no-repeat url(${afichePreview})` : '#1a2234',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: `1px solid ${theme.border}`,
                flexShrink: 0
              }}>
                {!afichePreview && (
                  <span style={{ fontSize: 30, color: '#475569' }}>🌇️</span>
                )}
              </div>
              
              {/* Selección de archivo */}
              <div style={{ flex: 1 }}>
                <label 
                  htmlFor="afiche-upload"
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
                  <span>{afiche ? afiche.name : 'Subir afiche'}</span>
                </label>
                <input 
                  id="afiche-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleAficheChange}
                  style={{ display: 'none' }} 
                />
                <div style={{ fontSize: 12, marginTop: 5, opacity: 0.7 }}>Formatos: JPG, PNG, GIF. Máx. 5MB</div>
              </div>
            </div>
          </div>
          
          {/* Tipo y Clasificación */}
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Tipo de evento *</label>
            <input 
              value={tipo_evento} 
              onChange={e => setTipoEvento(e.target.value)} 
              placeholder="Por ejemplo: Competencia, Taller, Congreso"
              required
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Clasificación *</label>
            <select 
              value={clasificacion} 
              onChange={e => setClasificacion(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecciona una opción</option>
              {clasificacionOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {clasificacionWarning && 
              <div style={{
                fontSize: 13, 
                color: theme.warning,
                marginTop: 5,
                opacity: 0.8
              }}>
                {clasificacionWarning}
              </div>
            }
          </div>
          
          {/* Organizador y País */}
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
              <span>🌐</span> Origen
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={labelStyle}>Organizador *</label>
                <input 
                  value={organizador} 
                  onChange={e => setOrganizador(e.target.value)}
                  placeholder="Nombre del organizador"
                  required 
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>País *</label>
                <input 
                  value={pais} 
                  onChange={e => setPais(e.target.value)}
                  placeholder="País de origen"
                  required 
                  style={inputStyle}
                />
              </div>
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
              {loading ? 'Registrando...' : 'Registrar Evento'}
              
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
