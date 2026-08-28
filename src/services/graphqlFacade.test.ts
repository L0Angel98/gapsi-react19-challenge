import { describe, expect, it, vi } from 'vitest';
import type { ProductRepository } from '../types/product';
import { GraphqlProductRepository, PRODUCT_GRAPHQL_SCHEMA, PRODUCT_SEARCH_QUERY, ProductGraphqlFacade, resolveGraphqlEndpoint } from './graphqlFacade';

describe('ProductGraphqlFacade', () => {
  it('delegates the GraphQL-shaped query to a repository', async () => {
    const page = { products: [], page: 1, hasMore: false };
    const repository: ProductRepository = { search: vi.fn().mockResolvedValue(page) };
    const facade = new ProductGraphqlFacade(repository);

    await expect(facade.searchProducts('computer', 1)).resolves.toEqual(page);
    expect(repository.search).toHaveBeenCalledWith('computer', 1, undefined);
    expect(PRODUCT_GRAPHQL_SCHEMA).toContain('searchProducts');
  });
});

describe('GraphqlProductRepository', () => {
  it('sends the stable query contract and normalizes the page response', async () => {
    const request = vi.fn((..._args: Parameters<typeof fetch>): Promise<Response> => Promise.resolve(new Response(JSON.stringify({
      data: {
        searchProducts: {
          products: [{ id: 'g-1', name: 'GraphQL laptop', price: 10, currency: 'USD', imageUrl: '/laptop.jpg', brand: 'Demo' }],
          page: 2,
          hasMore: true
        }
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
    const repository = new GraphqlProductRepository('/api/graphql', request as typeof fetch);

    await expect(repository.search('  computer  ', 2)).resolves.toEqual({
      products: [{ id: 'g-1', name: 'GraphQL laptop', price: 10, currency: 'USD', imageUrl: '/laptop.jpg', brand: 'Demo', sourceUrl: undefined }],
      page: 2,
      hasMore: true
    });
    expect(request).toHaveBeenCalledTimes(1);
    const [, init] = request.mock.calls[0] ?? [];
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toMatchObject({ variables: { keyword: 'computer', page: 2 }, query: PRODUCT_SEARCH_QUERY });
  });

  it('maps provider errors to a generic UI-safe message', async () => {
    const request = vi.fn((..._args: Parameters<typeof fetch>): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ errors: [{ message: 'internal SQL stack trace' }] }), { status: 200 })));
    const repository = new GraphqlProductRepository('/api/graphql', request as typeof fetch);

    await expect(repository.search('computer', 1)).rejects.toThrow('GraphQL devolvió un error al consultar productos.');
  });

  it('rejects oversized pages before materializing the catalog', async () => {
    const products = Array.from({ length: 101 }, (_, index) => ({ id: String(index), name: 'item', price: 1, currency: 'USD', imageUrl: '/item.jpg' }));
    const request = vi.fn((..._args: Parameters<typeof fetch>): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ data: { searchProducts: { products, page: 1, hasMore: false } } }), { status: 200 })));
    const repository = new GraphqlProductRepository('/api/graphql', request as typeof fetch);

    await expect(repository.search('computer', 1)).rejects.toThrow('La respuesta GraphQL es demasiado grande.');
  });

  it('uses the same-origin endpoint by default and rejects arbitrary origins', () => {
    expect(resolveGraphqlEndpoint('/api/graphql')).toBe('/api/graphql');
    expect(resolveGraphqlEndpoint('https://attacker.example/graphql')).toBe('/api/graphql');
  });
});
