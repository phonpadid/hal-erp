/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  type?: string;
}

export interface APIResponse<T> {
  status_code: number;
  message: string;
  data: T[];
  pagination: {
    total: number;
    total_pages: number;
    limit: number;
    page: number;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status?: any[];
}
