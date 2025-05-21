import React, { useEffect, useState } from 'react';
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

// Función de utilidad para obtener URLs de imágenes
const getImageUrl = (imageField) => {
  if (!imageField) return null;
  if (Array.isArray(imageField) && imageField[0]?.url) return imageField[0].url;
  if (Array.isArray(imageField) && typeof imageField[0] === 'string') return imageField[0];
  if (typeof imageField === 'string') return imageField;
  if (imageField.url) return imageField.url;
  return null;
};

function EmpresaModal({ empresa, onClose, onSave }) {
  const [form, setForm] = useState({ ...empresa.fields });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    
    try {
      // Nunca enviar logo_url al editar, solo si hay lógica para subir imagen nueva
      const formToSend = { ...form };
      if ('logo_url' in formToSend) {
        delete formToSend.logo_url;
      }
      
      // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Usar el servidor en Railway en lugar de Railway
      await axios.post(`${API_URL}/saveAirtable`, {
        table: 'empresas',
        id: empresa.id,
        data: formToSend
      });
      
      onSave({ ...empresa, fields: { ...form } });
      onClose();
    } catch (err) {
      let msg = err.response?.data?.error || err.message;
      if (err.response?.data?.airtable_error) msg += ': ' + err.response.data.airtable_error;
      if (err.response?.data?.details && typeof err.response.data.details === 'string') 
        msg += ': ' + err.response.data.details;
      if (err.response?.data?.details && typeof err.response.data.details === 'object' && 
          err.response.data.details.error?.message) 
        msg += ': ' + err.response.data.details.error.message;
      
      setErrorMsg(msg);
    }
    
    setSaving(false);
  };
  
  // Estilos para los inputs con diseño futurista
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
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:focus': {
      borderColor: theme.primary,
      boxShadow: theme.neonGlow
    }
  };

  // Estilo para las etiquetas
  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    color: theme.primary,
    fontWeight: 500,
    fontSize: 14
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: theme.darkBg,
        borderRadius: 16,
        padding: 0,
        width: '95%',
        maxWidth: 520,
        overflow: 'hidden',
        boxShadow: theme.cardShadow,
        position: 'relative',
        border: `1px solid ${theme.border}`
      }}>
        {/* Encabezado con gradiente futurista */}
        <div style={{
          background: theme.futuristicGradient,
          padding: '20px 30px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ opacity: 0.8 }}>⚙️</span>
            Editar Empresa
          </h2>
          
          {/* Efecto futurista en el encabezado */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 70%)',
            opacity: 0.4,
            pointerEvents: 'none'
          }}></div>
        </div>
        
        {/* Contenido del formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 30px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Nombre de la empresa</label>
            <input 
              name="nombre_empresa" 
              value={form.nombre_empresa || ''} 
              onChange={handleChange} 
              style={inputStyle} 
              placeholder="Nombre corporativo"
              required
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea 
              name="descripcion" 
              value={form.descripcion || ''} 
              onChange={handleChange} 
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Descripción de la empresa y sus servicios"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input 
                name="ciudad" 
                value={form.ciudad || ''} 
                onChange={handleChange} 
                style={inputStyle}
                placeholder="Ciudad" 
              />
            </div>
            
            <div>
              <label style={labelStyle}>País</label>
              <input 
                name="pais" 
                value={form.pais || ''} 
                onChange={handleChange} 
                style={inputStyle}
                placeholder="País" 
              />
            </div>
          </div>
          
          {/* Sección de Contacto */}
          <div style={{ 
            marginBottom: 20,
            background: `${theme.darkBg}`,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${theme.border}`
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
              <span>📱</span> Información de contacto
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email de contacto</label>
              <input 
                name="contacto" 
                type="email"
                value={form.contacto || ''} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="email@empresa.com"
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>WhatsApp</label>
              <input 
                name="whatsapp" 
                type="tel"
                value={form.whatsapp || ''} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="+593999999999"
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Página web</label>
              <input 
                name="web" 
                type="url"
                value={form.web || ''} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="https://empresa.com"
              />
            </div>
            
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input 
                name="telefono" 
                type="tel"
                value={form.telefono || ''} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="099999999"
              />
            </div>
          </div>
          
          {/* Mensaje de error */}
          {errorMsg && (
            <div style={{
              color: theme.danger,
              marginBottom: 20,
              padding: '12px 16px',
              background: `${theme.danger}15`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500
            }}>
              <span style={{ marginRight: 8 }}>⚠️</span>
              {errorMsg}
            </div>
          )}
          
          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: 14,
            marginTop: 24,
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                background: 'transparent',
                color: theme.textLight,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              disabled={saving} 
              style={{
                background: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmpresasList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editEmpresa, setEditEmpresa] = useState(null);

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Usar el servidor en Railway en lugar de Railway
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'empresas',
          action: 'list'
        });
        setEmpresas(res.data.records || []);
      } catch (err) {
        console.error('Error cargando empresas:', err);
        setError('No se pudieron cargar las empresas');
      }
      setLoading(false);
    }
    fetchEmpresas();
  }, []);

  // Estados de interfaz
  if (loading) return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      color: theme.textLight,
      background: theme.darkBg,
      borderRadius: 16,
      margin: '30px auto',
      maxWidth: 1200
    }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8 }}>⏳</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Cargando empresas tecnológicas...</div>
    </div>
  );
  
  if (error) return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      color: theme.danger,
      background: theme.darkBg,
      borderRadius: 16,
      margin: '30px auto',
      maxWidth: 1200
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{error}</div>
    </div>
  );

  if (!empresas.length) return (
    <div style={{
      padding: '80px 20px',
      textAlign: 'center',
      color: theme.textLight,
      background: theme.darkBg,
      borderRadius: 16,
      margin: '30px auto',
      maxWidth: 1200
    }}>
      <div style={{ fontSize: 50, marginBottom: 16, opacity: 0.6 }}>🌐</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>No hay empresas registradas</div>
      <div style={{ fontSize: 16, opacity: 0.7 }}>Aún no se han agregado empresas tecnológicas</div>
    </div>
  );

  // Función para formatear números de teléfono y WhatsApp
  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '10px 15px 40px'
    }}>
      {/* Cabecera con estilo futurista */}
      <div style={{
        background: theme.futuristicGradient,
        borderRadius: 16,
        padding: '30px 25px',
        marginBottom: 30,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.cardShadow
      }}>
        <h2 style={{
          margin: 0,
          color: '#fff',
          fontSize: 28,
          fontWeight: 600,
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 32 }}>🌐</span>
          Empresas Tecnológicas
        </h2>
        
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          margin: '10px 0 0 0',
          maxWidth: 600,
          fontSize: 16
        }}>
          Empresas tecnológicas participantes e información de contacto
        </p>
        
        {/* Decoración futurista */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '40%',
          background: 'radial-gradient(circle at right, rgba(255,255,255,0.15), transparent 70%)',
          pointerEvents: 'none'
        }}></div>
        
        <svg 
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            opacity: 0.15,
            pointerEvents: 'none'
          }}
          width="180" 
          height="180" 
          viewBox="0 0 100 100">
          <circle cx="75" cy="75" r="20" fill="none" stroke="#fff" strokeWidth="0.5"/>
          <circle cx="75" cy="75" r="15" fill="none" stroke="#fff" strokeWidth="0.5"/>
          <circle cx="75" cy="75" r="10" fill="none" stroke="#fff" strokeWidth="0.5"/>
          <circle cx="75" cy="75" r="5" fill="none" stroke="#fff" strokeWidth="0.5"/>
          <line x1="0" y1="75" x2="50" y2="75" stroke="#fff" strokeWidth="0.5"/>
          <line x1="100" y1="75" x2="150" y2="75" stroke="#fff" strokeWidth="0.5"/>
          <line x1="75" y1="0" x2="75" y2="50" stroke="#fff" strokeWidth="0.5"/>
          <line x1="75" y1="100" x2="75" y2="150" stroke="#fff" strokeWidth="0.5"/>
        </svg>
      </div>

      {/* Grid de empresas con diseño futurista */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '25px',
        justifyContent: 'center',
      }}>
        {empresas.map(emp => {
          const logoUrl = getImageUrl(emp.fields?.logo_url);
          
          return (
            <div key={emp.id} style={{
              background: theme.darkBg,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: theme.cardShadow,
              border: `1px solid ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
              }
            }}>
              {/* Cabecera de tarjeta con degradado futurista */}
              <div style={{
                background: theme.holographicBg,
                padding: '20px',
                borderBottom: `1px solid ${theme.border}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                {/* Logo */}
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: logoUrl ? '#fff' : 'rgba(30, 41, 59, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: logoUrl ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  cursor: logoUrl ? 'pointer' : 'default'
                }} onClick={() => {if (logoUrl) setAmpliarImg(logoUrl)}}>
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="logo" 
                      style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 26, opacity: 0.5 }}>🌐</span>
                  )}
                </div>
                
                {/* Nombre y ubicación */}
                <div>
                  <h3 style={{
                    margin: '0 0 6px 0',
                    color: theme.textLight,
                    fontSize: 18,
                    fontWeight: 600,
                  }}>
                    {emp.fields?.nombre_empresa || 'Empresa'}
                  </h3>
                  
                  {(emp.fields?.ciudad || emp.fields?.pais) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 14,
                      color: 'rgba(241, 245, 249, 0.6)'
                    }}>
                      <span>📍</span>
                      {[emp.fields?.ciudad, emp.fields?.pais].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Cuerpo de la tarjeta */}
              <div style={{
                padding: '16px 20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Descripción */}
                {emp.fields?.descripcion && (
                  <div style={{
                    fontSize: 14,
                    color: theme.textLight,
                    opacity: 0.8,
                    marginBottom: 16,
                    lineHeight: 1.5,
                    flex: 1
                  }}>
                    {emp.fields.descripcion}
                  </div>
                )}
                
                {/* Sección de contactos destacada */}
                <div style={{
                  marginTop: 'auto',
                  background: `${theme.primary}0a`,
                  padding: '16px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>📞</span> Contactos
                  </h4>
                  
                  {/* Email */}
                  {emp.fields?.contacto && (
                    <a 
                      href={`mailto:${emp.fields.contacto}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: theme.textLight,
                        textDecoration: 'none',
                        fontSize: 14,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        border: '1px solid rgba(255,255,255,0.05)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: theme.primary,
                        color: '#fff',
                        borderRadius: 16,
                        fontSize: 14,
                        marginRight: 5
                      }}>✉️</span>
                      <span style={{ flex: 1 }}>{emp.fields.contacto}</span>
                    </a>
                  )}
                  
                  {/* WhatsApp */}
                  {emp.fields?.whatsapp && (
                    <a 
                      href={`https://wa.me/${formatPhone(emp.fields.whatsapp)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: '#25D366',
                        textDecoration: 'none',
                        fontSize: 14,
                        padding: '8px 12px',
                        background: 'rgba(37, 211, 102, 0.08)',
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        border: '1px solid rgba(37, 211, 102, 0.1)',
                        fontWeight: 500,
                        '&:hover': {
                          background: 'rgba(37, 211, 102, 0.15)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#25D366',
                        color: '#fff',
                        borderRadius: 16,
                        fontSize: 18,
                        marginRight: 5
                      }}>💬</span>
                      <span style={{ flex: 1 }}>WhatsApp</span>
                    </a>
                  )}
                  
                  {/* Teléfono */}
                  {emp.fields?.telefono && (
                    <a 
                      href={`tel:${formatPhone(emp.fields.telefono)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: theme.accent,
                        textDecoration: 'none',
                        fontSize: 14,
                        padding: '8px 12px',
                        background: `${theme.accent}0a`,
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        border: `1px solid ${theme.accent}20`,
                        fontWeight: 500,
                        '&:hover': {
                          background: `${theme.accent}15`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: theme.accent,
                        color: '#fff',
                        borderRadius: 16,
                        fontSize: 16,
                        marginRight: 5
                      }}>📞</span>
                      <span style={{ flex: 1 }}>{emp.fields.telefono}</span>
                    </a>
                  )}
                  
                  {/* Web */}
                  {emp.fields?.web && (
                    <a 
                      href={(emp.fields.web.startsWith('http://') || emp.fields.web.startsWith('https://')) ? 
                        emp.fields.web : `https://${emp.fields.web}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: theme.primary,
                        textDecoration: 'none',
                        fontSize: 14,
                        padding: '8px 12px',
                        background: `${theme.primary}0a`,
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        border: `1px solid ${theme.primary}20`,
                        fontWeight: 500,
                        '&:hover': {
                          background: `${theme.primary}15`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: theme.primary,
                        color: '#fff',
                        borderRadius: 16,
                        fontSize: 16
                      }}>🌐</span>
                      <span style={{ flex: 1 }}>Sitio web</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición (si está activo) */}
      {editEmpresa && (
        <EmpresaModal 
          empresa={editEmpresa} 
          onClose={() => setEditEmpresa(null)} 
          onSave={(updated) => {
            setEmpresas(empresas.map(e => e.id === updated.id ? updated : e));
            setEditEmpresa(null);
          }} 
        />
      )}

      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'rgba(0, 0, 0, 0.9)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000,
          padding: '20px'
        }}>
          {/* Imagen ampliada */}
          <div style={{
            position: 'relative',
            maxWidth: '95%',
            maxHeight: '90%',
            overflow: 'hidden',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            background: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0
          }}>
            <img 
              src={ampliarImg} 
              alt="Imagen ampliada" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Botón para cerrar la vista ampliada */}
          <button 
            style={{ 
              position: 'absolute', 
              top: 20, 
              right: 20, 
              background: 'rgba(0, 0, 0, 0.5)', 
              color: '#fff', 
              border: 'none', 
              width: 50,
              height: 50,
              borderRadius: 25, 
              cursor: 'pointer', 
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.8)',
                transform: 'scale(1.05)'
              }
            }} 
            onClick={() => setAmpliarImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
