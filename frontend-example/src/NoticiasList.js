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

export default function NoticiasList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendiente', 'aprobado', 'rechazado'

  useEffect(() => {
    async function fetchNoticias() {
      setLoading(true);
      setError('');
      try {
        // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'noticias',
          action: 'list'
        });
        setNoticias(res.data.records || []);
      } catch (err) {
        console.error('Error al cargar noticias:', err);
        setError('No se pudieron cargar las noticias');
      }
      setLoading(false);
    }
    fetchNoticias();
  }, []);

  // Función para formatear fechas
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return fechaStr; // Si no es válida, mostrar como está
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  // Filtrar noticias según el estado seleccionado
  const noticiasFiltradas = noticias.filter(noticia => {
    if (filtro === 'todos') return true;
    return noticia.fields?.estado_aprobacion === filtro;
  });

  // Componentes de estado de carga y error
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: theme.accent,
        fontSize: 18,
        fontWeight: 500
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16 
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderTop: `3px solid ${theme.primary}`,
            borderRight: `3px solid ${theme.accent}`,
            borderBottom: `3px solid ${theme.secondary}`,
            borderLeft: '3px solid transparent',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          Cargando noticias...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: `${theme.danger}10`,
        color: theme.danger,
        padding: '16px 24px',
        borderRadius: 12,
        margin: '40px auto',
        maxWidth: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontSize: 16,
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
        border: `1px solid ${theme.danger}30`
      }}>
        <span role="img" aria-label="error" style={{ fontSize: 22 }}>⚠️</span>
        {error}
      </div>
    );
  }

  if (!noticias.length) {
    return (
      <div style={{
        background: `${theme.secondary}10`,
        color: theme.secondary,
        padding: '24px',
        borderRadius: 12,
        margin: '40px auto',
        maxWidth: 600,
        textAlign: 'center',
        fontSize: 16,
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
        border: `1px solid ${theme.secondary}30`
      }}>
        <span role="img" aria-label="empty" style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>📰</span>
        No hay noticias registradas en el sistema
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: '24px auto',
      padding: '0 20px'
    }}>
      {/* Encabezado con filtros */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
        padding: '20px 0'
      }}>
        <h2 style={{
          color: theme.textLight,
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 28 }}>📰</span>
          Últimas Noticias
        </h2>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setFiltro('todos')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: filtro === 'todos' ? theme.primary : 'rgba(37, 99, 235, 0.1)',
              color: filtro === 'todos' ? '#fff' : theme.primary,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('aprobado')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: filtro === 'aprobado' ? theme.success : 'rgba(16, 185, 129, 0.1)',
              color: filtro === 'aprobado' ? '#fff' : theme.success,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setFiltro('pendiente')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: filtro === 'pendiente' ? theme.warning : 'rgba(245, 158, 11, 0.1)',
              color: filtro === 'pendiente' ? '#fff' : theme.warning,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('rechazado')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: filtro === 'rechazado' ? theme.danger : 'rgba(239, 68, 68, 0.1)',
              color: filtro === 'rechazado' ? '#fff' : theme.danger,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Grid de noticias */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24,
        width: '100%',
      }}>
        {noticiasFiltradas.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '30px',
            background: theme.darkBg,
            borderRadius: 12,
            textAlign: 'center',
            color: theme.textLight,
            opacity: 0.7
          }}>
            No hay noticias que coincidan con el filtro seleccionado
          </div>
        ) : (
          noticiasFiltradas.map(noticia => {
            // Estado de aprobación
            const estado = noticia.fields?.estado_aprobacion || 'pendiente';
            const estadoColor = estado === 'aprobado' ? theme.success :
                              estado === 'rechazado' ? theme.danger :
                              theme.warning;
                              
            // Obtener URL de imagen
            const imagenUrl = getImageUrl(noticia.fields?.imagen_url);
            
            return (
              <div 
                key={noticia.id} 
                style={{
                  background: theme.darkBg,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${theme.border}`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.cardShadow
                  }
                }}
              >
                {/* Indicador de estado */}
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  backgroundColor: `${estadoColor}20`,
                  color: estadoColor,
                  padding: '4px 12px',
                  borderRadius: 30,
                  fontSize: 12,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  border: `1px solid ${estadoColor}40`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {estado === 'aprobado' ? 'Aprobada' : 
                   estado === 'rechazado' ? 'Rechazada' : 'Pendiente'}
                </div>
                
                {/* Imagen de la noticia */}
                <div style={{
                  position: 'relative',
                  height: 180,
                  background: imagenUrl ? `center/cover no-repeat url(${imagenUrl})` : '#1a2234',
                  cursor: imagenUrl ? 'zoom-in' : 'default',
                  borderBottom: `1px solid ${theme.border}`
                }} onClick={() => imagenUrl && setAmpliarImg(imagenUrl)}>
                  {!imagenUrl && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 40, color: '#334155', opacity: 0.5 }}>📰</span>
                    </div>
                  )}
                  
                  {/* Efecto de degradado sobre la imagen */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    pointerEvents: 'none'
                  }}></div>
                </div>
                
                {/* Contenido de la noticia */}
                <div style={{
                  padding: 20,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Fecha de la noticia */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: theme.accent,
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 12
                  }}>
                    <span style={{ fontSize: 14 }}>📅</span>
                    {formatearFecha(noticia.fields?.fecha) || 'Sin fecha'}
                  </div>
                  
                  {/* Título */}
                  <h3 style={{
                    color: theme.textLight,
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 12,
                    lineHeight: 1.3
                  }}>
                    {noticia.fields?.titulo || 'Sin título'}
                  </h3>
                  
                  {/* Descripción */}
                  <div style={{
                    color: 'rgba(241, 245, 249, 0.7)',
                    fontSize: 14,
                    marginBottom: 16,
                    flex: 1,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {noticia.fields?.descripcion || 'Sin descripción'}
                  </div>
                  
                  {/* Enlace a la fuente */}
                  {noticia.fields?.fuente && (
                    <div style={{
                      marginTop: 'auto',
                      textAlign: 'right'
                    }}>
                      <a 
                        href={noticia.fields.fuente} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{
                          color: theme.primary,
                          fontWeight: 500,
                          fontSize: 14,
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: `${theme.primary}15`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: 14 }}>🔗</span>
                        Ver fuente
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Efecto de brillo en bordes - estilo futurista */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  borderRadius: 16,
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  opacity: 0.5
                }}></div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div 
          onClick={() => setAmpliarImg(null)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideIn {
                from { transform: scale(0.9); }
                to { transform: scale(1); }
              }
            `}
          </style>
          
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            borderRadius: 12,
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease'
          }}>
            <img 
              src={ampliarImg} 
              alt="Vista ampliada" 
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                display: 'block'
              }} 
            />
          </div>
          
          <button 
            onClick={e => {
              e.stopPropagation();
              setAmpliarImg(null);
            }} 
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              width: 40,
              height: 40,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              cursor: 'pointer',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            aria-label="Cerrar vista ampliada"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
