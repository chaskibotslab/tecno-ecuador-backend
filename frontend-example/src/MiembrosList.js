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

export default function MiembrosList() {
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ampliarImg, setAmpliarImg] = useState(null);

  useEffect(() => {
    async function fetchMiembros() {
      setLoading(true);
      setError('');
      try {
        // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = 'https://api-tecno-ecuador.up.railway.app'; // Forzar uso del servidor local
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'miembros',
          action: 'list'
        });
        console.log('Datos de miembros recibidos:', res.data.records);
        setMiembros(res.data.records || []);
      } catch (err) {
        console.error('Error al cargar miembros:', err);
        setError('No se pudieron cargar los miembros. Por favor, intenta de nuevo más tarde.');
      }
      setLoading(false);
    }
    fetchMiembros();
  }, []);

  // Función auxiliar para extraer la URL de la foto correctamente
  const getFotoUrl = (miembro) => {
    if (!miembro.fields?.foto_url) return null;
    
    // Si es un array, intentamos sacar la URL del primer objeto
    if (Array.isArray(miembro.fields.foto_url)) {
      // Si el primer elemento es un objeto con propiedad url
      if (miembro.fields.foto_url[0]?.url) {
        return miembro.fields.foto_url[0].url;
      }
      // A veces puede ser una string directamente dentro del array
      return miembro.fields.foto_url[0];
    }
    
    // Si es un string, lo devolvemos directamente
    return miembro.fields.foto_url;
  };

  // Componente de tarjeta para cada miembro
  const MemberCard = ({ miembro }) => {
    const fields = miembro.fields || {};
    const fotoUrl = getFotoUrl(miembro);
    
    return (
      <div style={{
        background: theme.darkBg,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease',
        cursor: fotoUrl ? 'pointer' : 'default',
        border: `1px solid ${theme.border}`,
      }} onClick={() => {if(fotoUrl) setAmpliarImg(fotoUrl)}}>
        {/* Foto del miembro */}
        <div style={{ 
          padding: 20,
          display: 'flex', 
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.primary}11, ${theme.primary}22)`,
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            overflow: 'hidden',
            background: fotoUrl ? `url(${fotoUrl}) center/cover no-repeat` : `${theme.darkBg}`,
            border: `3px solid ${theme.primary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            {!fotoUrl && (
              <span style={{ fontSize: 40, opacity: 0.5 }}>👤</span>
            )}
          </div>
        </div>
        
        {/* Información del miembro */}
        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Nombre del miembro */}
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 18,
            fontWeight: 600,
            color: theme.primary,
            textAlign: 'center',
          }}>
            {fields.nombre || 'Sin nombre'}
          </h3>
          
          {/* Rol */}
          <div style={{ 
            fontSize: 14,
            color: theme.textLight,
            marginBottom: 12,
            padding: '4px 12px',
            background: theme.primary + '22',
            borderRadius: 20,
            display: 'inline-block',
            alignSelf: 'center',
            fontWeight: 500,
          }}>
            {fields.rol || 'Sin rol'}
          </div>
          
          {/* Equipo */}
          {fields.equipo_id && (
            <div style={{ 
              fontSize: 14,
              color: theme.textLight,
              marginTop: 4,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <span style={{ opacity: 0.7 }}>👥</span>
              <span>{Array.isArray(fields.equipo_id) && fields.equipo_id[0] || fields.equipo_id || 'Sin equipo'}</span>
            </div>
          )}
          
          {/* Descripción si existe */}
          {fields.descripcion && (
            <p style={{ 
              margin: '12px 0 0',
              fontSize: 14,
              color: theme.textLight,
              opacity: 0.9,
              textAlign: 'center',
              padding: '0 10px',
            }}>
              {fields.descripcion}
            </p>
          )}
          
          {/* Categoría si existe */}
          {fields.categoria && (
            <div style={{ 
              marginTop: 'auto', 
              paddingTop: 12, 
              borderTop: `1px solid ${theme.border}`,
              fontSize: 13,
              color: theme.secondary,
              textAlign: 'center',
              fontWeight: 500,
            }}>
              {fields.categoria}
            </div>
          )}
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
          <h3 style={{ margin: '0 0 8px 0' }}>Cargando miembros...</h3>
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

  // Si no hay miembros
  if (!miembros.length) {
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
          <h3 style={{ margin: '0 0 8px 0' }}>No hay miembros registrados</h3>
          <p style={{ margin: 0, opacity: 0.7 }}>Puedes agregar miembros desde la sección "Agregar"</p>
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
        Miembros del Equipo
      </h2>
      
      {/* Grid de tarjetas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 24,
      }}>
        {miembros.map(miembro => (
          <MemberCard key={miembro.id} miembro={miembro} />
        ))}
      </div>
      
      {/* Modal para ver imagen ampliada */}
      {ampliarImg && (
        <div 
          onClick={() => setAmpliarImg(null)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img 
            src={ampliarImg} 
            alt="Foto ampliada" 
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              objectFit: 'contain',
            }} 
          />
          <button 
            onClick={e => {
              e.stopPropagation();
              setAmpliarImg(null);
            }} 
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
