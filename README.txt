BEDROCK HUB — paquete estático para WebView / PWA

Archivos:
- index.html: interfaz responsive táctil.
- app.js: búsqueda Modrinth, fallback AllOrigins, accesos MCPEDL/Planet Minecraft y favoritos.
- manifest.json: metadatos PWA.
- sw.js: caché básica del shell para HTTPS/localhost.

Uso:
1. Extrae el ZIP y abre index.html en tu herramienta Code-to-App/WebView.
2. Para PWA y service worker, sirve los archivos desde HTTPS o localhost.
3. Se requiere conexión a internet para Tailwind CDN, APIs y búsquedas externas.

Limitaciones importantes:
- Modrinth está orientado principalmente a Java y su API no ofrece un filtro oficial fiable de Bedrock. Sus resultados se muestran como NO VERIFICADOS; revisa la página y formato antes de instalar.
- MCPEDL y Planet Minecraft se abren como búsquedas web externas porque no se consulta su contenido directamente (CORS/anti-bot).
- AllOrigins es un proxy público de mejor esfuerzo: puede fallar, limitar peticiones o estar bloqueado por el WebView. La aplicación conserva accesos externos y mensajes de error como alternativa.
- CurseForge queda preparado mediante CURSEFORGE_API_KEY = ""; no se llama desde el cliente. Para integrarlo se recomienda un backend propio que proteja la clave, respete los términos de CurseForge y gestione CORS.
- Los enlaces de descarga dependen de los archivos que publique cada proyecto. No se garantiza que sean .mcpack/.mcaddon/.mcworld ni que funcionen en Bedrock.

No afiliado con Mojang ni Microsoft.
