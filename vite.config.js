import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Auto-registra el SW y actualiza cuando haya cambios
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'], // Archivos adicionales
      manifest: {
        name: 'React PWA App',
        short_name: 'PWA App',
        description: 'Una aplicación PWA con React y Vite',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      // Configuración para un service worker personalizado
      strategies: 'generateSW',
      srcDir: 'src', // Directorio del archivo personalizado del service worker
      filename: 'sw.js', // Nombre del archivo de service worker
    }),
  ],
});
