export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pagination: {
        total: number,
        total_pages: number,
        limit: number,
        page: number
    }
}
