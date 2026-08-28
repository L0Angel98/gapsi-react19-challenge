import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAdd: (product: Product) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function getColumns(width: number) {
  if (width >= 1120) return 3;
  if (width >= 720) return 2;
  return 1;
}

export function ProductGrid({ products, onAdd, loading, hasMore, onLoadMore }: ProductGridProps) {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const columns = getColumns(width);
  const rowHeight = columns === 1 ? 346 : 366;
  const gap = 18;
  const rows = Math.ceil(products.length / columns);
  const viewportHeight = Math.min(Math.max(window.innerHeight * 0.62, 440), 680);
  const overscan = 2;
  const firstRow = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - overscan);
  const visibleRows = Math.ceil(viewportHeight / (rowHeight + gap)) + overscan * 2;
  const lastRow = Math.min(rows, firstRow + visibleRows);
  const visibleProducts = useMemo(() => products.slice(firstRow * columns, lastRow * columns), [columns, firstRow, lastRow, products]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && hasMore && !loading) onLoadMore();
    }, { root: viewport, rootMargin: '320px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, products.length]);

  const handleScroll = useCallback(() => {
    if (viewportRef.current) setScrollTop(viewportRef.current.scrollTop);
  }, []);

  return (
    <div ref={viewportRef} className="product-viewport" onScroll={handleScroll}>
      <div className="virtual-canvas" style={{ height: Math.max(rows * (rowHeight + gap) - gap, viewportHeight) }}>
        <div className="product-row-layer" style={{ top: firstRow * (rowHeight + gap), gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
        </div>
        <div ref={sentinelRef} className="load-sentinel" style={{ top: Math.max(rows * (rowHeight + gap) - 24, 0) }} aria-hidden="true" />
      </div>
      <div className="grid-status" aria-live="polite">
        {loading && <span><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando más productos...</span>}
        {!loading && !hasMore && products.length > 0 && <span>Has llegado al final de los resultados.</span>}
      </div>
    </div>
  );
}
