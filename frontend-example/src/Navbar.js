import React, { useState, useEffect } from 'react';

// Componente para los botones de navegación
const NavButton = ({ icon, label, active, accent = '#2563EB', onClick }) => {
  const buttonStyle = {
    ...linkStyle,
    background: active ? `rgba(${accent.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(', ')}, 0.1)` : 'transparent',
    color: active ? accent : theme.textLight,
    borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
    fontWeight: active ? 500 : 400
  };
  
  return (
    <button 
      style={buttonStyle} 
      onClick={onClick}
    >
      <span style={{
        fontSize: 16,
        width: 24,
        height: 24,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
      }}>{icon}</span> 
      {label}
    </button>
  );
};

// Nueva paleta de colores profesional
const theme = {
  primary: '#2563EB',       // Azul principal más moderno
  secondary: '#10B981',     // Verde/turquesa para acciones secundarias
  accent: '#F97316',        // Naranja para acciones/elementos destacados
  background: '#F8FAFC',    // Fondo claro
  darkBg: '#1E293B',        // Fondo oscuro
  text: '#0F172A',          // Texto oscuro
  textLight: '#F1F5F9',     // Texto claro
  border: '#E2E8F0',        // Bordes sutiles
  success: '#10B981',       // Verde para éxito
  danger: '#EF4444',        // Rojo para errores
  warning: '#F59E0B'        // Amarillo para advertencias
};

const navStyle = {
  height: '100vh',
  width: 260,
  position: 'fixed',
  top: 0,
  background: theme.darkBg,
  boxShadow: '0 0 20px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '1.5rem 0',
  zIndex: 9999,
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'all 0.3s ease-in-out'
};

const linkStyle = {
  color: theme.textLight,
  textDecoration: 'none',
  fontSize: 15,
  fontWeight: 500,
  padding: '10px 16px',
  margin: '2px 12px',
  borderRadius: 6,
  transition: 'all 0.2s ease',
  width: 'calc(100% - 24px)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
};

export default function Navbar({ setSection, section }) {
  const [showMenu, setShowMenu] = useState(window.innerWidth >= 800);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) setShowMenu(true);
      else if (mobile && showMenu) setShowMenu(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMenu]);

  return (
    <>
      {/* Header bar fijo para móviles */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: theme.darkBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textLight,
              padding: 8,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.5rem',
            }}
          >
            {showMenu ? '✕' : '≡'}
          </button>
          
          <h1 style={{
            margin: 0,
            color: theme.primary, 
            fontSize: '18px',
            fontWeight: 600
          }}>
            Tecnología Ecuador
          </h1>
          
          <div style={{width: '24px'}} /> {/* Elemento vacío para equilibrar el layout */}
        </header>
      )}
      
      {/* Overlay para cerrar menú en móvil */}
      {showMenu && isMobile && (
        <div 
          onClick={() => setShowMenu(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(2px)',
          }} 
        />
      )}
      
      {/* Barra de navegación lateral */}
      <nav style={{
        ...navStyle,
        left: showMenu ? 0 : '-300px',
        zIndex: 1000,
        top: isMobile ? '60px' : 0,
        height: isMobile ? 'calc(100vh - 60px)' : '100vh',
        width: isMobile ? '260px' : '280px',
        overflow: 'auto',
      }}>
        {!isMobile && (
          <div style={{
            padding: '10px 20px 20px',
            marginBottom: 10,
          }}>
            <h1 style={{
              fontSize: '20px',
              margin: '0 0 4px 0',
              color: theme.primary,
              fontWeight: 600,
            }}>
              Tecnología Ecuador
            </h1>
            <div style={{
              height: 3,
              background: theme.primary,
              width: '60%',
              marginTop: 8,
              borderRadius: 2,
            }} />
          </div>
        )}
        {/* Categoría: Datos */}
        <div style={{ 
          paddingLeft: 20, 
          marginTop: 10, 
          marginBottom: 6, 
          fontSize: 12, 
          fontWeight: 600, 
          textTransform: 'uppercase',
          color: theme.textLight,
          opacity: 0.6,
          letterSpacing: 1
        }}>
          Datos principales
        </div>
        
        <NavButton 
          icon="🏆" 
          label="Eventos" 
          active={section === 'eventos'}
          onClick={() => {
            setSection('eventos');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        <NavButton 
          icon="🏢" 
          label="Empresas" 
          active={section === 'empresas'}
          onClick={() => {
            setSection('empresas');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        <NavButton 
          icon="👥" 
          label="Equipos" 
          active={section === 'equipos'}
          onClick={() => {
            setSection('equipos');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        <NavButton 
          icon="👤" 
          label="Miembros" 
          active={section === 'miembros'}
          onClick={() => {
            setSection('miembros');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        <NavButton 
          icon="📰" 
          label="Noticias" 
          active={section === 'noticias'}
          onClick={() => {
            setSection('noticias');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        {/* Categoría: Administración */}
        <div style={{ 
          paddingLeft: 20, 
          marginTop: 16, 
          marginBottom: 6, 
          fontSize: 12, 
          fontWeight: 600, 
          textTransform: 'uppercase',
          color: theme.textLight,
          opacity: 0.6,
          letterSpacing: 1
        }}>
          Administración
        </div>
        
        <NavButton 
          icon="➕" 
          label="Agregar" 
          active={section === 'agregar'}
          accent={theme.secondary}
          onClick={() => {
            setSection('agregar');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        <NavButton 
          icon="⚙️" 
          label="Admin" 
          active={section === 'admin'}
          accent={theme.accent}
          onClick={() => {
            setSection('admin');
            if (isMobile) setShowMenu(false);
          }} 
        />
        
        {/* Pie de navegación */}
        <div style={{
          marginTop: 'auto', 
          borderTop: `1px solid ${theme.darkBg}`,
          padding: '16px 20px',
          fontSize: 12,
          color: theme.textLight,
          opacity: 0.7
        }}>
          <div>Robótica Ecuador</div>
          <div style={{marginTop: 4}}>v1.0.0</div>
        </div>
      </nav>
    </>
  );
}
