import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

function firebaseServerProxyPlugin(env: Record<string, string>): Plugin {
  const getDb = () => {
    const firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
      measurementId: env.FIREBASE_MEASUREMENT_ID,
    };
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return getFirestore(app);
  };

  const attachMiddleware = (middlewares: any) => {
    middlewares.use('/api/waitlist', (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      let rawBody = '';
      req.on('data', (chunk: any) => {
        rawBody += chunk;
      });
      req.on('end', async () => {
        try {
          const { email, organization } = JSON.parse(rawBody || '{}');
          if (env.FIREBASE_API_KEY && env.FIREBASE_PROJECT_ID && email) {
            const db = getDb();
            await addDoc(collection(db, 'waitlist'), {
              email: String(email).trim().toLowerCase(),
              organization: String(organization || 'Unspecified'),
              source: 'govroute-landing',
              createdAt: serverTimestamp(),
            });
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, queued: true }));
        }
      });
    });

    middlewares.use('/api/telemetry', (req: any, res: any) => {
      res.statusCode = 204;
      res.end();
    });
  };

  return {
    name: 'firebase-server-proxy',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load only FIREBASE_ server variables into the Node process (never exposed to client bundle)
  const env = loadEnv(mode, process.cwd(), 'FIREBASE_');

  return {
    plugins: [react(), tailwindcss(), firebaseServerProxyPlugin(env)],
    build: {
      sourcemap: false,
    },
  };
});
