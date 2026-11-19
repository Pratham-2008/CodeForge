import type { IncomingMessage, ServerResponse } from 'http';
import { handleAuthRoutes } from '../server/authRoutes';

/**
 * Vercel Serverless Function entry point for CodeForge
 * Catches all /api/* requests and delegates to the unified API router.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleAuthRoutes(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Endpoint not found', 
        path: req.url,
        matched: req.headers['x-matched-path'] || req.headers['x-forwarded-uri']
      }));
    }
  } catch (err: any) {
    console.error('[CodeForge Vercel Function Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
  }
}
