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
  // Simulación de usuario administrador
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('isAdmin');
    return stored === 'true';
  });
  const [adminInput, setAdminInput] = useState("");
  const adminPassword = "adminchaski2024"; // Puedes cambiar esta clave
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
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 900 ? '1fr' : 'repeat(2, 1fr)',
            gap: 32,
            justifyContent: 'center',
            alignItems: 'flex-start',
            margin: '0 auto',
            maxWidth: 1200,
            width: '100%',
            overflowX: 'auto',
            paddingTop: 0,
          }}>
            <div style={{background:'#181b24',borderRadius:16,padding:20,boxShadow:'0 2px 12px #0033A044',minWidth:280}}><FormEvento /></div>
            <div style={{background:'#181b24',borderRadius:16,padding:20,boxShadow:'0 2px 12px #0033A044',minWidth:280}}><FormEquipo /></div>
            <div style={{background:'#181b24',borderRadius:16,padding:20,boxShadow:'0 2px 12px #0033A044',minWidth:280}}>{isAdmin ? <FormEmpresa /> : <div style={{color:'#555',fontWeight:700,textAlign:'center'}}>Solo administradores pueden registrar empresas</div>}</div>
            <div style={{background:'#181b24',borderRadius:16,padding:20,boxShadow:'0 2px 12px #0033A044',minWidth:280}}>{isAdmin ? <FormNoticia /> : <div style={{color:'#555',fontWeight:700,textAlign:'center'}}>Solo administradores pueden registrar noticias</div>}</div>
            <div style={{background:'#181b24',borderRadius:16,padding:20,boxShadow:'0 2px 12px #0033A044',minWidth:280}}><FormMiembro /></div>
          </div>
        )}
          {section === 'formulario' && (
            <FormEvento />
          )}
          {section === 'equipos' && (
          <div style={{width:'100%',maxWidth:1100,margin:'0 auto',background:'#23272f',borderRadius:20,boxShadow:'0 4px 32px #0033A055',padding:'24px 0 32px 0'}}>
            <FormEquipo onSuccess={() => {}} />
            <EquiposList />
          </div>
        )}
          {section === 'miembros' && (
          <div style={{
            width:'100%',
            maxWidth:1100,
            margin:'0 auto',
            background: '#000000',
            border: '1px solid #FFDD00',
            borderTop: '3px solid #FFDD00',
            padding:'24px 0 32px 0'
          }}>
            <FormMiembro onSuccess={() => {}} />
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
