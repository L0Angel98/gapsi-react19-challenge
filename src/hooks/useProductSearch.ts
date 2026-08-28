import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createProductRepository } from '../services/productRepository';
import type { Product } from '../types/product';

/** Fachada de aplicación: coordina repository, cancelación, paginación y estado para la UI. */

export function useProductSearch(initialQuery = 'computer') {
  const repository = useMemo(() => createProductRepository(), []);
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const search = useCallback(async (nextQuery: string) => {
    const normalized = nextQuery.trim();
    if (!normalized) {
      setQuery('');
      setProducts([]);
      setPage(0);
      setHasMore(false);
      setError(null);
      return;
    }
    controller.current?.abort();
    const id = ++requestId.current;
    const nextController = new AbortController();
    controller.current = nextController;
    setQuery(normalized);
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    setLoading(true);
    try {
      const result = await repository.search(normalized, 1, nextController.signal);
      if (id !== requestId.current) return;
      setProducts(result.products);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (cause) {
      if (id !== requestId.current || (cause instanceof DOMException && cause.name === 'AbortError')) return;
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar los productos.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [repository]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !query) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await repository.search(query, nextPage);
      setProducts((current) => [...current, ...result.products]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar más productos.');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, query, repository]);

  useEffect(() => {
    void search(initialQuery);
    return () => controller.current?.abort();
  }, [initialQuery, search]);

  return { query, products, page, hasMore, loading, error, search, loadMore };
}

