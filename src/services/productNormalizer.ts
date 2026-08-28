import type { Product } from '../types/product';

const ALLOWED_IMAGE_HOSTS = ['images.unsplash.com', 'walmartimages.com', 'ssl-images-amazon.com'];

function numberFrom(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();
}

function isAllowedExternalUrl(url: URL): boolean {
  return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function safeImageUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048) return '/gapsi-logo.svg';
  if (/^[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*(?:\?.*)?$/.test(value)) return value;
  try {
    const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(value, origin);
    if (url.origin === origin && url.pathname.startsWith('/')) return url.pathname + url.search;
    return isAllowedExternalUrl(url) ? url.href : '/gapsi-logo.svg';
  } catch {
    return '/gapsi-logo.svg';
  }
}

function safeSourceUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2048) return undefined;
  try {
    const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(value, origin);
    if (url.origin === origin && url.pathname.startsWith('/')) return url.pathname + url.search;
    return isAllowedExternalUrl(url) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeProduct(raw: Record<string, unknown>, index: number): Product {
  const name = firstString(raw.name, raw.title, raw.productTitle, raw.product_name) || `Producto ${index + 1}`;
  const imageUrl = safeImageUrl(firstString(raw.image, raw.imageUrl, raw.thumbnail, raw.productImage, raw.mainImage));
  const id = firstString(raw.id, raw.productId, raw.itemId, raw.usItemId) || `${name}-${index}`;
  const candidateCurrency = firstString(raw.currency, raw.currencyCode);
  const currency = candidateCurrency && /^[A-Z]{3}$/.test(candidateCurrency) ? candidateCurrency : 'USD';
  return {
    id,
    name,
    price: numberFrom(raw.price ?? raw.currentPrice ?? raw.salePrice ?? raw.minPrice),
    currency,
    imageUrl,
    brand: firstString(raw.brand, raw.brandName),
    sourceUrl: safeSourceUrl(firstString(raw.productUrl, raw.url, raw.link))
  };
}


