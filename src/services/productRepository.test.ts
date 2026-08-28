import { describe, expect, it } from 'vitest';
import { buildSearchUrl, normalizeProduct } from './productRepository';

describe('productRepository', () => {
  it('encodes the challenge endpoint query contract', () => {
    const url = buildSearchUrl('sony headphones', 3);
    expect(url).toContain('keyword=sony+headphones');
    expect(url).toContain('page=3');
    expect(url).toContain('sortBy=best_match');
  });

  it('normalizes common Walmart response fields with safe defaults', () => {
    expect(normalizeProduct({ productId: '42', productTitle: 'Console', currentPrice: '$299.99', thumbnail: 'image.jpg' }, 0)).toMatchObject({ id: '42', name: 'Console', price: 299.99, imageUrl: 'image.jpg' });
  });

  it('uses local fallbacks for unsafe image and source URLs', () => {
    expect(normalizeProduct({ name: 'Unsafe', image: 'javascript:alert(1)', url: 'javascript:alert(1)' }, 0)).toMatchObject({ imageUrl: '/gapsi-logo.svg', sourceUrl: undefined });
    expect(normalizeProduct({ name: 'Local', image: '/catalog/item.webp', url: '/catalog/item.webp' }, 0)).toMatchObject({ imageUrl: '/catalog/item.webp', sourceUrl: '/catalog/item.webp' });
  });
});
