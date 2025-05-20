import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      // Nunca envíes logo_url al editar, solo si hay lógica para subir imagen nueva
      const formToSend = { ...form };
      if ('logo_url' in formToSend) {
        delete formToSend.logo_url;
      }
      await axios.post('http://localhost:3001/saveAirtable', {
        table: 'empresas',
        id: empresa.id,
        data: formToSend
      });
      onSave({ ...empresa, fields: { ...form } });
      onClose();
    } catch (err) {
      let msg = err.response?.data?.error || err.message;
      if (err.response?.data?.airtable_error) msg += ': ' + err.response.data.airtable_error;
      if (err.response?.data?.details && typeof err.response.data.details === 'string') msg += ': ' + err.response.data.details;
      if (err.response?.data?.details && typeof err.response.data.details === 'object' && err.response.data.details.error?.message) msg += ': ' + err.response.data.details.error.message;
      setErrorMsg(msg);
    }
    setSaving(false);
  };
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#000a',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <form onSubmit={handleSubmit} style={{background:'#23272f',padding:30,borderRadius:18,minWidth:320,maxWidth:480,boxShadow:'0 6px 32px #0033A0cc',color:'#fff'}}>
        <h2 style={{color:'#FFDD00',marginBottom:18}}>Editar Empresa</h2>
        <label>Nombre:<br/><input name="nombre_empresa" value={form.nombre_empresa||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>Descripción:<br/><textarea name="descripcion" value={form.descripcion||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>Ciudad:<br/><input name="ciudad" value={form.ciudad||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>País:<br/><input name="pais" value={form.pais||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>Contacto (email):<br/><input name="contacto" value={form.contacto||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>WhatsApp:<br/><input name="whatsapp" value={form.whatsapp||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>Página web:<br/><input name="web" value={form.web||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>
        <label>Teléfono:<br/><input name="telefono" value={form.telefono||''} onChange={handleChange} style={{width:'100%',marginBottom:10}}/></label><br/>

        {errorMsg && <div style={{color:'#EF3340',marginBottom:12,marginTop:-8,fontWeight:700}}>{errorMsg}</div>}
        <div style={{display:'flex',gap:16,marginTop:18}}>
          <button type="submit" disabled={saving} style={{background:'#FFDD00',color:'#0033A0',fontWeight:900,border:'none',borderRadius:8,padding:'8px 18px',fontSize:16}}>Guardar</button>
          <button type="button" onClick={onClose} style={{background:'#EF3340',color:'#fff',fontWeight:900,border:'none',borderRadius:8,padding:'8px 18px',fontSize:16}}>Cancelar</button>
        </div>
      </form>
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
      setLoading(true);
      setError('');
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'empresas',
          action: 'list'
        });
        setEmpresas(res.data.records || []);
      } catch (err) {
        setError('No se pudieron cargar las empresas');
      }
      setLoading(false);
    }
    fetchEmpresas();
  }, []);

  if (loading) return <div style={{color:'#FFDD00',textAlign:'center',marginTop:40}}>Cargando empresas...</div>;
  if (error) return <div style={{color:'#EF3340',textAlign:'center',marginTop:40}}>{error}</div>;

  if (!empresas.length) return <div style={{color:'#FFDD00',textAlign:'center',marginTop:40}}>No hay empresas registradas.</div>;

  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'#23272f',borderRadius:18,boxShadow:'0 4px 32px #0007',padding:'24px 0 32px 0'}}>
      <h2 style={{color:'#FFDD00',textAlign:'center',marginBottom:24}}>Empresas Tecnológicas Registradas</h2>
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:28}}>
        {empresas.map(emp => (
  <div key={emp.id} style={{background:'#181b24',borderRadius:16,padding:20,minWidth:260,maxWidth:320,boxShadow:'0 2px 12px #0033A055',marginBottom:18,position:'relative'}}>
    {/* Imagen y nombre */}
    {emp.fields?.logo_url && Array.isArray(emp.fields.logo_url) && emp.fields.logo_url[0]?.url ? (
      <>
        <img src={emp.fields.logo_url[0].url} alt="logo" style={{width:120,height:120,objectFit:'contain',borderRadius:20,marginBottom:16,background:'#fff',boxShadow:'0 2px 12px #0033A055',cursor:'zoom-in'}} onClick={()=>setAmpliarImg(emp.fields.logo_url[0].url)} />
        <h3 style={{color:'#FFDD00',marginBottom:6, fontSize:22}}>{emp.fields?.nombre_empresa || 'Sin nombre'}</h3>
      </>
    ) : (
      <h3 style={{color:'#FFDD00',marginBottom:6, fontSize:22}}>{emp.fields?.nombre_empresa || 'Sin nombre'}</h3>
    )}
    {/* Resto de datos */}
    <div style={{color:'#fff',marginBottom:6}}>{emp.fields?.descripcion || 'Sin descripción'}</div>
            <div style={{color:'#FFDD00',fontWeight:700, fontSize:16}}>{emp.fields?.ciudad || ''}{emp.fields?.ciudad && emp.fields?.pais ? ', ' : ''}{emp.fields?.pais || ''}</div>
            <div style={{color:'#fff',marginTop:8,fontSize:14}}><b>Contacto:</b> {emp.fields?.contacto || 'No especificado'}</div>
            {emp.fields?.whatsapp && (
              <div style={{marginTop:8}}>
                <a href={`https://wa.me/${emp.fields.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{color:'#25D366',fontWeight:700,fontSize:20,textDecoration:'none'}}>
                  🟢 WhatsApp
                </a>
              </div>
            )}

            {emp.fields?.telefono && (
              <div style={{marginTop:8}}>
                <a href={`tel:${emp.fields.telefono}`} style={{color:'#FFDD00',fontWeight:700,fontSize:20,textDecoration:'none'}}>
                  📞 Llamar
                </a>
              </div>
            )}
            {emp.fields?.web && (
              <div style={{marginTop:8}}>
                <a href={(emp.fields.web.startsWith('http://') || emp.fields.web.startsWith('https://')) ? emp.fields.web : `https://${emp.fields.web}`} target="_blank" rel="noopener noreferrer" style={{color:'#0099ff',fontWeight:700,fontSize:18,textDecoration:'underline'}}>
                  🌐 Sitio web
                </a>
              </div>
            )}


          </div>
        ))}

      </div>
      {/* Modal de imagen ampliada */}
      {ampliarImg && (
        <div onClick={()=>setAmpliarImg(null)} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={ampliarImg} alt="ampliada" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:18,boxShadow:'0 4px 32px #FFDD00'}} />
          <button onClick={e=>{e.stopPropagation();setAmpliarImg(null);}} style={{position:'fixed',top:30,right:30,fontSize:30,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:40,width:50,height:50,cursor:'pointer'}}>✖</button>
        </div>
      )}
    </div>
  );
}
