# Recursos y notas de implementación

Este inventario complementa resources/README.md y registra los assets recibidos para el rediseño.

| Recurso | Propósito | Restricción |
| --- | --- | --- |
| public/brand/logo.png | Marca azul oficial en el header | Mantener proporción 161x74 y no deformar |
| public/brand/logoBlanco.png | Marca blanca en footer | Usar sobre fondo brand para conservar contraste |
| public/brand/icon.png | Favicon e icono PWA pequeño | Es el asset entregado de 32x32 |
| resources/reference/*.png/jpg | Capturas de referencia del examen | Documentación; no se cargan en runtime |
| public/gapsi-logo.svg | Fallback de imagen | Sustituir solo si el evaluador entrega otro fallback |
| public/pwa-icon-192.svg | Icono PWA 192x192 | SVG incluido |
| public/pwa-icon-512.svg | Icono PWA grande/maskable | SVG incluido |
| public/manifest.webmanifest | Metadatos de instalación | Declara colores Gapsi e iconos |
| public/sw.js | Cache shell same-origin versionado | Excluye /api/, query strings, errores y respuestas grandes |
| .env.example | Plantilla segura | RAPIDAPI_KEY es server-only |
| src/services/productRepository.ts | Repository + demo | REST usa el proxy same-origin |
| src/services/productNormalizer.ts | Adapter y validación de URLs | Separa responsabilidad del transporte |
| src/theme.ts | ThemeProvider Material UI | Usa la paleta azul/cian entregada |
| index.html | Bootstrap Grid 5.3.8 + Font Awesome CDN con SRI | Versiones fijadas |
| src/services/repositoryFactory.ts | Strategy/Factory | No lee credenciales VITE_ |
| src/services/graphqlFacade.ts | Adaptador GraphQL, fachada, schema y query | REST sigue por defecto |
| src/state/cartReducer.ts + src/hooks/useCart.ts | Reglas puras y fachada del carrito | Integrados desde App.tsx |

Las imágenes demo externas se usan para visualizar estados del reto. En una entrega con red estrictamente cerrada, reemplázalas por assets locales.

