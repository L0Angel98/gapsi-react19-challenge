import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const RAPID_API_HOST = 'axesso-walmart-data-service.p.rapidapi.com';
const RAPID_API_PATH = '/wlm/walmart-search-by-keyword';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

type RuntimeEnv = Record<string, string>;

/**
 * Proxy de desarrollo para RapidAPI. Node lee RAPIDAPI_KEY y nunca se expone
 * mediante una variable VITE_ ni dentro del bundle del navegador.
 */
function rapidApiProxy(env: RuntimeEnv): Plugin {
  const requestLog = new Map<string, number[]>();

  return {
    name: 'gapsi-rapidapi-proxy',
    configureServer(server) {
      server.middlewares.use('/api/products', async (request, response) => {
        if (request.method !== 'GET') {
          response.statusCode = 405;
          response.setHeader('Allow', 'GET');
          response.end(JSON.stringify({ error: 'Método no permitido' }));
          return;
        }

        const clientKey = request.socket.remoteAddress ?? 'unknown';
        const now = Date.now();
        const recentRequests = (requestLog.get(clientKey) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
        if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
          response.statusCode = 429;
          response.setHeader('Retry-After', '60');
          response.end(JSON.stringify({ error: 'Demasiadas búsquedas. Intenta de nuevo en un minuto.' }));
          return;
        }
        recentRequests.push(now);
        requestLog.set(clientKey, recentRequests);

        const requestUrl = new URL(request.url ?? '/', 'http://localhost');
        const keyword = requestUrl.searchParams.get('keyword')?.trim().slice(0, 100) ?? '';
        const pageValue = Number(requestUrl.searchParams.get('page') ?? '1');
        const page = Number.isInteger(pageValue) ? Math.max(1, Math.min(100, pageValue)) : 1;
        const apiKey = env.RAPIDAPI_KEY?.trim();

        if (!apiKey) {
          response.statusCode = 503;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: 'Configura RAPIDAPI_KEY en el entorno del proxy.' }));
          return;
        }
        if (keyword.length < 1) {
          response.statusCode = 400;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: 'keyword es obligatorio.' }));
          return;
        }

        const upstreamUrl = new URL(`https://${RAPID_API_HOST}${RAPID_API_PATH}`);
        upstreamUrl.searchParams.set('keyword', keyword);
        upstreamUrl.searchParams.set('page', String(page));
        upstreamUrl.searchParams.set('sortBy', 'best_match');

        try {
          const upstream = await fetch(upstreamUrl, {
            headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': RAPID_API_HOST }
          });
          response.statusCode = upstream.status;
          response.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
          response.end(Buffer.from(await upstream.arrayBuffer()));
        } catch {
          response.statusCode = 502;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ error: 'No fue posible consultar el servicio de productos.' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), rapidApiProxy(env)],
    build: {
      target: 'es2022',
      minify: 'esbuild',
      cssMinify: true,
      assetsInlineLimit: 4096,
    }
  };
});

