export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type?: string;
  brand: string;
  quantityInStock?: number;
}

// params used for query string in HTTP request
export interface ProductParams {
  orderBy: string;
  searchTerm?: string;
  types?: string[];
  brands?: string[];
  pageNumber: number;
  pageSize: number;
}
