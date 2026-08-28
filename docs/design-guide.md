# Guía para replicar el diseño

## Dirección visual

La referencia define la jerarquía funcional: encabezado con marca, buscador, carrito/dropzone y catálogo de tres columnas. La implementación conserva esa lectura, pero usa una capa visual moderna: superficies blancas, bordes suaves, profundidad ligera, tipografía fluida y acentos Gapsi.

La experiencia sigue enfocada en el buscador y el carrito; el hero es compacto y no desplaza el contenido principal.

## Paleta Gapsi

~~~css
:root {
  --brand: #005db9;
  --brand-dark: #00488f;
  --accent: #00a1d3;
  --ink: #26364a;
  --muted: #68798d;
  --line: #dbe4ec;
  --surface: #ffffff;
  --surface-soft: #f6f9fc;
  --bg: #eef3f7;
}
~~~

El azul principal proviene del logo entregado. El cian se reserva para precios, iconos de estado y focos de interacción. Los fondos claros permiten que las imágenes de producto sean el punto de atención.

## Recursos de marca

| Archivo | Uso |
| --- | --- |
| public/brand/logo.png | Logo azul para el encabezado claro. |
| public/brand/logoBlanco.png | Logo blanco dentro del footer azul. |
| public/brand/icon.png | Favicon y primer icono PWA. |
| resources/reference/01-container.png | Referencia de estructura general. |
| resources/reference/02-products-virtual-scroll-no-items.jpg | Referencia del estado sin productos en carrito. |
| resources/reference/03-products-virtual-scroll-items.jpg | Referencia del carrito con contador y catálogo. |

Las capturas son referencias visuales y no se cargan en la interfaz final. Los logos sí forman parte del shell de la aplicación.

## Composición

~~~html
<header class="site-header">...</header>
<main class="app-main">
  <section class="hero-section container">...</section>
  <section class="workspace container">
    <div class="row g-4 align-items-start">
      <div class="col-12 col-xl-8">Catálogo</div>
      <div class="col-12 col-xl-4">Carrito</div>
    </div>
  </section>
</main>
<footer class="app-footer container">...</footer>
~~~

Bootstrap Grid resuelve la distribución responsive; Material UI aporta los controles, estados y accesibilidad. El CSS propio concentra la identidad visual y evita estilos dispersos.

## Tarjetas

~~~css
.product-card {
  min-height: 21.6rem;
  overflow: hidden;
  border: 1px solid #d7e1e9;
  border-radius: .95rem;
  background: #fff;
  box-shadow: 0 4px 14px rgba(18, 59, 96, .1);
}
~~~

La altura se conserva porque el virtualizador calcula filas con ese tamaño. La imagen tiene altura reservada y loading lazy para evitar saltos de layout. La sombra es clara y contenida: no se coloca ningún overlay o gradiente sobre la imagen, evitando la franja oscura observada en la referencia anterior.

## Buscador y carrito

- El campo MUI es controlado por App y permite Enter.
- Buscar se bloquea durante la petición.
- El dropzone muestra icono de carrito, contador y estado vacío.
- Agregar funciona con botón, teclado, touch y drag & drop nativo.
- Quitar usa un IconButton con nombre accesible.
- El carrito es sticky solo en desktop; en móvil permanece en el flujo natural.

## Responsive

La base es mobile-first:

- 320–575 px: una columna, acciones compactas y footer vertical.
- 576–1199 px: catálogo fluido de una o dos columnas según el viewport.
- 1200 px o más: catálogo y carrito en dos columnas; el carrito puede ser sticky.

Se usan rem, porcentajes, minmax, aspect-ratio implícito en las imágenes y scrollbar-gutter para estabilizar el scroll. Los objetivos táctiles MUI conservan al menos 44 px.

## Checklist visual

1. Logo azul visible en el header y blanco sobre el footer.
2. Fondo general claro, sin zonas negras heredadas del tema anterior.
3. Precio e iconos con acento cian.
4. Botones y foco activo con azul Gapsi.
5. Tarjetas blancas con borde y sombra suave.
6. Sin barras oscuras sobre imágenes ni sombras entre filas virtualizadas.
7. Catálogo y carrito utilizables a 375, 768, 1024 y 1440 px.
8. prefers-reduced-motion mantiene la interfaz estable.

