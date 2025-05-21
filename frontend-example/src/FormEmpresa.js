import React, { useState } from 'react';
import axios from 'axios';

// Tema de colores para mejorar apariencia
const theme = {
  primary: '#2563EB',      // Azul principal
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
};

export default function FormEmpresaTest() {
  // Campos básicos
  const [nombre_empresa, setNombreEmpresa] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Ubicación
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  
  // Contacto
  const [contacto, setContacto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [web, setWeb] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Estado del formulario
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Este es el mismo manejador que usamos en ImagenTest
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Imagen seleccionada:', file.name, file.type, file.size);
      setLogo(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogo(null);
      setLogoPreview(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    
    console.log("Enviando formulario con nombre:", nombre_empresa);
    console.log("Logo seleccionado:", logo ? logo.name : "ninguno");
    
    // Validación básica
    if (!nombre_empresa.trim()) {
      setMensaje('El nombre de la empresa es obligatorio');
      setLoading(false);
      return;
    }
    
    try {
      // SOLUCIÓN SIMPLIFICADA QUE SÍ FUNCIONA
      let logoUrl = '';
      
      // COPIAR EXACTAMENTE EL CÓDIGO QUE FUNCIONA DEL COMPONENTE DE PRUEBA
      if (logo) {
        try {
          // 1. SUBIR DIRECTO A DRIVE
          const formData = new FormData();
          formData.append('imagen', logo);
          
          console.log('Formdata creado con:', logo.name);
          
          // Usar fetch en lugar de axios como alternativa
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
            logoUrl = datos.url;
            console.log('URL de la imagen:', logoUrl);
          } else {
            throw new Error('No se recibió URL de la imagen');
          }
        } catch (error) {
          console.error('Error completo:', error);
          setMensaje(`Error: ${error.message || 'Error desconocido'}`);
          // Seguimos para guardar al menos los datos básicos
        }
      }
      
      // FORMATO SIMPLIFICADO DE PAYLOAD QUE FUNCIONA (como en la memoria)
      const logoPayload = logoUrl ? [{ url: logoUrl }] : '';
      console.log("Logo payload:", logoPayload);
      
      // Usar directamente el servidor local para evitar problemas de CORS
      console.log('Enviando datos a Airtable mediante servidor local...');
      const saveRes = await axios.post('https://api-tecno-ecuador.up.railway.app/saveAirtable', {
        table: 'empresas',
        data: {
          nombre_empresa,
          descripcion,
          logo_url: logoPayload,
          ciudad,
          pais,
          contacto,
          whatsapp,
          web,
          telefono
        }
      });
      
      console.log("Respuesta de Airtable:", saveRes.data);
      setMensaje("¡Empresa guardada correctamente!");
      
      // Limpiar todos los campos
      setNombreEmpresa('');
      setDescripcion('');
      setLogo(null);
      setLogoPreview(null);
      setCiudad('');
      setPais('');
      setContacto('');
      setWhatsapp('');
      setWeb('');
      setTelefono('');
    } catch (error) {
      console.error("Error al guardar empresa:", error);
      setMensaje("Error al guardar empresa: " + (error.message || 'Error desconocido'));
    }
    
    setLoading(false);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', background: theme.darkBg, color: theme.textLight, borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center', color: theme.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <span style={{ fontSize: 28 }}>💼</span> Registro de Empresa
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Solo los campos esenciales */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
            Nombre de la empresa *
          </label>
          <input
            type="text"
            value={nombre_empresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)',
              color: 'white',
              fontSize: '16px'
            }}
            placeholder="Ingrese el nombre de la empresa"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)',
              color: 'white',
              fontSize: '16px',
              height: '120px',
              resize: 'vertical'
            }}
            placeholder="Ingrese una descripción de la empresa"
          />
        </div>
        
        {/* Ubicación */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              Ciudad
            </label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="Ciudad"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              País
            </label>
            <input
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="País"
            />
          </div>
        </div>
        
        {/* Sección de Contacto */}
        <div style={{ 
          marginBottom: '20px',
          background: theme.darkBg,
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: theme.secondary,
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px' 
          }}>
            <span>📱</span> Información de contacto
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              Email de contacto
            </label>
            <input
              type="email"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="email@empresa.com"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="+593999999999"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              Página web
            </label>
            <input
              type="url"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="https://empresa.com"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textLight }}>
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="099999999"
            />
          </div>
        </div>
        
        {/* Subida de imágenes usando el código de ImagenTest que SÍ funciona */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ background: theme.darkBg, padding: '15px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: theme.textLight }}>
              <span style={{ fontSize: '18px' }}>🖼️</span> Logo de la Empresa
            </h3>
            
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: theme.textLight }}>
                  Selecciona una imagen:
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: theme.textLight
                  }}
                />
              </div>
              
              {logoPreview && (
                <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                  <p style={{ color: theme.textLight }}>Vista previa:</p>
                  <img 
                    src={logoPreview} 
                    alt="Vista previa" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px' 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botón de envío */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            display: 'block',
            width: '100%',
            padding: '12px 15px', 
            background: theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Empresa'}
        </button>
      </form>
      
      {mensaje && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: mensaje.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          border: `1px solid ${mensaje.includes('Error') ? theme.danger : theme.success}`,
          borderRadius: '5px',
          color: mensaje.includes('Error') ? theme.danger : theme.success
        }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
