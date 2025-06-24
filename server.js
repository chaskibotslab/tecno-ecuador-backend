import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware anti-cache para WebViews móviles - ESTO SOLUCIONA EL PROBLEMA DE LA APP
app.use((req, res, next) => {
  // Headers anti-cache específicos para WebViews
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Headers CORS (manteniendo tu configuración original)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Headers adicionales para WebView
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Manejar las solicitudes de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mantener también el middleware cors para compatibilidad
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos (frontend-example)
app.use(express.static(path.join(__dirname, 'frontend-example'), {
  setHeaders: (res, filePath) => {
    // No cachear HTML, JS, CSS en WebViews
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

const upload = multer({ dest: 'uploads/' });

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Usar credenciales desde variable de entorno o archivo local
let auth;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  // Para entorno de producción (Railway)
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
} else {
  // Para entorno de desarrollo local
  const KEYFILEPATH = './roboticoncurso-f4daec7e9d78.json';
  auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
}
const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = process.env.DRIVE_FOLDER_ID;

function getPublicUrl(fileId) {
  return `https://drive.google.com/uc?id=${fileId}`;
}

// TUS ENDPOINTS ORIGINALES - SIN CAMBIOS
// Endpoint para subir imagen
app.post('/upload', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (req.file.size > 10 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: [FOLDER_ID],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    const fileId = file.data.id;
    // Hacer el archivo público automáticamente (aplica para cualquier imagen subida)
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (e) {
      // Si ya es público, ignora el error
    }
    fs.unlinkSync(req.file.path);
    // Generar URL pública
    const url = getPublicUrl(fileId);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para guardar datos en Airtable
app.post('/saveAirtable', async (req, res) => {
  // Debes poner tu API key y base ID de Airtable en variables de entorno
  const { table, data, action, id } = req.body;
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable API key or Base ID not configured' });
  }
  try {
    if (action === 'list') {
      // Listar registros de Airtable
      try {
        const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        return res.json({ records: response.data.records });
      } catch (err) {
        console.error('Error consultando Airtable:', err.response ? err.response.data : err.message);
        return res.status(500).json({ error: 'Error consultando Airtable', details: err.response ? err.response.data : err.message });
      }
    }
    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'Falta el id para eliminar' });
      await axios.delete(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}/${id}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      });
      return res.json({ success: true });
    }
    if (!table || !data) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }
    // Guardar registro en Airtable
    const response = await axios.post(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`,
      { fields: data },
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    res.json({ id: response.data.id, fields: response.data.fields });
  } catch (error) {
    // Devuelve el error completo de Airtable para mejor depuración
    if (error.response && error.response.data) {
      // Devuelve el mensaje y detalles exactos de Airtable
      res.status(500).json({
        error: 'Error al guardar en Airtable',
        details: error.response.data,
        airtable_error: error.response.data.error ? error.response.data.error.message : undefined
      });
    } else {
      res.status(500).json({ error: 'Error al guardar en Airtable', details: error.message });
    }
  }
});

// NUEVAS RUTAS PARA SERVIR EL FRONTEND Y SOLUCIONAR EL PROBLEMA DE LA APP

// Ruta específica para /app (donde entra la APP móvil)
app.get('/app', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Buscar el archivo index.html en la carpeta frontend-example
  const indexPath = path.join(__dirname, 'frontend-example', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Si no encuentra el archivo, crear uno temporal
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Tecno Ecuador</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Tecno Ecuador</h1>
            <p>¡Aplicación funcionando correctamente!</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <button class="btn" onclick="testAPI()">🧪 Probar API</button>
            <div id="result"></div>
        </div>
        <script>
            console.log('✅ Aplicación cargada - ${new Date().toISOString()}');
            
            function testAPI() {
                fetch('/saveAirtable', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'test', action: 'list' })
                })
                .then(r => r.json())
                .then(data => {
                    document.getElementById('result').innerHTML = '<p>✅ API funcionando: ' + JSON.stringify(data).substring(0, 100) + '...</p>';
                })
                .catch(e => {
                    document.getElementById('result').innerHTML = '<p>❌ Error: ' + e.message + '</p>';
                });
            }
            
            // Auto-test al cargar
            setTimeout(testAPI, 1000);
        </script>
    </body>
    </html>
  `);
});

// Ruta para la raíz - redirigir a /app
app.get('/', (req, res) => {
  res.redirect('/app');
});

// Catch-all para aplicaciones SPA (Single Page Application)
app.get('*', (req, res) => {
  // No aplicar catch-all a rutas de API
  if (req.path.startsWith('/upload') || req.path.startsWith('/saveAirtable')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  
  // Para cualquier otra ruta, servir la aplicación principal
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const indexPath = path.join(__dirname, 'frontend-example', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Si no existe, redirigir a /app
  res.redirect('/app');
});

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend disponible en: http://0.0.0.0:${PORT}/app`);
  console.log(`🌐 Producción: https://chaskibots.com/app`);
  console.log(`📁 Buscando archivos en: ${path.join(__dirname, 'frontend-example')}`);
});
