/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  status?: any[];
  pagination: {
        total: number,
        total_pages: number,
        limit: number,
        page: number
    }
}
