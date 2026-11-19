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
  // 0. Handle Authentication and Admin API routes
  try {
    const handledAuth = await handleAuthRoutes(req, res);
    if (handledAuth) return;
  } catch (authErr) {
    console.error('[CodeForge Auth Middleware Error]:', authErr);
  }

  const url = req.url?.split('?')[0];

      // Health endpoint
      if (url === '/api/health' && req.method === 'GET') {
        const hasKey = !!process.env.JUDGE0_API_KEY;
        const endpoint = process.env.JUDGE0_ENDPOINT || 'https://ce.judge0.com';
        return sendJsonResponse(res, 200, {
          status: 'ok',
          judge0Endpoint: endpoint,
          hasServerApiKey: hasKey
        });
      }

      // Execute endpoint
      if (url === '/api/execute' && req.method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const { language, language_id, source_code, stdin = '', endpoint: clientEndpoint, apiKey: clientApiKey } = body;

          // 1. Validation
          if (!source_code || typeof source_code !== 'string') {
            return sendJsonResponse(res, 400, { error: 'source_code must be a non-empty string' });
          }

          if (!language_id || typeof language_id !== 'number') {
            return sendJsonResponse(res, 400, { error: 'valid language_id is required' });
          }

          if (source_code.length > 65536) {
            return sendJsonResponse(res, 400, { error: 'Source code exceeds maximum allowed size (64KB)' });
          }

          // 2. Resolve credentials safely on backend
          const targetEndpoint = (clientEndpoint?.trim() || process.env.JUDGE0_ENDPOINT?.trim() || 'https://ce.judge0.com').replace(/\/$/, '');
          const apiKey = clientApiKey?.trim() || process.env.JUDGE0_API_KEY?.trim() || '';
          const isRapidApi = targetEndpoint.includes('rapidapi.com');

          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };

          if (apiKey) {
            if (isRapidApi) {
              headers['X-RapidAPI-Key'] = apiKey;
              headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
            } else {
              headers['X-Auth-Token'] = apiKey;
            }
          }

          // 3. Sandboxed limits: 5.0s CPU, 10.0s wall time, 128MB RAM
          const base64Source = Buffer.from(source_code, 'utf-8').toString('base64');
          const base64Stdin = Buffer.from(stdin || '', 'utf-8').toString('base64');

          const submissionPayload = {
            language_id,
            source_code: base64Source,
            stdin: base64Stdin,
            cpu_time_limit: 5.0,
            wall_time_limit: 10.0,
            memory_limit: 128000
          };

          const submissionUrl = `${targetEndpoint}/submissions?base64_encoded=true&wait=true`;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);

          try {
            const judgeRes = await fetch(submissionUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(submissionPayload),
              signal: controller.signal
            });

            clearTimeout(timeout);

            if (!judgeRes.ok) {
              const errBody = await judgeRes.text();
              let parsedErr: any;
              try { parsedErr = JSON.parse(errBody); } catch (_) {}

              return sendJsonResponse(res, 200, {
                error: `Backend compiler service returned status ${judgeRes.status} (${judgeRes.statusText})`,
                details: parsedErr?.message || parsedErr?.error || errBody || 'Failed to submit code to Judge0',
                isConfigured: judgeRes.status !== 401 && judgeRes.status !== 403
              });
            }

            const data: any = await judgeRes.json();

            const decodeB64 = (val?: string | null) => {
              if (!val) return '';
              try {
                return Buffer.from(val, 'base64').toString('utf-8');
              } catch (_) {
                return val;
              }
            };

            const stdout = decodeB64(data.stdout);
            const stderr = decodeB64(data.stderr);
            const compileOutput = decodeB64(data.compile_output);

            return sendJsonResponse(res, 200, {
              stdout,
              stderr,
              compileOutput,
              status: data.status?.description || 'Completed',
              time: data.time ? `${data.time}s` : undefined,
              memory: data.memory ? `${data.memory} KB` : undefined,
              isConfigured: true
            });
          } catch (fetchErr: any) {
            clearTimeout(timeout);
            return sendJsonResponse(res, 200, {
              error: 'Could not connect to Judge0 execution service.',
              details: `Connection to ${targetEndpoint} failed: ${fetchErr.message}. Ensure your Judge0 endpoint or RapidAPI credentials are valid.`,
              isConfigured: false
            });
          }
        } catch (err: any) {
          return sendJsonResponse(res, 500, { error: 'Internal execution proxy error', details: err.message });
        }
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
