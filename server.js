const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para que tu app Flutter pueda hacer solicitudes
app.use(cors());

// Endpoint para obtener URL de streaming
app.get('/api/stream-url/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  
  // Validar videoId para evitar inyección de comandos
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'ID de video inválido' });
  }
  
  exec(`yt-dlp -f bestaudio -g --no-warnings https://www.youtube.com/watch?v=${videoId}`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'Error al obtener URL' });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      const url = stdout.trim();
      if (!url) {
        return res.status(404).json({ error: 'No se encontró URL' });
      }
      
      res.json({ url });
    });
});

// Endpoint de estado
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});