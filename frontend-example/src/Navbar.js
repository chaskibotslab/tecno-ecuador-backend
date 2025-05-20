import React, { useState, useEffect } from 'react';

const navStyle = {
  height: '100vh',
  width: 240,
  position: 'fixed',
  top: 0,
  background: '#000000',
  boxShadow: '0 0 25px rgba(0,0,0,0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '2.5rem 1.4rem 1.5rem 1.4rem',
  zIndex: 9999,
  fontFamily: 'Arial, sans-serif',
  borderRight: '3px solid #FFDD00',
  transition: 'all 0.3s ease-in-out'
};
const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: 17,
  fontWeight: 600,
  padding: '12px 18px',
  borderRadius: 8,
  transition: 'all 0.25s ease',
  margin: '3px 0',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  letterSpacing: 0.8,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
};

export default function Navbar({ setSection, section }) {
  const [showMenu, setShowMenu] = useState(window.innerWidth >= 800);
  useEffect(() => {
    const handleResize = () => setShowMenu(window.innerWidth >= 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {window.innerWidth < 800 && (
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          style={{
            position: 'fixed',
            top: 15,
            left: 15,
            zIndex: 9999,
            background: '#FFDD00',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            padding: 8,
            cursor: 'pointer',
            width: 48,
            height: 48,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transform: showMenu ? 'rotate(0deg)' : 'rotate(0deg)',
            transition: 'all 0.3s ease'
          }}
        >
          {showMenu ? '✕' : '≡'}
        </button>
      )}
      {/* Overlay drawer */}
      {showMenu && window.innerWidth < 800 && (
        <div onClick={() => setShowMenu(false)} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.38)',zIndex:1099}} />
      )}
      <nav style={{
        ...navStyle,
        left: showMenu ? 0 : '-240px',
        zIndex: 1100,
      }}>
        <div style={{textAlign:'center',width:'100%',marginBottom:30}}>
          <span style={{fontWeight:'bold',fontSize:22, color:'#FFDD00', letterSpacing:1.5, display:'inline-block'}}>
            Tecnología Ecuador
          </span>
          <div style={{height:4, background: 'linear-gradient(to right, #FFDD00 33%, #0033A0 33%, #0033A0 66%, #EF3340 66%, #EF3340 100%)', marginTop:10, boxShadow: '0 2px 4px rgba(0,0,0,0.3)'}} />
        </div>

        <button style={{...linkStyle, 
            background: section==='eventos'? 'rgba(255,221,0,0.1)' : 'transparent',
            color: section==='eventos'? '#FFDD00' : '#fff',
            borderLeft: section==='eventos'? '3px solid #FFDD00' : '3px solid transparent',
            boxShadow: section==='eventos'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('eventos');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#FFDD00', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(255,221,0,0.15)'}}>E</span> Eventos
        </button>
        
        <div style={{height:1, background:'#333', margin:'10px 0', width:'90%'}}></div>
        
        <button style={{...linkStyle, 
            background: section==='empresas'? 'rgba(0,51,160,0.1)' : 'transparent',
            color: section==='empresas'? '#0033A0' : '#fff',
            borderLeft: section==='empresas'? '3px solid #0033A0' : '3px solid transparent',
            boxShadow: section==='empresas'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('empresas');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#0033A0', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(0,51,160,0.15)'}}>E</span> Empresas
        </button>
        
        <button style={{...linkStyle, 
            background: section==='equipos'? 'rgba(0,51,160,0.1)' : 'transparent',
            color: section==='equipos'? '#0033A0' : '#fff',
            borderLeft: section==='equipos'? '3px solid #0033A0' : '3px solid transparent',
            boxShadow: section==='equipos'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('equipos');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#0033A0', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(0,51,160,0.15)'}}>T</span> Equipos
        </button>
        
        <button style={{...linkStyle, 
            background: section==='miembros'? 'rgba(0,51,160,0.1)' : 'transparent',
            color: section==='miembros'? '#0033A0' : '#fff',
            borderLeft: section==='miembros'? '3px solid #0033A0' : '3px solid transparent',
            boxShadow: section==='miembros'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('miembros');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#0033A0', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(0,51,160,0.15)'}}>M</span> Miembros
        </button>
        
        <button style={{...linkStyle, 
            background: section==='noticias'? 'rgba(0,51,160,0.1)' : 'transparent',
            color: section==='noticias'? '#0033A0' : '#fff',
            borderLeft: section==='noticias'? '3px solid #0033A0' : '3px solid transparent',
            boxShadow: section==='noticias'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('noticias');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#0033A0', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(0,51,160,0.15)'}}>N</span> Noticias
        </button>
        
        <div style={{height:1, background:'#333', margin:'10px 0', width:'90%'}}></div>
        
        <button style={{...linkStyle, 
            background: section==='agregar'? 'rgba(239,51,64,0.1)' : 'transparent',
            color: section==='agregar'? '#EF3340' : '#fff',
            borderLeft: section==='agregar'? '3px solid #EF3340' : '3px solid transparent',
            boxShadow: section==='agregar'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('agregar');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#EF3340', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(239,51,64,0.15)'}}>+</span> Agregar
        </button>
        
        <button style={{...linkStyle, 
            background: section==='admin'? 'rgba(239,51,64,0.1)' : 'transparent',
            color: section==='admin'? '#EF3340' : '#fff',
            borderLeft: section==='admin'? '3px solid #EF3340' : '3px solid transparent',
            boxShadow: section==='admin'? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
          }} onClick={() => {
          setSection('admin');
          setShowMenu(window.innerWidth >= 800);
        }}>
          <span style={{fontSize:16, color:'#EF3340', width:26, height:26, textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'50%', background:'rgba(239,51,64,0.15)'}}>A</span> Admin
        </button>
      </nav>
    </>
  );
}
