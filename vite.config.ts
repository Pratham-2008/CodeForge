import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleAuthRoutes } from './server/authRoutes';

function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJsonResponse(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Shared API middleware for Auth, Admin, Health, and Judge0 Compiler
async function apiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  try {
    const handled = await handleAuthRoutes(req, res);
    if (handled) return;
  } catch (err) {
    console.error('[CodeForge API Middleware Error]:', err);
  }
  next();
}

// Backend compiler & authentication API plugin for both dev and preview servers
const backendCompilerPlugin = () => ({
  name: 'codeforge-backend-compiler',
  configureServer(server: any) {
    server.middlewares.use(apiMiddleware);
  },
  configurePreviewServer(server: any) {
    server.middlewares.use(apiMiddleware);
  }
});

export default defineConfig({
  plugins: [react(), backendCompilerPlugin()],
  resolve: {
    preserveSymlinks: true
  },
  server: {
    port: 3000,
    open: false,
    host: true,
    fs: {
      strict: false,
      allow: [
        'E:/codeforge',
        'C:/Users/Dr Adarsh Srivastava/.gemini/antigravity/scratch/codeforge'
      ]
    }
  },
  preview: {
    port: 3000,
    host: true
  }
});
