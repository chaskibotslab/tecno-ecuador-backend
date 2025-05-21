import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Paleta de colores moderna y profesional
const theme = {
  primary: '#2563EB',       // Azul principal
  secondary: '#10B981',     // Verde/turquesa 
  accent: '#F97316',        // Naranja 
  background: '#F8FAFC',    // Fondo claro
  darkBg: '#1E293B',        // Fondo oscuro
  text: '#0F172A',          // Texto oscuro
  textLight: '#F1F5F9',     // Texto claro
  border: '#E2E8F0',        // Bordes sutiles
  success: '#10B981',       // Verde para éxito
  danger: '#EF4444',        // Rojo para errores
  warning: '#F59E0B'        // Amarillo para advertencias
};

export default function EquiposList() {
  const [ampliarImg, setAmpliarImg] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [loadingMiembros, setLoadingMiembros] = useState(false);

  // Función auxiliar para extraer la URL de la imagen correctamente
  const getImageUrl = (imageField) => {
    if (!imageField) return null;
    
    // Si es un array, intentamos sacar la URL del primer objeto
    if (Array.isArray(imageField)) {
      // Si el primer elemento es un objeto con propiedad url
      if (imageField[0]?.url) {
        return imageField[0].url;
      }
      // A veces puede ser una string directamente dentro del array
      return imageField[0];
    }
    
    // Si es un string, lo devolvemos directamente
    return imageField;
  };

  useEffect(() => {
    async function fetchEquipos() {
      setLoading(true);
      setError('');
      try {
        // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'equipos',
          action: 'list'
        });
        console.log('Datos de equipos recibidos:', res.data.records);
        setEquipos(res.data.records || []);
      } catch (err) {
        console.error('Error al cargar equipos:', err);
        setError('No se pudieron cargar los equipos. Por favor, intenta de nuevo más tarde.');
      }
      setLoading(false);
    }
    fetchEquipos();
  }, []);

  // Componente de tarjeta para cada equipo
  const TeamCard = ({ equipo }) => {
    const fields = equipo.fields || {};
    const logoUrl = getImageUrl(fields.logo_url);
    
    return (
      <div 
        style={{
          background: theme.darkBg,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          border: `1px solid ${theme.border}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }
        }} 
        onClick={async () => {
          setEquipoActivo(equipo);
          setLoadingMiembros(true);
          try {
            // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
            const res = await axios.post(`${API_URL}/saveAirtable`, {
              table: 'miembros',
              action: 'list'
            });
            // Filtra miembros que tengan equipo_id que incluya el id del equipo activo
            const miembrosEquipo = (res.data.records || []).filter(mb => 
              Array.isArray(mb.fields?.equipo_id) && mb.fields.equipo_id.includes(equipo.id));
            console.log('Miembros del equipo encontrados:', miembrosEquipo.length);
            setMiembros(miembrosEquipo);
          } catch (err) {
            console.error('Error al cargar miembros del equipo:', err);
            setMiembros([]);
          }
          setLoadingMiembros(false);
        }}
      >
        {/* Cabecera con logo e información principal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: 20,
          borderBottom: `1px solid ${theme.border}`,
          background: `linear-gradient(135deg, ${theme.darkBg}, ${theme.primary}11)`,
        }}>
          {/* Logo del equipo */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            overflow: 'hidden',
            background: logoUrl ? `#fff` : theme.darkBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: logoUrl ? `2px solid ${theme.border}` : 'none',
            padding: 4,
          }}>
            {logoUrl ? (
              <img 
                src={logoUrl}
                alt="Logo del equipo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  cursor: 'zoom-in',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAmpliarImg(logoUrl);
                }}
              />
            ) : (
              <span style={{ fontSize: 32, opacity: 0.5 }}>🏆</span>
            )}
          </div>
          
          {/* Información principal */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 18,
              fontWeight: 600,
              color: theme.primary,
              lineHeight: 1.3,
            }}>
              {fields.nombre_equipo || 'Equipo sin nombre'}
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 10px',
              fontSize: 14,
              color: theme.textLight,
            }}>
              {fields.institucion && (
                <div style={{ opacity: 0.9 }}>{fields.institucion}</div>
              )}
              
              {(fields.ciudad || fields.pais) && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4,
                }}>
                  <span style={{ opacity: 0.7 }}>📍</span>
                  <span>
                    {[fields.ciudad, fields.pais].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Detalles adicionales */}
        <div style={{ padding: '12px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Estado de aprobación */}
          {fields.estado_aprobacion && (
            <div style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 500,
              background: 
                fields.estado_aprobacion === 'aprobado' ? `${theme.success}22` :
                fields.estado_aprobacion === 'pendiente' ? `${theme.warning}22` : 
                `${theme.danger}22`,
              color: 
                fields.estado_aprobacion === 'aprobado' ? theme.success :
                fields.estado_aprobacion === 'pendiente' ? theme.warning : 
                theme.danger,
            }}>
              {fields.estado_aprobacion}
            </div>
          )}
          
          {/* Categoría */}
          {fields.categoria && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              marginBottom: 8, 
              fontSize: 14,
              color: theme.textLight,
            }}>
              <span style={{ fontWeight: 500, opacity: 0.8 }}>Categoría:</span>
              <span>{fields.categoria}</span>
            </div>
          )}
          
          {/* Descripción */}
          {fields.descripcion && (
            <div style={{ 
              margin: '8px 0 0',
              padding: '10px 12px',
              background: `${theme.primary}08`,
              borderRadius: 8,
              fontSize: 14,
              color: theme.textLight,
              opacity: 0.9,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {fields.descripcion}
            </div>
          )}
          
          {/* Ver miembros */}
          <div style={{ 
            marginTop: 'auto',
            paddingTop: 10,
            fontSize: 14,
            fontWeight: 500,
            color: theme.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <span>👥</span>
            <span>Ver miembros</span>
          </div>
        </div>
      </div>
    );
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        color: theme.textLight,
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.darkBg,
          padding: '30px 40px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Cargando equipos...</h3>
          <p style={{ margin: 0, opacity: 0.7 }}>Esto puede tomar unos momentos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        color: theme.textLight,
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.darkBg,
          padding: '30px 40px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          maxWidth: 500,
        }}>
          <div style={{ fontSize: 36, marginBottom: 16, color: theme.danger }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', color: theme.danger }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  // Si no hay equipos
  if (!equipos.length) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        color: theme.textLight,
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.darkBg,
          padding: '30px 40px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No hay equipos registrados</h3>
          <p style={{ margin: 0, opacity: 0.7 }}>Puedes agregar equipos desde la sección "Agregar"</p>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div style={{ padding: '20px 16px 40px' }}>
      {/* Título */}
      <h2 style={{
        margin: '0 0 24px 0',
        color: theme.textLight,
        fontWeight: 600,
        fontSize: 24,
        textAlign: 'center',
      }}>
        Equipos Registrados
      </h2>
      
      {/* Grid de tarjetas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24,
      }}>
        {equipos.map(equipo => (
          <TeamCard key={equipo.id} equipo={equipo} />
        ))}
      </div>
      {/* Modal de detalle de equipo */}
      {equipoActivo && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'rgba(0, 0, 0, 0.85)', 
            backdropFilter: 'blur(5px)',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 999,
            padding: '20px' 
          }}
        >
          <div style={{ 
            background: theme.darkBg, 
            padding: 30, 
            borderRadius: 16, 
            width: '95%', 
            maxWidth: 800, 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            position: 'relative', 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header del modal */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 24,
              borderBottom: `1px solid ${theme.border}`,
              paddingBottom: 20
            }}>
              {/* Logo del equipo */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                overflow: 'hidden',
                background: getImageUrl(equipoActivo.fields?.logo_url) ? '#fff' : theme.darkBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: getImageUrl(equipoActivo.fields?.logo_url) ? `1px solid ${theme.border}` : 'none',
                padding: 4
              }}>
                {getImageUrl(equipoActivo.fields?.logo_url) ? (
                  <img 
                    src={getImageUrl(equipoActivo.fields?.logo_url)}
                    alt="Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 32, opacity: 0.5 }}>🏆</span>
                )}
              </div>
              
              {/* Nombre y detalles básicos */}
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: '0 0 8px 0', 
                  color: theme.primary,
                  fontSize: 24,
                  fontWeight: 600 
                }}>
                  {equipoActivo.fields?.nombre_equipo || 'Equipo'}
                </h2>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 12, 
                  fontSize: 14,
                  color: theme.textLight
                }}>
                  {equipoActivo.fields?.institucion && (
                    <div>{equipoActivo.fields.institucion}</div>
                  )}
                  
                  {(equipoActivo.fields?.ciudad || equipoActivo.fields?.pais) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>📍</span>
                      {[equipoActivo.fields?.ciudad, equipoActivo.fields?.pais].filter(Boolean).join(', ')}
                    </div>
                  )}
                  
                  {equipoActivo.fields?.categoria && (
                    <div>
                      Categoría: {equipoActivo.fields.categoria}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón de cierre */}
              <button 
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: theme.textLight,
                  fontSize: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  opacity: 0.8,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: `${theme.darkBg}`,
                    opacity: 1
                  }
                }} 
                onClick={() => setEquipoActivo(null)}
              >
                ✕
              </button>
            </div>
            
            {/* Información detallada */}
            {equipoActivo.fields?.descripcion && (
              <div style={{ 
                marginBottom: 24,
                padding: '16px 20px',
                background: `${theme.primary}08`,
                borderRadius: 12,
                color: theme.textLight,
                fontSize: 15,
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: theme.primary }}>Descripción</div>
                {equipoActivo.fields.descripcion}
              </div>
            )}
            
            {/* Estado */}
            {equipoActivo.fields?.estado_aprobacion && (
              <div style={{
                display: 'inline-block',
                marginBottom: 20,
                padding: '5px 12px',
                borderRadius: 16,
                background: 
                  equipoActivo.fields.estado_aprobacion === 'aprobado' ? `${theme.success}22` :
                  equipoActivo.fields.estado_aprobacion === 'pendiente' ? `${theme.warning}22` : 
                  `${theme.danger}22`,
                color: 
                  equipoActivo.fields.estado_aprobacion === 'aprobado' ? theme.success :
                  equipoActivo.fields.estado_aprobacion === 'pendiente' ? theme.warning : 
                  theme.danger,
                fontSize: 14,
                fontWeight: 600
              }}>
                {equipoActivo.fields.estado_aprobacion}
              </div>
            )}
            
            {/* Título de miembros */}
            <h3 style={{ 
              margin: '24px 0 16px 0',
              color: theme.textLight,
              fontWeight: 600,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span>👥</span> Miembros del equipo
            </h3>
            
            {/* Miembros */}
            {loadingMiembros ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                color: theme.textLight
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <div>Cargando miembros...</div>
              </div>
            ) : miembros.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: theme.textLight,
                opacity: 0.7,
                background: `${theme.darkBg}dd`,
                borderRadius: 12
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No hay miembros registrados</div>
                <div style={{ fontSize: 14 }}>Este equipo aún no tiene miembros asociados</div>
              </div>
            ) : (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 16
              }}>
                {miembros.map((miembro) => {
                  const fotoUrl = getImageUrl(miembro.fields?.foto_url);
                  return (
                    <div key={miembro.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      background: `${theme.primary}08`,
                      borderRadius: 14, 
                      padding: 16, 
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: fotoUrl ? 'pointer' : 'default',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                      }
                    }} onClick={() => {if(fotoUrl) setAmpliarImg(fotoUrl)}}>
                      {/* Foto del miembro */}
                      <div style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: fotoUrl ? `center/cover no-repeat url(${fotoUrl})` : theme.darkBg,
                        border: `2px solid ${theme.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                      }}>
                        {!fotoUrl && <span style={{ fontSize: 32, opacity: 0.5 }}>👤</span>}
                      </div>
                      
                      {/* Nombre y rol */}
                      <div style={{ 
                        fontSize: 16, 
                        color: theme.primary, 
                        fontWeight: 600,
                        textAlign: 'center',
                        marginBottom: 4
                      }}>
                        {miembro.fields?.nombre || 'Sin nombre'}
                      </div>
                      
                      <div style={{ 
                        fontSize: 14, 
                        color: theme.textLight, 
                        opacity: 0.9,
                        textAlign: 'center'
                      }}>
                        {miembro.fields?.rol || 'Sin rol'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal de ampliación de imagen */}
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
