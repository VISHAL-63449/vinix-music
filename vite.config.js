import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Custom plugin to serve audio files and images from root with partial content/Range support
function mediaServerPlugin() {
  return {
    name: 'media-server-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
        // Strip leading slash
        const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl;
        const filePath = path.resolve(__dirname, relativePath);

        // Security check: ensure path is within __dirname
        if (!filePath.startsWith(__dirname)) {
          return next();
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.jpeg': 'image/jpeg',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
          };

          const contentType = mimeTypes[ext];
          if (!contentType) {
            return next();
          }

          const stat = fs.statSync(filePath);
          const total = stat.size;
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunksize = end - start + 1;

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${total}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);
            return;
          } else {
            res.writeHead(200, {
              'Content-Length': total,
              'Accept-Ranges': 'bytes',
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            });
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mediaServerPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
    watch: {
      ignored: [
        '**/*.mp3',
        '**/*.wav',
        '**/*.ogg',
        '**/*.m4a',
        '**/*.jpeg',
        '**/*.jpg',
        '**/*.png',
        '**/*.webp',
        '**/node_modules/**',
        '**/.git/**'
      ]
    }
  }
});
