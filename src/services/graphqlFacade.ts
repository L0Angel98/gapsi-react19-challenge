import type { ProductRepository, SearchPage } from '../types/product';
import { normalizeProduct } from './productNormalizer';

const DEFAULT_GRAPHQL_PATH = '/api/graphql';
const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_PRODUCTS_PER_PAGE = 100;
const REQUEST_TIMEOUT_MS = 10_000;

function configuredOrigins(): string[] {
  return (import.meta.env.VITE_GRAPHQL_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** Same-origin por defecto; los gateways externos requieren una allowlist HTTPS explícita. */
export function resolveGraphqlEndpoint(rawEndpoint?: string): string {
  const candidate = rawEndpoint?.trim() || DEFAULT_GRAPHQL_PATH;
  try {
    const appOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(candidate, appOrigin);
    if (url.origin === appOrigin && url.pathname === DEFAULT_GRAPHQL_PATH && !url.search && !url.hash) return DEFAULT_GRAPHQL_PATH;
    if (url.protocol === 'https:' && configuredOrigins().includes(url.origin) && !url.hash) return url.href;
  } catch {
  }
  return DEFAULT_GRAPHQL_PATH;
}

export const GRAPHQL_API_URL = resolveGraphqlEndpoint(import.meta.env.VITE_GRAPHQL_API_URL);

export const PRODUCT_SEARCH_QUERY = `
  query SearchProducts($keyword: String!, $page: Int!) {
    searchProducts(keyword: $keyword, page: $page) {
      products { id name price currency imageUrl brand sourceUrl }
      page
      hasMore
    }
  }
`;

export const PRODUCT_GRAPHQL_SCHEMA = `
  type Product { id: ID!, name: String!, price: Float!, currency: String!, imageUrl: String!, brand: String, sourceUrl: String }
  type ProductPage { products: [Product!]!, page: Int!, hasMore: Boolean! }
  type Query { searchProducts(keyword: String!, page: Int!): ProductPage! }
`;

type GraphqlError = { message?: unknown };
type GraphqlPayload = {
  data?: { searchProducts?: { products?: unknown; page?: unknown; hasMore?: unknown } };
  errors?: GraphqlError[];
};

function normalizePage(value: number): number {
  return Math.max(1, Math.min(100, Math.trunc(value)));
}

function readGraphqlPage(payload: unknown, requestedPage: number): SearchPage {
  if (!payload || typeof payload !== 'object') throw new Error('La respuesta GraphQL no es válida.');
  const root = payload as GraphqlPayload;
  if (Array.isArray(root.errors) && root.errors.length > 0) {
    throw new Error('GraphQL devolvió un error al consultar productos.');
  }
  const pageData = root.data?.searchProducts;
  if (!pageData || !Array.isArray(pageData.products)) throw new Error('La respuesta GraphQL no contiene una página válida.');
  if (pageData.products.length > MAX_PRODUCTS_PER_PAGE) throw new Error('La respuesta GraphQL es demasiado grande.');
  const page = typeof pageData.page === 'number' && Number.isFinite(pageData.page) ? normalizePage(pageData.page) : requestedPage;
  return {
    products: pageData.products
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, index) => normalizeProduct(item, index)),
    page,
    hasMore: pageData.hasMore === true
  };
}

/**
 * Patrón Adapter para transporte GraphQL. La UI no depende de Apollo ni de un proveedor concreto;
 * hoy puede usar un BFF same-origin y mañana un gateway GraphQL.
 */
export class GraphqlProductRepository implements ProductRepository {
  constructor(
    private readonly endpoint = GRAPHQL_API_URL,
    private readonly request: typeof fetch = fetch
  ) {}

  async search(query: string, page: number, signal?: AbortSignal): Promise<SearchPage> {
    const safePage = normalizePage(page);
    const timeoutController = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => { timedOut = true; timeoutController.abort(); }, REQUEST_TIMEOUT_MS);
    const forwardAbort = () => timeoutController.abort();
    signal?.addEventListener('abort', forwardAbort, { once: true });

    try {
      const response = await this.request(resolveGraphqlEndpoint(this.endpoint), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: PRODUCT_SEARCH_QUERY,
          variables: { keyword: query.trim().slice(0, 100), page: safePage }
        }),
        signal: timeoutController.signal
      });
      if (!response.ok) throw new Error('No pudimos consultar los productos por GraphQL.');
      const contentLength = Number(response.headers.get('content-length') ?? '');
      if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) throw new Error('La respuesta GraphQL es demasiado grande.');
      const body = await response.text();
      if (body.length > MAX_RESPONSE_BYTES) throw new Error('La respuesta GraphQL es demasiado grande.');
      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        throw new Error('La respuesta GraphQL no es válida.');
      }
      return readGraphqlPage(payload, safePage);
    } catch (cause) {
      if (timedOut) throw new Error('La consulta GraphQL tardó demasiado.');
      if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
      if (cause instanceof Error && /GraphQL|respuesta|productos/.test(cause.message)) throw cause;
      throw new Error('No pudimos consultar los productos por GraphQL.');
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', forwardAbort);
    }
  }
}

export class ProductGraphqlFacade {
  constructor(private readonly repository: ProductRepository) {}

  async searchProducts(keyword: string, page: number, signal?: AbortSignal): Promise<SearchPage> {
    return this.repository.search(keyword, page, signal);
  }
}






