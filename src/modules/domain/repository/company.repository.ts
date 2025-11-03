import type { CompanyEntity } from "../entities/company.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateCompanyDTO, UpdateCompanyDTO } from "@/modules/application/dtos/company.dto";

export interface CompanyRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<CompanyEntity>>;
  findById(id: string): Promise<CompanyEntity | null>;
  create(data: CreateCompanyDTO): Promise<CompanyEntity>;
  update(id: string, data: UpdateCompanyDTO): Promise<CompanyEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}