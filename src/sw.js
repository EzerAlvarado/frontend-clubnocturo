self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalado');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activado');
  });
  
  self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Interceptando fetch:', event.request.url);
  });
