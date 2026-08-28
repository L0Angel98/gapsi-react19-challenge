/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRODUCT_API_URL?: string;
  readonly VITE_PRODUCT_DATA_SOURCE?: 'mock' | 'rest' | 'graphql';
  readonly VITE_GRAPHQL_API_URL?: string;
  readonly VITE_GRAPHQL_ALLOWED_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
