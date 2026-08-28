import { describe, expect, it } from 'vitest';
import { MockProductRepository, RapidApiProductRepository } from './productRepository';
import { GraphqlProductRepository } from './graphqlFacade';
import { createRepository } from './repositoryFactory';

describe('repositoryFactory', () => {
  it('falls back to demo without a key', () => {
    expect(createRepository('rest')).toBeInstanceOf(MockProductRepository);
  });

  it('selects REST only when explicitly requested with a key', () => {
    expect(createRepository('rest', 'local-test-key')).toBeInstanceOf(RapidApiProductRepository);
  });

  it('keeps GraphQL ready as an interchangeable data source', () => {
    expect(createRepository('graphql')).toBeInstanceOf(GraphqlProductRepository);
  });
});
