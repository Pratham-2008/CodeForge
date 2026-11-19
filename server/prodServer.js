import { preview } from 'vite';

const port = Number(process.env.PORT) || 3000;

try {
  const previewServer = await preview({
    preview: {
      port,
      host: true
    }
  });

  previewServer.printUrls();
  console.log(`[CodeForge] Production server running with full API backend on port ${port}`);
} catch (err) {
  console.error('[CodeForge] Failed to start production server:', err);
  process.exit(1);
}
