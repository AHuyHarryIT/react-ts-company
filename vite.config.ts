import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    // add others plugin before this line ^
    viteTsConfigPaths({
      projects: ['./tsconfig.json']
    })
  ],
  server: {
    allowedHosts: [
      'localhost',
      '.codeforfun.id.vn',
      '.onrender.com',
      '.a7atest.id.vn',
      '.a7acompany.com'
    ]
  }
});
