import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// get env use dotenv
const BASE_URL = process.env.VITE_BASE_API_URL;

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
    proxy: {
      '/api': BASE_URL || 'http://localhost:8000',
      '/storage': BASE_URL || 'http://localhost:8000'
    },
    allowedHosts: [
      'localhost',
      '.codeforfun.id.vn',
      '.onrender.com',
      '.a7atest.id.vn',
      '.a7acompany.com'
    ]
  }
});
