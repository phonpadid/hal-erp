import type { CompanyEntity } from "../../../domain/entities/company.entity";
import type { CreateCompanyDTO, UpdateCompanyDTO } from "../../dtos/company.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CompanyService {
  createCompany(createCompanyDTO: CreateCompanyDTO): Promise<CompanyEntity>;
  getCompanyById(id: string): Promise<CompanyEntity | null>;
  getAllCompanies(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CompanyEntity>>;
  updateCompany(id: string, updateCompanyDTO: UpdateCompanyDTO): Promise<CompanyEntity>;
  deleteCompany(id: string): Promise<boolean>;
  restoreCompany(id: string): Promise<boolean>;
}