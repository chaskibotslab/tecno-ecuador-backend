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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir archivos estáticos desde public_html/app en la ruta /app
app.use('/app', express.static(path.join(__dirname, 'public_html/app')));

// Configuración CORS para permitir solicitudes desde cualquier origen
app.use(function(req, res, next) {
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

// Ejemplo de endpoint para guardar datos en Airtable
dotenv.config();
app.use(express.json());

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

// Ruta específica para /app (para la APP móvil)
app.get('/app', (req, res) => {
  const indexPath = path.join(__dirname, 'public_html/app/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App no encontrada en: ' + indexPath);
  }
});

// Ruta específica para /app/* (para React Router)
app.get('/app/*', (req, res) => {
  const indexPath = path.join(__dirname, 'public_html/app/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App no encontrada');
  }
});

// Ruta raíz redirige a /app
app.get('/', (req, res) => {
  res.redirect('/app');
});

// Usar puerto dinámico para Railway
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 App React: http://0.0.0.0:${PORT}/app`);
  console.log(`📁 Sirviendo desde: ${path.join(__dirname, 'public_html/app')}`);
  console.log(`🔍 Buscando index.html en: ${path.join(__dirname, 'public_html/app/index.html')}`);
  
  // Verificar si los archivos existen
  const indexExists = fs.existsSync(path.join(__dirname, 'public_html/app/index.html'));
  const jsExists = fs.existsSync(path.join(__dirname, 'public_html/app/static/js/main.f3bfcb26.js'));
  console.log(`✅ index.html existe: ${indexExists}`);
  console.log(`✅ main.js existe: ${jsExists}`);
});
