import type { CompanyVendorEntity } from "../entities/company-vendor.entity";
import type { CompanyVendorCreate, CompanyVendorUpdate } from "@/modules/interfaces/company-vendor.interface";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CompanyVendorRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CompanyVendorEntity>>;
  findById(id: string): Promise<CompanyVendorEntity | null>;
  // Assign a single vendor (with its credit terms) to a company.
  assign(data: CompanyVendorCreate): Promise<CompanyVendorEntity>;
  update(id: string, data: CompanyVendorUpdate): Promise<CompanyVendorEntity>;
  delete(id: string): Promise<boolean>;
}
