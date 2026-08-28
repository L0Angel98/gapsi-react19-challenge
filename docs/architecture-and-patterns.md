# Arquitectura y patrones de diseño

## Vista general

La aplicación usa una arquitectura por capas pequeña y explícita:

```text
UI (App, componentes)
        │
        ▼
Facades/hooks (useProductSearch, useCart)
        │
        ▼
Contratos de dominio (ProductRepository, Product, SearchPage)
        │
        ▼
Infraestructura (REST RapidAPI, demo, GraphQL facade)
```

La UI no conoce `fetch`, nombres de campos de RapidAPI ni la forma de paginar. Esa separación permite ejecutar el reto sin una key y sustituir la fuente de datos sin reescribir los componentes.

## Patrones utilizados

### Repository

`ProductRepository` define `search(query, page, signal)`. `RapidApiProductRepository` consume el endpoint same-origin del proxy y `MockProductRepository` genera cuatro páginas deterministas para desarrollo y QA sin red.

### Strategy + Factory

La aplicación puede elegir una fuente mediante `VITE_PRODUCT_API_URL`:

```env
VITE_PRODUCT_API_URL=/api/products  # activa el proxy REST privado
# Sin esta variable se usa MockProductRepository
```

`createProductRepository` es la Factory; cada clase es una Strategy intercambiable detrás del mismo contrato.

### Adapter

`normalizeProduct` adapta nombres externos como `productTitle`, `thumbnail` y `currentPrice` al modelo estable `Product`. Los componentes reciben siempre `id`, `name`, `price`, `currency` e `imageUrl`.

### Observer

`IntersectionObserver` observa el sentinel inferior dentro de la ventana de productos. Al intersectar solicita una página y el cleanup desconecta el observer al desmontar.

### Facade

`useProductSearch` expone a la pantalla solo `products`, `loading`, `error`, `hasMore`, `search` y `loadMore`. Oculta cancelación, request IDs y paginación.

### Reducer

El carrito se modela como acciones puras (`add`, `remove`, `clear`). La regla de no duplicar productos y la exclusión del catálogo pueden probarse sin montar React.

### Dependency inversion

Los componentes dependen de interfaces del dominio. La infraestructura depende de esas interfaces, no al revés. Esto facilita usar MSW/mock en pruebas y mover RapidAPI a un proxy backend en producción.

## Flujo drag & drop

```text
ProductCard (draggable)
  └─ onDragStart: dataTransfer.setData("text/product-id", id)
        │
        ▼
CartDropzone (onDragOver + onDrop)
  └─ obtiene id, busca el producto y llama onDropProduct
        │
        ▼
App / reducer
  └─ add(product), filtra el catálogo por cartIds
```

El botón `Agregar` es la alternativa accesible para touch, teclado y dispositivos sin drag nativo. La mejora futura con `dnd-kit` puede añadir `TouchSensor`, `KeyboardSensor` y `DragOverlay` sin cambiar el contrato `onAdd`.

## Contrato GraphQL

REST es el transporte oficial del reto, pero GraphQL queda implementado como adaptador de transporte opt-in. El cliente mantiene el contrato `ProductRepository`, valida errores GraphQL y reutiliza el normalizador; el esquema equivalente es:

```graphql
type Product {
  id: ID!
  name: String!
  price: Float!
  currency: String!
  imageUrl: String!
  brand: String
  sourceUrl: String
}

type ProductPage {
  products: [Product!]!
  page: Int!
  hasMore: Boolean!
}

type Query {
  searchProducts(keyword: String!, page: Int!): ProductPage!
}
```

El resolver debe delegar en `ProductRepository`; nunca debe duplicar la lógica de normalización. En el cliente, `GraphqlProductRepository` envía `PRODUCT_SEARCH_QUERY` por `POST`, convierte la respuesta al mismo `SearchPage` que usa REST, limita a 100 productos/1 MB y aplica timeout. Se activa con `VITE_PRODUCT_DATA_SOURCE=graphql` y puede apuntar a un BFF same-origin (`/api/graphql`); un origen externo solo se acepta si aparece en `VITE_GRAPHQL_ALLOWED_ORIGINS` con HTTPS.




## SOLID aplicado en el código

- **S — Single Responsibility:** `productNormalizer.ts` transforma datos externos; `productRepository.ts` solo gestiona transporte/paginación; `useProductSearch.ts` orquesta estado de búsqueda.
- **O — Open/Closed:** `ProductRepository` permite añadir otra fuente (GraphQL, mock o nuevo proveedor) creando otra implementación sin modificar la UI.
- **L — Liskov Substitution:** `MockProductRepository`, `RapidApiProductRepository` y `GraphqlProductRepository` cumplen exactamente `search(query, page, signal)` y son intercambiables.
- **I — Interface Segregation:** los componentes reciben props pequeñas (`onAdd`, `onRemove`, `onDropProduct`) en lugar de un objeto global.
- **D — Dependency Inversion:** `App` depende de `useProductSearch`/`useCart` y del contrato `ProductRepository`, no de `fetch` ni de RapidAPI.

### Antes y después

```tsx
// Antes: una tarjeta acoplada a detalles de red y estado global (difícil de probar).
function Card() {
  // fetch(...), setCart(...), normalización y render mezclados
}

// Después: la tarjeta solo recibe el producto y una acción de dominio.
interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return <button onClick={() => onAdd(product)}>Agregar</button>;
}
```

Material UI se limita a primitives de presentación (`AppBar`, `Toolbar`, `TextField`, `Card`, `Paper`, `Button`, `Chip`, `List`, `IconButton`) mediante `ThemeProvider`; no entra en dominio ni servicios. Bootstrap Grid aporta el contenedor responsive y tampoco se importa desde los módulos de negocio.

### Qué probar

- Unit tests: `normalizeProduct`, `cartReducer`, factories y fachadas con entradas límite.
- Integración: `App` con repositorio mock, agregar/quitar/reiniciar y paginación.
- UI/e2e: breakpoints, foco de botones MUI, drag nativo y ausencia de overlay sobre imágenes.







