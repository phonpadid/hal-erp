/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  type?: string;
  //search between
  filter?: {
    from_currency_id?: string;
    to_currency_id?: string;
    [key: string]: string | undefined; // Allow additional filter fields
  };
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
