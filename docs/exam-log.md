# Bitácora de preparación

Fecha de actualización: 2026-08-28 (America/Mexico_City).

## Estado

- Núcleo demo: disponible sin red ni credenciales.
- API RapidAPI: disponible mediante `/api/products`; el middleware Vite mantiene `RAPIDAPI_KEY` solo en Node.
- Seguridad: `pnpm audit --audit-level=high` sin vulnerabilidades conocidas; búsqueda limitada y URLs de imagen validadas.
- GitHub público y correo: pendientes de autorización/cuenta remota.
- Logo oficial: no fue entregado; se conserva un SVG local de identidad para la demostración.
- PWA: manifest, service worker versionado e iconos SVG 192/512 incluidos. Exporta PNG solo si el evaluador impone ese formato.
- GraphQL: adaptador HTTP, fachada, query y schema incluidos; REST continúa por defecto y GraphQL se activa con `VITE_PRODUCT_DATA_SOURCE=graphql`.
- UI: Material UI integrado mediante `ThemeProvider`, `AppBar`, `Toolbar`, `TextField`, `Card`, `Paper`, `Button`, `Chip`, `List` e `IconButton`; Bootstrap Grid 5.3.8 se carga por CDN con SRI y compone `container / row / col-*`; el CSS propio conserva solo marca y virtualización.

## Validación ejecutada

```text
pnpm lint  -> OK (tsc --noEmit)
pnpm test  -> OK (4 archivos, 8 tests)
pnpm build -> OK (Vite 6.4.3; MUI incluido; JS/CSS minificados y JS ofuscado en dist/)
pnpm audit --audit-level=high -> OK (No known vulnerabilities found)
```

Para una entrega externa todavía faltan únicamente los pasos que dependen de una cuenta: introducir una key RapidAPI autorizada, probar el endpoint real, crear/publicar el repositorio GitHub, comprimir y enviar el correo solicitado.





