# e-Commerce Gapsi · React 19 Challenge

Implementación del examen práctico **Preparación Examen práctico React v.19 - v.1.3**: búsqueda de productos, scroll infinito con virtualización, carrito drag & drop y PWA responsive.

## Arranque rápido

Requisitos: Node.js 22.x y pnpm 9.x.

```bash
pnpm install
copy .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
pnpm dev
```

Sin `.env.local` la aplicación usa el repositorio demo (no requiere red ni credenciales). Para RapidAPI configura el proxy local:

```env
VITE_PRODUCT_API_URL=/api/products
RAPIDAPI_KEY=tu_llave_privada
```

`RAPIDAPI_KEY` no lleva prefijo `VITE_`: Vite la consume solo en Node mediante el middleware proxy y nunca se envía en el bundle del navegador. En producción despliega el mismo contrato `/api/products` en una función/reverse proxy server-side.

## Comportamiento del buscador en modo demo

Cuando no se configura una API REST o GraphQL, la aplicación utiliza el repositorio demo local para poder ejecutarse sin red ni credenciales. En este modo los productos se generan de forma determinista y el texto buscado se incorpora al nombre de cada tarjeta:

```text
phone    → phone essentials 1
computer → computer essentials 1
```

Esto confirma visualmente que la búsqueda actualizó el estado, pero no representa un catálogo real: las imágenes y los precios son datos de demostración. Al usar REST o GraphQL, los nombres, precios e imágenes provienen de la respuesta del servicio y no se renombran en el frontend.

## Validación y entrega

```bash
pnpm lint       # TypeScript
pnpm test       # Vitest
pnpm audit      # vulnerabilidades conocidas
pnpm build      # bundle minificado en dist/
pnpm preview
```

## Funcionalidades cubiertas

| Requisito | Evidencia |
| --- | --- |
| Header, logo y reinicio | `src/components/Header.tsx`, `public/brand/logo.png` |
| REST RapidAPI + modo demo | `vite.config.ts`, `src/services/productRepository.ts` |
| Nombre, precio e imagen | `src/components/ProductCard.tsx` |
| Scroll infinito y virtualización | `src/components/ProductGrid.tsx`, `src/hooks/useIntersectionSentinel.ts` |
| Drag & drop + teclado/táctil | `src/components/ProductCard.tsx`, `src/components/CartDropzone.tsx` |
| Ocultar productos del carrito | `src/App.tsx`, `src/hooks/useCart.ts` |
| Patrones | Repository, Adapter/normalizer, Strategy/Factory, Observer, Facade y Reducer |
| PWA | `public/manifest.webmanifest`, `public/sw.js`, iconos SVG |
| UI/CDN | Material UI (`ThemeProvider`, `AppBar`, `Toolbar`, `TextField`, `Card`, `Paper`, `Button`, `Chip`, `List`, `IconButton`) + Bootstrap Grid 5.3.8 CDN con SRI |
| GraphQL preparado | `GraphqlProductRepository`, query, schema y selector `VITE_PRODUCT_DATA_SOURCE`; es opt-in y no cambia la UI. |

## Patrones de diseño identificados

| Patrón | Aplicación en el proyecto |
| --- | --- |
| Repository | `ProductRepository` desacopla la UI de REST, GraphQL y datos demo. |
| Adapter | Los repositorios externos y `normalizeProduct` convierten respuestas ajenas al contrato `Product`. |
| Strategy + Factory | `createProductRepository` selecciona REST, GraphQL o demo según configuración. |
| Observer | `useIntersectionSentinel` encapsula `IntersectionObserver` para solicitar más resultados. |
| Reducer | `cartReducer` mantiene transiciones puras de agregar, quitar y vaciar productos. |
| Facade | `useProductSearch`, `useCart` y `ProductGraphqlFacade` exponen APIs pequeñas para los componentes. |
| SOLID / inversión de dependencias | Los componentes reciben acciones y contratos; no conocen `fetch`, RapidAPI ni GraphQL. |

Los comentarios del código se reservan para decisiones de seguridad, compatibilidad o coordinación que no resultan evidentes al leer el nombre de la función. El resto de funciones usa nombres explícitos y tipos para documentar su intención.

## Documentación

- [Arquitectura, SOLID y patrones](docs/architecture-and-patterns.md)
- [Guía de diseño](docs/design-guide.md)
- [Matriz de requisitos](docs/requirements-matrix.md)
- [Registro del examen y límites](docs/exam-log.md)
- [Inventario de recursos](resources/implementation-notes.md)
- [Referencias visuales entregadas](resources/reference/README.md)
- [Especificación original](resources/Preparación%20Examen%20práctico%20React%20v.19%20-%20v.1.3.pdf)

## Seguridad y límites

- La key RapidAPI debe rotarse si alguna vez se expuso como `VITE_RAPIDAPI_KEY`; esa variable ya no forma parte del código.
- El proxy limita `keyword` a 100 caracteres, `page` a 1–100 y aplica 30 solicitudes/minuto por dirección.
- Las imágenes externas se aceptan solo por HTTPS y hosts permitidos; las demás usan el logo local.
- GitHub público, ZIP y envío por correo son pasos externos que requieren una cuenta/destino proporcionados por quien entrega el examen.

## Diseño

La interfaz usa una paleta clara Gapsi, tokens CSS mobile-first, Bootstrap Grid para `container / row / col-*`, targets táctiles de 44 px, controles MUI con foco visible y tarjetas con sombra suave sin overlays sobre las imágenes.




