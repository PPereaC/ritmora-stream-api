const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para que tu app Flutter pueda hacer solicitudes
app.use(cors());

// Verificar que yt-dlp está instalado
exec('yt-dlp --version', (error, stdout, stderr) => {
  if (error) {
    console.error('Error: yt-dlp no está instalado o accesible');
    console.error(error);
  } else {
    console.log(`yt-dlp versión: ${stdout.trim()}`);
  }
});

// Endpoint para obtener URL de streaming
app.get('/api/stream-url/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  
  // Validar videoId para evitar inyección de comandos
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'ID de video inválido' });
  }
  
  console.log(`Obteniendo URL para video ID: ${videoId}`);
  
  // Modificar el comando en server.js
const command = `yt-dlp -f bestaudio -g --no-warnings --cookies-from-browser chrome https://www.youtube.com/watch?v=${videoId}`;
  console.log(`Ejecutando comando: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando yt-dlp: ${error.message}`);
      return res.status(500).json({ error: 'Error al obtener URL', details: error.message });
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    
    const url = stdout.trim();
    if (!url) {
      console.error('No se encontró URL');
      return res.status(404).json({ error: 'No se encontró URL' });
    }
    
    console.log(`URL obtenida para ${videoId} (truncada): ${url.substring(0, 50)}...`);
    res.json({ url });
  });
});

// Endpoint de estado
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Ritmora Stream API</title></head>
      <body>
        <h1>Ritmora Stream API</h1>
        <p>API para obtener URLs de streaming de YouTube.</p>
        <p>Endpoints disponibles:</p>
        <ul>
          <li><code>/health</code> - Verificar estado del servidor</li>
          <li><code>/api/stream-url/:videoId</code> - Obtener URL de streaming para un ID de video</li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});