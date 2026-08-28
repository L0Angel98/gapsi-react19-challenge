import type { ProductRepository } from '../types/product';
import { GraphqlProductRepository } from './graphqlFacade';
import { MockProductRepository, RapidApiProductRepository } from './productRepository';

export type DataSource = 'mock' | 'rest' | 'graphql';

export function createRepository(
  source: DataSource = (import.meta.env.VITE_PRODUCT_DATA_SOURCE?.trim().toLowerCase() as DataSource | undefined)
    ?? (import.meta.env.VITE_PRODUCT_API_URL?.trim() ? 'rest' : 'mock'),
  _legacyCredential?: string
): ProductRepository {
  if (source === 'graphql') return new GraphqlProductRepository();
  if (source === 'rest' && (import.meta.env.VITE_PRODUCT_API_URL?.trim() || _legacyCredential?.trim())) {
    return new RapidApiProductRepository();
  }
  return new MockProductRepository();
}


