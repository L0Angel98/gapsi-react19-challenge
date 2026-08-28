import type { Product, ProductRepository, SearchPage } from '../types/product';
import { normalizeProduct } from './productNormalizer';
import { GraphqlProductRepository } from './graphqlFacade';

export { normalizeProduct } from './productNormalizer';

/**
 * El navegador usa un endpoint same-origin. La clave RapidAPI permanece en
 * el proxy de Vite/hosting y nunca se incluye en el JavaScript del cliente.
 */
const API_ROOT = import.meta.env.VITE_PRODUCT_API_URL?.trim() || '/api/products';
const DATA_SOURCE = import.meta.env.VITE_PRODUCT_DATA_SOURCE?.trim().toLowerCase();

export function buildSearchUrl(query: string, page: number): string {
  const safeQuery = query.trim().slice(0, 100);
  const safePage = Math.max(1, Math.min(100, Math.trunc(page)));
  const params = new URLSearchParams({ keyword: safeQuery, page: String(safePage), sortBy: 'best_match' });
  return `${API_ROOT}${API_ROOT.includes('?') ? '&' : '?'}${params.toString()}`;
}

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const candidates = [root.items, root.products, root.searchResults, root.results, (root.data as Record<string, unknown> | undefined)?.items];
  const items = candidates.find(Array.isArray);
  return Array.isArray(items) ? items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')) : [];
}

function hasNextPage(payload: unknown, page: number, count: number): boolean {
  if (payload && typeof payload === 'object') {
    const root = payload as Record<string, unknown>;
    const explicit = root.hasNextPage ?? root.has_next_page ?? (root.pagination as Record<string, unknown> | undefined)?.hasNext;
    if (typeof explicit === 'boolean') return explicit;
    const totalPages = Number(root.totalPages ?? (root.pagination as Record<string, unknown> | undefined)?.totalPages);
    if (Number.isFinite(totalPages) && totalPages > 0) return page < totalPages;
  }
  return count > 0;
}

export class RapidApiProductRepository implements ProductRepository {
  /** Se conserva por compatibilidad; las credenciales se ignoran intencionalmente. */
  constructor(_legacyApiKey?: string) {}

  async search(query: string, page: number, signal?: AbortSignal): Promise<SearchPage> {
    const response = await fetch(buildSearchUrl(query, page), { signal });
    if (!response.ok) throw new Error(`El proxy de productos respondió ${response.status}`);
    const payload: unknown = await response.json();
    const items = extractItems(payload);
    return { products: items.map((item, index) => normalizeProduct(item, index)), page, hasMore: hasNextPage(payload, page, items.length) };
  }
}

const demoImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=720&q=80',
  'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=720&q=80',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=720&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=720&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=720&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=720&q=80'
];

export class MockProductRepository implements ProductRepository {
  async search(query: string, page: number): Promise<SearchPage> {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const start = (page - 1) * 12;
    const products = Array.from({ length: 12 }, (_, index) => {
      const number = start + index + 1;
      return {
        id: `demo-${number}`,
        name: `${query || 'Computer'} essentials ${number}`,
        price: 39 + ((number * 37) % 840),
        currency: 'USD',
        imageUrl: demoImages[index % demoImages.length],
        brand: ['Gapsi Select', 'Northstar', 'Orbit'][index % 3]
      } satisfies Product;
    });
    return { products, page, hasMore: page < 4 };
  }
}

export function createProductRepository(): ProductRepository {
  if (DATA_SOURCE === 'graphql') return new GraphqlProductRepository();
  if (DATA_SOURCE === 'rest' || import.meta.env.VITE_PRODUCT_API_URL?.trim()) return new RapidApiProductRepository();
  return new MockProductRepository();
}








