
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente (incluindo as da Vercel)
  // Fix: cast process to any to access cwd() and env in environments where Node.js types might be incomplete
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Injeta a API_KEY no bundle do cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY || (process as any).env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000,
    }
  };
});
