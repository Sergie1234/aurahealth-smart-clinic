import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Register tsx loader dynamically so Node can resolve TypeScript imports without flags
try {
  const { register } = await import('tsx/esm/api');
  register();
} catch {}

const { app } = await import('./src/serverApp');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Respect Cloud Run's PORT env variable (e.g. 8080) with fallback to 3000 for local AI Studio preview
const PORT = Number(process.env.PORT) || 3000;

// Setup Vite Dev Server or Production Static Serving
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Clinic Server running on port ${PORT} (0.0.0.0) [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
