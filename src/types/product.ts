export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  brand?: string;
  sourceUrl?: string;
}

export interface SearchPage {
  products: Product[];
  page: number;
  hasMore: boolean;
}

export interface ProductRepository {
  search(query: string, page: number, signal?: AbortSignal): Promise<SearchPage>;
}
