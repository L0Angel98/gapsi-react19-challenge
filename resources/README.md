# Recursos del challenge

Este directorio documenta los recursos entregados junto con la solución.

| Recurso | Uso |
| --- | --- |
| Preparación Examen práctico React v.19 - v.1.3.pdf | Especificación original usada como fuente de requisitos. |
| reference/01-container.png | Referencia visual de estructura general. |
| reference/02-products-virtual-scroll-no-items.jpg | Referencia del catálogo con carrito vacío. |
| reference/03-products-virtual-scroll-items.jpg | Referencia del catálogo con productos en carrito. |
| ../public/brand/logo.png | Logo azul entregado para el header. |
| ../public/brand/logoBlanco.png | Logo blanco entregado para el footer. |
| ../public/brand/icon.png | Icono entregado para favicon y PWA. |
| ../public/gapsi-logo.svg | Fallback vectorial local para imágenes no válidas. |
| ../public/manifest.webmanifest | Metadata PWA, colores, iconos y modo standalone. |
| ../public/pwa-icon-192.svg / ../public/pwa-icon-512.svg | Iconos PWA vectoriales incluidos en la entrega. |
| ../src/theme.ts | Tema Material UI alineado con la paleta Gapsi. |
| ../public/sw.js | Service worker versionado; cachea solo shell/assets same-origin. |
| .env.example | Fuentes REST/mock y activación GraphQL opt-in; RAPIDAPI_KEY privada. |

## Servicio REST

El navegador llama únicamente al proxy same-origin:

/api/products?keyword={criterio}&page={numero}&sortBy=best_match

El middleware de desarrollo de vite.config.ts llama al contrato RapidAPI:

https://axesso-walmart-data-service.p.rapidapi.com/wlm/walmart-search-by-keyword

La cabecera x-rapidapi-key se añade exclusivamente en Node con RAPIDAPI_KEY; nunca uses VITE_RAPIDAPI_KEY ni envíes la credencial desde el navegador. El proxy valida keyword/page y aplica 30 solicitudes por minuto y dirección.

Sin endpoint configurado, el repositorio demo genera cuatro páginas deterministas para revisar virtualización, scroll, carrito y estados vacíos sin red.

## Adaptador GraphQL preparado

El cliente implementa GraphqlProductRepository en ../src/services/graphqlFacade.ts. Usa el mismo contrato ProductRepository que REST, envía la query searchProducts por POST y reutiliza el normalizador. Para activarlo:

~~~env
VITE_PRODUCT_DATA_SOURCE=graphql
VITE_GRAPHQL_API_URL=/api/graphql
# VITE_GRAPHQL_ALLOWED_ORIGINS=https://api.example.com
~~~

El endpoint /api/graphql debe ser un BFF o gateway autorizado. El cliente limita la respuesta a 1 MB/100 productos, aplica timeout de 10 s y rechaza orígenes externos no incluidos en VITE_GRAPHQL_ALLOWED_ORIGINS. El frontend no incluye credenciales de RapidAPI ni asume un proveedor GraphQL específico.

## Imágenes

El modo demo usa imágenes públicas de Unsplash. Las respuestas REST y GraphQL se normalizan y solo aceptan URLs HTTPS de hosts permitidos; cualquier otro valor usa el logo azul local.

Bootstrap Grid 5.3.8 se carga desde index.html como CSS CDN con SRI; el CSS propio sigue siendo la fuente visual principal.

