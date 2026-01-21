import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (inclusa OPENAI_API_KEY) in process.env
  const env = loadEnv(mode, process.cwd(), '');
  process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
          id: 'pantry-manager-app',
          name: 'Pantry Manager',
          short_name: 'Pantry',
          description: 'Gestione dispensa e scadenze',
          categories: ['food', 'productivity', 'lifestyle'],
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true
        }
      })
    ],
    server: {
      host: true, // Permette l'accesso dalla rete locale (es. Android)
      configureServer(server) {
        server.middlewares.use('/api/parse-receipt', async (req, res, next) => {
          if (req.method !== 'POST') {
            next();
            return;
          }

          try {
            // Bufferizza il body della richiesta Node
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            const body = JSON.parse(data || '{}');

            // Importa il handler API dinamicamente
            const { default: parseReceipt } = await import('./api/parse-receipt.js');

            // Crea un oggetto simile a Request per il handler
            const mockReq = {
              method: 'POST',
              json: async () => body
            };

            // Esegui il handler
            const response = await parseReceipt(mockReq);

            // Invia la risposta
            const responseData = await response.text();
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(responseData);

          } catch (error) {
            console.error('API Middleware Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      }
    }
  };
})
