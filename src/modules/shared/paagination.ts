
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * ผลลัพธ์ที่มีการแบ่งหน้า
 */
export interface PaginatedResult<T> {
  /** ข้อมูลของหน้าปัจจุบัน */
  data: T[];

  /** จำนวนรายการทั้งหมด */
  total: number;

  /** หน้าปัจจุบัน */
  page: number;

  /** จำนวนรายการต่อหน้า */
  limit: number;

  /** จำนวนหน้าทั้งหมด */
  totalPages: number;
}
