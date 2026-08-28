# Matriz de trazabilidad del challenge

| Requisito | Evidencia | Validación | Estado |
| --- | --- | --- | --- |
| Header y logo | `src/components/Header.tsx`, `public/gapsi-logo.svg` | Inspección visual | Cubierto (logo oficial pendiente si lo entrega evaluador) |
| Búsqueda REST | `vite.config.ts`, `src/services/productRepository.ts` | Proxy + key privada | Cubierto con `RAPIDAPI_KEY` |
| Nombre, precio, imagen | `src/components/ProductCard.tsx` | Render demo/REST | Cubierto |
| Paginación al scroll | `ProductGrid.tsx`, `IntersectionObserver` | Scroll hasta página 4 demo | Cubierto |
| Virtual scroll | canvas, filas visibles, overscan | DevTools DOM | Cubierto |
| Drag & drop | `ProductCard` + `CartDropzone` | Mouse + botón | Cubierto |
| Alternativa táctil | botón Agregar, targets >=44px | Touch/teclado | Cubierto |
| Ocultar añadido | `useCart` + `cartIds` en `App.tsx` | Add/remove | Cubierto |
| Reiniciar | `Header`/`handleReset` | Click Reiniciar | Cubierto |
| Repository/Adapter/Observer | `services`, `hooks` | Unit tests | Cubierto |
| Strategy/Factory/Reducer/Facade | `repositoryFactory`, `cartReducer`, `useCart`, `graphqlFacade` | Unit tests | Cubierto/documentado |
| PWA | manifest + service worker + iconos SVG | Instalación/DevTools | Cubierto; PNG opcional según Lighthouse |
| Build minificado | `vite build` | Inspección `dist` | Cubierto |
| Ofuscación dedicada | `scripts/obfuscate.mjs` después de `vite build` | `dist/assets/*.js` | Cubierto |
| Material UI | `src/theme.ts`, `AppBar`, `Toolbar`, `TextField`, `Card`, `Paper`, `Button`, `Chip`, `List`, `IconButton` | Build + inspección visual | Cubierto |
| GraphQL | `GraphqlProductRepository`, fachada, query y schema en `src/services/graphqlFacade.ts` | 2 pruebas de transporte/error + factory | Atendido como fuente opt-in |
| Bootstrap Grid CDN | `index.html` Bootstrap 5.3.8 Grid con SRI + `container`, `row`, `col-*` y `container-fluid` | Build + responsive smoke test | Cubierto |
| Git público/ZIP/correo | externo | Cuenta/destino | Requiere autorización |






