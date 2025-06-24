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

// Solo agregar headers anti-cache para WebViews móviles
app.use(function(req, res, next) {
  // Headers anti-cache para solucionar problema de APP móvil
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  // Tu configuración CORS original (sin cambios)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Manejar las solicitudes de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mantener también el middleware cors para compatibilidad
app.use(cors());

// Servir archivos estáticos desde frontend-example (para que la APP encuentre el contenido)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'frontend-example'), {
  setHeaders: (res, path) => {
    // Anti-cache para archivos estáticos también
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

app.use(express.json());
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

// Solo agregar esta ruta para servir tu aplicación en /app
app.get('/app', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend-example', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Tecno Ecuador</title>
      </head>
      <body>
        <h1>Tecno Ecuador App</h1>
        <p>Servidor funcionando - ${new Date().toLocaleString()}</p>
        <script>
          console.log('App cargada correctamente');
          // Forzar actualización en WebView
          if (window.navigator.userAgent.includes('wv')) {
            console.log('WebView detectado - forzando actualización');
          }
        </script>
      </body>
      </html>
    `);
  }
});

// Ruta raíz redirige a /app
app.get('/', (req, res) => {
  res.redirect('/app');
});

// Usar puerto dinámico para Railway
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT} (accesible en red local)`);
  console.log(`App disponible en: http://0.0.0.0:${PORT}/app`);
});
