import React, { useState } from 'react';
import Navbar from './Navbar';
import EventosList from './EventosList';
import EquiposList from './EquiposList';
import MiembrosList from './MiembrosList';
import FormEquipo from './FormEquipo';
import FormMiembro from './FormMiembro';
import EventosTabs from './EventosTabs';
import FormEmpresa from './FormEmpresa';
import EmpresasList from './EmpresasList';
import FormNoticia from './FormNoticia';
import NoticiasList from './NoticiasList';
import FormEvento from './FormEvento';

function App() {
  // Forzar usuario administrador para desarrollo
  const [isAdmin, setIsAdmin] = useState(true); // Siempre administrador
  const [adminInput, setAdminInput] = useState("");
  const adminPassword = "adminchaski2024"; // No se usa porque forzamos admin = true
  const [section, setSection] = useState('eventos');
  const [nombreEvento, setNombreEvento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Subiendo imagen...');
    // 1. Subir la imagen al backend
    const formData = new FormData();
    formData.append('imagen', imagen);
    try {
      const resp = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (!data.url) throw new Error(data.error || 'Error al subir imagen');
      setMensaje('Imagen subida, guardando evento en Airtable...');
      // 2. Guardar los datos en Airtable
      const evento = {
        nombre_evento: nombreEvento,
        descripcion: descripcion,
        afiche_url: data.url,
      };
      const saveResp = await fetch('http://localhost:3001/saveAirtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'eventos', data: evento }),
      });
      const saveData = await saveResp.json();
      if (saveData.error) throw new Error(saveData.error);
      setMensaje('¡Evento guardado exitosamente en Airtable!');
      setNombreEvento('');
      setDescripcion('');
      setImagen(null);
    } catch (err) {
      setMensaje('Error: ' + err.message);
    }
  };

  // Mantener sesión admin en localStorage
  React.useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin);
  }, [isAdmin]);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
      {/* Línea superior con colores de Ecuador */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #FFDD00 33%, #0033A0 33%, #0033A0 66%, #EF3340 66%, #EF3340 100%)', zIndex: 10 }} />
      <Navbar setSection={setSection} section={section} />
      <main
        style={{
          marginLeft: window.innerWidth < 800 ? 0 : 220,
          padding: window.innerWidth < 800 ? '12px 3vw 16px' : '12px 12px 24px',
          transition: 'all 0.3s ease',
          minHeight: 'calc(100vh - 60px)',
          maxWidth: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(160deg,rgba(16,19,28,0.98) 0%,rgba(28,32,51,0.98) 100%)',
          justifyContent: 'flex-start',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 5
        }}
      >
        {section === 'eventos' && (
          <div style={{
            width: '100%', 
            maxWidth: 1100,
            background: '#000000',
            border: '1px solid #FFDD00',
            borderTop: '3px solid #FFDD00',
            padding: '24px 0 32px 0', 
            color: '#FFDD00'
          }}>
            <EventosTabs />
          </div>
        )}
        {section === 'empresas' && (
          <div style={{
            width: '100%',
            maxWidth: 1100,
            background: '#000000',
            border: '1px solid #0033A0',
            borderTop: '3px solid #0033A0',
            padding: '24px 0 32px 0', 
            color: '#FFDD00'
          }}>
            <EmpresasList />
          </div>
        )}
        {section === 'agregar' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            margin: '0 auto',
            width: '100%',
            padding: '10px 15px 40px',
            maxWidth: 1200
          }}>
            {/* Cabecera de registro */}
            <div style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 50%, #3B82F6 100%)',
              borderRadius: 16,
              padding: '30px 25px',
              width: '100%',
              marginBottom: 10,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
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
                <span style={{ fontSize: 32 }}>📝</span>
                Registros
              </h2>
              
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: '10px 0 0 0',
                maxWidth: 600,
                fontSize: 16
              }}>
                Seleccione el formulario que necesita completar
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
            </div>
            
            {/* Contenedor de tarjetas de formularios */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 
                               window.innerWidth < 1200 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '30px',
              width: '100%',
            }}>
              {/* Formulario de Evento - accesible para todos */}
              <div style={{
                background: '#1E293B', 
                borderRadius: 16, 
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '20px 25px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(37, 99, 235, 0.1)'
                }}>
                  <span style={{ fontSize: 24, color: '#F97316' }}>🎯</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Registrar Evento</h3>
                </div>
                <div style={{ padding: 0 }}>
                  <FormEvento />
                </div>
              </div>
              
              {/* Formulario de Equipo - accesible para todos */}
              <div style={{
                background: '#1E293B', 
                borderRadius: 16, 
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '20px 25px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(16, 185, 129, 0.1)'
                }}>
                  <span style={{ fontSize: 24, color: '#10B981' }}>👥</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Registrar Equipo</h3>
                </div>
                <div style={{ padding: 0 }}>
                  <FormEquipo />
                </div>
              </div>
              
              {/* Formulario de Miembro - accesible para todos */}
              <div style={{
                background: '#1E293B', 
                borderRadius: 16, 
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '20px 25px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(139, 92, 246, 0.1)'
                }}>
                  <span style={{ fontSize: 24, color: '#8B5CF6' }}>👤</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Registrar Miembro</h3>
                </div>
                <div style={{ padding: 0 }}>
                  <FormMiembro />
                </div>
              </div>
              
              {/* Formulario de Empresa - solo para administradores */}
              {isAdmin && (
                <div style={{
                  background: '#1E293B', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: '20px 25px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(37, 99, 235, 0.1)'
                  }}>
                    <span style={{ fontSize: 24, color: '#2563EB' }}>💻️</span>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Registrar Empresa</h3>
                  </div>
                  <div style={{ padding: 0 }}>
                    <FormEmpresa />
                  </div>
                </div>
              )}
              
              {/* El componente de Test de Subida de Imagen ya no es necesario, se eliminó */}
              
              {/* Formulario de Noticia - solo para administradores */}
              {isAdmin && (
                <div style={{
                  background: '#1E293B', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: '20px 25px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(249, 115, 22, 0.1)'
                  }}>
                    <span style={{ fontSize: 24, color: '#F97316' }}>📰</span>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Registrar Noticia</h3>
                  </div>
                  <div style={{ padding: 0 }}>
                    <FormNoticia />
                  </div>
                </div>
              )}
              
              {/* Mensaje para usuarios no administradores */}
              {!isAdmin && (
                <div style={{
                  background: '#1E293B', 
                  borderRadius: 16, 
                  padding: '30px 25px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #334155',
                  gridColumn: window.innerWidth < 768 ? 'auto' : 'span 2',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: 200
                }}>
                  <div style={{ fontSize: 50, marginBottom: 20, color: '#F97316', opacity: 0.7 }}>🔒</div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
                    Área Restringida
                  </h3>
                  <p style={{ margin: 0, color: '#94A3B8', maxWidth: 400 }}>
                    Los formularios para registrar empresas y noticias están disponibles solo para administradores. 
                    Acceda a la sección de Admin para autenticarse.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
          {section === 'formulario' && (
            <FormEvento />
          )}
          {section === 'equipos' && (
          <div style={{width:'100%',maxWidth:1100,margin:'0 auto',padding:'0 0 32px 0'}}>
            <EquiposList />
          </div>
        )}
          {section === 'miembros' && (
          <div style={{
            width:'100%',
            maxWidth:1100,
            margin:'0 auto',
            padding:'0 0 32px 0'
          }}>
            <MiembrosList />
          </div>
        )}
          {section === 'noticias' && (
          <div style={{
            width:'100%',
            maxWidth:1100,
            margin:'0 auto',
            background: '#000000',
            border: '1px solid #0033A0',
            borderTop: '3px solid #0033A0',
            padding:'24px 0 32px 0'
          }}>
            <NoticiasList />
          </div>
        )}
          {section === 'nacionales' && (
          <div style={{ 
            maxWidth: 650, 
            margin: '2rem auto', 
            padding: 40, 
            border: '1px solid #FFDD00',
            borderTop: '3px solid #FFDD00',
            background: '#000000', 
            color: '#FFDD00', 
            textAlign: 'center', 
            fontSize: '1.15rem'
          }}>
            <h2 style={{
              color:'#FFDD00',
              fontWeight:900, 
              fontSize:'1.8rem', 
              marginBottom:20
            }}>
              Eventos Nacionales
            </h2>
            <p>Próximamente aquí podrás ver los eventos nacionales de robótica y tecnología.</p>
          </div>
        )}
          {section === 'internacionales' && (
          <div style={{ 
            maxWidth: 650, 
            margin: '2rem auto', 
            padding: 40, 
            border: '1px solid #0033A0',
            borderTop: '3px solid #0033A0',
            background: '#000000', 
            color: '#FFDD00', 
            textAlign: 'center', 
            fontSize: '1.15rem'
          }}>
            <h2 style={{
              color: '#0033A0',
              fontWeight: 900, 
              fontSize: '1.8rem', 
              marginBottom: 20
            }}>
              Eventos Internacionales
            </h2>
            <p>Próximamente aquí podrás ver los eventos internacionales de robótica y tecnología.</p>
          </div>
        )}
          {section === 'admin' && (
          <div style={{ 
            maxWidth: 700, 
            margin: '2rem auto', 
            padding: 40, 
            border: '1px solid #EF3340',
            borderTop: '3px solid #EF3340',
            background: '#000000', 
            color: '#FFDD00', 
            textAlign: 'center', 
            fontSize: '1.15rem'
          }}>
            <h2 style={{
              color: '#EF3340',
              fontWeight: 900, 
              fontSize: '1.8rem', 
              marginBottom: 20
            }}>
              Panel de Administrador
            </h2>
            {isAdmin ? (
              <>
                <p>¡Bienvenido, administrador! Aquí podrás gestionar usuarios, aprobar eventos, editar información y más (próximamente).</p>
                <div style={{marginTop:20, color:'#FFDD00', fontWeight:700}}>
                  Acceso concedido
                </div>
              </>
            ) : (
              <form onSubmit={e => {e.preventDefault(); if(adminInput === adminPassword) setIsAdmin(true); else alert('Contraseña incorrecta');}} style={{marginTop:25, maxWidth:300, margin:'25px auto'}}>
                <label style={{fontWeight:600}}>
                  Contraseña de administrador:
                  <input 
                    type="password" 
                    value={adminInput} 
                    onChange={e=>setAdminInput(e.target.value)} 
                    style={{
                      width:'100%',
                      padding:'8px 10px',
                      border:'1px solid #FFDD00',
                      background:'#000',
                      color:'#FFDD00',
                      marginTop:8,
                      display:'block'
                    }}
                  />
                </label>
                <button 
                  type="submit" 
                  style={{
                    marginTop:15,
                    padding:'8px 20px',
                    background:'#FFDD00',
                    color:'#000',
                    fontWeight:600,
                    border:'none',
                    cursor:'pointer'
                  }}
                >
                  Acceder
                </button>
                {isAdmin === false && adminInput === '' && (
                  <div style={{color:'#FFDD00',marginTop:15,fontSize:'0.9rem'}}>
                    Ingresa la contraseña para acceder.
                  </div>
                )}
              </form>
            )}
          </div>
        )}
        </main>
      <footer style={{width:'100%',textAlign:'center',padding:'18px 0',background:'#23272f',color:'#FFDD00',fontWeight:800,letterSpacing:1.5,marginTop:32,boxShadow:'0 -2px 8px #0033A055'}}>
        Creado por Chaski Bots Lab
      </footer>
    </div>
  );
}

export default App;
