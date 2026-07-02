import type { CompanyProductEntity } from "../entities/company-product.entity";
import type { CompanyProductCreate, CompanyProductUpdate } from "@/modules/interfaces/company-product.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CompanyProductRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CompanyProductEntity>>;
  findById(id: string): Promise<CompanyProductEntity | null>;
  // Assign one or more products to a company. Returns only the records actually created (idempotent).
  assign(data: CompanyProductCreate): Promise<CompanyProductEntity[]>;
  update(id: string, data: CompanyProductUpdate): Promise<CompanyProductEntity>;
  delete(id: string): Promise<boolean>;
}
