export interface Metadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

export class PaginatedResponse<T> {
  items: T;
  metaData: Metadata;
  constructor(items: T, metaData: Metadata) {
    this.items = items;
    this.metaData = metaData;
  }
}
